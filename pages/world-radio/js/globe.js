// Globe visualization with Three.js
class GlobeController {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globe = null;
        this.countries = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedCountry = null;
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.rotationVelocity = { x: 0, y: 0 };
        this.autoRotate = true;
        this.init();
    }

    init() {
        const container = document.getElementById('globe-canvas');

        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 2.5;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);

        // Create Earth
        this.createGlobe();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 3, 5);
        this.scene.add(pointLight);

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        container.addEventListener('click', (e) => this.onGlobeClick(e));
        container.addEventListener('mousemove', (e) => this.onMouseMove(e));
        container.addEventListener('mousedown', (e) => this.onMouseDown(e));
        container.addEventListener('mouseup', (e) => this.onMouseUp(e));
        container.addEventListener('mouseleave', (e) => this.onMouseUp(e));

        // Touch event listeners for mobile
        container.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        container.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        container.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });

        // Start animation
        this.animate();
    }

    createGlobe() {
        const geometry = new THREE.SphereGeometry(1, 64, 64);

        // Load realistic Earth texture from NASA
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load(
            'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_atmos_2048.jpg',
            () => {
                console.log('Earth texture loaded successfully');
            },
            undefined,
            (err) => {
                console.error('Error loading Earth texture, using fallback:', err);
                // Fallback to simple texture if loading fails
                this.createFallbackTexture();
            }
        );

        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            specular: 0x222222,
            shininess: 10,
            bumpScale: 0.02
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);

        // Add country markers
        this.addCountryMarkers();
    }

    createFallbackTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Create a more realistic looking fallback
        // Ocean background
        const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        oceanGradient.addColorStop(0, '#1a4d6f');
        oceanGradient.addColorStop(0.5, '#0d3a5c');
        oceanGradient.addColorStop(1, '#1a4d6f');
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw continents with more detail
        ctx.fillStyle = '#2d5a2d';
        ctx.strokeStyle = '#1a3a1a';
        ctx.lineWidth = 2;

        this.drawDetailedContinents(ctx);

        const texture = new THREE.CanvasTexture(canvas);
        this.globe.material.map = texture;
        this.globe.material.needsUpdate = true;
    }

    drawDetailedContinents(ctx) {
        // More detailed continent shapes
        const continents = [
            // North America
            { x: 200, y: 150, w: 350, h: 280 },
            // South America
            { x: 380, y: 430, w: 180, h: 320 },
            // Europe
            { x: 900, y: 130, w: 200, h: 160 },
            // Africa
            { x: 950, y: 280, w: 250, h: 380 },
            // Asia
            { x: 1200, y: 80, w: 550, h: 420 },
            // Australia
            { x: 1500, y: 550, w: 240, h: 200 }
        ];

        continents.forEach(continent => {
            ctx.beginPath();
            ctx.ellipse(
                continent.x + continent.w / 2,
                continent.y + continent.h / 2,
                continent.w / 2,
                continent.h / 2,
                0, 0, Math.PI * 2
            );
            ctx.fill();
            ctx.stroke();
        });
    }

    addCountryMarkers() {
        // Simplified country coordinates (lat, lon)
        const countries = [
            { name: 'United States', lat: 37.0902, lon: -95.7129, code: 'US' },
            { name: 'Canada', lat: 56.1304, lon: -106.3468, code: 'CA' },
            { name: 'Mexico', lat: 23.6345, lon: -102.5528, code: 'MX' },
            { name: 'Brazil', lat: -14.2350, lon: -51.9253, code: 'BR' },
            { name: 'United Kingdom', lat: 55.3781, lon: -3.4360, code: 'GB' },
            { name: 'France', lat: 46.2276, lon: 2.2137, code: 'FR' },
            { name: 'Germany', lat: 51.1657, lon: 10.4515, code: 'DE' },
            { name: 'Italy', lat: 41.8719, lon: 12.5674, code: 'IT' },
            { name: 'Spain', lat: 40.4637, lon: -3.7492, code: 'ES' },
            { name: 'Russia', lat: 61.5240, lon: 105.3188, code: 'RU' },
            { name: 'China', lat: 35.8617, lon: 104.1954, code: 'CN' },
            { name: 'Japan', lat: 36.2048, lon: 138.2529, code: 'JP' },
            { name: 'South Korea', lat: 35.9078, lon: 127.7669, code: 'KR' },
            { name: 'India', lat: 20.5937, lon: 78.9629, code: 'IN' },
            { name: 'Australia', lat: -25.2744, lon: 133.7751, code: 'AU' },
            { name: 'New Zealand', lat: -40.9006, lon: 174.8860, code: 'NZ' },
            { name: 'South Africa', lat: -30.5595, lon: 22.9375, code: 'ZA' },
            { name: 'Egypt', lat: 26.8206, lon: 30.8025, code: 'EG' },
            { name: 'Argentina', lat: -38.4161, lon: -63.6167, code: 'AR' },
            { name: 'Chile', lat: -35.6751, lon: -71.5430, code: 'CL' },
            { name: 'Sweden', lat: 60.1282, lon: 18.6435, code: 'SE' },
            { name: 'Norway', lat: 60.4720, lon: 8.4689, code: 'NO' },
            { name: 'Netherlands', lat: 52.1326, lon: 5.2913, code: 'NL' },
            { name: 'Belgium', lat: 50.5039, lon: 4.4699, code: 'BE' },
            { name: 'Poland', lat: 51.9194, lon: 19.1451, code: 'PL' },
            { name: 'Greece', lat: 39.0742, lon: 21.8243, code: 'GR' },
            { name: 'Turkey', lat: 38.9637, lon: 35.2433, code: 'TR' },
            { name: 'Thailand', lat: 15.8700, lon: 100.9925, code: 'TH' },
            { name: 'Indonesia', lat: -0.7893, lon: 113.9213, code: 'ID' },
            { name: 'Philippines', lat: 12.8797, lon: 121.7740, code: 'PH' }
        ];

        countries.forEach(country => {
            const marker = this.createCountryMarker(country);
            this.globe.add(marker);
        });

        this.countries = countries;
    }

    createCountryMarker(country) {
        const phi = (90 - country.lat) * (Math.PI / 180);
        const theta = (country.lon + 180) * (Math.PI / 180);

        const x = -1 * Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);

        const geometry = new THREE.SphereGeometry(0.02, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5
        });

        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(x, y, z);
        marker.userData = country;

        return marker;
    }

    latLonToVector3(lat, lon, radius = 1) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
    }

    onMouseMove(event) {
        if (this.isDragging) {
            // Calculate rotation based on mouse movement
            const deltaMove = {
                x: event.clientX - this.previousMousePosition.x,
                y: event.clientY - this.previousMousePosition.y
            };

            this.rotationVelocity.x = deltaMove.x * 0.005;
            this.rotationVelocity.y = deltaMove.y * 0.005;

            // Apply rotation to globe
            this.globe.rotation.y += this.rotationVelocity.x;
            this.globe.rotation.x += this.rotationVelocity.y;

            // Clamp vertical rotation to prevent flipping
            this.globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.globe.rotation.x));

            this.previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };

            document.body.style.cursor = 'grabbing';
        } else {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.globe.children);

            // Reset all markers
            this.globe.children.forEach(child => {
                if (child.geometry && child.geometry.type === 'SphereGeometry') {
                    child.material.color.setHex(0x00ff00);
                    child.scale.set(1, 1, 1);
                }
            });

            // Highlight hovered marker and show tooltip
            const tooltip = document.getElementById('country-tooltip');
            if (intersects.length > 0 && intersects[0].object.userData.name) {
                const country = intersects[0].object.userData;
                intersects[0].object.material.color.setHex(0x00ffff);
                intersects[0].object.scale.set(1.5, 1.5, 1.5);
                document.body.style.cursor = 'pointer';

                // Show tooltip
                tooltip.textContent = country.name;
                tooltip.classList.remove('hidden');
                tooltip.style.left = (event.clientX + 15) + 'px';
                tooltip.style.top = (event.clientY + 15) + 'px';
            } else {
                document.body.style.cursor = 'grab';
                tooltip.classList.add('hidden');
            }
        }
    }

    onMouseDown(event) {
        this.isDragging = true;
        this.autoRotate = false;
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        document.body.style.cursor = 'grabbing';
    }

    onMouseUp(event) {
        this.isDragging = false;
        document.body.style.cursor = 'grab';
    }

    onTouchStart(event) {
        if (event.touches.length === 1) {
            event.preventDefault();
            this.isDragging = true;
            this.autoRotate = false;
            this.previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
    }

    onTouchMove(event) {
        if (event.touches.length === 1 && this.isDragging) {
            event.preventDefault();

            const deltaMove = {
                x: event.touches[0].clientX - this.previousMousePosition.x,
                y: event.touches[0].clientY - this.previousMousePosition.y
            };

            this.rotationVelocity.x = deltaMove.x * 0.005;
            this.rotationVelocity.y = deltaMove.y * 0.005;

            // Apply rotation to globe
            this.globe.rotation.y += this.rotationVelocity.x;
            this.globe.rotation.x += this.rotationVelocity.y;

            // Clamp vertical rotation
            const maxRotation = Math.PI / 2;
            this.globe.rotation.x = Math.max(-maxRotation, Math.min(maxRotation, this.globe.rotation.x));

            this.previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
    }

    onTouchEnd(event) {
        this.isDragging = false;

        // Handle tap for country selection (if not dragged much)
        if (event.changedTouches.length === 1) {
            const touch = event.changedTouches[0];
            this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.globe.children);

            if (intersects.length > 0 && intersects[0].object.userData.name) {
                const country = intersects[0].object.userData;
                this.selectCountry(country);
            }
        }
    }

    onGlobeClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.globe.children);

        if (intersects.length > 0 && intersects[0].object.userData.name) {
            const country = intersects[0].object.userData;
            this.selectCountry(country);
        }
    }

    selectCountry(country) {
        this.selectedCountry = country;

        // Dispatch event to app
        const event = new CustomEvent('countrySelected', {
            detail: country
        });
        document.dispatchEvent(event);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Auto-rotate globe slowly when not being dragged
        if (this.globe && this.autoRotate && !this.isDragging) {
            this.globe.rotation.y += 0.001;
        }

        // Apply momentum/inertia when not dragging
        if (!this.isDragging && (Math.abs(this.rotationVelocity.x) > 0.0001 || Math.abs(this.rotationVelocity.y) > 0.0001)) {
            this.globe.rotation.y += this.rotationVelocity.x;
            this.globe.rotation.x += this.rotationVelocity.y;

            // Dampen the velocity
            this.rotationVelocity.x *= 0.95;
            this.rotationVelocity.y *= 0.95;

            // Stop completely when velocity is very small
            if (Math.abs(this.rotationVelocity.x) < 0.0001 && Math.abs(this.rotationVelocity.y) < 0.0001) {
                this.rotationVelocity.x = 0;
                this.rotationVelocity.y = 0;
                this.autoRotate = true;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize globe when DOM is ready
let globeController;
document.addEventListener('DOMContentLoaded', () => {
    globeController = new GlobeController();
});
