#!/usr/bin/env python3
"""
Starbase1_IO Flask Application
Professional security monitoring dashboard
"""

from flask import Flask, render_template, jsonify
import os
import sys
from datetime import datetime

# Add collectors to path
sys.path.append(os.path.dirname(__file__))

from config import config
from collectors.security_collector import SecurityCollector
from collectors.service_collector import ServiceCollector
from collectors.system_collector import SystemCollector

def create_app(config_name=None):
    """Create Flask application"""
    app = Flask(__name__)
    
    # Load configuration
    config_name = config_name or os.environ.get('FLASK_CONFIG') or 'default'
    app.config.from_object(config[config_name])
    
    # Initialize collectors
    security_collector = SecurityCollector()
    service_collector = ServiceCollector(app.config['MONITORED_SERVICES'])
    system_collector = SystemCollector()
    
    @app.route('/')
    def dashboard():
        """Main dashboard page"""
        import time
        cache_buster = str(int(time.time()))
        return render_template('dashboard.html', 
                             app_name=app.config['APP_NAME'],
                             refresh_interval=app.config['REFRESH_INTERVAL'],
                             version=cache_buster)
    
    @app.route('/api/security')
    def api_security():
        """API endpoint for security data"""
        try:
            data = security_collector.get_security_summary()
            return jsonify(data)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/services')
    def api_services():
        """API endpoint for service data"""
        try:
            data = service_collector.get_service_summary()
            return jsonify(data)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/system')
    def api_system():
        """API endpoint for system data"""
        try:
            data = system_collector.get_system_summary()
            return jsonify(data)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/status')
    def api_status():
        """Combined status API endpoint"""
        try:
            security_data = security_collector.get_security_summary()
            service_data = service_collector.get_service_summary()
            system_data = system_collector.get_system_summary()
            
            # Combined health status
            security_status = security_data.get('overall_status', 'unknown')
            service_status = service_data.get('summary', {}).get('overall_status', 'unknown')
            
            if 'critical' in [security_status, service_status]:
                overall_status = 'critical'
            elif 'warning' in [security_status, service_status]:
                overall_status = 'warning'
            else:
                overall_status = 'good'
            
            return jsonify({
                'timestamp': datetime.now().isoformat(),
                'security': security_data,
                'services': service_data,
                'system': system_data,
                'overall_status': overall_status
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/health')
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'app': app.config['APP_NAME'],
            'version': app.config['APP_VERSION'],
            'timestamp': datetime.now().isoformat()
        })
    
    return app

# Create Flask app
app = create_app()

if __name__ == '__main__':
    import sys
    
    # Get port from command line args if provided
    port = 5000
    if len(sys.argv) > 1 and '--port=' in sys.argv[1]:
        try:
            port = int(sys.argv[1].split('=')[1])
        except:
            port = 5000
    
    print(">>> Starting Starbase1_IO CLI Terminal Interface")
    print("=" * 60)
    print(f">>> Dashboard: http://localhost:{port}")
    print(f">>> API Status: http://localhost:{port}/api/status")
    print(f">>> Health Check: http://localhost:{port}/health")
    print("=" * 60)
    print(">>> Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        app.run(
            host='0.0.0.0',
            port=port,
            debug=False,  # Disable debug mode for stability
            use_reloader=False,  # Disable auto-reloader 
            threaded=True  # Enable threading for better performance
        )
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"!!! ERROR: Port {port} is already in use!")
            print(">>> Try: sudo lsof -ti:5000 | xargs kill -9")
            print(">>> Or run with: python3 app.py --port=5001")
        else:
            print(f"!!! ERROR starting server: {e}")
    except KeyboardInterrupt:
        print("\n>>> Shutting down Starbase1_IO Terminal Interface...")
    except Exception as e:
        print(f"!!! UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()