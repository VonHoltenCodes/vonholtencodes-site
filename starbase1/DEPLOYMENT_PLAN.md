# 🚀 Starbase1_IO Production Deployment Plan

## 📋 **Deployment Target**
- **URL**: https://www.vonholtencodes.com/starbase1
- **Server**: Apache web server (mod_wsgi)
- **Environment**: Production (no venv, system-wide Python)
- **Ports**: Standard Apache ports only (80/443)

---

## 🎯 **Pre-Deployment Checklist**

### ✅ **Server Requirements**
- [ ] Ubuntu/Debian Linux server with Apache installed
- [ ] Python 3.8+ installed system-wide
- [ ] mod_wsgi enabled in Apache
- [ ] SSL certificate configured for vonholtencodes.com
- [ ] Root/sudo access for initial setup

### ✅ **Python Dependencies (System-wide)**
```bash
# Install required Python packages system-wide
sudo apt update
sudo apt install python3-pip python3-dev libapache2-mod-wsgi-py3
sudo pip3 install flask psutil
```

---

## 📁 **Step 1: Directory Setup**

### **Create Application Directory**
```bash
# Create application directory
sudo mkdir -p /var/www/vonholtencodes.com/starbase1
sudo chown www-data:www-data /var/www/vonholtencodes.com/starbase1
sudo chmod 755 /var/www/vonholtencodes.com/starbase1
```

### **Upload Application Files**
```bash
# Copy all starbase1_IO files to server
sudo cp -r /home/traxx/starbase1_IO/* /var/www/vonholtencodes.com/starbase1/
sudo chown -R www-data:www-data /var/www/vonholtencodes.com/starbase1
sudo chmod -R 755 /var/www/vonholtencodes.com/starbase1
```

---

## 🔧 **Step 2: Apache Configuration**

### **Create WSGI File**
Create `/var/www/vonholtencodes.com/starbase1/starbase1.wsgi`:
```python
#!/usr/bin/python3
import sys
import os

# Add the application directory to Python path
sys.path.insert(0, '/var/www/vonholtencodes.com/starbase1/')

from app import app as application

if __name__ == "__main__":
    application.run()
```

### **Apache Virtual Host Configuration**
Add to existing `/etc/apache2/sites-available/vonholtencodes.com.conf`:

```apache
<VirtualHost *:80>
    ServerName www.vonholtencodes.com
    DocumentRoot /var/www/vonholtencodes.com/html
    
    # Existing site configuration...
    
    # Starbase1_IO Configuration
    Alias /starbase1/static /var/www/vonholtencodes.com/starbase1/static
    <Directory /var/www/vonholtencodes.com/starbase1/static>
        Require all granted
    </Directory>
    
    WSGIScriptAlias /starbase1 /var/www/vonholtencodes.com/starbase1/starbase1.wsgi
    <Directory /var/www/vonholtencodes.com/starbase1>
        WSGIApplicationGroup %{GLOBAL}
        WSGIScriptReloading On
        Require all granted
    </Directory>
</VirtualHost>

<VirtualHost *:443>
    ServerName www.vonholtencodes.com
    DocumentRoot /var/www/vonholtencodes.com/html
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    
    # Existing site configuration...
    
    # Starbase1_IO Configuration
    Alias /starbase1/static /var/www/vonholtencodes.com/starbase1/static
    <Directory /var/www/vonholtencodes.com/starbase1/static>
        Require all granted
    </Directory>
    
    WSGIScriptAlias /starbase1 /var/www/vonholtencodes.com/starbase1/starbase1.wsgi
    <Directory /var/www/vonholtencodes.com/starbase1>
        WSGIApplicationGroup %{GLOBAL}
        WSGIScriptReloading On
        Require all granted
    </Directory>
</VirtualHost>
```

---

## 🔐 **Step 3: Permissions & Security**

### **Set Proper Permissions**
```bash
# Application files
sudo chown -R www-data:www-data /var/www/vonholtencodes.com/starbase1
sudo chmod -R 755 /var/www/vonholtencodes.com/starbase1
sudo chmod 644 /var/www/vonholtencodes.com/starbase1/starbase1.wsgi

# Ensure Python files are executable
sudo chmod +x /var/www/vonholtencodes.com/starbase1/app.py
sudo chmod +x /var/www/vonholtencodes.com/starbase1/collectors/*.py
```

### **Sudo Access for System Monitoring**
Add to `/etc/sudoers.d/starbase1`:
```bash
# Allow www-data to run system monitoring commands
www-data ALL=(ALL) NOPASSWD: /usr/sbin/dmidecode
www-data ALL=(ALL) NOPASSWD: /bin/systemctl status *
www-data ALL=(ALL) NOPASSWD: /usr/bin/who
www-data ALL=(ALL) NOPASSWD: /usr/bin/w
www-data ALL=(ALL) NOPASSWD: /usr/bin/last
```

