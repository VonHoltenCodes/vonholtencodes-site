# 🛰️ Starbase1_IO CLI Terminal Interface - Access Guide

## ✅ **SYSTEM STATUS: OPERATIONAL**

The Starbase1_IO CLI Terminal Interface is **RUNNING** and ready for access!

---

## 🌐 **ACCESS INFORMATION**

### **Primary Dashboard**
```
http://localhost:5000
```

### **API Endpoints**
- **System Status**: http://localhost:5000/api/status
- **Security Data**: http://localhost:5000/api/security  
- **Service Status**: http://localhost:5000/api/services
- **System Hardware**: http://localhost:5000/api/system
- **Health Check**: http://localhost:5000/health

---

## 🚀 **SERVER MANAGEMENT**

### **Start Server**
```bash
cd /home/traxx/starbase1_IO
./start_server.sh
```

### **Stop Server**
```bash
cd /home/traxx/starbase1_IO
./stop_server.sh
```

### **View Server Logs**
```bash
cd /home/traxx/starbase1_IO
tail -f starbase1_io.log
```

### **Check Server Status**
```bash
curl http://localhost:5000/health
```

---

## 🖥️ **CLI TERMINAL FEATURES**

### **Visual Design**
- ✅ **Black background** with bright green terminal text
- ✅ **Monospace fonts** for authentic terminal feel
- ✅ **Terminal prompt indicators** (">>>", "$", "#")
- ✅ **Scanline animations** and terminal glow effects
- ✅ **CLI-style status messages** 

### **System Monitoring**
- ✅ **CPU**: Model, usage %, current frequency
- ✅ **Memory**: Used, total, available, percentage
- ✅ **Temperature**: CPU and system temps in Fahrenheit
- ✅ **BIOS**: Vendor, version, motherboard info
- ✅ **Storage**: Disk usage, free space, drive count
- ✅ **Network**: Bytes sent/received, packet counts
- ✅ **Uptime**: Boot time and system uptime

### **Real-Time Updates**
- ✅ **6-minute refresh intervals** (360 seconds)
- ✅ **Automatic data refresh** without page reload
- ✅ **Live system health monitoring**
- ✅ **Terminal-style status indicators**

---

## 📊 **DASHBOARD SECTIONS**

### **1. CPU & Memory Panel**
- CPU model and current usage percentage
- CPU frequency and core information  
- Memory usage statistics (used/total/percentage)

### **2. Temps & Hardware Panel**
- CPU and system temperatures in Fahrenheit
- BIOS vendor, version, and motherboard info
- Total drive count

### **3. Active Users Panel**
- Current logged-in users
- Login times and terminal sessions
- User session tracking

### **4. Security Events Panel**
- Failed login attempt counts
- Last failed login timestamp
- Security status monitoring

### **5. Service Status Panel**
- Core service health (Apache, MySQL, SSH, etc.)
- Service status with CLI-style indicators
- Real-time service monitoring

### **6. Storage & Network Panel**
- Disk usage and free space
- Network traffic statistics
- Boot time and uptime information

---

## 🔧 **TROUBLESHOOTING**

### **If the dashboard doesn't load:**
1. Check if server is running: `curl http://localhost:5000/health`
2. View server logs: `tail starbase1_io.log`
3. Restart server: `./stop_server.sh && ./start_server.sh`

### **If port 5000 is in use:**
```bash
echo "VonHolten2025" | sudo -S lsof -ti:5000 | xargs sudo kill -9
```

### **For permission issues:**
- BIOS data requires sudo access for dmidecode
- Temperature sensors may need hardware sensor access
- Service status checking uses systemctl

---

## 🎯 **CURRENT CAPABILITIES**

✅ **Fully Operational CLI Terminal Interface**  
✅ **Real-time system hardware monitoring**  
✅ **6-minute automatic refresh cycles**  
✅ **CLI aesthetic with green-on-black styling**  
✅ **Comprehensive system information display**  
✅ **Temperature monitoring in Fahrenheit**  
✅ **BIOS and hardware details**  
✅ **Service and security monitoring**  
✅ **Background server process**  

---

**🚀 The Starbase1_IO CLI Terminal Interface is ready for development/testing use!**

Access your dashboard at: **http://localhost:5000**