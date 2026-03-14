document.addEventListener('DOMContentLoaded', () => {
    // --- Register GSAP Plugins ---
    gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);

    // --- Configuration (v2.1 Spaced Out Order) ---
    const config = {
        scrollLength: 15000,
        cameraPath: [
            { pos: new THREE.Vector3(0, 10, 100), look: new THREE.Vector3(0, 5, 0) },        // 0: Welcome
            { pos: new THREE.Vector3(70, 15, -300), look: new THREE.Vector3(100, 5, -350) },  // 1: About
            { pos: new THREE.Vector3(-100, 25, -700), look: new THREE.Vector3(-20, 15, -750) }, // 2: Skills
            { pos: new THREE.Vector3(120, 50, -1100), look: new THREE.Vector3(120, 0, -1100) }, // 3: Experience
            { pos: new THREE.Vector3(250, 20, -1500), look: new THREE.Vector3(300, 15, -1650) }, // 4: Projects
            { pos: new THREE.Vector3(-200, 40, -1900), look: new THREE.Vector3(-250, 30, -2100) }, // 5: Education
            { pos: new THREE.Vector3(60, 15, -2300), look: new THREE.Vector3(0, 10, -2500) },    // 6: Certs
            { pos: new THREE.Vector3(0, 30, -2800), look: new THREE.Vector3(0, 15, -3000) }      // 7: Contact
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

    const techPlanet = new THREE.Group();
    techPlanet.position.copy(config.cameraPath[2].look);
    techPlanet.add(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 32), new THREE.MeshStandardMaterial({ color: 0x06b6d4, wireframe: true, emissive: 0x3b82f6, emissiveIntensity: 1.2 })));
    const skillList = ['Java', 'HTML', 'CSS', 'JS', 'JSP', 'MySQL', 'Android', 'GitHub'];
    skillList.forEach((skill, i) => {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 16), new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 2 }));
        const angle = (i / skillList.length) * Math.PI * 2;
        sphere.position.set(Math.cos(angle) * 60, Math.sin(angle) * 60, (Math.random()-0.5)*40);
        
        // Add skill label
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 128; canvas.height = 64;
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 24px Orbitron';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(skill, 64, 32);
        const tex = new THREE.CanvasTexture(canvas);
        const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.9 }));
        label.scale.set(4, 2, 1);
        label.position.set(0, 10, 0);
        sphere.add(label);
        
        techPlanet.add(sphere);
    });
    scene.add(techPlanet);

    const city = new THREE.Group();
    city.position.copy(config.cameraPath[4].look);
    const projectData = [
        { title: 'SmartMart App', tech: 'Java, Android', color: 0xec4899, pos: [0, 80, 0] },
        { title: 'Feedback System', tech: 'JSP, MySQL', color: 0x3b82f6, pos: [100, 60, -80] },
        { title: 'Messcode Web', tech: 'JSP, CSS', color: 0x06b6d4, pos: [-120, 70, 90] },
        { title: 'HelpReach', tech: 'Web Tech', color: 0xa855f7, pos: [80, 90, 120] }
    ];
    projectData.forEach(p => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(40, 150, 40), new THREE.MeshStandardMaterial({ color: 0x020617, emissive: p.color, wireframe: true, emissiveIntensity: 2 }));
        mesh.position.set(p.pos[0], 0, p.pos[2]);
        city.add(mesh);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512; canvas.height = 256;
        ctx.fillStyle = 'rgba(10, 10, 25, 0.8)';
        ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5;
        ctx.strokeRect(10, 10, 492, 236);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 44px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(p.title, 256, 100);
        ctx.font = '28px Orbitron';
        ctx.fillText(p.tech, 256, 180);
        
        const tex = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.9 }));
        sprite.scale.set(60, 30, 1);
        sprite.position.set(p.pos[0], p.pos[1] + 30, p.pos[2]);
        city.add(sprite);
    });
    scene.add(city);

    // ACADEMIC ISLE (EDUCATION)
    const academicSymbols = new THREE.Group();
    academicSymbols.position.copy(config.cameraPath[5].look);
    const educationData = [
        { title: 'Zeal Polytechnic', sub: 'Diploma in Computer Eng.', pos: [0, 80, 0] },
        { title: 'Achievements', sub: 'Hackathons & Presentations', pos: [80, 40, -40] },
        { title: 'Focus Areas', sub: 'Java, Full Stack, Android', pos: [-80, 50, 40] }
    ];
    educationData.forEach(e => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512; canvas.height = 256;
        ctx.fillStyle = 'rgba(10, 10, 25, 0.8)';
        ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 5;
        ctx.strokeRect(10, 10, 492, 236);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 44px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(e.title, 256, 100);
        ctx.font = '24px Orbitron';
        ctx.fillText(e.sub, 256, 180);
        
        const tex = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.9 }));
        sprite.scale.set(60, 30, 1);
        sprite.position.set(...e.pos);
        academicSymbols.add(sprite);
    });
    scene.add(academicSymbols);

    // Crystal Gallery (Refined)
    const crystals = new THREE.Group();
    crystals.position.copy(config.cameraPath[6].look);
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
        crystal.position.set(THREE.MathUtils.randFloatSpread(400), THREE.MathUtils.randFloatSpread(250), THREE.MathUtils.randFloatSpread(400));
        crystal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        crystals.add(crystal);
        
        if(i < certLabels.length) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 256; canvas.height = 64;
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 32px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(certLabels[i], 128, 40);
            const tex = new THREE.CanvasTexture(canvas);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 1 }));
            sprite.scale.set(30, 7.5, 1);
            sprite.position.copy(crystal.position).add(new THREE.Vector3(0, 25, 0));
            crystals.add(sprite);
        }
    }
    scene.add(crystals);

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
    thankYouCanvas.width = 1024; thankYouCanvas.height = 512;
    tyCtx.fillStyle = 'rgba(255, 255, 255, 0)'; 
    tyCtx.fillRect(0, 0, 1024, 512);
    
    tyCtx.shadowColor = '#ec4899'; tyCtx.shadowBlur = 40;
    tyCtx.fillStyle = '#ffffff'; tyCtx.font = 'bold 64px Orbitron';
    tyCtx.textAlign = 'center';
    tyCtx.fillText('THANK YOU FOR VISITING MY PORTFOLIO', 512, 120);
    
    tyCtx.font = 'bold 50px Orbitron'; tyCtx.fillStyle = '#a855f7';
    tyCtx.fillText('Prachi Suhas Pawar', 512, 260);
    
    tyCtx.font = '32px Orbitron'; tyCtx.fillStyle = '#ffffff';
    tyCtx.fillText('Future Software Engineer', 512, 340);
    
    const tyTex = new THREE.CanvasTexture(thankYouCanvas);
    const tySprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tyTex, transparent: true, opacity: 1 }));
    tySprite.scale.set(160, 80, 1);
    tySprite.position.set(0, 110, -50); // Floating high and in front
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
        { title: 'WELCOME SKY ISLAND', content: '<strong>Prachi Suhas Pawar</strong><br>Java Full Stack Developer | Student at Zeal Polytechnic Pune.<br><br>Exploring the intersection of logic and creativity through code.', pos: config.cameraPath[0].look },
        { title: 'HOLOGRAPHIC GARDEN', content: 'I specialize in Java environments, building scalable tools and Android apps. My goal is to craft digital experiences that solve real-world problems.', pos: config.cameraPath[1].look },
        { title: 'SKILLS PLANET', content: '<strong>Dominant Skills:</strong><br>• Core Java, JSP, Spring Basics<br>• HTML, CSS, JavaScript (ES6+)<br>• MySQL, DBMS Optimization<br>• Android Studio & Git Workflow', pos: config.cameraPath[2].look },
        { title: 'EXPERIENCE DATA SPIRE', content: '<strong>Mass Technologies (Intern)</strong><br>Jun 2025 - Sep 2025<br>Building responsive web applications and refining technical workflows in an agile environment.', pos: config.cameraPath[3].look },
        { title: 'PROJECT NEON CITY', content: '<div class="project-grid"><div class="project-card"><h4>SmartMart App</h4><p>QR-based shopping application that scans products, adds them to a cart, and generates a bill with payment integration.</p><small>Tech: Java, Android Studio, XML</small></div><div class="project-card"><h4>Student Feedback System</h4><p>Web-based feedback system where students can submit feedback and administrators can view reports.</p><small>Tech: JSP, HTML, CSS, JDBC, MySQL</small></div><div class="project-card"><h4>Messcode Website</h4><p>A platform where users can search nearby mess services, view menus, and register as mess owners or customers.</p><small>Tech: JSP, HTML, CSS, MySQL</small></div><div class="project-card"><h4>HelpReach Project</h4><p>A social platform designed to help people connect with support services such as emergency help and donations.</p><small>Tech: Web technologies, Backend integration</small></div></div>', pos: config.cameraPath[4].look },
        { title: 'ACADEMIC FLOATING ISLE', content: '<strong>Zeal Polytechnic, Pune</strong><br>Diploma in Computer Engineering<br><br><strong>Focus Areas:</strong><br>• Programming and Development<br>• Java, Full Stack Development, Android<br><br><strong>Achievements:</strong><br>• Active participation in hackathons<br>• Technical presentations<br>• Hands-on project development', pos: config.cameraPath[5].look },
        { title: 'CRYSTAL GALLERY', content: '<div class="cert-grid"><div class="cert-card"><h4>Technical Workshops</h4><p>Attended various technical workshops on advanced programming and development practices.</p></div><div class="cert-card"><h4>Hackathon Participation</h4><p>Participated in multiple hackathons, showcasing problem-solving skills and teamwork.</p></div><div class="cert-card"><h4>Development Projects</h4><p>Completed numerous development projects demonstrating proficiency in Java Full Stack technologies.</p></div><div class="cert-card"><h4>Java Full Stack Learning</h4><p>Continuous learning and progress in Java Full Stack Development, including frameworks and best practices.</p></div></div>', pos: config.cameraPath[6].look },
        { title: 'THE HEART PORTAL', content: '<div class="final-message"><div class="special-greeting"><h1>✨ THANK YOU FOR VISITING ✨</h1><p class="greeting-text">Your journey through my coding universe has come to an end...</p><p class="greeting-text">But the adventure continues!</p></div><h3>Prachi Suhas Pawar</h3><p>Future Software Engineer</p><div class="contact-info"><div class="contact-item"><span class="icon">📧</span><span>Email: prachipawar5133@gmail.com</span></div><div class="contact-item"><span class="icon">🐙</span><span>GitHub: prachi-pawar</span></div><div class="contact-item"><span class="icon">💼</span><span>LinkedIn: /in/prachipawar</span></div></div><button id="restart-journey-btn" class="btn-restart">Restart Journey</button><div class="auto-restart"><p>Returning to the beginning...</p><div class="loading-bar"><div class="loading-progress"></div></div></div></div>', pos: config.cameraPath[7].look }
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
            const isLookingAt = dist < 700;
            const isCurrent = (i === activeZone);
            
            if (isCurrent && isLookingAt) {
                // Position the HUD item in front of the camera, slightly offset towards the target
                const direction = item.pos.clone().sub(camera.position).normalize();
                const offsetPos = camera.position.clone().add(direction.multiplyScalar(80));
                const vector = offsetPos.project(camera);
                
                item.element.style.left = `${(vector.x * 0.5 + 0.5) * window.innerWidth}px`;
                item.element.style.top = `${(-(vector.y * 0.5) + 0.5) * window.innerHeight}px`;
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
        academicSymbols.rotation.y += 0.005;
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
         const zoneGroups = [null, techPlanet, techPlanet, techPlanet, city, academicSymbols, crystals, contactIcons];
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
         [city, academicSymbols, crystals, contactIcons, techPlanet].forEach(group => {
             group.traverse(child => {
                 if (child.type === 'Sprite') {
                     child.lookAt(camera.position);
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
