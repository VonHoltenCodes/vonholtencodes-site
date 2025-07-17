// Starbase1_IO Dashboard JavaScript
// Windows 95 Style Interface Implementation

document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading Starbase1_IO Windows 95 Interface...');
    
    // Configuration
    const REFRESH_INTERVAL = 360000; // milliseconds (6 minutes)
    const UPDATE_TIMEOUT = 30000; // 30 seconds timeout for API calls

    // Initialize dashboard
    function initDashboard() {
        console.log('Starbase1_IO Windows 95 Interface initializing...');
        console.log('Refresh interval:', REFRESH_INTERVAL / 1000, 'seconds');
        
        // Initialize clock
        updateClock();
        setInterval(updateClock, 1000);
        
        // Initial load
        updateDashboard();
        
        // Set up periodic updates
        setInterval(updateDashboard, REFRESH_INTERVAL);
        
        console.log('Dashboard initialization complete');
    }

    // Update the clock in taskbar
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: true,
            hour: 'numeric',
            minute: '2-digit'
        });
        const clockEl = document.getElementById('currentTime');
        if (clockEl) {
            clockEl.textContent = timeString;
        }
    }

    // Main update function
    async function updateDashboard() {
        console.log('Updating Windows 95 dashboard data...');
        updateConnectionStatus('updating');
        
        try {
            // Fetch all data concurrently
            const [securityResponse, servicesResponse, systemResponse] = await Promise.all([
                fetchWithTimeout('/api/security'),
                fetchWithTimeout('/api/services'),
                fetchWithTimeout('/api/system')
            ]);
            
            // Update each section
            updateUserSessions(securityResponse.data);
            updateSecurityEvents(securityResponse.data);
            updateServices(servicesResponse.data);
            updateSystemInfo(systemResponse.data);
            updateOverallHealth(securityResponse.data, servicesResponse.data, systemResponse.data);
            
            updateConnectionStatus('connected');
            console.log('Dashboard data updated successfully');
            
        } catch (error) {
            console.error('Dashboard update failed:', error);
            updateConnectionStatus('error');
            showError('Failed to update dashboard data');
        }
    }

    // Fetch data with timeout
    async function fetchWithTimeout(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), UPDATE_TIMEOUT);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { data, status: response.status };
            
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    // Update user sessions
    function updateUserSessions(securityData) {
        try {
            const userList = document.getElementById('userList');
            const userCount = document.getElementById('userCount');
            
            if (!securityData || !securityData.active_users) {
                userList.innerHTML = '<div class="loading">No user data available</div>';
                userCount.textContent = '(0)';
                return;
            }
            
            const users = securityData.active_users;
            userCount.textContent = `(${users.length})`;
            
            if (users.length === 0) {
                userList.innerHTML = '<div class="loading">No active users</div>';
                return;
            }
            
            userList.innerHTML = users.map(user => `
                <div class="listview-item">
                    <span><strong>${user.username}</strong> (${user.terminal})</span>
                    <span>${user.login_time}</span>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error updating user sessions:', error);
            const userList = document.getElementById('userList');
            if (userList) {
                userList.innerHTML = '<div class="error">Failed to load user data</div>';
            }
        }
    }

    // Update security events
    function updateSecurityEvents(securityData) {
        try {
            const failedLoginsEl = document.getElementById('failedLogins');
            const lastFailureEl = document.getElementById('lastFailure');
            
            if (!securityData) {
                if (failedLoginsEl) failedLoginsEl.textContent = 'N/A';
                if (lastFailureEl) lastFailureEl.textContent = 'No data';
                return;
            }
            
            const failedLogins = securityData.failed_logins || {};
            
            if (failedLoginsEl) {
                failedLoginsEl.textContent = failedLogins.total_count || 0;
            }
            
            if (lastFailureEl) {
                if (failedLogins.last_attempt) {
                    lastFailureEl.textContent = failedLogins.last_attempt.timestamp || 'Unknown';
                } else {
                    lastFailureEl.textContent = 'None recent';
                }
            }
            
        } catch (error) {
            console.error('Error updating security events:', error);
            const failedLoginsEl = document.getElementById('failedLogins');
            const lastFailureEl = document.getElementById('lastFailure');
            if (failedLoginsEl) failedLoginsEl.textContent = 'ERROR';
            if (lastFailureEl) lastFailureEl.textContent = 'FAILED TO LOAD';
        }
    }

    // Update services status
    function updateServices(servicesData) {
        try {
            const servicesList = document.getElementById('servicesList');
            
            if (!servicesData || !servicesData.services) {
                servicesList.innerHTML = '<div class="loading">No service data available</div>';
                return;
            }
            
            const services = servicesData.services;
            
            if (services.length === 0) {
                servicesList.innerHTML = '<div class="loading">No services monitored</div>';
                return;
            }
            
            servicesList.innerHTML = services.map(service => {
                const statusLower = service.status.toLowerCase();
                const statusClass = statusLower === 'running' ? 'service-running' : 
                                   statusLower === 'stopped' ? 'service-stopped' : 'service-error';
                const statusText = service.status.toUpperCase();
                
                return `
                    <div class="listview-item">
                        <span><span class="service-icon ${statusClass}"></span>${service.name}</span>
                        <span class="text-bold">${statusText}</span>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Error updating services:', error);
            const servicesList = document.getElementById('servicesList');
            if (servicesList) {
                servicesList.innerHTML = '<div class="error">Failed to load service data</div>';
            }
        }
    }

    // Update system information
    function updateSystemInfo(systemData) {
        try {
            if (!systemData) return;
            
            // CPU and Memory
            updateElementText('cpuModel', systemData.cpu?.model || 'Unknown');
            updateElementText('cpuUsage', systemData.cpu?.usage_percent ? `${systemData.cpu.usage_percent}%` : '-');
            updateElementText('cpuSpeed', systemData.cpu?.current_freq ? `${Math.round(systemData.cpu.current_freq)} MHz` : '-');
            
            updateElementText('memoryUsed', systemData.memory?.used || '-');
            updateElementText('memoryTotal', systemData.memory?.total || '-');
            updateElementText('memoryPercent', systemData.memory?.percent ? `${systemData.memory.percent}%` : '-');
            
            // Temperatures - fix the mapping
            const temperatures = systemData.temperatures || {};
            let cpuTemp = 'N/A';
            let systemTemp = 'N/A';
            
            // Look for coretemp entries (CPU temperature)
            if (temperatures.coretemp && Array.isArray(temperatures.coretemp)) {
                // Get the Package id 0 temperature (overall CPU temp)
                const packageTemp = temperatures.coretemp.find(t => t.label && t.label.includes('Package'));
                if (packageTemp && packageTemp.temp_f) {
                    cpuTemp = packageTemp.temp_f.toFixed(1) + '°F';
                } else if (temperatures.coretemp[0] && temperatures.coretemp[0].temp_f) {
                    // Fallback to first temperature reading
                    cpuTemp = temperatures.coretemp[0].temp_f.toFixed(1) + '°F';
                }
            }
            
            // Look for acpitz entries (System temperature)
            if (temperatures.acpitz && Array.isArray(temperatures.acpitz)) {
                if (temperatures.acpitz[0] && temperatures.acpitz[0].temp_f) {
                    systemTemp = temperatures.acpitz[0].temp_f.toFixed(1) + '°F';
                }
            }
            
            updateElementText('cpuTemp', cpuTemp);
            updateElementText('systemTemp', systemTemp);
            
            // BIOS Info
            updateElementText('biosVendor', systemData.bios?.vendor || 'Unknown');
            updateElementText('biosVersion', systemData.bios?.version || 'Unknown');
            updateElementText('motherboard', systemData.bios?.board_name || 'Unknown');
            
            // Disk Info - fix the mapping
            const disks = systemData.disks || [];
            updateElementText('driveCount', disks.length.toString());
            updateElementText('diskUsage', systemData.disk_usage?.used || '-');
            updateElementText('diskFree', systemData.disk_usage?.free || '-');
            
            // Network
            updateElementText('networkIn', systemData.network?.bytes_recv || '-');
            updateElementText('networkOut', systemData.network?.bytes_sent || '-');
            
            // System uptime
            updateElementText('bootTime', systemData.boot_time || '-');
            updateElementText('uptime', systemData.uptime || '-');
            
        } catch (error) {
            console.error('Error updating system info:', error);
        }
    }
    
    // Helper function to safely update element text
    function updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }
    
    // Update overall system health
    function updateOverallHealth(securityData, servicesData, systemData) {
        try {
            const healthStatus = document.getElementById('overallHealth');
            const healthDetails = document.getElementById('healthDetails');
            
            if (!healthStatus || !healthDetails) return;
            
            // Calculate overall health metrics
            const totalServices = servicesData?.services ? servicesData.services.length : 0;
            const runningServices = servicesData?.services ? 
                servicesData.services.filter(s => s.status === 'running').length : 0;
            
            const activeUsers = securityData?.active_users ? securityData.active_users.length : 0;
            const failedLogins = securityData?.failed_logins?.total_count || 0;
            const cpuUsage = systemData?.cpu?.usage_percent || 0;
            const memoryUsage = systemData?.memory?.percent || 0;
            
            // Simple status logic - just show ONLINE if system is responding
            let status = 'ONLINE';
            let statusClass = 'status-good';
            
            // Only show WARNING for very high resource usage
            if (cpuUsage > 90 || memoryUsage > 95) {
                status = 'WARNING';
                statusClass = 'status-warning';
            }
            
            // Only show CRITICAL for extreme resource usage
            if (cpuUsage > 98 || memoryUsage > 98) {
                status = 'CRITICAL';
                statusClass = 'status-error';
            }
            
            // Update display
            healthStatus.innerHTML = `<span class="${statusClass}">System Status: ${status}</span>`;
            healthDetails.innerHTML = `
                <span>Services: ${runningServices}/${totalServices}</span>
                <span>Users: ${activeUsers}</span>
                <span>Security: ${failedLogins}</span>
                <span>CPU: ${cpuUsage}%</span>
                <span>Memory: ${memoryUsage}%</span>
                <span id="lastUpdate">Last Updated: ${new Date().toLocaleTimeString()}</span>
            `;
            
        } catch (error) {
            console.error('Error updating overall health:', error);
        }
    }

    // Update connection status
    function updateConnectionStatus(status) {
        const connectionStatus = document.getElementById('connectionStatus');
        const systemStatus = document.getElementById('systemStatus');
        
        switch(status) {
            case 'connected':
                if (connectionStatus) connectionStatus.textContent = 'Connected';
                if (systemStatus) {
                    systemStatus.textContent = 'Online';
                    systemStatus.className = 'status-good';
                }
                break;
            case 'updating':
                if (connectionStatus) connectionStatus.textContent = 'Updating...';
                if (systemStatus) {
                    systemStatus.textContent = 'Updating';
                    systemStatus.className = 'status-warning';
                }
                break;
            case 'error':
                if (connectionStatus) connectionStatus.textContent = 'Error';
                if (systemStatus) {
                    systemStatus.textContent = 'Error';
                    systemStatus.className = 'status-error';
                }
                break;
        }
    }

    // Show error message
    function showError(message) {
        console.error('Windows 95 Interface Error:', message);
        // Could implement Windows 95 style error dialog here
    }

    // Utility function to format bytes
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Global error handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        showError('Unexpected error occurred');
    });

    // Start the dashboard
    initDashboard();
});