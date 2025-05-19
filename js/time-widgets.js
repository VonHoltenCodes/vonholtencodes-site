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
 * Shows Zulu (UTC) time for all locations
 */
function updateWorldClock() {
    // Define locations to display in Zulu time
    const locations = [
        { element: 'chicago-time', zone: 'America/Chicago', label: 'Chicago' },
        { element: 'newyork-time', zone: 'America/New_York', label: 'New York' },
        { element: 'sandiego-time', zone: 'America/Los_Angeles', label: 'San Diego' },
        { element: 'tokyo-time', zone: 'Asia/Tokyo', label: 'Tokyo' },
        { element: 'bethlehem-time', zone: 'Asia/Jerusalem', label: 'Bethlehem' }
    ];
    
    const now = new Date();
    
    // Update each clock - always showing Zulu (UTC) time
    locations.forEach(location => {
        const timeElement = document.getElementById(location.element);
        
        if (!timeElement) {
            return; // Element not found
        }
        
        try {
            // Get the time in the location's timezone
            const localTime = new Date(now.toLocaleString('en-US', { timeZone: location.zone }));
            
            // Format as Zulu time (24-hour format)
            const hours = localTime.getUTCHours().toString().padStart(2, '0');
            const minutes = localTime.getUTCMinutes().toString().padStart(2, '0');
            const seconds = localTime.getUTCSeconds().toString().padStart(2, '0');
            
            // Format as HH:MM:SS
            const timeString = `${hours}:${minutes}:${seconds}Z`;
            timeElement.textContent = timeString;
        } catch (error) {
            console.error(`Error formatting time for ${location.zone}:`, error);
            timeElement.textContent = '--:--:--Z';
        }
    });
}