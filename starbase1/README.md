# 🛰️ Starbase1_IO - Security Dashboard

**Public server security monitoring with clean professional design**

## 🎯 Purpose
Read-only security and system monitoring dashboard displaying:
- 👥 Current logged in users and sessions
- 🚨 Failed login attempts and security events  
- ⚙️ Service status monitoring (apache, nginx, mysql, ssh, docker, etc.)

## 🎨 Design Philosophy
- **Clean white background** with black primary text
- **Professional card-based layout** with subtle shadows
- **Status color coding**: 🟢 Green (good), 🟡 Yellow (warning), 🔴 Red (error)
- **Responsive design** for mobile, tablet, and desktop
- **Real-time updates** without page refresh

## 🚀 Apache Integration
Designed for deployment as a subdomain:
- `stats.yourdomain.com`
- No authentication required (public monitoring)
- Apache mod_wsgi integration
- Minimal resource footprint

## 📊 Dashboard Features

### 👥 User Monitoring
- Active SSH/terminal sessions
- User login times and terminals
- Session duration tracking
- Recent login history

### 🚨 Security Events
- Failed login attempt counts (24h)
- Recent failed login sources
- Security pattern analysis
- Brute force detection indicators

### ⚙️ Service Health
- Core service status monitoring
- Service uptime tracking
- Port and configuration status
- Dependency health checks

## 🏗️ Project Structure
```
starbase1_IO/
├── README.md                    # This file
├── NEXT_STEPS.md               # Development roadmap
├── requirements.txt            # Python dependencies  
├── app.py                      # Main Flask application
├── config.py                   # Configuration settings
├── collectors/                 # Data collection modules
├── static/                     # CSS and JavaScript files
├── templates/                  # HTML templates
├── data/                       # Sample and test data
└── deploy/                     # Apache deployment configs
```

## 🔧 Technology Stack
- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Data Collection**: psutil, system commands
- **Deployment**: Apache mod_wsgi
- **Database**: JSON files (no external DB required)

## 📱 Interface Preview
```
┌────────────────────────────────────────────────────────────────────┐
│  🛰️ STARBASE1_IO                              [●] ONLINE  16:45:23  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  👥 ACTIVE USERS (3)            🚨 SECURITY EVENTS               │
│  ┌─────────────────────────┐    ┌─────────────────────────────────┐ │
│  │ 🟢 admin    pts/0  14:23 │    │ Failed Logins (24h): 23        │ │
│  │ 🟢 deploy   pts/1  15:45 │    │ Last Failed: 14:32:15         │ │
│  │ 🟢 monitor  ssh    16:12 │    │ Security Status: 🟢 Normal     │ │
│  └─────────────────────────┘    └─────────────────────────────────┘ │
│                                                                    │
│  ⚙️ SERVICE STATUS                                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 🟢 Apache      Running    🟢 MySQL       Running            │   │
│  │ 🟢 SSH         Running    🟡 Docker      Stopped            │   │
│  │ 🟢 Nginx       Running    🔴 PostgreSQL  Failed             │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

## 🌟 Key Benefits
- **No authentication required** - Perfect for public monitoring
- **Lightweight and fast** - Minimal server resource usage
- **Easy Apache integration** - Simple subdomain deployment
- **Professional appearance** - Clean, modern interface
- **Real-time monitoring** - Live status updates
- **Mobile-friendly** - Responsive design for all devices

## 📋 License
MIT License - Built by VonHoltenCodes

---

*A clean, professional approach to server monitoring - no dark terminals, just clear information.*