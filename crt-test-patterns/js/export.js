// Export functionality for patterns

class ExportManager {
    constructor(canvasManager, patternGenerator) {
        this.canvasManager = canvasManager;
        this.patternGenerator = patternGenerator;
        this.presets = this.loadPresets();
    }
    
    exportPNG() {
        const dataURL = this.canvasManager.getCanvasDataURL();
        const link = document.createElement('a');
        link.download = `pattern_${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    }
    
    exportSVG() {
        // Get current pattern settings
        const settings = this.getCurrentSettings();
        const svg = this.generateSVG(settings);
        
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `pattern_${Date.now()}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }
    
    generateSVG(settings) {
        const { width, height, pattern, options } = settings;
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
        svg += `<rect width="${width}" height="${height}" fill="${options.bgColor}"/>`;
        
        switch(pattern) {
            case 'grid':
                svg += this.generateGridSVG(width, height, options);
                break;
            case 'circles':
                svg += this.generateCirclesSVG(width, height, options);
                break;
            case 'checkerboard':
                svg += this.generateCheckerboardSVG(width, height, options);
                break;
            case 'lines':
                svg += this.generateLinesSVG(width, height, options);
                break;
            case 'dots':
                svg += this.generateDotsSVG(width, height, options);
                break;
            default:
                // For complex patterns, add a message
                svg += `<text x="${width/2}" y="${height/2}" text-anchor="middle" fill="${options.primaryColor}">`;
                svg += `Complex pattern - use PNG export</text>`;
        }
        
        svg += '</svg>';
        return svg;
    }
    
    generateGridSVG(width, height, options) {
        const { size, spacing, lineWidth, primaryColor, rotation } = options;
        const step = size + spacing;
        let svg = `<g stroke="${primaryColor}" stroke-width="${lineWidth}" fill="none"`;
        
        if (rotation !== 0) {
            svg += ` transform="rotate(${rotation} ${width/2} ${height/2})"`;
        }
        svg += '>';
        
        // Vertical lines
        for (let x = 0; x <= width; x += step) {
            svg += `<line x1="${x}" y1="0" x2="${x}" y2="${height}"/>`;
        }
        
        // Horizontal lines
        for (let y = 0; y <= height; y += step) {
            svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}"/>`;
        }
        
