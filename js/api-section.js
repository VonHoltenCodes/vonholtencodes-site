/**
 * API Section Functionality for VonHoltenCodes site
 * Handles API integrations for NASA, USGS, Joker, and Weather
 */

document.addEventListener('DOMContentLoaded', function() {
    initApiSection();
});

/**
 * Initialize API section
 */
function initApiSection() {
    console.log('API section initialized');
    
    // Setup NASA API functionality
    setupNasaApi();
    
    // Setup USGS Earthquake API functionality
    setupUsgsApi();
    
    // Setup Joker API functionality
    setupJokerApi();
    
    // Setup Weather API functionality - ensure this runs last
    // to make sure the DOM is fully loaded
    setTimeout(setupWeatherApi, 100);
}

/**
 * Setup NASA API functionality
 */
function setupNasaApi() {
    // NASA APOD button click handler
    const nasaButton = document.getElementById('nasa-api-button');
    if (nasaButton) {
        nasaButton.addEventListener('click', function() {
            showNasaModal();
        });
    }
}

/**
 * Show NASA API modal
 */
function showNasaModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('nasa-modal');
    if (!modal) {
        modal = createApiModal('nasa-modal', 'NASA Astronomy Picture of the Day');
        document.body.appendChild(modal);
    }
    
    // Clear previous content and show loading
    const modalContent = modal.querySelector('.api-modal-content');
    modalContent.innerHTML = '<h2>NASA Astronomy Picture of the Day</h2>';
    modalContent.innerHTML += '<div class="api-loading">Loading NASA data...</div>';
    
    // Show modal
    modal.style.display = 'block';
    
    // Fetch NASA APOD data
    fetchNasaApod(modalContent);
}

/**
 * Fetch NASA APOD data
 */
