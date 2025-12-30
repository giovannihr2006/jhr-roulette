/**
 * three-renderer.js
 * Version: 2.0.0 - Fase 2: Hiperrealismo Visual
 * 
 * Motor de renderizado 3D con Three.js
 * - Escena 3D completa
 * - Cámaras dinámicas
 * - Iluminación profesional
 * - Carga de texturas de assets
 * 
 * Autor: JHR Quantum Roulette - Fase 2
 */

class ThreeRenderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.wheelMesh = null;
        this.ballMesh = null;
        this.lights = [];
        
        // Assets URLs (Fase 2)
        this.assets = {
            wheelTexture: 'https://www.genspark.ai/api/files/s/07FAB1Ll',
            ballTexture: 'https://www.genspark.ai/api/files/s/amiXkQQt',
            tableTexture: 'https://www.genspark.ai/api/files/s/rF8Shnfa'
        };
        
        // Estado de carga
        this.isLoaded = false;
        this.loadingProgress = 0;
        
        console.log('[ThreeRenderer] Inicializado - Fase 2');
    }
    
    /**
     * Inicializa el motor 3D
     */
    async init() {
        console.log('[ThreeRenderer] Inicializando motor 3D...');
        
        // Verificar que Three.js esté disponible
        if (typeof THREE === 'undefined') {
            console.error('[ThreeRenderer] Three.js no está cargado');
            return false;
        }
        
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a1f14);
        this.scene.fog = new THREE.Fog(0x0a1f14, 10, 50);
        
        // Configurar cámara
        this.setupCamera();
        
        // Configurar renderer
        this.setupRenderer();
        
        // Configurar iluminación
        this.setupLighting();
        
        // Cargar modelos 3D
        await this.loadModels();
        
        // Crear mesa base
        this.createTable();
        
        this.isLoaded = true;
        console.log('[ThreeRenderer] ✓ Motor 3D inicializado');
        
        return true;
    }
    
    /**
     * Configura la cámara
     */
    setupCamera() {
        const aspect = this.canvas.width / this.canvas.height;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 15, 20);
        this.camera.lookAt(0, 0, 0);
        
        console.log('[ThreeRenderer] Cámara configurada');
    }
    
    /**
     * Configura el renderer
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        console.log('[ThreeRenderer] Renderer configurado');
    }
    
    /**
     * Configura la iluminación profesional
     */
    setupLighting() {
        // Luz ambiente suave
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Luz direccional principal (casino spot)
        const mainLight = new THREE.DirectionalLight(0xffd700, 0.8);
        mainLight.position.set(5, 15, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        this.scene.add(mainLight);
        this.lights.push(mainLight);
        
        // Luz de relleno
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 10, -5);
        this.scene.add(fillLight);
        this.lights.push(fillLight);
        
        // Luz puntual sobre la ruleta (dramatic)
        const spotLight = new THREE.SpotLight(0xffd700, 1.2);
        spotLight.position.set(0, 12, 0);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.3;
        spotLight.decay = 2;
        spotLight.distance = 30;
        spotLight.castShadow = true;
        this.scene.add(spotLight);
        this.lights.push(spotLight);
        
        console.log('[ThreeRenderer] Iluminación configurada (4 luces)');
    }
    
    /**
     * Carga los modelos 3D
     */
    async loadModels() {
        console.log('[ThreeRenderer] Cargando modelos 3D...');
        
        const textureLoader = new THREE.TextureLoader();
        
        try {
            // Cargar textura de cilindro
            const wheelTexture = await this.loadTexture(textureLoader, this.assets.wheelTexture);
            this.createWheel(wheelTexture);
            
            // Cargar textura de bola
            const ballTexture = await this.loadTexture(textureLoader, this.assets.ballTexture);
            this.createBall(ballTexture);
            
            console.log('[ThreeRenderer] ✓ Modelos 3D cargados');
        } catch (error) {
            console.error('[ThreeRenderer] Error cargando modelos:', error);
        }
    }
    
    /**
     * Carga una textura con promesa
     */
    loadTexture(loader, url) {
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (texture) => resolve(texture),
                (progress) => {
                    this.loadingProgress = (progress.loaded / progress.total) * 100;
                },
                (error) => reject(error)
            );
        });
    }
    
    /**
     * Crea el cilindro de ruleta 3D
     */
    createWheel(texture) {
        // Geometría del cilindro
        const geometry = new THREE.CylinderGeometry(4, 4, 0.5, 64);
        
        // Material con textura
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            metalness: 0.3,
            roughness: 0.4,
            envMapIntensity: 1
        });
        
        this.wheelMesh = new THREE.Mesh(geometry, material);
        this.wheelMesh.position.set(0, 0, 0);
        this.wheelMesh.rotation.x = Math.PI / 2; // Rotar para que quede horizontal
        this.wheelMesh.castShadow = true;
        this.wheelMesh.receiveShadow = true;
        
        this.scene.add(this.wheelMesh);
        
        console.log('[ThreeRenderer] Cilindro 3D creado');
    }
    
    /**
     * Crea la bola 3D
     */
    createBall(texture) {
        // Geometría esférica
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        
        // Material PBR realista
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            metalness: 0.1,
            roughness: 0.2,
            envMapIntensity: 1
        });
        
        this.ballMesh = new THREE.Mesh(geometry, material);
        this.ballMesh.position.set(3.5, 0.5, 0);
        this.ballMesh.castShadow = true;
        
        this.scene.add(this.ballMesh);
        
        console.log('[ThreeRenderer] Bola 3D creada');
    }
    
    /**
     * Crea la mesa base
     */
    createTable() {
        // Base de mesa
        const tableGeometry = new THREE.BoxGeometry(12, 0.2, 8);
        const tableMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a472a,
            metalness: 0.1,
            roughness: 0.8
        });
        
        const tableMesh = new THREE.Mesh(tableGeometry, tableMaterial);
        tableMesh.position.set(0, -0.5, 0);
        tableMesh.receiveShadow = true;
        
        this.scene.add(tableMesh);
        
        console.log('[ThreeRenderer] Mesa base creada');
    }
    
    /**
     * Renderiza la escena
     */
    render() {
        if (!this.isLoaded || !this.renderer) return;
        
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Actualiza el tamaño del renderer
     */
    resize(width, height) {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    /**
     * Obtiene el wheelMesh para física
     */
    getWheel() {
        return this.wheelMesh;
    }
    
    /**
     * Obtiene el ballMesh para física
     */
    getBall() {
        return this.ballMesh;
    }
    
    /**
     * Cambia la posición de la cámara
     */
    setCameraPosition(x, y, z) {
        if (this.camera) {
            this.camera.position.set(x, y, z);
            this.camera.lookAt(0, 0, 0);
        }
    }
    
    /**
     * Anima la cámara a una posición
     */
    animateCamera(targetPos, duration = 1000) {
        if (!this.camera) return;
        
        const startPos = this.camera.position.clone();
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing suave
            const eased = this.easeInOutCubic(progress);
            
            this.camera.position.lerpVectors(startPos, targetPos, eased);
            this.camera.lookAt(0, 0, 0);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * Función de easing
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    /**
     * Destructor
     */
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.scene) {
            this.scene.clear();
        }
        
        console.log('[ThreeRenderer] Destruido');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ThreeRenderer = ThreeRenderer;
}
