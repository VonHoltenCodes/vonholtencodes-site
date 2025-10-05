// Radio Browser API integration
class RadioAPI {
    constructor() {
        this.baseUrl = 'https://de1.api.radio-browser.info/json';
        this.stationCache = {};
    }

    async getStationsByCountry(countryCode) {
        // Check cache first
        if (this.stationCache[countryCode]) {
            return this.stationCache[countryCode];
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/stations/bycountrycodeexact/${countryCode}?limit=50&order=votes&reverse=true&hidebroken=true`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const stations = await response.json();

            // Filter for working stations with good quality
            const filteredStations = stations.filter(station => {
                return station.url_resolved &&
                       station.lastcheckok === 1 &&
                       station.codec &&
                       station.bitrate >= 64;
            });

            // Cache the results
            this.stationCache[countryCode] = filteredStations;

            return filteredStations;
        } catch (error) {
            console.error('Error fetching stations:', error);
            return [];
        }
    }

    async searchStations(query) {
        try {
            const response = await fetch(
                `${this.baseUrl}/stations/search?name=${encodeURIComponent(query)}&limit=20&hidebroken=true&order=votes&reverse=true`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching stations:', error);
            return [];
        }
    }

    async voteForStation(stationUuid) {
        try {
            await fetch(`${this.baseUrl}/vote/${stationUuid}`, {
                method: 'GET'
            });
        } catch (error) {
            console.error('Error voting for station:', error);
        }
    }

    formatStation(station) {
        return {
            uuid: station.stationuuid,
            name: station.name,
            url: station.url_resolved,
            country: station.country,
            countryCode: station.countrycode,
            tags: station.tags ? station.tags.split(',').slice(0, 5) : [],
            codec: station.codec,
            bitrate: station.bitrate,
            homepage: station.homepage,
            favicon: station.favicon,
            language: station.language,
            votes: station.votes
        };
    }
}

// Audio player with Web Audio API
class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.isPlaying = false;
        this.currentStation = null;
        this.volume = 0.7;

        this.audio.volume = this.volume;
        this.audio.crossOrigin = 'anonymous';

        // Setup audio context for visualization
        this.setupAudioContext();

        // Event listeners
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        this.audio.addEventListener('error', (e) => this.onError(e));
        this.audio.addEventListener('loadstart', () => this.onLoadStart());
        this.audio.addEventListener('canplay', () => this.onCanPlay());
    }

    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        } catch (error) {
            console.error('Error setting up audio context:', error);
        }
    }

    async playStation(station) {
        this.currentStation = station;

        // Stop current playback
        this.stop();

        // Set new source
        this.audio.src = station.url;

        try {
            // Resume audio context if suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            await this.audio.play();
            this.isPlaying = true;

            // Dispatch event
            this.dispatchEvent('stationChanged', station);
        } catch (error) {
            console.error('Error playing station:', error);
            this.dispatchEvent('playbackError', { station, error });
        }
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.dispatchEvent('stopped');
    }

    pause() {
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            this.dispatchEvent('paused');
        }
    }

    resume() {
        if (!this.isPlaying && this.currentStation) {
            this.audio.play();
            this.isPlaying = true;
            this.dispatchEvent('resumed');
        }
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value / 100));
        this.audio.volume = this.volume;
        this.dispatchEvent('volumeChanged', this.volume);
    }

    getVolume() {
        return Math.round(this.volume * 100);
    }

    getAnalyserData() {
        if (!this.analyser) return null;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        return dataArray;
    }

    onPlay() {
        this.dispatchEvent('play');
    }

    onPause() {
        this.dispatchEvent('pause');
    }

    onError(e) {
        console.error('Audio error:', e);
        this.dispatchEvent('error', e);
    }

    onLoadStart() {
        this.dispatchEvent('loading');
    }

    onCanPlay() {
        this.dispatchEvent('ready');
    }

    dispatchEvent(eventName, data = null) {
        const event = new CustomEvent(`player:${eventName}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }
}
