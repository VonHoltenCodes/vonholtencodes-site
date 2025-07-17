#!/usr/bin/env python3
"""
Security Data Collector
Collects user sessions and failed login attempts
"""

import subprocess
import re
import datetime
import json
from typing import List, Dict, Any

class SecurityCollector:
    """Collects security-related system data"""
    
    def __init__(self):
        self.auth_log_path = '/var/log/auth.log'
    
    def get_active_users(self) -> List[Dict[str, Any]]:
        """Get currently logged in users"""
        try:
            # Use 'who' command to get active sessions
            result = subprocess.run(['who'], capture_output=True, text=True, timeout=5)
            users = []
            
            for line in result.stdout.strip().split('\n'):
                if line.strip():
                    parts = line.split()
                    if len(parts) >= 3:
                        user = {
                            'username': parts[0],
                            'terminal': parts[1],
                            'login_time': ' '.join(parts[2:4]) if len(parts) >= 4 else parts[2],
                            'status': 'active'
                        }
                        users.append(user)
            
            return users
        except Exception as e:
            return [{'error': f'Failed to get users: {str(e)}'}]
    
    def get_failed_logins(self, hours: int = 24) -> Dict[str, Any]:
        """Get failed login attempts from last N hours"""
        try:
            # Get failed SSH login attempts
            cmd = ['grep', 'Failed password', self.auth_log_path]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            
            failed_attempts = []
            total_count = 0
            
            if result.stdout:
                lines = result.stdout.strip().split('\n')
                total_count = len(lines)
                
                # Parse recent attempts (last 10)
                for line in lines[-10:]:
                    if 'Failed password' in line:
                        # Extract IP address
                        ip_match = re.search(r'from (\d+\.\d+\.\d+\.\d+)', line)
                        # Extract username
                        user_match = re.search(r'for (\w+)', line)
                        # Extract timestamp (simplified)
                        time_match = re.search(r'^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})', line)
                        
                        attempt = {
                            'timestamp': time_match.group(1) if time_match else 'unknown',
                            'username': user_match.group(1) if user_match else 'unknown',
                            'source_ip': ip_match.group(1) if ip_match else 'unknown'
                        }
                        failed_attempts.append(attempt)
            
            return {
                'total_count': total_count,
                'recent_attempts': failed_attempts,
                'last_attempt': failed_attempts[-1] if failed_attempts else None,
                'status': 'normal' if total_count < 50 else 'warning' if total_count < 100 else 'critical'
            }
            
        except Exception as e:
            return {
                'total_count': 0,
                'recent_attempts': [],
                'last_attempt': None,
                'status': 'unknown',
                'error': str(e)
            }
    
    def get_security_summary(self) -> Dict[str, Any]:
        """Get overall security status summary"""
        users = self.get_active_users()
        failed_logins = self.get_failed_logins()
        
        # Determine overall security status
        status = 'good'
        if failed_logins.get('total_count', 0) > 100:
            status = 'warning'
        if failed_logins.get('total_count', 0) > 200:
            status = 'critical'
        
        return {
            'timestamp': datetime.datetime.now().isoformat(),
            'active_users': users,
            'failed_logins': failed_logins,
            'overall_status': status,
            'user_count': len([u for u in users if 'error' not in u])
        }