async function fetchNasaApod(container) {
    try {
        // NASA API Key
        const nasaApiKey = 'DNRz2QfzI5uw2HvSVnVmgUpqj0ETOtRclf9UCWmt';
        
        // Fetch APOD data
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`);
        const data = await response.json();
        
        // Create APOD content
        let content = `
            <h2>NASA Astronomy Picture of the Day</h2>
            <h3>${data.title}</h3>
            <p class="nasa-date">Date: ${data.date}</p>
        `;
        
        // Add media (image or video)
        if (data.media_type === 'image') {
            content += `<img src="${data.url}" alt="${data.title}" style="max-width: 100%; max-height: 60vh; display: block; margin: 0 auto 20px;">`;
        } else if (data.media_type === 'video') {
            content += `<iframe src="${data.url}" style="width: 100%; height: 50vh; margin-bottom: 20px;"></iframe>`;
        }
        
        // Add explanation
        content += `<p>${data.explanation}</p>`;
        
        // Update container
        container.innerHTML = content;
        
    } catch (error) {
        container.innerHTML = `
            <h2>NASA Astronomy Picture of the Day</h2>
            <div class="api-error">Error loading NASA data: ${error.message}</div>
        `;
    }
}

/**
 * Setup USGS Earthquake API functionality
 */
function setupUsgsApi() {
    // USGS Earthquake button click handler
    const usgsButton = document.getElementById('usgs-api-button');
    if (usgsButton) {
        usgsButton.addEventListener('click', function() {
            showUsgsModal();
        });
    }
}

/**
 * Show USGS API modal
 */
function showUsgsModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('usgs-modal');
    if (!modal) {
        modal = createApiModal('usgs-modal', 'USGS Earthquake Monitor');
        document.body.appendChild(modal);
    }
    
    // Clear previous content and show loading
    const modalContent = modal.querySelector('.api-modal-content');
    modalContent.innerHTML = '<h2>USGS Earthquake Monitor</h2>';
    modalContent.innerHTML += '<div class="api-loading">Loading earthquake data...</div>';
    
    // Show modal
    modal.style.display = 'block';
    
    // Setup earthquake map
    setupEarthquakeMap(modalContent);
}

/**
 * Setup earthquake map
 */
function setupEarthquakeMap(container) {
    try {
        // Add header content
        container.innerHTML = `
            <h2>USGS Earthquake Monitor</h2>
            <p class="map-description">Discover where earthquakes are happening around the world in real-time with this interactive retro-styled map.</p>
            
            <div class="earthquake-controls">
                <button class="earthquake-time-control active" data-period="hour">Past Hour</button>
                <button class="earthquake-time-control" data-period="day">Past Day</button>
                <button class="earthquake-time-control" data-period="week">Past Week</button>
                <button class="earthquake-time-control" data-period="month">Past Month</button>
            </div>
            
            <div class="earthquake-map-container">
                <div class="map-header">
                    <span class="map-header-text">USGS REAL-TIME EARTHQUAKE MONITOR</span>
                    <span class="map-header-blinker">_</span>
                </div>
                <div id="earthquake-map"></div>
                <div class="earthquake-legend">
                    <h4>MAGNITUDE SCALE</h4>
                    <div class="magnitude-item">
                        <div class="magnitude-color pulse-animation" style="background-color: #2ecc71; border: 2px solid #1abc9c;"></div>
                        <span>&lt; 3.0 (MINOR)</span>
                    </div>
                    <div class="magnitude-item">
                        <div class="magnitude-color pulse-animation" style="background-color: #f39c12; border: 2px solid #f1c40f;"></div>
                        <span>3.0 - 4.9 (MODERATE)</span>
                    </div>
                    <div class="magnitude-item">
                        <div class="magnitude-color pulse-animation" style="background-color: #e74c3c; border: 2px solid #ff6b8b;"></div>
                        <span>5.0+ (SIGNIFICANT)</span>
                    </div>
                </div>
                <div class="map-overlay-grid"></div>
                <div class="map-corner top-left"></div>
                <div class="map-corner top-right"></div>
                <div class="map-corner bottom-left"></div>
                <div class="map-corner bottom-right"></div>
            </div>
            
            <div class="earthquake-count"></div>
            
            <div class="usgs-footer">
                <p>Data provided by <a href="https://earthquake.usgs.gov/" target="_blank">USGS</a></p>
            </div>
        `;
        
        // Initialize map
        initEarthquakeMap();
        
        // Add event listeners to time controls
        const timeControls = container.querySelectorAll('.earthquake-time-control');
        timeControls.forEach(control => {
            control.addEventListener('click', function() {
                // Remove active class from all controls
                timeControls.forEach(c => c.classList.remove('active'));
                // Add active class to clicked control
                this.classList.add('active');
                
                // Load earthquakes for the selected period
                const period = this.dataset.period;
                loadEarthquakes(period);
            });
        });
        
    } catch (error) {
        container.innerHTML = `
            <h2>USGS Earthquake Monitor</h2>
            <div class="api-error">Error setting up earthquake map: ${error.message}</div>
        `;
    }
}

// Global map variable
let earthquakeMap;
// Global layer variable
let earthquakeLayer;

/**
 * Initialize earthquake map
 */
function initEarthquakeMap() {
    try {
        // Create map with custom options
        earthquakeMap = L.map('earthquake-map', {
            center: [20, 0],
            zoom: 2,
            zoomControl: true,
            attributionControl: true,
            scrollWheelZoom: true,
            dragging: true,
            zoomSnap: 0.5,
            zoomDelta: 0.5,
            minZoom: 1.5,
            maxZoom: 12,
        });
        
        // Add dark basemap for retro look
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://earthquake.usgs.gov/">USGS</a>',
            subdomains: 'abcd',
            maxZoom: 12
        }).addTo(earthquakeMap);
        
        // Add retro scanlines overlay
        L.tileLayer('https://cdn.jsdelivr.net/gh/turban/Leaflet.Mask@master/example/img/scanline.png', {
            opacity: 0.15,
            maxZoom: 12
        }).addTo(earthquakeMap);
        
        // Create layer for earthquakes
        earthquakeLayer = L.layerGroup().addTo(earthquakeMap);
        
        // Load earthquakes for the past hour (default)
        loadEarthquakes('hour');
        
    } catch (error) {
        console.error('Error initializing map:', error);
        document.querySelector('.earthquake-map-container').innerHTML = `
            <div class="api-error">Error initializing map: ${error.message}</div>
        `;
    }
}

/**
 * Load earthquakes for a given time period
 */
function loadEarthquakes(period) {
    try {
        // Show loading in count display
        const countDisplay = document.querySelector('.earthquake-count');
        if (countDisplay) {
            countDisplay.textContent = 'Loading earthquake data...';
        }
        
        // Clear existing earthquakes
        if (earthquakeLayer) {
            earthquakeLayer.clearLayers();
        }
        
        // Fetch earthquake data
        fetch(`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${period}.geojson`)
            .then(response => response.json())
            .then(data => {
                // Display earthquakes on map
                displayEarthquakes(data);
                
                // Update count display
                if (countDisplay) {
                    countDisplay.textContent = `Total earthquakes in the selected period: ${data.metadata.count}`;
                }
            })
            .catch(error => {
                console.error('Error fetching earthquake data:', error);
                if (countDisplay) {
                    countDisplay.textContent = `Error loading earthquake data: ${error.message}`;
                }
            });
            
    } catch (error) {
        console.error('Error loading earthquakes:', error);
    }
}

/**
 * Display earthquakes on map
 */
function displayEarthquakes(data) {
    try {
        // Loop through earthquake features
        data.features.forEach(feature => {
            // Get earthquake properties
            const mag = feature.properties.mag;
            const depth = feature.geometry.coordinates[2];
            const place = feature.properties.place;
            const time = new Date(feature.properties.time).toLocaleString();
            const url = feature.properties.url;
            const longitude = feature.geometry.coordinates[0];
            const latitude = feature.geometry.coordinates[1];
            
            // Determine radius based on magnitude (exponential scale)
            // Modified to make markers larger and more visible
            const radius = Math.pow(mag, 1.5) * 0.8;
            
            // Determine color based on magnitude (with retro colors)
            let color, pulseColor;
            if (mag >= 5) {
                // High magnitude - red with pink pulse
                color = '#e74c3c';
                pulseColor = '#ff6b8b';
            } else if (mag >= 3) {
                // Medium magnitude - orange with yellow pulse
                color = '#f39c12';
                pulseColor = '#f1c40f';
            } else {
                // Low magnitude - green with cyan pulse
                color = '#2ecc71';
                pulseColor = '#1abc9c';
            }
            
            // Create retro pixel-like circle marker with pulsing effect
            const marker = L.circleMarker([latitude, longitude], {
                radius: radius,
                fillColor: color,
                color: pulseColor,
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.7,
                className: `earthquake-marker magnitude-${mag >= 5 ? 'high' : mag >= 3 ? 'medium' : 'low'}`
            });
            
            // Add CSS animation for pulsing effect
            const style = document.createElement('style');
            style.innerHTML = `
                .earthquake-marker {
                    animation: pulse 2s infinite;
                }
                .magnitude-high {
                    animation-duration: 1s;
                }
                .magnitude-medium {
                    animation-duration: 1.5s;
                }
                .magnitude-low {
                    animation-duration: 2s;
                }
                @keyframes pulse {
                    0% { opacity: 0.7; }
                    50% { opacity: 1; }
                    100% { opacity: 0.7; }
                }
            `;
            document.head.appendChild(style);
            
            // Add enhanced popup with earthquake info
            marker.bindPopup(`
                <div class="earthquake-info">
                    <h4>MAG ${mag.toFixed(1)}</h4>
                    <p><strong>LOCATION:</strong> ${place}</p>
                    <p><strong>TIME:</strong> ${time}</p>
                    <p><strong>DEPTH:</strong> ${depth.toFixed(1)} km</p>
                    <p><strong>COORDS:</strong> ${latitude.toFixed(2)}, ${longitude.toFixed(2)}</p>
                    <a href="${url}" target="_blank">USGS DATA >></a>
                </div>
            `);
            
            // Also add hover effect with tooltip showing basic info
            marker.bindTooltip(`Mag ${mag.toFixed(1)} | ${place}`, {
                direction: 'top',
                className: 'earthquake-tooltip'
            });
            
            // Add marker to layer
            earthquakeLayer.addLayer(marker);
        });
        
    } catch (error) {
        console.error('Error displaying earthquakes:', error);
    }
}

/**
 * Fetch USGS earthquakes by time period (for legacy support)
 */
async function fetchUsgsEarthquakesByPeriod(container, period) {
    try {
        // Note: This function is kept for backwards compatibility
        const earthquakeList = container.querySelector('.usgs-earthquake-list');
        if (earthquakeList) {
            earthquakeList.innerHTML = '<div class="api-loading">Loading earthquake data...</div>';
        }
        
        // Fetch earthquake data
        const response = await fetch(`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${period}.geojson`);
        const data = await response.json();
        
        // Update footer with count
        const footer = container.querySelector('.usgs-footer');
        if (footer) {
            footer.innerHTML = `
                <p>Data provided by <a href="https://earthquake.usgs.gov/" target="_blank">USGS</a></p>
                <p>Total earthquakes in the selected period: ${data.metadata.count}</p>
            `;
        }
    } catch (error) {
        console.error('Error in legacy earthquake loader:', error);
    }
}

/**
 * Setup Joker API functionality
 */
function setupJokerApi() {
    // Joker button click handler
    const jokerButton = document.getElementById('joker-api-button');
    if (jokerButton) {
        jokerButton.addEventListener('click', function() {
            showJokerModal();
        });
    }
}

/**
 * Show Joker API modal
 */
function showJokerModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('joker-modal');
    if (!modal) {
        modal = createApiModal('joker-modal', 'The Joker - Kid-Friendly Jokes');
        document.body.appendChild(modal);
    }
    
    // Clear previous content and show loading
    const modalContent = modal.querySelector('.api-modal-content');
    modalContent.innerHTML = '<h2>The Joker - Kid-Friendly Jokes</h2>';
    modalContent.innerHTML += '<div class="api-loading">Fetching a joke...</div>';
    
    // Show modal
    modal.style.display = 'block';
    
    // Fetch joke
    fetchJoke(modalContent);
}

/**
 * Fetch joke from Joke API
 */
async function fetchJoke(container, category = 'Any') {
    try {
        // Ensure jokes are kid-friendly
        const blacklistFlags = 'nsfw,religious,political,racist,sexist,explicit';
        
        // Fetch a joke
        const response = await fetch(`https://v2.jokeapi.dev/joke/${category}?safe-mode&blacklistFlags=${blacklistFlags}`);
        const data = await response.json();
        
        // Create joke content
        let content = `
            <h2>The Joker - Kid-Friendly Jokes</h2>
            <div class="joke-container">
        `;
        
        if (data.error) {
            content += `<div class="api-error">${data.message}</div>`;
        } else {
            if (data.type === 'single') {
                content += `<p class="joke-text">${data.joke}</p>`;
            } else {
                content += `
                    <p class="joke-setup">${data.setup}</p>
                    <p class="joke-delivery">${data.delivery}</p>
                `;
            }
            
            content += `<div class="joke-category">Category: ${data.category}</div>`;
        }
        
        content += '</div>';
        
        // Add category selector
        content += `
            <div class="joke-categories">
                <h3>Select Category</h3>
                <div class="joke-category-buttons">
                    <button class="joke-category-button ${category === 'Any' ? 'active' : ''}" data-category="Any">Any</button>
                    <button class="joke-category-button ${category === 'Misc' ? 'active' : ''}" data-category="Misc">Misc</button>
                    <button class="joke-category-button ${category === 'Programming' ? 'active' : ''}" data-category="Programming">Programming</button>
                    <button class="joke-category-button ${category === 'Pun' ? 'active' : ''}" data-category="Pun">Pun</button>
                    <button class="joke-category-button ${category === 'Spooky' ? 'active' : ''}" data-category="Spooky">Spooky</button>
                    <button class="joke-category-button ${category === 'Christmas' ? 'active' : ''}" data-category="Christmas">Christmas</button>
                </div>
            </div>
            
            <button id="another-joke" class="joke-button">Another Joke</button>
        `;
        
        // Update container
        container.innerHTML = content;
        
        // Add event listeners to category buttons
        const categoryButtons = container.querySelectorAll('.joke-category-button');
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                categoryButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Fetch joke for selected category
                const category = this.dataset.category;
                fetchJoke(container, category);
            });
        });
        
        // Add event listener to "Another Joke" button
        const anotherButton = container.querySelector('#another-joke');
        if (anotherButton) {
            anotherButton.addEventListener('click', function() {
                // Get current active category
                const activeCategory = container.querySelector('.joke-category-button.active');
                const category = activeCategory ? activeCategory.dataset.category : 'Any';
                
                // Fetch another joke
                fetchJoke(container, category);
            });
        }
        
    } catch (error) {
        container.innerHTML = `
            <h2>The Joker - Kid-Friendly Jokes</h2>
            <div class="api-error">Error loading joke: ${error.message}</div>
        `;
    }
}

