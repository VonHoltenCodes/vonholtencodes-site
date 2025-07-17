#!/usr/bin/env python3
"""
Service Status Collector
Monitors system services and their health
"""

import subprocess
import datetime
import re
from typing import List, Dict, Any

class ServiceCollector:
    """Collects service status and health data"""
    
    def __init__(self, services: List[str] = None):
        self.services = services or [
            'apache2',
            'nginx', 
            'mysql',
            'postgresql',
            'ssh',
            'docker',
            'redis-server',
            'fail2ban'
        ]
    
    def get_service_status(self, service_name: str) -> Dict[str, Any]:
        """Get status for a specific service"""
        try:
            # Check if service is active
            result = subprocess.run(
                ['systemctl', 'is-active', service_name],
                capture_output=True, text=True, timeout=5
            )
            
            is_active = result.stdout.strip() == 'active'
            raw_status = result.stdout.strip()
            
            # Get more detailed info if active
            uptime = None
            pid = None
            
            if is_active:
                try:
                    # Get service info
                    status_result = subprocess.run(
                        ['systemctl', 'status', service_name],
                        capture_output=True, text=True, timeout=5
                    )
                    
                    # Extract PID
                    pid_match = re.search(r'Main PID: (\d+)', status_result.stdout)
                    if pid_match:
                        pid = int(pid_match.group(1))
                    
                    # Extract active time (simplified)
                    active_match = re.search(r'Active: active \([^)]+\) since ([^;]+)', status_result.stdout)
                    if active_match:
                        uptime = active_match.group(1).strip()
                        
                except Exception:
                    pass
            
            # Determine status color
            if is_active:
                status_color = 'success'
                display_status = 'Running'
            elif raw_status == 'inactive':
                status_color = 'warning'
                display_status = 'Stopped'
            else:
                status_color = 'danger'
                display_status = 'Failed'
            
            return {
                'name': service_name,
                'status': display_status,
                'status_color': status_color,
                'is_active': is_active,
                'raw_status': raw_status,
                'uptime': uptime,
                'pid': pid
            }
            
        except Exception as e:
            return {
                'name': service_name,
                'status': 'Unknown',
                'status_color': 'secondary',
                'is_active': False,
                'raw_status': 'error',
                'error': str(e)
            }
    
    def get_all_services(self) -> List[Dict[str, Any]]:
        """Get status for all monitored services"""
        services = []
        
        for service in self.services:
            service_data = self.get_service_status(service)
            services.append(service_data)
        
        return services
    
    def get_service_summary(self) -> Dict[str, Any]:
        """Get summary of all service statuses"""
        services = self.get_all_services()
        
        running_count = len([s for s in services if s.get('is_active', False)])
        total_count = len(services)
        stopped_count = len([s for s in services if s.get('status') == 'Stopped'])
        failed_count = len([s for s in services if s.get('status') == 'Failed'])
        
        # Overall health status
        if failed_count > 0:
            overall_status = 'critical'
        elif stopped_count > total_count // 2:
            overall_status = 'warning' 
        else:
            overall_status = 'good'
        
        return {
            'timestamp': datetime.datetime.now().isoformat(),
            'services': services,
            'summary': {
                'total': total_count,
                'running': running_count,
                'stopped': stopped_count,
                'failed': failed_count,
                'overall_status': overall_status
            }
        }