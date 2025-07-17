// Canvas management and zoom functionality

class CanvasManager {
    constructor(canvas, patternGenerator) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.patternGenerator = patternGenerator;
        this.container = canvas.parentElement;
        
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.isPanning = false;
        this.lastX = 0;
        this.lastY = 0;
        
        this.setupCanvas();
        this.initEventListeners();
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.patternGenerator.updateDimensions(this.canvas.width, this.canvas.height);
        this.updateTransform();
    }
    
    setCanvasSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.patternGenerator.updateDimensions(width, height);
        this.resetView();
        this.updateTransform();
    }
    
    initEventListeners() {
        // Mouse wheel zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoomAtPoint(e.offsetX, e.offsetY, delta);
        });
        
        // Mouse drag pan
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left button
                this.isPanning = true;
                this.lastX = e.clientX;
                this.lastY = e.clientY;
                this.canvas.style.cursor = 'grabbing';
            }
        });
        
        window.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                const dx = e.clientX - this.lastX;
                const dy = e.clientY - this.lastY;
                this.panX += dx;
                this.panY += dy;
                this.lastX = e.clientX;
                this.lastY = e.clientY;
                this.updateTransform();
            }
            
            // Update mouse position display
            if (e.target === this.canvas) {
                const rect = this.canvas.getBoundingClientRect();
                const x = Math.round((e.clientX - rect.left - this.panX) / this.zoom);
                const y = Math.round((e.clientY - rect.top - this.panY) / this.zoom);
                this.updateMousePosition(x, y);
            }
        });
        
        window.addEventListener('mouseup', () => {
            this.isPanning = false;
            this.canvas.style.cursor = 'grab';
        });
        
        // Touch support
        let touchStartDistance = 0;
        let touchStartZoom = 1;
        
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                touchStartDistance = this.getTouchDistance(e.touches);
                touchStartZoom = this.zoom;
            } else if (e.touches.length === 1) {
                this.isPanning = true;
                this.lastX = e.touches[0].clientX;
                this.lastY = e.touches[0].clientY;
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 2) {
                const currentDistance = this.getTouchDistance(e.touches);
                const scale = currentDistance / touchStartDistance;
                this.zoom = Math.max(0.1, Math.min(10, touchStartZoom * scale));
                this.updateTransform();
            } else if (e.touches.length === 1 && this.isPanning) {
                const dx = e.touches[0].clientX - this.lastX;
                const dy = e.touches[0].clientY - this.lastY;
                this.panX += dx;
                this.panY += dy;
                this.lastX = e.touches[0].clientX;
                this.lastY = e.touches[0].clientY;
                this.updateTransform();
            }
        });
        
        this.canvas.addEventListener('touchend', () => {
            this.isPanning = false;
        });
    }
    
    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    zoomIn() {
        this.zoomAtCenter(1.2);
    }
    
    zoomOut() {
        this.zoomAtCenter(0.8);
    }
    
    zoomAtCenter(factor) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.zoomAtPoint(centerX, centerY, factor);
    }
    
    zoomAtPoint(x, y, factor) {
        const newZoom = Math.max(0.1, Math.min(10, this.zoom * factor));
        
        // Adjust pan to keep the point under the mouse cursor
        const zoomDelta = newZoom - this.zoom;
        this.panX -= (x - this.panX) * (zoomDelta / this.zoom);
        this.panY -= (y - this.panY) * (zoomDelta / this.zoom);
        
        this.zoom = newZoom;
        this.updateTransform();
        this.updateZoomDisplay();
    }
    
    resetView() {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
        this.updateZoomDisplay();
    }
    
    updateTransform() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply transformations
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.zoom, this.zoom);
        
        // Request redraw from pattern generator
        if (window.app && window.app.currentPattern) {
            window.app.drawCurrentPattern();
        }
    }
    
    updateZoomDisplay() {
        const zoomLevel = document.querySelector('.zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.zoom * 100)}%`;
        }
    }
    
    updateMousePosition(x, y) {
        const mousePos = document.getElementById('mousePosition');
        if (mousePos) {
            mousePos.textContent = `X: ${x}, Y: ${y}`;
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    getCanvasDataURL() {
        // Create a temporary canvas at original size
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width / this.zoom;
        tempCanvas.height = this.canvas.height / this.zoom;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Save current state
        const savedZoom = this.zoom;
        const savedPanX = this.panX;
        const savedPanY = this.panY;
        
        // Reset transform for export
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.patternGenerator.canvas = tempCanvas;
        this.patternGenerator.ctx = tempCtx;
        
        // Redraw pattern
        if (window.app && window.app.currentPattern) {
            window.app.drawCurrentPattern();
        }
        
        // Restore original canvas
        this.patternGenerator.canvas = this.canvas;
        this.patternGenerator.ctx = this.ctx;
        this.zoom = savedZoom;
        this.panX = savedPanX;
        this.panY = savedPanY;
        
        return tempCanvas.toDataURL('image/png');
    }
}