// Stereo UI Controller
class StereoController {
    constructor(player) {
        this.player = player;
        this.isPoweredOn = false;
        this.presets = JSON.parse(localStorage.getItem('radioPresets')) || {};
        this.spectrumCanvas = document.getElementById('spectrum-canvas');
        this.spectrumCtx = this.spectrumCanvas.getContext('2d');
        this.animationId = null;

        this.initElements();
        this.attachEventListeners();
        this.loadPlayerEvents();
    }

    initElements() {
        this.elements = {
            stationName: document.getElementById('station-name'),
            stationLocation: document.getElementById('station-location'),
            stationFrequency: document.getElementById('station-frequency'),
            stereoIndicator: document.getElementById('stereo-indicator'),
            signalIndicator: document.getElementById('signal-indicator'),
            volumeSlider: document.getElementById('volume-slider'),
            volumeDisplay: document.getElementById('volume-display'),
            powerBtn: document.getElementById('power-btn'),
            playBtn: document.getElementById('play-btn'),
            stopBtn: document.getElementById('stop-btn'),
            globeBtn: document.getElementById('globe-btn'),
            presetBtns: document.querySelectorAll('.preset-btn')
        };

        // Set initial volume
        this.elements.volumeSlider.value = this.player.getVolume();
        this.elements.volumeDisplay.textContent = this.player.getVolume();
    }

    attachEventListeners() {
        // Power button
        this.elements.powerBtn.addEventListener('click', () => this.togglePower());

        // Transport controls
        this.elements.playBtn.addEventListener('click', () => this.handlePlay());
        this.elements.stopBtn.addEventListener('click', () => this.handleStop());
        this.elements.globeBtn.addEventListener('click', () => this.showGlobe());

        // Volume control
        this.elements.volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            this.player.setVolume(volume);
            this.elements.volumeDisplay.textContent = volume;
        });

        // Preset buttons
        this.elements.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handlePreset(btn));
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.savePreset(btn);
            });
        });
    }

    loadPlayerEvents() {
        document.addEventListener('player:stationChanged', (e) => {
            this.updateDisplay(e.detail);
        });

        document.addEventListener('player:play', () => {
            this.elements.playBtn.classList.add('active');
            this.elements.signalIndicator.classList.add('active');
            this.startSpectrumAnalyzer();
        });

        document.addEventListener('player:pause', () => {
            this.elements.playBtn.classList.remove('active');
            this.elements.signalIndicator.classList.remove('active');
            this.stopSpectrumAnalyzer();
        });

        document.addEventListener('player:stopped', () => {
            this.elements.playBtn.classList.remove('active');
            this.elements.signalIndicator.classList.remove('active');
            this.stopSpectrumAnalyzer();
            this.resetDisplay();
        });

        document.addEventListener('player:loading', () => {
            this.elements.stationName.textContent = 'LOADING...';
        });

        document.addEventListener('player:error', () => {
            this.elements.stationName.textContent = 'ERROR';
            this.elements.stationLocation.textContent = 'STATION UNAVAILABLE';
            this.elements.signalIndicator.classList.remove('active');
        });
    }

    togglePower() {
        this.isPoweredOn = !this.isPoweredOn;

        if (this.isPoweredOn) {
            this.elements.powerBtn.classList.add('active');
            document.getElementById('stereo-container').style.opacity = '1';
        } else {
            this.elements.powerBtn.classList.remove('active');
            this.player.stop();
            this.resetDisplay();
            document.getElementById('stereo-container').style.opacity = '0.5';
        }
    }

    handlePlay() {
        if (!this.isPoweredOn) {
            alert('Please turn on the power first');
            return;
        }

        if (this.player.isPlaying) {
            this.player.pause();
        } else {
            if (this.player.currentStation) {
                this.player.resume();
            } else {
                alert('Please select a station from the globe');
            }
        }
    }

    handleStop() {
        if (!this.isPoweredOn) return;
        this.player.stop();
    }

    showGlobe() {
        document.getElementById('stereo-container').classList.remove('active');
        document.getElementById('globe-container').classList.add('active');
    }

    updateDisplay(station) {
        this.elements.stationName.textContent = station.name.substring(0, 30);
        this.elements.stationLocation.textContent = `${station.country || 'INTERNATIONAL'}`.toUpperCase();

        // Generate a fake frequency for aesthetic purposes
        const frequency = (88 + Math.random() * 20).toFixed(1);
        this.elements.stationFrequency.textContent = `${frequency} FM`;

        // Activate stereo indicator
        this.elements.stereoIndicator.classList.add('active');
    }

    resetDisplay() {
        this.elements.stationName.textContent = '- - - - - -';
        this.elements.stationLocation.textContent = 'SELECT STATION';
        this.elements.stationFrequency.textContent = '- - - FM';
        this.elements.stereoIndicator.classList.remove('active');
        this.elements.signalIndicator.classList.remove('active');
    }

    handlePreset(btn) {
        if (!this.isPoweredOn) {
            alert('Please turn on the power first');
            return;
        }

        const presetNum = btn.dataset.preset;
        const preset = this.presets[presetNum];

        if (preset) {
            // Remove active class from all presets
            this.elements.presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Play the preset station
            this.player.playStation(preset);
        } else {
            alert('No station saved to this preset. Right-click to save current station.');
        }
    }

    savePreset(btn) {
        if (!this.player.currentStation) {
            alert('No station currently playing to save as preset');
            return;
        }

        const presetNum = btn.dataset.preset;
        this.presets[presetNum] = this.player.currentStation;

        // Save to localStorage
        localStorage.setItem('radioPresets', JSON.stringify(this.presets));

        alert(`Station saved to preset ${presetNum}`);
    }

    startSpectrumAnalyzer() {
        const draw = () => {
            this.animationId = requestAnimationFrame(draw);

            const dataArray = this.player.getAnalyserData();
            if (!dataArray) return;

            const bufferLength = dataArray.length;
            const barWidth = this.spectrumCanvas.width / bufferLength;

            this.spectrumCtx.fillStyle = '#000';
            this.spectrumCtx.fillRect(0, 0, this.spectrumCanvas.width, this.spectrumCanvas.height);

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * this.spectrumCanvas.height;

                // Create gradient for bars
                const gradient = this.spectrumCtx.createLinearGradient(
                    0, this.spectrumCanvas.height - barHeight,
                    0, this.spectrumCanvas.height
                );
                gradient.addColorStop(0, '#00ffcc');
                gradient.addColorStop(0.5, '#00aa88');
                gradient.addColorStop(1, '#006666');

                this.spectrumCtx.fillStyle = gradient;
                this.spectrumCtx.fillRect(
                    i * barWidth,
                    this.spectrumCanvas.height - barHeight,
                    barWidth - 1,
                    barHeight
                );

                // Add glow effect
                this.spectrumCtx.shadowBlur = 10;
                this.spectrumCtx.shadowColor = '#00ffcc';
            }

            this.spectrumCtx.shadowBlur = 0;
        };

        draw();
    }

    stopSpectrumAnalyzer() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Clear the canvas
        this.spectrumCtx.fillStyle = '#000';
        this.spectrumCtx.fillRect(0, 0, this.spectrumCanvas.width, this.spectrumCanvas.height);
    }
}
