#!/usr/bin/env python3
"""
Starbase1_IO Configuration
Settings for security monitoring dashboard
"""

import os

class Config:
    """Base configuration class"""
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'starbase1-security-monitor-2025'
    DEBUG = os.environ.get('FLASK_DEBUG') or False
    
    # Application settings
    APP_NAME = "Starbase1_IO"
    APP_VERSION = "1.0.0"
    REFRESH_INTERVAL = 360  # seconds (6 minutes)
    
    # Monitoring settings
    MAX_FAILED_LOGINS_TO_SHOW = 10
    HOURS_OF_HISTORY = 24
    
    # Services to monitor
    MONITORED_SERVICES = [
        'apache2',
        'nginx', 
        'mysql',
        'postgresql',
        'ssh',
        'docker',
        'redis-server',
        'fail2ban'
    ]
    
    # Log file paths
    AUTH_LOG_PATH = '/var/log/auth.log'
    SYSLOG_PATH = '/var/log/syslog'
    
    # Data storage
    DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
    
    # Cache settings
    CACHE_TIMEOUT = 30  # seconds

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    
class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    
# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}