/**
 * Setup Weather API functionality
 */
function setupWeatherApi() {
    // Set up weather form - Make sure this only runs after DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        initWeatherForm();
    });

    // Initialize immediately if DOM is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initWeatherForm();
    }
}

/**
 * Initialize weather form with event listeners
 */
function initWeatherForm() {
    const weatherForm = document.getElementById('weather-form');
    const weatherCity = document.getElementById('weather-city');
    const weatherSearchBtn = document.querySelector('.weather-search-btn');
    
    if (weatherForm) {
        // Form submit event (handles Enter key press)
        weatherForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (weatherCity && weatherCity.value.trim()) {
                getWeather(weatherCity.value.trim());
            }
        });
        
        // Click event on the search button
        if (weatherSearchBtn) {
            weatherSearchBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (weatherCity && weatherCity.value.trim()) {
                    getWeather(weatherCity.value.trim());
                }
            });
        }
        
        // Add event for pressing Enter in the input field (redundant but ensures coverage)
        if (weatherCity) {
            weatherCity.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (this.value.trim()) {
                        getWeather(this.value.trim());
                    }
                }
            });
        }
        
        console.log('Weather form initialized with event listeners');
    } else {
        console.warn('Weather form element not found');
    }
}

/**
 * Get weather for a city
 */
