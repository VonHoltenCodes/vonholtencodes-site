/**
 * Time widgets functionality for VonHoltenCodes site
 * Handles the birthday counter and world clock
 */

document.addEventListener('DOMContentLoaded', function() {
    initBirthdayCounter();
    initWorldClock();
    
    // Update time displays every second
    setInterval(function() {
        updateBirthdayCounter();
        updateWorldClock();
    }, 1000);
});

/**
 * Initialize the birthday counter
 */
function initBirthdayCounter() {
    console.log('Birthday counter initialized');
    updateBirthdayCounter();
}

/**
 * Update the birthday counter display
 * Birthday: May 27th, 1984 at 1:27pm Central Time
 */
function updateBirthdayCounter() {
    // Get elements
    const ageDisplay = document.getElementById('age-value');
    const daysValue = document.getElementById('days-value');
    const hoursValue = document.getElementById('hours-value');
    const minutesValue = document.getElementById('minutes-value');
    const secondsValue = document.getElementById('seconds-value');
    
    if (!ageDisplay || !daysValue || !hoursValue || !minutesValue || !secondsValue) {
        return; // Elements not found
    }
    
    // Set birthday (May 27, 1984 at 1:27pm Central Time)
    const birthday = new Date('1984-05-27T13:27:00-05:00');
    const now = new Date();
    
    // Calculate age
    const ageInMilliseconds = now - birthday;
    const ageDate = new Date(ageInMilliseconds);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    
    // Calculate time elapsed since last birthday
    const lastBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate(), 
                               birthday.getHours(), birthday.getMinutes(), birthday.getSeconds());
    
    // If this year's birthday hasn't happened yet, use last year's birthday
    if (lastBirthday > now) {
        lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
    }
    
    // Calculate time difference
    const diff = now - lastBirthday;
    
    // Convert to days, hours, minutes, seconds
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Update the display
    ageDisplay.textContent = years;
    daysValue.textContent = days.toString().padStart(2, '0');
    hoursValue.textContent = hours.toString().padStart(2, '0');
    minutesValue.textContent = minutes.toString().padStart(2, '0');
    secondsValue.textContent = seconds.toString().padStart(2, '0');
}

/**
 * Initialize the world clock
 */
function initWorldClock() {
    console.log('World clock initialized');
    updateWorldClock();
}

/**
 * Update the world clock displays
 */
function updateWorldClock() {
    // Define time zones to display
    const timeZones = [
        { element: 'local-time', zone: Intl.DateTimeFormat().resolvedOptions().timeZone, label: 'Local' },
        { element: 'utc-time', zone: 'UTC', label: 'UTC' },
        { element: 'eastern-time', zone: 'America/New_York', label: 'Eastern' },
        { element: 'pacific-time', zone: 'America/Los_Angeles', label: 'Pacific' }
    ];
    
    const now = new Date();
    
    // Update each clock
    timeZones.forEach(tz => {
        const timeElement = document.getElementById(tz.element);
        
        if (!timeElement) {
            return; // Element not found
        }
        
        try {
            // Format the time for the specified timezone
            const options = { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit', 
                hour12: false,
                timeZone: tz.zone 
            };
            
            const timeString = new Intl.DateTimeFormat('en-US', options).format(now);
            timeElement.textContent = timeString;
        } catch (error) {
            console.error(`Error formatting time for ${tz.zone}:`, error);
            timeElement.textContent = '--:--:--';
        }
    });
}