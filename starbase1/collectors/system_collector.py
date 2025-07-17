#!/usr/bin/env python3
"""
System Hardware Collector
Collects detailed system information, temperatures, and BIOS data
"""

import subprocess
import psutil
import re
import datetime
import os
from typing import Dict, Any, List

class SystemCollector:
    """Collects detailed system hardware and performance data"""
    
    def __init__(self):
        self.boot_time = psutil.boot_time()
    
    def get_cpu_info(self) -> Dict[str, Any]:
        """Get detailed CPU information"""
        try:
            # Get CPU info from /proc/cpuinfo
            cpu_info = {}
            with open('/proc/cpuinfo', 'r') as f:
                for line in f:
                    if ':' in line:
                        key, value = line.split(':', 1)
                        key = key.strip()
                        if key == 'model name':
                            cpu_info['model'] = value.strip()
                        elif key == 'cpu MHz':
                            cpu_info['current_mhz'] = float(value.strip())
                        elif key == 'cache size':
                            cpu_info['cache'] = value.strip()
                        elif key == 'cpu cores':
                            cpu_info['physical_cores'] = int(value.strip())
            
            # Get CPU frequency and usage
            cpu_freq = psutil.cpu_freq()
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_times = psutil.cpu_times()
            load_avg = os.getloadavg()
            
            return {
                'model': cpu_info.get('model', 'Unknown'),
                'physical_cores': psutil.cpu_count(logical=False),
                'logical_cores': psutil.cpu_count(logical=True),
                'current_freq_mhz': cpu_freq.current if cpu_freq else None,
                'max_freq_mhz': cpu_freq.max if cpu_freq else None,
                'usage_percent': cpu_percent,
                'cache': cpu_info.get('cache', 'Unknown'),
                'load_1min': load_avg[0],
                'load_5min': load_avg[1], 
                'load_15min': load_avg[2],
                'uptime_seconds': datetime.datetime.now().timestamp() - self.boot_time
            }
        except Exception as e:
            return {'error': str(e)}
    
    def get_memory_info(self) -> Dict[str, Any]:
        """Get detailed memory information"""
        try:
            mem = psutil.virtual_memory()
            swap = psutil.swap_memory()
            
            # Convert to MB for easier reading
            return {
                'total_mb': round(mem.total / 1024 / 1024),
                'available_mb': round(mem.available / 1024 / 1024),
                'used_mb': round(mem.used / 1024 / 1024),
                'free_mb': round(mem.free / 1024 / 1024),
                'usage_percent': mem.percent,
                'cached_mb': round(getattr(mem, 'cached', 0) / 1024 / 1024),
                'buffers_mb': round(getattr(mem, 'buffers', 0) / 1024 / 1024),
                'swap_total_mb': round(swap.total / 1024 / 1024),
                'swap_used_mb': round(swap.used / 1024 / 1024),
                'swap_percent': swap.percent
            }
        except Exception as e:
            return {'error': str(e)}
    
    def get_disk_info(self) -> Dict[str, Any]:
        """Get disk information"""
        try:
            disks = []
            disk_io = psutil.disk_io_counters()
            
            # Get all mounted disks
            partitions = psutil.disk_partitions()
            for partition in partitions:
                try:
                    usage = psutil.disk_usage(partition.mountpoint)
                    disk_data = {
                        'device': partition.device,
                        'mountpoint': partition.mountpoint,
                        'fstype': partition.fstype,
                        'total_gb': round(usage.total / 1024 / 1024 / 1024, 1),
                        'used_gb': round(usage.used / 1024 / 1024 / 1024, 1),
                        'free_gb': round(usage.free / 1024 / 1024 / 1024, 1),
                        'usage_percent': round((usage.used / usage.total) * 100, 1) if usage.total > 0 else 0
                    }
                    disks.append(disk_data)
                except PermissionError:
                    continue
            
            return {
                'disks': disks,
                'total_disks': len(disks),
                'io_read_mb': round(disk_io.read_bytes / 1024 / 1024) if disk_io else 0,
                'io_write_mb': round(disk_io.write_bytes / 1024 / 1024) if disk_io else 0
            }
        except Exception as e:
            return {'error': str(e)}
    
    def get_network_info(self) -> Dict[str, Any]:
        """Get network interface information"""
        try:
            net_io = psutil.net_io_counters()
            interfaces = psutil.net_if_addrs()
            
            interface_list = []
            for name, addresses in interfaces.items():
                if name != 'lo':  # Skip loopback
                    for addr in addresses:
                        if addr.family.name == 'AF_INET':
                            interface_list.append({
                                'name': name,
                                'ip': addr.address,
                                'netmask': addr.netmask
                            })
            
            return {
                'interfaces': interface_list,
                'bytes_sent_mb': round(net_io.bytes_sent / 1024 / 1024) if net_io else 0,
                'bytes_recv_mb': round(net_io.bytes_recv / 1024 / 1024) if net_io else 0,
                'packets_sent': net_io.packets_sent if net_io else 0,
                'packets_recv': net_io.packets_recv if net_io else 0
            }
        except Exception as e:
            return {'error': str(e)}
    
    def get_temperature_info(self) -> Dict[str, Any]:
        """Get system temperature information"""
        try:
            temps = {}
            
            # Try to get temperatures using psutil
            if hasattr(psutil, 'sensors_temperatures'):
                sensor_temps = psutil.sensors_temperatures()
                for name, entries in sensor_temps.items():
                    temp_list = []
                    for entry in entries:
                        # Convert Celsius to Fahrenheit
                        temp_f = (entry.current * 9/5) + 32 if entry.current else None
                        temp_list.append({
                            'label': entry.label or f'{name}_sensor',
                            'temp_f': round(temp_f, 1) if temp_f else None,
                            'temp_c': round(entry.current, 1) if entry.current else None
                        })
                    temps[name] = temp_list
            
            # Try alternative methods for CPU temp
            if not temps:
                try:
                    # Try thermal zone
                    result = subprocess.run(['cat', '/sys/class/thermal/thermal_zone0/temp'], 
                                          capture_output=True, text=True, timeout=5)
                    if result.stdout:
                        temp_c = int(result.stdout.strip()) / 1000
                        temp_f = (temp_c * 9/5) + 32
                        temps['cpu'] = [{'label': 'CPU', 'temp_f': round(temp_f, 1), 'temp_c': round(temp_c, 1)}]
                except:
                    pass
            
            return temps if temps else {'status': 'No temperature sensors found'}
            
        except Exception as e:
            return {'error': str(e)}
    
    def get_bios_info(self) -> Dict[str, Any]:
        """Get BIOS and system information"""
        try:
            bios_info = {}
            
            # Try to get DMI information
            dmi_commands = {
                'bios_vendor': ['dmidecode', '-s', 'bios-vendor'],
                'bios_version': ['dmidecode', '-s', 'bios-version'],
                'bios_date': ['dmidecode', '-s', 'bios-release-date'],
                'system_manufacturer': ['dmidecode', '-s', 'system-manufacturer'],
                'system_product': ['dmidecode', '-s', 'system-product-name'],
                'system_serial': ['dmidecode', '-s', 'system-serial-number'],
                'baseboard_manufacturer': ['dmidecode', '-s', 'baseboard-manufacturer'],
                'baseboard_product': ['dmidecode', '-s', 'baseboard-product-name']
            }
            
            for key, cmd in dmi_commands.items():
                try:
                    # Try without sudo first
                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
                    if result.stdout and result.returncode == 0:
                        output = result.stdout.strip()
                        if output and output != 'Not Specified' and 'invalid' not in output.lower():
                            bios_info[key] = output
                        else:
                            bios_info[key] = 'N/A'
                    else:
                        # Try with sudo if normal command fails
                        try:
                            sudo_cmd = ['sudo', '-S'] + cmd
                            result = subprocess.run(
                                sudo_cmd, 
                                input='VonHolten2025\n',
                                capture_output=True, 
                                text=True, 
                                timeout=10
                            )
                            if result.stdout and result.returncode == 0:
                                output = result.stdout.strip()
                                if output and output != 'Not Specified' and 'invalid' not in output.lower():
                                    bios_info[key] = output
                                else:
                                    bios_info[key] = 'N/A'
                            else:
                                bios_info[key] = 'N/A'
                        except:
                            bios_info[key] = 'N/A'
                except:
                    bios_info[key] = 'N/A'
            
            return bios_info
            
        except Exception as e:
            return {'error': str(e)}
    
    def get_system_summary(self) -> Dict[str, Any]:
        """Get system summary for dashboard API"""
        cpu_info = self.get_cpu_info()
        memory_info = self.get_memory_info()
        disk_info = self.get_disk_info()
        network_info = self.get_network_info()
        temperature_info = self.get_temperature_info()
        bios_info = self.get_bios_info()
        
        # Format data for dashboard display
        uptime_seconds = datetime.datetime.now().timestamp() - self.boot_time
        days = int(uptime_seconds // 86400)
        hours = int((uptime_seconds % 86400) // 3600)
        minutes = int((uptime_seconds % 3600) // 60)
        
        uptime_str = f"{days}d {hours}h {minutes}m" if days > 0 else f"{hours}h {minutes}m"
        boot_time_str = datetime.datetime.fromtimestamp(self.boot_time).strftime('%Y-%m-%d %H:%M')
        
        # Format disk usage
        disk_usage = {}
        if disk_info and isinstance(disk_info, dict) and 'disks' in disk_info:
            disks = disk_info['disks']
            total_size = sum(disk.get('total_gb', 0) for disk in disks if isinstance(disk, dict))
            used_size = sum(disk.get('used_gb', 0) for disk in disks if isinstance(disk, dict))
            free_size = total_size - used_size
            
            disk_usage = {
                'used': self._format_bytes(used_size * 1024 * 1024 * 1024),
                'free': self._format_bytes(free_size * 1024 * 1024 * 1024),
                'total': self._format_bytes(total_size * 1024 * 1024 * 1024),
                'percent': round((used_size / total_size) * 100, 1) if total_size > 0 else 0
            }
        
        # Format network data
        network_summary = {}
        if network_info and isinstance(network_info, dict):
            network_summary = {
                'bytes_recv': self._format_bytes(network_info.get('bytes_recv_mb', 0) * 1024 * 1024),
                'bytes_sent': self._format_bytes(network_info.get('bytes_sent_mb', 0) * 1024 * 1024),
                'packets_recv': network_info.get('packets_recv', 0),
                'packets_sent': network_info.get('packets_sent', 0)
            }
        
        return {
            'timestamp': datetime.datetime.now().isoformat(),
            'cpu': {
                'model': cpu_info.get('model', 'Unknown'),
                'usage_percent': cpu_info.get('usage_percent', 0),
                'current_freq': cpu_info.get('current_freq_mhz', 0),
                'physical_cores': cpu_info.get('physical_cores', 0),
                'logical_cores': cpu_info.get('logical_cores', 0)
            },
            'memory': {
                'used': self._format_bytes(memory_info.get('used_mb', 0) * 1024 * 1024),
                'total': self._format_bytes(memory_info.get('total_mb', 0) * 1024 * 1024),
                'available': self._format_bytes(memory_info.get('available_mb', 0) * 1024 * 1024),
                'percent': memory_info.get('usage_percent', 0)
            },
            'disk_usage': disk_usage,
            'disks': disk_info.get('disks', []) if isinstance(disk_info, dict) else [],
            'network': network_summary,
            'temperatures': temperature_info or {},
            'bios': {
                'vendor': bios_info.get('bios_vendor', 'Unknown'),
                'version': bios_info.get('bios_version', 'Unknown'),
                'board_name': bios_info.get('baseboard_product', 'Unknown'),
                'manufacturer': bios_info.get('system_manufacturer', 'Unknown')
            },
            'boot_time': boot_time_str,
            'uptime': uptime_str
        }
    
    def _format_bytes(self, bytes_value):
        """Format bytes to human readable format"""
        if bytes_value == 0:
            return "0 B"
        
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_value < 1024.0:
                return f"{bytes_value:.1f} {unit}"
            bytes_value /= 1024.0
        return f"{bytes_value:.1f} PB"
    
    def get_complete_system_info(self) -> Dict[str, Any]:
        """Get all system information"""
        return {
            'timestamp': datetime.datetime.now().isoformat(),
            'cpu': self.get_cpu_info(),
            'memory': self.get_memory_info(),
            'disks': self.get_disk_info(),
            'network': self.get_network_info(),
            'temperatures': self.get_temperature_info(),
            'bios': self.get_bios_info(),
            'uptime': {
                'boot_time': datetime.datetime.fromtimestamp(self.boot_time).isoformat(),
                'uptime_seconds': datetime.datetime.now().timestamp() - self.boot_time
            }
        }