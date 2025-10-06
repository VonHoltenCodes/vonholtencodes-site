// Radio Browser API integration
class RadioAPI {
    constructor() {
        this.baseUrl = 'https://all.api.radio-browser.info/json';
        this.stationCache = {};
        this.fallbackStations = this.getFallbackStations();
    }

    getFallbackStations() {
        // Hardcoded fallback stations for when API is down
        return {
            'US': [
                { stationuuid: 'fallback-us-1', name: 'KEXP 90.3 FM', url_resolved: 'https://kexp-mp3-128.streamguys1.com/kexp128.mp3', country: 'United States', countrycode: 'US', tags: 'Alternative, Rock, Indie', codec: 'MP3', bitrate: 128, homepage: 'https://www.kexp.org', lastcheckok: 1 },
                { stationuuid: 'fallback-us-2', name: 'WNYC FM', url_resolved: 'https://fm939.wnyc.org/wnycfm', country: 'United States', countrycode: 'US', tags: 'News, Talk, NPR', codec: 'MP3', bitrate: 128, homepage: 'https://www.wnyc.org', lastcheckok: 1 },
                { stationuuid: 'fallback-us-3', name: 'KNKX Jazz', url_resolved: 'https://knkx-mp3-128.streamguys1.com/knkx128.mp3', country: 'United States', countrycode: 'US', tags: 'Jazz, Blues', codec: 'MP3', bitrate: 128, homepage: 'https://www.knkx.org', lastcheckok: 1 },
            ],
            'GB': [
                { stationuuid: 'fallback-gb-1', name: 'BBC Radio 1', url_resolved: 'http://stream.live.vc.bbcmedia.co.uk/bbc_radio_one', country: 'United Kingdom', countrycode: 'GB', tags: 'Pop, Dance, Chart', codec: 'MP3', bitrate: 128, homepage: 'https://www.bbc.co.uk/radio1', lastcheckok: 1 },
                { stationuuid: 'fallback-gb-2', name: 'BBC Radio 6 Music', url_resolved: 'http://stream.live.vc.bbcmedia.co.uk/bbc_6music', country: 'United Kingdom', countrycode: 'GB', tags: 'Alternative, Indie, Rock', codec: 'MP3', bitrate: 128, homepage: 'https://www.bbc.co.uk/6music', lastcheckok: 1 },
            ],
            'CA': [
                { stationuuid: 'fallback-ca-1', name: 'CBC Radio One', url_resolved: 'https://cbcliveradio-lh.akamaihd.net/i/CBCR1_TOR@118115/master.m3u8', country: 'Canada', countrycode: 'CA', tags: 'News, Talk', codec: 'HLS', bitrate: 128, homepage: 'https://www.cbc.ca/radio', lastcheckok: 1 },
            ],
            'DE': [
                { stationuuid: 'fallback-de-1', name: 'Bayern 3', url_resolved: 'https://streams.br.de/bayern3_2.m3u', country: 'Germany', countrycode: 'DE', tags: 'Pop, Rock', codec: 'MP3', bitrate: 128, homepage: 'https://www.br.de/bayern3', lastcheckok: 1 },
            ],
            'FR': [
                { stationuuid: 'fallback-fr-1', name: 'FIP', url_resolved: 'https://icecast.radiofrance.fr/fip-midfi.mp3', country: 'France', countrycode: 'FR', tags: 'Eclectic, Jazz, World', codec: 'MP3', bitrate: 128, homepage: 'https://www.fip.fr', lastcheckok: 1 },
            ],
            'AU': [
                { stationuuid: 'fallback-au-1', name: 'triple j', url_resolved: 'https://live-radio01.mediahubaustralia.com/2TJW/mp3/', country: 'Australia', countrycode: 'AU', tags: 'Alternative, Rock, Indie', codec: 'MP3', bitrate: 128, homepage: 'https://www.abc.net.au/triplej', lastcheckok: 1 },
            ],
        };
    }

    async getStationsByCountry(countryCode) {
        // Check cache first
        if (this.stationCache[countryCode]) {
            return this.stationCache[countryCode];
        }

        try {
            // Fetch top voted stations (API endpoint working)
            const response = await fetch(
                `${this.baseUrl}/stations/topvote/500`,
                { timeout: 5000 }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const allStations = await response.json();

            // Filter for the requested country code and quality
            const filteredStations = allStations.filter(station => {
                return station.countrycode === countryCode &&
                       station.url_resolved &&
                       station.lastcheckok === 1 &&
                       station.codec &&
                       station.bitrate >= 64;
            });

            // Take top 50 by votes
            const topStations = filteredStations
                .sort((a, b) => b.votes - a.votes)
                .slice(0, 50);

            // Cache the results
            this.stationCache[countryCode] = topStations;

            return topStations;
        } catch (error) {
            console.warn('API error, using fallback stations:', error);

            // Use fallback stations when API fails
            const fallback = this.fallbackStations[countryCode] || [];
            this.stationCache[countryCode] = fallback;
            return fallback;
        }
    }

    async searchStations(query) {
        try {
            // Fetch top stations and filter client-side (workaround for broken search endpoint)
            const response = await fetch(
                `${this.baseUrl}/stations/topvote/200`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const stations = await response.json();

            // Filter by query (case-insensitive search in name and tags)
            const queryLower = query.toLowerCase();
            const filtered = stations.filter(station => {
                return (station.name && station.name.toLowerCase().includes(queryLower)) ||
                       (station.tags && station.tags.toLowerCase().includes(queryLower));
            });

            return filtered.slice(0, 20);
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