function getWeather(city) {
    console.log('Getting weather for city:', city);
    const weatherResult = document.getElementById('weather-result');
    if (!weatherResult) {
        console.error('Weather result element not found');
        return;
    }
    
    weatherResult.innerHTML = '<div class="weather-loading">Fetching weather data...</div>';
    
    // Use a different approach with a public API that doesn't require an API key
    fetchWeatherViaCors(city, weatherResult);
}

/**
 * Fetch weather data using CORS-compatible public service
 */
function fetchWeatherViaCors(city, resultElement) {
    // Use the GeoDB Cities API to get location data first
    const geoUrl = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(city)}&limit=1`;
    
    console.log('Searching for city location:', city);
    
    // Fetch using a CORS proxy to avoid CORS issues
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const weatherBitApiKey = '9ce121b9ebe94c1aae9be1f0c89dfabb'; // WeatherBit free API key
    
    // Directly use the WeatherBit API with city name in imperial units
    const weatherUrl = `https://api.weatherbit.io/v2.0/current?city=${encodeURIComponent(city)}&key=${weatherBitApiKey}&units=I`;
    
    console.log('Fetching weather data for:', city);
    
    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather data request failed');
            }
            return response.json();
        })
        .then(data => {
            console.log('Weather data received:', data);
            if (data && data.data && data.data.length > 0) {
                displayWeatherBitData(data, resultElement);
            } else {
                throw new Error('City not found');
            }
        })
        .catch(error => {
            console.error('Weather API error:', error);
            
            // Try alternative API as backup
            console.log('Trying backup weather API...');
            fetchOpenMeteoWeather(city, resultElement);
        });
}