        svg += '</g>';
        return svg;
    }
    
    generateCirclesSVG(width, height, options) {
        const { size, spacing, lineWidth, primaryColor, secondaryColor } = options;
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) / 2;
        
        let svg = `<g stroke="${primaryColor}" stroke-width="${lineWidth}" fill="none">`;
        
        for (let radius = size; radius < maxRadius; radius += size + spacing) {
            svg += `<circle cx="${centerX}" cy="${centerY}" r="${radius}"/>`;
        }
        
        // Crosshairs
        svg += `<line x1="0" y1="${centerY}" x2="${width}" y2="${centerY}" stroke="${secondaryColor}"/>`;
        svg += `<line x1="${centerX}" y1="0" x2="${centerX}" y2="${height}" stroke="${secondaryColor}"/>`;
        
        svg += '</g>';
        return svg;
    }
    
    generateCheckerboardSVG(width, height, options) {
        const { size, primaryColor, secondaryColor } = options;
        const rows = Math.ceil(height / size);
        const cols = Math.ceil(width / size);
        
        let svg = '<g>';
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const isEven = (row + col) % 2 === 0;
                const color = isEven ? primaryColor : secondaryColor;
                svg += `<rect x="${col * size}" y="${row * size}" width="${size}" height="${size}" fill="${color}"/>`;
            }
        }
        
        svg += '</g>';
        return svg;
    }
    
    generateLinesSVG(width, height, options) {
        const { size, spacing, lineWidth, primaryColor, secondaryColor, rotation } = options;
        const step = size + spacing;
        
        let svg = `<g stroke-width="${lineWidth}"`;
        if (rotation !== 0) {
            svg += ` transform="rotate(${rotation} ${width/2} ${height/2})"`;
        }
        svg += '>';
        
        let colorIndex = 0;
        for (let y = 0; y <= height; y += step) {
            const color = colorIndex % 2 === 0 ? primaryColor : secondaryColor;
            svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${color}"/>`;
            colorIndex++;
        }
        
        svg += '</g>';
        return svg;
    }
    
    generateDotsSVG(width, height, options) {
        const { size, spacing, primaryColor, secondaryColor } = options;
        const step = size + spacing;
        const dotRadius = size / 2;
        
        let svg = '<g>';
        
        for (let y = dotRadius; y < height; y += step) {
            for (let x = dotRadius; x < width; x += step) {
                svg += `<circle cx="${x - dotRadius/3}" cy="${y}" r="${dotRadius/3}" fill="${primaryColor}"/>`;
                svg += `<circle cx="${x + dotRadius/3}" cy="${y}" r="${dotRadius/3}" fill="${secondaryColor}"/>`;
                svg += `<circle cx="${x}" cy="${y - dotRadius/3}" r="${dotRadius/3}" fill="#0000ff"/>`;
            }
        }
        
        svg += '</g>';
        return svg;
    }
    
    getCurrentSettings() {
        const pattern = document.getElementById('patternType').value;
        const canvas = this.canvasManager.canvas;
        
        const options = {
            size: parseInt(document.getElementById('patternSize').value),
            spacing: parseInt(document.getElementById('patternSpacing').value),
            lineWidth: parseInt(document.getElementById('lineWidth').value),
            primaryColor: document.getElementById('primaryColor').value,
            secondaryColor: document.getElementById('secondaryColor').value,
            bgColor: document.getElementById('bgColor').value,
            rotation: parseInt(document.getElementById('rotation').value)
        };
        
        return {
            pattern,
            options,
            width: canvas.width,
            height: canvas.height
        };
    }
    
    generateShareURL() {
        const settings = this.getCurrentSettings();
        const params = new URLSearchParams();
        
        params.set('p', settings.pattern);
        params.set('w', settings.width);
        params.set('h', settings.height);
        
        // Encode options
        for (const [key, value] of Object.entries(settings.options)) {
            params.set(key, value);
        }
        
        const baseURL = window.location.origin + window.location.pathname;
        return `${baseURL}?${params.toString()}`;
    }
    
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('p')) {
            // Load pattern type
            const patternType = params.get('p');
            document.getElementById('patternType').value = patternType;
            
            // Load canvas size
            if (params.has('w') && params.has('h')) {
                const width = parseInt(params.get('w'));
                const height = parseInt(params.get('h'));
                this.canvasManager.setCanvasSize(width, height);
            }
            
            // Load options
            const optionFields = ['size', 'spacing', 'lineWidth', 'primaryColor', 'secondaryColor', 'bgColor', 'rotation'];
            optionFields.forEach(field => {
                if (params.has(field)) {
                    const element = document.getElementById('pattern' + field.charAt(0).toUpperCase() + field.slice(1));
                    if (element) {
                        element.value = params.get(field);
                        
                        // Update display values for sliders
                        if (element.type === 'range') {
                            const valueSpan = document.getElementById(field + 'Value');
                            if (valueSpan) {
                                valueSpan.textContent = element.value;
                            }
                        }
                        
                        // Update hex inputs for colors
                        if (element.type === 'color') {
                            const hexInput = document.getElementById(field.replace('Color', 'Hex'));
                            if (hexInput) {
                                hexInput.value = element.value;
                            }
                        }
                    }
                }
            });
            
            return true;
        }
        
        return false;
    }
    
    savePreset() {
        const name = prompt('Enter preset name:');
        if (!name) return;
        
        const settings = this.getCurrentSettings();
        settings.name = name;
        settings.timestamp = Date.now();
        
        this.presets.push(settings);
        this.savePresetsToStorage();
        
        alert(`Preset "${name}" saved!`);
    }
    
    loadPresets() {
        const stored = localStorage.getItem('patternPresets');
        return stored ? JSON.parse(stored) : [];
    }
    
    savePresetsToStorage() {
        localStorage.setItem('patternPresets', JSON.stringify(this.presets));
    }
    
    loadPreset(preset) {
        // Set pattern type
        document.getElementById('patternType').value = preset.pattern;
        
        // Set options
        for (const [key, value] of Object.entries(preset.options)) {
            const fieldName = 'pattern' + key.charAt(0).toUpperCase() + key.slice(1);
            const element = document.getElementById(fieldName);
            
            if (element) {
                element.value = value;
                
                // Trigger change event
                element.dispatchEvent(new Event('input'));
            }
        }
        
        // Set canvas size if specified
        if (preset.width && preset.height) {
            this.canvasManager.setCanvasSize(preset.width, preset.height);
        }
    }
    
    exportColorProfile() {
        // Create color profile data
        const profileData = {
            name: 'NEONpulseTechshop Web Calibrated',
            created: new Date().toISOString(),
            whitePoint: { x: 0.3127, y: 0.3290 }, // D65
            gamma: 2.2,
            primaries: {
                red: { x: 0.640, y: 0.330 },
                green: { x: 0.300, y: 0.600 },
                blue: { x: 0.150, y: 0.060 }
            },
            measurements: this.collectMeasurements()
        };
        
        // Export as JSON (simplified ICC profile data)
        const json = JSON.stringify(profileData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `color_profile_${Date.now()}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        // Also generate installation instructions
        this.generateProfileInstructions(profileData);
    }
    
    collectMeasurements() {
        // Collect color measurements from current pattern
        const measurements = [];
        const canvas = this.canvasManager.canvas;
        const ctx = canvas.getContext('2d');
        
        // Sample points across the canvas
        const samplePoints = [
            { x: 0.1, y: 0.1 },
            { x: 0.5, y: 0.1 },
            { x: 0.9, y: 0.1 },
            { x: 0.1, y: 0.5 },
            { x: 0.5, y: 0.5 },
            { x: 0.9, y: 0.5 },
            { x: 0.1, y: 0.9 },
            { x: 0.5, y: 0.9 },
            { x: 0.9, y: 0.9 }
        ];
        
        samplePoints.forEach(point => {
            const x = Math.floor(canvas.width * point.x);
            const y = Math.floor(canvas.height * point.y);
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            
            measurements.push({
                position: point,
                rgb: [pixel[0], pixel[1], pixel[2]],
                // Simulated XYZ values (would be from actual measurement)
                xyz: [
                    pixel[0] / 255,
                    pixel[1] / 255,
                    pixel[2] / 255
                ]
            });
        });
        
        return measurements;
    }
    
    generateProfileInstructions(profileData) {
        const instructions = `
# Color Profile Installation Instructions

## Profile: ${profileData.name}
Created: ${new Date(profileData.created).toLocaleString()}

## Installation:

### Windows:
1. Save the accompanying .icm file to your computer
2. Right-click the file and select "Install Profile"
3. Go to Display Settings > Advanced > Color Management
4. Select the NEONpulseTechshop profile

### macOS:
1. Save the .icc file to your computer
2. Double-click to open in ColorSync Utility
3. Click "Install" to add to system profiles
4. Select in System Preferences > Displays > Color

### Linux:
1. Copy the .icc file to ~/.local/share/icc/
2. Or system-wide: /usr/share/color/icc/
3. Use your desktop environment's color settings

## Measured Values:
- White Point: ${profileData.whitePoint.x}, ${profileData.whitePoint.y}
- Gamma: ${profileData.gamma}
- Measurements: ${profileData.measurements.length} samples

## Note:
For accurate color calibration, use a hardware colorimeter
with the desktop test patterns for best results.
        `;
        
        const blob = new Blob([instructions], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'color_profile_instructions.txt';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }
}