// Main application controller
class WorldRadioApp {
    constructor() {
        this.radioAPI = new RadioAPI();
        this.player = new AudioPlayer();
        this.stereoController = null;
        this.currentCountry = null;

        this.initApp();
    }

    initApp() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Initialize stereo controller
        this.stereoController = new StereoController(this.player);

        // Listen for country selection from globe
        document.addEventListener('countrySelected', (e) => {
            this.handleCountrySelected(e.detail);
        });

        // Listen for station selection
        document.addEventListener('stationSelected', (e) => {
            this.handleStationSelected(e.detail);
        });

        // Setup modal close button
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        // Setup return to stereo button
        document.getElementById('return-to-stereo').addEventListener('click', () => {
            this.showStereo();
        });

        console.log('World Radio Stereo initialized');
    }

    async handleCountrySelected(country) {
        this.currentCountry = country;

        // Show loading state
        this.showModal();
        document.getElementById('country-name').textContent = country.name;
        document.getElementById('stations-list').innerHTML = '<p style="text-align: center;">Loading stations...</p>';

        try {
            // Fetch stations for the selected country
            const stations = await this.radioAPI.getStationsByCountry(country.code);

            if (stations.length === 0) {
                document.getElementById('stations-list').innerHTML = '<p style="text-align: center;">No stations found for this country.</p>';
                return;
            }

            // Display stations
            this.displayStations(stations);

        } catch (error) {
            console.error('Error loading stations:', error);
            document.getElementById('stations-list').innerHTML = '<p style="text-align: center; color: #f00;">Error loading stations. Please try again.</p>';
        }
    }

    displayStations(stations) {
        const stationsList = document.getElementById('stations-list');
        stationsList.innerHTML = '';

        // Limit to top 20 stations
        const topStations = stations.slice(0, 20);

        topStations.forEach(station => {
            const formattedStation = this.radioAPI.formatStation(station);
            const stationElement = this.createStationElement(formattedStation);
            stationsList.appendChild(stationElement);
        });
    }

    createStationElement(station) {
        const div = document.createElement('div');
        div.className = 'station-item';

        const name = document.createElement('div');
        name.className = 'station-item-name';
        name.textContent = station.name;

        const tags = document.createElement('div');
        tags.className = 'station-item-tags';

        const tagText = [];
        if (station.codec) tagText.push(station.codec.toUpperCase());
        if (station.bitrate) tagText.push(`${station.bitrate}kbps`);
        if (station.language) tagText.push(station.language.toUpperCase());
        if (station.tags && station.tags.length > 0) {
            tagText.push(...station.tags.slice(0, 3));
        }

        tags.textContent = tagText.join(' • ');

        div.appendChild(name);
        div.appendChild(tags);

        div.addEventListener('click', () => {
            this.handleStationSelected(station);
        });

        return div;
    }

    handleStationSelected(station) {
        // Close modal
        this.closeModal();

        // Switch to stereo view
        this.showStereo();

        // Auto power on if not already
        if (!this.stereoController.isPoweredOn) {
            this.stereoController.togglePower();
        }

        // Play the station
        setTimeout(() => {
            this.player.playStation(station);

            // Vote for the station (helps improve Radio Browser data)
            if (station.uuid) {
                this.radioAPI.voteForStation(station.uuid);
            }
        }, 300);
    }

    showModal() {
        document.getElementById('station-list-modal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('station-list-modal').classList.add('hidden');
    }

    showStereo() {
        document.getElementById('globe-container').classList.remove('active');
        document.getElementById('stereo-container').classList.add('active');
    }

    showGlobe() {
        document.getElementById('stereo-container').classList.remove('active');
        document.getElementById('globe-container').classList.add('active');
    }
}

// Initialize the app
const app = new WorldRadioApp();