/**
 * Fetch weather using Open-Meteo API (doesn't require API key)
 */
function fetchOpenMeteoWeather(city, resultElement) {
    // First find coordinates for the city using Open-Meteo geocoding API
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    
    console.log('Fetching city coordinates from Open-Meteo');
    
    fetch(geocodeUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Geocoding request failed');
            }
            return response.json();
        })
        .then(data => {
            console.log('Geocoding data received:', data);
            
            if (data && data.results && data.results.length > 0) {
                const location = data.results[0];
                const latitude = location.latitude;
                const longitude = location.longitude;
                const cityName = location.name;
                const country = location.country;
                
                // Now get weather for these coordinates
                // Use Open-Meteo API with imperial units (fahrenheit and mph)
                const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;
                
                return fetch(weatherUrl).then(response => {
                    if (!response.ok) {
                        throw new Error('Weather data request failed');
                    }
                    return response.json().then(weatherData => {
                        return {
                            weather: weatherData,
                            city: cityName,
                            country: country
                        };
                    });
                });
            } else {
                throw new Error('City not found');
            }
        })
        .then(data => {
            console.log('Weather data received:', data);
            displayOpenMeteoData(data, resultElement);
        })
        .catch(error => {
            console.error('Open-Meteo API error:', error);
            
            // Just show error message, no fallback simulation
            console.error('All weather data sources failed');
            resultElement.innerHTML = `
                <div class="weather-error">
                    <p>Error: Could not load weather data for ${city}</p>
                    <p>Please try again later or try a different city.</p>
                </div>
            `;
        });
}