---

## 🚀 **Step 4: Deployment Execution**

### **1. Upload and Configure**
```bash
# Upload files to server
scp -r /home/traxx/starbase1_IO/* user@vonholtencodes.com:/tmp/starbase1/

# On server: Move files to web directory
sudo cp -r /tmp/starbase1/* /var/www/vonholtencodes.com/starbase1/
sudo chown -R www-data:www-data /var/www/vonholtencodes.com/starbase1
```

### **2. Create WSGI File**
```bash
sudo tee /var/www/vonholtencodes.com/starbase1/starbase1.wsgi > /dev/null << 'EOF'
#!/usr/bin/python3
import sys
import os

sys.path.insert(0, '/var/www/vonholtencodes.com/starbase1/')
from app import app as application

if __name__ == "__main__":
    application.run()
EOF
```

### **3. Update Apache Configuration**
```bash
# Backup existing config
sudo cp /etc/apache2/sites-available/vonholtencodes.com.conf /etc/apache2/sites-available/vonholtencodes.com.conf.backup

# Add Starbase1 configuration to existing virtual host
# (Manual edit required - see Apache configuration above)
sudo nano /etc/apache2/sites-available/vonholtencodes.com.conf
```

### **4. Enable and Test**
```bash
# Test Apache configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2

# Test the application
curl -I https://www.vonholtencodes.com/starbase1
```

---

## 🧪 **Step 5: Testing & Validation**

### **Test Checklist**
- [ ] **Basic Access**: https://www.vonholtencodes.com/starbase1 loads
- [ ] **Windows 95 UI**: Proper styling and layout display
- [ ] **API Endpoints**: All /api/* endpoints return data
- [ ] **Real-time Updates**: Dashboard updates every 6 minutes
- [ ] **System Data**: CPU, memory, temperatures display correctly
- [ ] **Service Status**: Service monitoring works
- [ ] **User Sessions**: Active users display correctly
- [ ] **Mobile Responsive**: Works on mobile devices

### **Debugging Commands**
```bash
# Check Apache error logs
sudo tail -f /var/log/apache2/error.log

# Check Apache access logs
sudo tail -f /var/log/apache2/access.log

# Test WSGI application directly
sudo -u www-data python3 /var/www/vonholtencodes.com/starbase1/app.py

# Check permissions
ls -la /var/www/vonholtencodes.com/starbase1/
```

---

## 📊 **Step 6: Production Configuration**

### **Update app.py for Production**
Ensure production settings in `/var/www/vonholtencodes.com/starbase1/app.py`:
```python
# In app.py, ensure production config
app = create_app('production')
```

### **Update config.py for Production**
```python
class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SECRET_KEY = 'your-production-secret-key-here'
    REFRESH_INTERVAL = 360  # 6 minutes
```

---

## 🔄 **Step 7: Maintenance & Updates**

### **Update Procedure**
```bash
# 1. Upload new files to temp directory
scp -r updated_files/* user@server:/tmp/starbase1_update/

# 2. Backup current installation
sudo cp -r /var/www/vonholtencodes.com/starbase1 /var/www/vonholtencodes.com/starbase1.backup.$(date +%Y%m%d)

# 3. Update files
sudo cp -r /tmp/starbase1_update/* /var/www/vonholtencodes.com/starbase1/
sudo chown -R www-data:www-data /var/www/vonholtencodes.com/starbase1

# 4. Reload Apache
sudo systemctl reload apache2
```

### **Monitoring**
```bash
# Monitor application logs
sudo tail -f /var/log/apache2/error.log | grep starbase1

# Check system resources
htop
df -h
free -h
```

---

## 🎯 **Final Production URL**

**Dashboard Access**: https://www.vonholtencodes.com/starbase1

**API Endpoints**:
- https://www.vonholtencodes.com/starbase1/api/status
- https://www.vonholtencodes.com/starbase1/api/security
- https://www.vonholtencodes.com/starbase1/api/services
- https://www.vonholtencodes.com/starbase1/api/system
- https://www.vonholtencodes.com/starbase1/health

---

## ⚠️ **Important Notes**

1. **No Virtual Environment**: Application runs with system Python as requested
2. **Apache Only**: No custom ports, uses standard Apache configuration
3. **Subdirectory Deployment**: Runs under /starbase1 path, not subdomain
4. **Security**: Sudo permissions required for system monitoring
5. **SSL Required**: HTTPS recommended for production security monitoring
6. **Backup**: Always backup existing Apache config before changes

---

**🚀 Ready for production deployment at https://www.vonholtencodes.com/starbase1!**