document.addEventListener('DOMContentLoaded', () => {
    // --- Register GSAP Plugins ---
    gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);

    // --- Configuration (v2.1 Spaced Out Order) ---
    const config = {
        scrollLength: 15000,
        cameraPath: [
            { pos: new THREE.Vector3(0, 10, 180), look: new THREE.Vector3(0, 5, 0) },        // 0: Welcome (Moved back from 100 to 180)
            { pos: new THREE.Vector3(100, 20, -250), look: new THREE.Vector3(100, 5, -350) },  // 1: About (Moved back)
            { pos: new THREE.Vector3(-140, 35, -620), look: new THREE.Vector3(-20, 15, -750) }, // 2: Skills (Moved back from -100,25,-700)
            { pos: new THREE.Vector3(120, 90, -950), look: new THREE.Vector3(120, 0, -1100) }, // 3: Experience (Moved back/up from 120,50,-1100)
            { pos: new THREE.Vector3(300, 40, -1400), look: new THREE.Vector3(300, 15, -1650) }, // 4: Projects (Moved back)
            { pos: new THREE.Vector3(-250, 60, -1800), look: new THREE.Vector3(-250, 30, -2100) }, // 5: Education (Moved back)
            { pos: new THREE.Vector3(90, 30, -2200), look: new THREE.Vector3(0, 10, -2500) },    // 6: Certs (Moved back)
            { pos: new THREE.Vector3(0, 50, -2700), look: new THREE.Vector3(0, 15, -3000) }      // 7: Contact (Moved back)
        ],
        zoneColors: [
            { bg: 0x020617, fog: 0x020617, accent: 0xa855f7 },
            { bg: 0x020617, fog: 0x0f172a, accent: 0x3b82f6 },
            { bg: 0x020617, fog: 0x06b6d4, accent: 0x06b6d4 },
            { bg: 0x020617, fog: 0xa855f7, accent: 0xfb923c },
            { bg: 0x020617, fog: 0xec4899, accent: 0x3b82f6 },
            { bg: 0x020617, fog: 0xfbbf24, accent: 0xa855f7 },
            { bg: 0x020617, fog: 0x0f172a, accent: 0xc084fc },
            { bg: 0x020617, fog: 0xa855f7, accent: 0xec4899 }
        ]
    };

    // --- Core Three.js Setup ---
    const container = document.getElementById('three-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(config.zoneColors[0].bg);
    scene.fog = new THREE.FogExp2(config.zoneColors[0].fog, 0.0008); 

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 8000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // Initial position
    camera.position.copy(config.cameraPath[0].pos);
    camera.lookAt(config.cameraPath[0].look);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 300, 0);
    scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(100, 200, 100);
    scene.add(dirLight);

    // Zone-specific lights
    const zoneLights = [
        new THREE.PointLight(0xa855f7, 2, 500), // Welcome
        new THREE.PointLight(0x3b82f6, 2, 500), // About
        new THREE.PointLight(0x06b6d4, 3, 600), // Skills
        new THREE.PointLight(0xfb923c, 2, 500), // Experience
        new THREE.PointLight(0x3b82f6, 3, 700), // Projects
        new THREE.PointLight(0xfbbf24, 2, 500), // Education
        new THREE.PointLight(0xc084fc, 3, 600), // Certs
        new THREE.PointLight(0xec4899, 4, 800)  // Contact
    ];
    zoneLights.forEach((light, i) => {
        light.position.copy(config.cameraPath[i].pos);
        scene.add(light);
    });

    // --- Guide Robot ---
    class RobotGirl {
        constructor() {
            this.group = new THREE.Group();
            
            const bodyGeo = new THREE.SphereGeometry(0.6, 32, 32);
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xa855f7, emissiveIntensity: 0.8 });
            this.body = new THREE.Mesh(bodyGeo, bodyMat);
            this.group.add(this.body);

            const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
            const eyeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 3 });
            [-0.2, 0.2].forEach(x => {
                const eye = new THREE.Mesh(eyeGeo, eyeMat);
                eye.position.set(x, 0.2, 0.5);
                this.group.add(eye);
            });

            const wingGeo = new THREE.PlaneGeometry(0.6, 1.2);
            const wingMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, side: THREE.DoubleSide, transparent: true, opacity: 0.5, emissive: 0x3b82f6 });
            this.leftWing = new THREE.Mesh(wingGeo, wingMat);
            this.leftWing.position.set(-1.1, 0, 0);
            this.leftWing.rotation.y = -Math.PI/4;
            this.group.add(this.leftWing);

            this.rightWing = this.leftWing.clone();
            this.rightWing.position.set(1.1, 0, 0);
            this.rightWing.rotation.y = Math.PI/4;
            this.group.add(this.rightWing);

            this.symbols = new THREE.Group();
            const symbolChars = ['<', '>', '{', '}', '/', '*', '+', '='];
            symbolChars.forEach((char, i) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 64; canvas.height = 64;
                ctx.fillStyle = '#06b6d4'; ctx.font = 'bold 44px Orbitron';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(char, 32, 32);
                const tex = new THREE.CanvasTexture(canvas);
                const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.7 }));
                sprite.scale.set(0.5, 0.5, 1);
                const angle = (i / symbolChars.length) * Math.PI * 2;
                sprite.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0);
                this.symbols.add(sprite);
            });
            this.group.add(this.symbols);
            scene.add(this.group);
        }

        update(time, targetPos, targetLook) {
            this.group.position.lerp(targetPos, 0.08);
            this.group.position.y += Math.sin(time * 1.5) * 0.2;
            this.group.lookAt(targetLook);
            this.symbols.rotation.z += 0.03;
            this.body.rotation.y += 0.015;
            this.leftWing.rotation.y = -Math.PI/4 + Math.sin(time * 4) * 0.3;
            this.rightWing.rotation.y = Math.PI/4 - Math.sin(time * 4) * 0.3;
        }
    }
    const guide = new RobotGirl();

    // --- Environment Elements (v2.1 In Order) ---
    function createEnchantedWorld() {
        const starsCount = 4000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starsCount * 3);
        const colors = new Float32Array(starsCount * 3);
        for(let i=0; i<starsCount; i++) {
            positions[i*3] = THREE.MathUtils.randFloatSpread(8000);
            positions[i*3+1] = THREE.MathUtils.randFloatSpread(4000);
            positions[i*3+2] = THREE.MathUtils.randFloatSpread(10000);
            const color = new THREE.Color().setHSL(Math.random() * 0.1 + 0.5, 0.8, 0.9);
            colors[i*3] = color.r; colors[i*3+1] = color.g; colors[i*3+2] = color.b;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ size: 2, vertexColors: true, transparent: true, opacity: 0.8 })));

        const grid = new THREE.GridHelper(10000, 100, 0x06b6d4, 0x020617);
        grid.position.y = -30;
        grid.material.transparent = true; grid.material.opacity = 0.1;
        scene.add(grid);

        // Floating Code Symbols
        const codeSymbols = ['< >', '{ }', '[ ]', '( )', '//', '/* */', 'if', 'for', 'class', 'function', 'import', 'export', 'const', 'let', 'var'];
        const floatingSymbols = new THREE.Group();
        codeSymbols.forEach((symbol, i) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 128; canvas.height = 64;
            ctx.fillStyle = '#06b6d4'; ctx.font = 'bold 32px Orbitron';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(symbol, 64, 32);
            const tex = new THREE.CanvasTexture(canvas);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.6 }));
            sprite.scale.set(2, 1, 1);
            const angle = (i / codeSymbols.length) * Math.PI * 2;
            const radius = 200 + Math.random() * 300;
            sprite.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius + Math.random() * 200 - 100, Math.sin(angle * 2) * radius);
            floatingSymbols.add(sprite);
        });
        scene.add(floatingSymbols);

        // Glowing Particles
        const particlesCount = 2000;
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesPositions = new Float32Array(particlesCount * 3);
        for(let i=0; i<particlesCount; i++) {
            particlesPositions[i*3] = THREE.MathUtils.randFloatSpread(6000);
            particlesPositions[i*3+1] = THREE.MathUtils.randFloatSpread(3000);
            particlesPositions[i*3+2] = THREE.MathUtils.randFloatSpread(8000);
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
        const particlesMaterial = new THREE.PointsMaterial({ color: 0xa855f7, size: 1, transparent: true, opacity: 0.4 });
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);
    }
    createEnchantedWorld();

    // --- Theme Objects ---
    const clouds = new THREE.Group();
    for(let i=0; i<30; i++) {
        const c = new THREE.Mesh(new THREE.SphereGeometry(10, 20, 20), new THREE.MeshStandardMaterial({ color: 0xa855f7, transparent: true, opacity: 0.15 }));
        c.position.set(THREE.MathUtils.randFloatSpread(400), 20, THREE.MathUtils.randFloat(0, 200));
        c.scale.set(4, 0.5, 3);
        clouds.add(c);
    }
    scene.add(clouds);

    const techPlanetContainer = new THREE.Group();
    techPlanetContainer.position.copy(config.cameraPath[2].look);
    
    const techPlanet = new THREE.Group();
    techPlanetContainer.add(techPlanet);
    techPlanet.add(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 32), new THREE.MeshStandardMaterial({ color: 0x06b6d4, wireframe: true, emissive: 0x3b82f6, emissiveIntensity: 1.2 })));
    

    const skillList = ['Java', 'HTML', 'CSS', 'JS', 'JSP', 'MySQL', 'Android', 'GitHub'];
    skillList.forEach((skill, i) => {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 16), new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 2 }));
        const angle = (i / skillList.length) * Math.PI * 2;
        sphere.position.set(Math.cos(angle) * 70, Math.sin(angle) * 70, (Math.random()-0.5)*40); // Increased orbit
        
        // Add skill label
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256; canvas.height = 128;
        ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 20; // Improved lighting and contrast
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 44px Orbitron'; // White text, larger font
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(skill, 128, 64);
        const tex = new THREE.CanvasTexture(canvas);
        const label = new THREE.Sprite(new THREE.SpriteMaterial({ 
            map: tex, transparent: true, opacity: 1, depthTest: false, depthWrite: false, fog: false 
        }));
        label.scale.set(18, 9, 1); // Noticeably increased text badge size
        label.position.set(0, 15, 0);
        sphere.add(label);
        
        techPlanet.add(sphere);
    });
    scene.add(techPlanetContainer);

    // --- Data Spire (Experience) ---
    const dataSpire = new THREE.Group();
    dataSpire.position.copy(config.cameraPath[3].look);
    
    
    const spireCore = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 80, 8), new THREE.MeshStandardMaterial({ color: 0x020617, emissive: 0x3b82f6, wireframe: true, emissiveIntensity: 2 }));
    spireCore.position.set(0, -10, -20);
    dataSpire.add(spireCore);

    // Add 3D Holographic Info Panel for Experience
    const expCanvas = document.createElement('canvas');
    const expCtx = expCanvas.getContext('2d');
    expCanvas.width = 512; expCanvas.height = 256;
    expCtx.shadowColor = '#ffffff'; expCtx.shadowBlur = 20; // Glowing text
    expCtx.fillStyle = '#ffffff'; expCtx.font = 'bold 36px Orbitron';
    expCtx.textAlign = 'center';
    expCtx.fillText('Mass Technologies', 256, 80);
    expCtx.font = 'bold 28px Orbitron';
    expCtx.fillStyle = '#a855f7'; // Purple highlight for role
    expCtx.fillText('Software Intern', 256, 130);
    expCtx.fillStyle = '#ffffff';
    expCtx.font = '24px Orbitron';
    expCtx.fillText('Jun 2025 - Sep 2025', 256, 175);
    
    const expTex = new THREE.CanvasTexture(expCanvas);
    const expSprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
        map: expTex, transparent: true, opacity: 1, depthTest: false, depthWrite: false, fog: false 
    }));
    expSprite.scale.set(40, 20, 1);
    expSprite.position.set(0, 20, 10); // Placed prominently in front of the spire
    dataSpire.add(expSprite);
    
    scene.add(dataSpire);

    const city = new THREE.Group();
    city.position.copy(config.cameraPath[4].look);
    const projectData = [
        { title: 'SmartMart App', tech: 'Java, Android', color: 0xec4899, pos: [0, 80, 0] },
        { title: 'Feedback System', tech: 'JSP, MySQL', color: 0x3b82f6, pos: [100, 60, -80] },
        { title: 'Messcode Web', tech: 'JSP, CSS', color: 0x06b6d4, pos: [-120, 70, 90] },
        { title: 'HelpReach', tech: 'Web Tech', color: 0xa855f7, pos: [80, 90, 120] }
    ];
    projectData.forEach(p => {
        const safeX = Math.max(-80, Math.min(80, p.pos[0] * 0.4));
        const safeZ = p.pos[2] * 0.4;

        const mesh = new THREE.Mesh(new THREE.BoxGeometry(40, 150, 40), new THREE.MeshStandardMaterial({ color: 0x020617, emissive: p.color, wireframe: true, emissiveIntensity: 2 }));
        mesh.position.set(safeX, 0, safeZ);
        city.add(mesh);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512; canvas.height = 256;
        ctx.clearRect(0, 0, 512, 256);
        ctx.shadowColor = '#ffffff'; // White glow
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 48px Orbitron'; // White text
        ctx.textAlign = 'center';
        ctx.fillText(p.title, 256, 110);
        ctx.font = '30px Orbitron';
        ctx.fillText(p.tech, 256, 170);
        
        const tex = new THREE.CanvasTexture(canvas);
        // depthTest false and fog false for visibility overrides
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
            map: tex, transparent: true, opacity: 1, depthTest: false, depthWrite: false, fog: false 
        }));
        sprite.scale.set(30, 15, 1); // Normalized panel size even smaller
        sprite.position.set(safeX, (p.pos[1] * 0.3) + 10, safeZ + 20); // Severely lowered Y and pushed forward Z
        city.add(sprite);
    });
    scene.add(city);

    // ACADEMIC ISLE (EDUCATION)
    const academicSymbols = new THREE.Group();
    academicSymbols.position.copy(config.cameraPath[5].look);
    const educationData = [
        { title: 'Zeal Polytechnic', sub: 'Diploma in Computer Eng.', pos: [0, 80, 0] },
        { title: 'Achievements', sub: 'Hackathons & Presentations', pos: [80, 40, -40] },
        { title: 'Focus Areas', sub: 'Web Dev, Java, UI', pos: [-80, 50, 40] }
    ];
    educationData.forEach(e => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512; canvas.height = 256;
        ctx.clearRect(0, 0, 512, 256);
        ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 25; // White glow
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 48px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(e.title, 256, 110);
        ctx.font = '28px Orbitron';
        ctx.fillText(e.sub, 256, 170);
        
        const tex = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
            map: tex, transparent: true, opacity: 1, depthTest: false, depthWrite: false, fog: false 
        }));
        sprite.scale.set(35, 17.5, 1); // Normalized scale smaller
        const safeX = Math.max(-60, Math.min(60, e.pos[0] * 0.4));
        const safeZ = e.pos[2] * 0.4;
        sprite.position.set(safeX, (e.pos[1] * 0.3) + 5, safeZ + 20); // Severely lowered Y, pushed forward
        academicSymbols.add(sprite);
    });
    scene.add(academicSymbols);

    const crystalsContainer = new THREE.Group();
    crystalsContainer.position.copy(config.cameraPath[6].look);
    
    const crystals = new THREE.Group();
    crystalsContainer.add(crystals);
    const certLabels = ['Hackathons', 'Workshops', 'Java Full Stack', 'Development'];
    for(let i=0; i<30; i++) {
        const type = Math.floor(Math.random() * 4);
        let geo;
        if(type === 0) geo = new THREE.OctahedronGeometry(6, 0);
        else if(type === 1) geo = new THREE.IcosahedronGeometry(6, 0);
        else if(type === 2) geo = new THREE.TetrahedronGeometry(6, 0);
        else geo = new THREE.BoxGeometry(20, 30, 2); 
        
        const crystal = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ 
            color: config.zoneColors[6].accent, 
            emissive: config.zoneColors[6].accent, 
            emissiveIntensity: 3, 
            transparent: true, 
            opacity: 0.9 
        }));
        crystal.position.set(THREE.MathUtils.randFloatSpread(300), THREE.MathUtils.randFloat(0, 100) - 50, THREE.MathUtils.randFloatSpread(300));
        crystal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        crystals.add(crystal);
        
        if(i < certLabels.length) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 512; canvas.height = 128;
            ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 25; // White glow
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 48px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(certLabels[i], 256, 80);
            const tex = new THREE.CanvasTexture(canvas);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
                map: tex, transparent: true, opacity: 1, depthTest: false, depthWrite: false, fog: false 
            }));
            sprite.scale.set(40, 10, 1); // Reduced scale
            
            // Fixed container position so they don't swirl out of view
            sprite.position.set(crystal.position.x * 0.5, 15 + (i * 10), crystal.position.z * 0.5 + 40); 
            crystalsContainer.add(sprite);
        }
    }
    scene.add(crystalsContainer);

    // Portal & Finale Decorations
    const portal = new THREE.Mesh(new THREE.TorusGeometry(40, 4, 32, 100), new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 5 }));
    portal.position.set(0, 20, -3000);
    scene.add(portal);

    // Light Beams
    const lightBeams = new THREE.Group();
    for(let i=0; i<8; i++) {
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 200, 8), new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 3, transparent: true, opacity: 0.3 }));
        beam.position.set(Math.cos((i/8)*Math.PI*2) * 60, 100, -3000 + Math.sin((i/8)*Math.PI*2) * 60);
        beam.rotation.z = Math.PI / 2;
        lightBeams.add(beam);
    }
    scene.add(lightBeams);

    const sparkles = new THREE.Group();
    scene.add(sparkles);
    
    // PORTAL TEMPLE (CONTACT) - Redesigned 3D Finale Message
    const contactIcons = new THREE.Group();
    contactIcons.position.set(0, 25, -2900); // In front of the portal at -3000
    
    const thankYouCanvas = document.createElement('canvas');
    const tyCtx = thankYouCanvas.getContext('2d');
    thankYouCanvas.width = 1400; thankYouCanvas.height = 1024; // Increased width to prevent clipping
    tyCtx.fillStyle = 'rgba(255, 255, 255, 0)'; 
    tyCtx.fillRect(0, 0, 1400, 1024);
    
    // Core Line 1: THANK YOU FOR VISITING
    tyCtx.shadowColor = '#ffffff'; tyCtx.shadowBlur = 40;
    tyCtx.fillStyle = '#ffffff'; tyCtx.font = 'bold 80px Orbitron'; // Increased font weight/size
    tyCtx.textAlign = 'center';
    tyCtx.fillText('THANK YOU FOR VISITING', 700, 300); // 700 is the horizontal center
    
    // Line 2: MY PORTFOLIO
    tyCtx.font = 'bold 70px Orbitron';
    tyCtx.fillText('MY PORTFOLIO', 700, 420);
    
    // Line 3: Prachi Suhas Pawar
    tyCtx.shadowColor = 'transparent'; // Remove glow from lower text to make the top prominent
    tyCtx.font = 'bold 50px Orbitron'; tyCtx.fillStyle = '#ffffff'; // Changed to white as requested
    tyCtx.fillText('Prachi Suhas Pawar', 700, 580);
    
    // Line 4: Future Software Engineer
    tyCtx.font = '32px Orbitron'; tyCtx.fillStyle = '#ffffff';
    tyCtx.fillText('Future Software Engineer', 700, 660);
    
    const tyTex = new THREE.CanvasTexture(thankYouCanvas);
    const tySprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
        map: tyTex, transparent: true, opacity: 1, depthTest: false, depthWrite: false, fog: false 
    }));
    // Adjusted scale to maintain proportions with the new 1400x1024 canvas
    tySprite.scale.set(246, 180, 1); // Slight increase in size for finale
    // Positioned lower so it appears fully inside camera view
    tySprite.position.set(0, -20, -50); 
    contactIcons.add(tySprite);

    const contactData = [
        { char: '📧', pos: [-60, 50, 0], color: 0x3b82f6 },
        { char: '🐙', pos: [60, 50, 0], color: 0xffffff },
        { char: '💼', pos: [0, 90, 0], color: 0x06b6d4 }
    ];
    contactData.forEach(d => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(10, 0.8, 16, 100), new THREE.MeshStandardMaterial({ color: d.color, emissive: d.color, emissiveIntensity: 5 }));
        ring.position.set(...d.pos); contactIcons.add(ring);
    });
    scene.add(contactIcons);

    const curve = new THREE.CatmullRomCurve3(config.cameraPath.map(c => c.pos));
    const lookCurve = new THREE.CatmullRomCurve3(config.cameraPath.map(c => c.look));

    const hudItems = [];
    const data = [
        { title: 'WELCOME SKY ISLAND', content: '<strong>Prachi Suhas Pawar</strong><br>Aspiring Software Developer | Student at Zeal Polytechnic Pune.<br><br>Exploring the intersection of logic and creativity through code.', pos: config.cameraPath[0].look },
        { title: 'HOLOGRAPHIC GARDEN', content: '<strong>About Me</strong><br>I enjoy building websites and exploring modern web technologies. I like creating clean user interfaces and developing practical web-based solutions while continuously improving my programming skills.', pos: config.cameraPath[1].look },
        { title: 'SKILLS PLANET', content: '<strong>Dominant Skills</strong><br>• Core Java, JSP, Spring Basics<br>• HTML, CSS, JavaScript (ES6+)<br>• MySQL, DBMS Optimization<br>• Git Workflow', pos: config.cameraPath[2].look },
        { title: 'DATA SPIRE', content: 'Follow my learning path, technical experiences, and growth as a developer.<br><br><strong>Mass Technologies (Intern)</strong><br>Jun 2025 - Sep 2025<br>Building responsive web applications and refining technical workflows in an agile environment.', pos: config.cameraPath[3].look },
        { title: 'PROJECT NEON CITY', content: '<strong>SmartMart App (Java, Android)</strong><br>QR-based shopping application that scans products, adds them to a cart, and generates a bill with payment integration.<br><br><strong>Student Feedback System (JSP, MySQL)</strong><br>Web-based system where students submit feedback and administrators view reports.<br><br><strong>Messcode Website (JSP, CSS)</strong><br>Platform where users can search nearby mess services, view menus, and register as owners.<br><br><strong>HelpReach Project (Web)</strong><br>Social platform designed to connect people with emergency help and donations.', pos: config.cameraPath[4].look },
        { title: 'ACADEMIC FLOATING ISLE', content: '<strong>Zeal Polytechnic, Pune</strong><br>Diploma in Computer Engineering<br><br><strong>Focus Areas</strong><br>• Programming and Web Development<br>• Java, Full Stack Development<br><br><strong>Achievements</strong><br>• Active participation in hackathons<br>• Technical presentations<br>• Hands-on project development', pos: config.cameraPath[5].look },
        { title: 'CRYSTAL GALLERY', content: '<strong>Technical Workshops</strong><br>Attended various technical workshops on advanced programming and development practices.<br><br><strong>Hackathon Participation</strong><br>Participated in multiple hackathons, showcasing problem-solving skills and teamwork.<br><br><strong>Web Projects</strong><br>Completed numerous development projects demonstrating proficiency in web frameworks.<br><br><strong>Continuous Learning</strong><br>Ongoing progress in software development, including modern architectures.', pos: config.cameraPath[6].look },
        { title: 'THE HEART PORTAL', content: '<strong>Thank You for Visiting!</strong><br>Your journey through my coding universe has come to an end... but the adventure continues!<br><br><strong>Prachi Suhas Pawar</strong><br>Future Software Engineer<br><br>📧 Email: prachipawar5133@gmail.com<br>🐙 GitHub: prachi-pawar<br>💼 LinkedIn: /in/prachipawar<br><br><button id="restart-journey-btn" class="btn-restart">Restart Journey</button>', pos: config.cameraPath[7].look }
    ];

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'hud-item glass-card';
        div.innerHTML = `<h3>${item.title}</h3><p>${item.content}</p>`;
        document.getElementById('hud-overlay').appendChild(div);
        hudItems.push({ element: div, pos: item.pos });
    });

    let portalTriggered = false;
    let activeZone = 0;

    let scrollProgress = 0;
    let isJourneyStarted = false;

    const composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.4, 0.8);
    composer.addPass(bloomPass);

    document.getElementById('start-journey').addEventListener('click', () => {
        if(isJourneyStarted) return;
        isJourneyStarted = true;
        
        window.scrollTo(0, 0);
        
        document.getElementById('welcome-screen').classList.add('fade-out');
        document.getElementById('game-hud').classList.remove('hidden');
        document.body.style.height = config.scrollLength + 'px';
        ScrollTrigger.refresh();
        gsap.to(window, { scrollTo: 100, duration: 2, ease: "power2.inOut" });
    });

    ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 2,
        onUpdate: (self) => { if(isJourneyStarted) scrollProgress = self.progress; }
    });

    function updateWorld(time) {
        const t = Math.min(Math.max(scrollProgress, 0.0001), 0.999);
        const targetPos = curve.getPoint(t);
        const targetLook = lookCurve.getPoint(t);
        
        // Cinematic Deceleration near zones
        activeZone = Math.floor(t * 8);
        const lerpToZone = (t * 8) % 1;
        let lerpSpeed = 0.06;
        if (lerpToZone > 0.8 || lerpToZone < 0.2) lerpSpeed = 0.03; // Slow down near key points

        camera.position.lerp(targetPos, lerpSpeed);
        camera.lookAt(targetLook);

        const guideTarget = camera.position.clone().add(new THREE.Vector3(4, -2, -15).applyQuaternion(camera.quaternion));
        guide.update(time, guideTarget, targetLook);

        const lerpFactor = (t * 8) % 1;
        const c1 = config.zoneColors[activeZone];
        const c2 = config.zoneColors[Math.min(activeZone + 1, 7)];
        
        if (c1 && c2) scene.fog.color.copy(new THREE.Color(c1.fog).lerp(new THREE.Color(c2.fog), lerpFactor));

        hudItems.forEach((item, i) => {
            const dist = camera.position.distanceTo(item.pos);
            const isLookingAt = dist < 2200; // Increased visibility trigger range to start earlier
            const isCurrent = (i === activeZone);
            
            if (isCurrent && isLookingAt) {
                // Position the HUD item in front of the camera, directly in center viewing direction
                item.element.style.left = `50%`;
                item.element.style.top = `50%`;
                item.element.classList.add('active');
            } else {
                item.element.classList.remove('active');
            }
            
            document.querySelectorAll('#hud-menu li')[i]?.classList.toggle('active', i === activeZone);
        });

        if(t > 0.98 && !portalTriggered) {
            portalTriggered = true;
            const progressBar = document.querySelector('.loading-progress');
            if(progressBar) progressBar.classList.add('started');
            
            // Cinematic Portal Sequence
            setTimeout(() => {
                // 1. Stronger portal glow handled in animate() via scrollProgress
                // 2. Stars swirl handled in animate()
                
                // 3. Move camera forward through portal
                gsap.to(camera.position, {
                    z: -3500,
                    duration: 3,
                    ease: "power2.in"
                });

                // 4. Fade to black
                setTimeout(() => {
                    document.body.style.transition = "opacity 1s ease";
                    document.body.style.opacity = "0";
                    
                    // 5. Reset with 1s delay
                    setTimeout(() => {
                        window.scrollTo(0, 0);
                        location.reload(); // Hard reset for clean state
                    }, 1200);
                }, 2000);
            }, 1000);
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now() * 0.001;
        
        if(isJourneyStarted) {
            updateWorld(time);
        } else {
            camera.position.x = Math.sin(time * 0.4) * 8;
            camera.lookAt(0, 5, 0);
        }
        
        techPlanet.rotation.y += 0.003;
        clouds.rotation.y += 0.0004;
        portal.rotation.z += 0.05;
        lightBeams.rotation.y += 0.02;

        // Animate academic symbols
        // Removed academicSymbols.rotation.y so text stays visible and centered
        academicSymbols.children.forEach((symbol, i) => {
            symbol.position.y += Math.sin(time + i * 0.5) * 0.02;
        });

        // Animate crystals
        crystals.rotation.y += 0.003;
        crystals.children.forEach((crystal, i) => {
            crystal.rotation.x += 0.01;
            crystal.rotation.y += 0.01;
            crystal.position.y += Math.sin(time * 0.5 + i) * 0.01;
        });

        // Animate floating symbols
        scene.children.forEach(child => {
            if (child.type === 'Group' && child.children.length > 10) { // Assuming floatingSymbols group
                child.rotation.y += 0.001;
                child.children.forEach((symbol, i) => {
                    if (symbol.type === 'Sprite') {
                        symbol.position.y += Math.sin(time + i) * 0.01;
                        symbol.material.opacity = 0.6 + Math.sin(time * 2 + i) * 0.2;
                    }
                });
            }
        });

        // Animate Finale Sparkles
        sparkles.children.forEach((s, i) => {
            s.rotation.x += 0.02;
            s.position.y += Math.sin(time + i) * 0.05;
        });

        // Special Guide Pulse at Finale
        if(scrollProgress > 0.95) {
            const pulse = 1 + Math.sin(time * 10) * 0.1;
            guide.group.scale.set(pulse, pulse, pulse);
        } else {
            guide.group.scale.set(1, 1, 1);
        }

         // Spotlight Effect based on active zone
         const zoneGroups = [null, techPlanetContainer, techPlanetContainer, dataSpire, city, academicSymbols, crystalsContainer, contactIcons];
         zoneGroups.forEach((group, i) => {
             if (group) {
                 const isActive = (i === activeZone);
                 group.scale.lerp(new THREE.Vector3(isActive ? 1.05 : 1, isActive ? 1.05 : 1, isActive ? 1.05 : 1), 0.1);
                 group.traverse(child => {
                     if (child.material && child.material.emissiveIntensity !== undefined) {
                         const baseIntensity = (child.type === 'Sprite' ? 1 : 2);
                         child.material.emissiveIntensity = THREE.MathUtils.lerp(child.material.emissiveIntensity, isActive ? baseIntensity * 2.5 : baseIntensity, 0.05);
                     }
                 });
             }
         });
 
         // Camera-Facing Logic & Floating Animation for all info sprites
         [city, academicSymbols, crystalsContainer, contactIcons, techPlanetContainer, dataSpire].forEach(group => {
             group.traverse(child => {
                 if (child.type === 'Sprite') {
                     child.lookAt(camera.position);
                     
                     const worldPos = new THREE.Vector3();
                     child.getWorldPosition(worldPos);
                     const dist = camera.position.distanceTo(worldPos);
                     
                     // Aggressive distance culling (ensures background 3D text from other zones doesn't ghost through)
                     const maxVisibleDist = 550;
                     if (dist > maxVisibleDist) {
                         child.material.opacity = 0;
                     } else {
                         // Starts fading at 350 out to 550
                         child.material.opacity = Math.min(1, Math.max(0, 1 - (dist - 350) / 200));
                     }
                 }
             });
         });
 
         composer.render();
     }
 
     window.addEventListener('resize', () => {
         camera.aspect = window.innerWidth / window.innerHeight;
         camera.updateProjectionMatrix();
         renderer.setSize(window.innerWidth, window.innerHeight);
         composer.setSize(window.innerWidth, window.innerHeight);
     });
 
     animate();
 
     // Mission Map Clicks
     document.querySelectorAll('#hud-menu li').forEach(li => {
         li.addEventListener('click', () => {
             if(!isJourneyStarted) return;
             const zoneIndex = parseInt(li.dataset.zone);
             const progress = (zoneIndex / 7); 
             gsap.to(window, { scrollTo: progress * (document.body.scrollHeight - window.innerHeight), duration: 2.5, ease: "power2.inOut" });
         });
     });
 
     // Restart Button Handler
     document.addEventListener('click', (e) => {
         if(e.target.id === 'restart-journey-btn') {
             gsap.to(window, { scrollTo: 0, duration: 2, ease: "power2.inOut" });
             setTimeout(() => location.reload(), 2100);
         }
     });
 });