/**
 * Display weather data from WeatherBit API
 */
function displayWeatherBitData(data, resultElement) {
    try {
        const weatherData = data.data[0];
        const temp = Math.round(weatherData.temp);
        const feelsLike = Math.round(weatherData.app_temp);
        const description = weatherData.weather.description;
        const iconCode = weatherData.weather.icon;
        const humidity = weatherData.rh;
        const windSpeed = weatherData.wind_spd;
        const cityName = weatherData.city_name;
        const country = weatherData.country_code;
        
        // Icon URL for WeatherBit
        const iconUrl = `https://www.weatherbit.io/static/img/icons/${iconCode}.png`;
        
        updateWeatherUI(cityName, country, temp, feelsLike, description, iconUrl, humidity, windSpeed, resultElement);
    } catch (error) {
        console.error('Error displaying WeatherBit data:', error);
        // Try the fallback method - pass the city name from the original request
        fetchOpenMeteoWeather(weatherData?.city_name || data?.data?.[0]?.city_name || "the city", resultElement);
    }
}

/**
 * Display weather data from Open-Meteo API
 */
function displayOpenMeteoData(data, resultElement) {
    try {
        const weather = data.weather.current;
        const cityName = data.city;
        const country = data.country;
        
        const temp = Math.round(weather.temperature_2m);
        const feelsLike = Math.round(weather.apparent_temperature);
        const humidity = weather.relative_humidity_2m;
        const windSpeed = weather.wind_speed_10m;
        
        // Convert weather code to description and icon
        const weatherInfo = getWeatherInfo(weather.weather_code);
        const description = weatherInfo.description;
        
        // Use weather icons from Open-Meteo (fallback to generic icon)
        const iconUrl = `https://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`;
        
        updateWeatherUI(cityName, country, temp, feelsLike, description, iconUrl, humidity, windSpeed, resultElement);
    } catch (error) {
        console.error('Error displaying Open-Meteo data:', error);
        // Show error instead of using simulation
        resultElement.innerHTML = `
            <div class="weather-error">
                <p>Error: Could not display weather data.</p>
                <p>Please try again or try a different city.</p>
            </div>
        `;
    }
}

/**
 * Convert Open-Meteo weather code to description and icon
 */
