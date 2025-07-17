// Main application controller

class PatternGeneratorApp {
    constructor() {
        this.canvas = document.getElementById('patternCanvas');
        this.patternGenerator = new PatternGenerator(this.canvas);
        this.canvasManager = new CanvasManager(this.canvas, this.patternGenerator);
        this.exportManager = new ExportManager(this.canvasManager, this.patternGenerator);
        
        this.currentPattern = 'grid';
        this.animationId = null;
        this.showGrid = false;
        
        this.initControls();
        this.loadInitialState();
        this.drawCurrentPattern();
        this.startFPSCounter();
    }
    
    initControls() {
        // Pattern type selector
        document.getElementById('patternType').addEventListener('change', (e) => {
            this.currentPattern = e.target.value;
            this.drawCurrentPattern();
        });
        
        // Color controls
        this.initColorControl('primary');
        this.initColorControl('secondary');
        this.initColorControl('bg');
        
        // Slider controls
        this.initSliderControl('patternSize', 'sizeValue');
        this.initSliderControl('patternSpacing', 'spacingValue');
        this.initSliderControl('lineWidth', 'lineWidthValue');
        this.initSliderControl('rotation', 'rotationValue');
        this.initSliderControl('peakNits', 'peakNitsValue');
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                this.applyPreset(preset);
            });
        });
        
        // Export buttons
        document.getElementById('exportPNG').addEventListener('click', () => {
            this.exportManager.exportPNG();
        });
        
        document.getElementById('exportSVG').addEventListener('click', () => {
            this.exportManager.exportSVG();
        });
        
        document.getElementById('shareURL').addEventListener('click', () => {
            this.showShareModal();
        });
        
        document.getElementById('savePreset').addEventListener('click', () => {
            this.exportManager.savePreset();
        });
        
        document.getElementById('exportProfile').addEventListener('click', () => {
            this.exportManager.exportColorProfile();
        });
        
        // Canvas settings
        document.getElementById('canvasSize').addEventListener('change', (e) => {
            this.handleCanvasSizeChange(e.target.value);
        });
        
        document.getElementById('customWidth').addEventListener('input', () => {
            this.applyCustomSize();
        });
        
        document.getElementById('customHeight').addEventListener('input', () => {
            this.applyCustomSize();
        });
        
        // Toolbar buttons
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.canvasManager.toggleFullscreen();
        });
        
        document.getElementById('gridToggle').addEventListener('click', () => {
            this.toggleGrid();
        });
        
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.canvasManager.zoomIn();
        });
        
        document.getElementById('zoomOut').addEventListener('click', () => {
            this.canvasManager.zoomOut();
        });
        
        document.getElementById('resetZoom').addEventListener('click', () => {
            this.canvasManager.resetView();
        });
        
        // Modal controls
        document.getElementById('copyURLBtn').addEventListener('click', () => {
            this.copyShareURL();
        });
        
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideShareModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }
    
    initColorControl(name) {
        const colorPicker = document.getElementById(`${name}Color`);
        const hexInput = document.getElementById(`${name}Hex`);
        
        colorPicker.addEventListener('input', (e) => {
            hexInput.value = e.target.value;
            this.drawCurrentPattern();
        });
        
        hexInput.addEventListener('input', (e) => {
            const hex = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                colorPicker.value = hex;
                this.drawCurrentPattern();
            }
        });
    }
    
    initSliderControl(sliderId, valueId) {
        const slider = document.getElementById(sliderId);
        const valueSpan = document.getElementById(valueId);
        
        slider.addEventListener('input', (e) => {
            valueSpan.textContent = e.target.value;
            this.drawCurrentPattern();
        });
    }
    
    getPatternOptions() {
        const options = {
            size: parseInt(document.getElementById('patternSize').value),
            spacing: parseInt(document.getElementById('patternSpacing').value),
            lineWidth: parseInt(document.getElementById('lineWidth').value),
            primaryColor: document.getElementById('primaryColor').value,
            secondaryColor: document.getElementById('secondaryColor').value,
            bgColor: document.getElementById('bgColor').value,
            rotation: parseInt(document.getElementById('rotation').value)
        };
        
        // Add HDR options if HDR pattern is selected
        if (this.currentPattern.startsWith('hdr-')) {
            options.peakNits = parseInt(document.getElementById('peakNits').value);
            options.colorSpace = document.getElementById('colorSpace').value;
            options.hdrMode = document.getElementById('hdrMode').value;
        }
        
        return options;
    }
    
    drawCurrentPattern() {
        const options = this.getPatternOptions();
        
        // Cancel any ongoing animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear and draw pattern
        this.patternGenerator.clear();
        
        switch(this.currentPattern) {
            case 'grid':
                this.patternGenerator.drawGrid(options);
                break;
            case 'colorBars':
                this.patternGenerator.drawColorBars(options);
                break;
            case 'circles':
                this.patternGenerator.drawCircles(options);
                break;
            case 'gradient':
                this.patternGenerator.drawGradient(options);
                break;
            case 'checkerboard':
                this.patternGenerator.drawCheckerboard(options);
                break;
            case 'lines':
                this.patternGenerator.drawLines(options);
                break;
            case 'dots':
                this.patternGenerator.drawDots(options);
                break;
            case 'custom':
                this.patternGenerator.drawCustom(options);
                break;
            case 'hdr-gradient':
                this.patternGenerator.drawHDRGradient(options);
                break;
            case 'hdr-color-volume':
                this.patternGenerator.drawHDRColorVolume(options);
                break;
        }
        
        // Show/hide HDR controls
        const hdrSection = document.getElementById('hdrSection');
        if (hdrSection) {
            hdrSection.style.display = this.currentPattern.startsWith('hdr-') ? 'block' : 'none';
        }
        
        // Update canvas info
        this.updateCanvasInfo();
    }
    
    applyPreset(presetName) {
        const options = this.getPatternOptions();
        this.patternGenerator.applyPreset(presetName, options);
        
        // Update controls to match preset
        switch(presetName) {
            case 'convergence':
                document.getElementById('patternType').value = 'grid';
                document.getElementById('patternSize').value = 20;
                document.getElementById('patternSpacing').value = 0;
                document.getElementById('lineWidth').value = 1;
                document.getElementById('primaryColor').value = '#ffffff';
                document.getElementById('bgColor').value = '#000000';
                break;
            case 'focus':
                document.getElementById('patternType').value = 'circles';
                document.getElementById('patternSize').value = 30;
                document.getElementById('patternSpacing').value = 10;
                document.getElementById('lineWidth').value = 1;
                break;
            case 'linearity':
                document.getElementById('patternType').value = 'grid';
                document.getElementById('patternSize').value = 50;
                document.getElementById('patternSpacing').value = 0;
                document.getElementById('lineWidth').value = 2;
                break;
            case 'smpte':
                document.getElementById('patternType').value = 'colorBars';
                break;
            case 'hdr-gradient':
                document.getElementById('patternType').value = 'hdr-gradient';
                document.getElementById('peakNits').value = 1000;
                break;
            case 'hdr-color-volume':
                document.getElementById('patternType').value = 'hdr-color-volume';
                document.getElementById('peakNits').value = 1000;
                break;
        }
        
        // Update displays
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            const valueId = slider.id.replace('pattern', '').replace(/([A-Z])/g, '$1').toLowerCase() + 'Value';
            const valueSpan = document.getElementById(valueId);
            if (valueSpan) {
                valueSpan.textContent = slider.value;
            }
        });
        
        // Update hex inputs
        ['primary', 'secondary', 'bg'].forEach(name => {
            const colorPicker = document.getElementById(`${name}Color`);
            const hexInput = document.getElementById(`${name}Hex`);
            hexInput.value = colorPicker.value;
        });
        
        this.currentPattern = document.getElementById('patternType').value;
    }
    
    handleCanvasSizeChange(value) {
        const customInputs = document.getElementById('customSizeInputs');
        
        if (value === 'custom') {
            customInputs.style.display = 'flex';
        } else {
            customInputs.style.display = 'none';
            
            if (value === 'window') {
                this.canvasManager.resizeCanvas();
            } else {
                const [width, height] = value.split('x').map(n => parseInt(n));
                this.canvasManager.setCanvasSize(width, height);
            }
        }
        
        this.drawCurrentPattern();
    }
    
    applyCustomSize() {
        const width = parseInt(document.getElementById('customWidth').value);
        const height = parseInt(document.getElementById('customHeight').value);
        
        if (width > 0 && height > 0) {
            this.canvasManager.setCanvasSize(width, height);
            this.drawCurrentPattern();
        }
    }
    
    toggleGrid() {
        const overlay = document.getElementById('gridOverlay');
        this.showGrid = !this.showGrid;
        overlay.style.display = this.showGrid ? 'block' : 'none';
        document.getElementById('gridToggle').classList.toggle('active', this.showGrid);
    }
    
    showShareModal() {
        const modal = document.getElementById('shareModal');
        const input = document.getElementById('shareURLInput');
        const url = this.exportManager.generateShareURL();
        
        input.value = url;
        modal.style.display = 'flex';
        input.select();
    }
    
    hideShareModal() {
        document.getElementById('shareModal').style.display = 'none';
    }
    
    copyShareURL() {
        const input = document.getElementById('shareURLInput');
        input.select();
        document.execCommand('copy');
        
        const btn = document.getElementById('copyURLBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }
    
    handleKeyboard(e) {
        switch(e.key) {
            case 'f':
            case 'F':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    this.canvasManager.toggleFullscreen();
                }
                break;
            case 'g':
            case 'G':
                e.preventDefault();
                this.toggleGrid();
                break;
            case '+':
            case '=':
                e.preventDefault();
                this.canvasManager.zoomIn();
                break;
            case '-':
            case '_':
                e.preventDefault();
                this.canvasManager.zoomOut();
                break;
            case '0':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.canvasManager.resetView();
                }
                break;
            case 's':
            case 'S':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.exportManager.exportPNG();
                }
                break;
        }
    }
    
    updateCanvasInfo() {
        const canvas = this.canvas;
        const resolution = document.getElementById('canvasResolution');
        resolution.textContent = `${canvas.width}×${canvas.height}`;
    }
    
    loadInitialState() {
        // Check if we have URL parameters
        const hasParams = this.exportManager.loadFromURL();
        
        if (!hasParams) {
            // Set default canvas size
            this.canvasManager.resizeCanvas();
        }
        
        this.updateCanvasInfo();
    }
    
    startFPSCounter() {
        let lastTime = performance.now();
        let fps = 0;
        let frameCount = 0;
        
        const updateFPS = () => {
            const currentTime = performance.now();
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
                document.getElementById('fps').textContent = `${fps} FPS`;
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        updateFPS();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PatternGeneratorApp();
});