function getWeatherInfo(code) {
    const weatherCodes = {
        0: { description: 'Clear sky', icon: '01d' },
        1: { description: 'Mainly clear', icon: '02d' },
        2: { description: 'Partly cloudy', icon: '03d' },
        3: { description: 'Overcast', icon: '04d' },
        45: { description: 'Fog', icon: '50d' },
        48: { description: 'Depositing rime fog', icon: '50d' },
        51: { description: 'Light drizzle', icon: '09d' },
        53: { description: 'Moderate drizzle', icon: '09d' },
        55: { description: 'Dense drizzle', icon: '09d' },
        56: { description: 'Light freezing drizzle', icon: '09d' },
        57: { description: 'Dense freezing drizzle', icon: '09d' },
        61: { description: 'Slight rain', icon: '10d' },
        63: { description: 'Moderate rain', icon: '10d' },
        65: { description: 'Heavy rain', icon: '10d' },
        66: { description: 'Light freezing rain', icon: '13d' },
        67: { description: 'Heavy freezing rain', icon: '13d' },
        71: { description: 'Slight snow fall', icon: '13d' },
        73: { description: 'Moderate snow fall', icon: '13d' },
        75: { description: 'Heavy snow fall', icon: '13d' },
        77: { description: 'Snow grains', icon: '13d' },
        80: { description: 'Slight rain showers', icon: '09d' },
        81: { description: 'Moderate rain showers', icon: '09d' },
        82: { description: 'Violent rain showers', icon: '09d' },
        85: { description: 'Slight snow showers', icon: '13d' },
        86: { description: 'Heavy snow showers', icon: '13d' },
        95: { description: 'Thunderstorm', icon: '11d' },
        96: { description: 'Thunderstorm with slight hail', icon: '11d' },
        99: { description: 'Thunderstorm with heavy hail', icon: '11d' }
    };
    
    return weatherCodes[code] || { description: 'Unknown weather', icon: '50d' };
}

// Simulation function removed

/**
 * Update the weather UI with provided data
 */
function updateWeatherUI(city, country, temp, feelsLike, description, iconUrl, humidity, windSpeed, resultElement) {
    resultElement.innerHTML = `
        <div class="weather-city">${city}, ${country}</div>
        <div class="weather-main">
            <img src="${iconUrl}" alt="${description}" onerror="this.src='https://openweathermap.org/img/wn/50d@2x.png'">
            <div class="weather-temp">${temp}°F</div>
        </div>
        <div class="weather-description">${description}</div>
        <div class="weather-details">
            <div>Feels like: ${feelsLike}°F</div>
            <div>Humidity: ${humidity}%</div>
            <div>Wind: ${windSpeed} mph</div>
        </div>
    `;
}

/**
 * Display weather data in the UI
 */
function displayWeatherData(data, resultElement) {
    try {
        // Extract weather data
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const description = data.weather[0].description;
        const icon = data.weather[0].icon;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const cityName = data.name;
        const country = data.sys.country;
        
        // Update the weather result
        resultElement.innerHTML = `
            <div class="weather-city">${cityName}, ${country}</div>
            <div class="weather-main">
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
                <div class="weather-temp">${temp}°C</div>
            </div>
            <div class="weather-description">${description}</div>
            <div class="weather-details">
                <div>Feels like: ${feelsLike}°C</div>
                <div>Humidity: ${humidity}%</div>
                <div>Wind: ${windSpeed} m/s</div>
            </div>
        `;
    } catch (error) {
        console.error('Error displaying weather data:', error);
        resultElement.innerHTML = `
            <div class="weather-error">
                <p>Error: Could not display weather data.</p>
                <p>Please try again or try a different city.</p>
            </div>
        `;
    }
}

/**
 * Create API modal
 */
function createApiModal(id, title) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'api-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'api-modal-content';
    
    // Add close button
    const closeButton = document.createElement('div');
    closeButton.className = 'api-modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    
    // Close modal when clicking outside content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Close modal when pressing ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
        }
    });
    
    return modal;
}