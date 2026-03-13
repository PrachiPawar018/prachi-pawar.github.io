document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    // --- Configuration ---
    const config = {
        scrollLength: 12000,
        scenesCount: 8,
        // Specific user-requested coordinates
        sceneCoordinates: [
            { pos: new THREE.Vector3(0, 0, 0), look: new THREE.Vector3(0, 0, -10) },     // Intro
            { pos: new THREE.Vector3(10, 2, -10), look: new THREE.Vector3(15, 0, -15) },  // About
            { pos: new THREE.Vector3(20, 4, -20), look: new THREE.Vector3(25, 4, -25) },  // Skills
            { pos: new THREE.Vector3(30, 8, -30), look: new THREE.Vector3(30, 0, -35) },  // Experience
            { pos: new THREE.Vector3(45, 10, -40), look: new THREE.Vector3(50, 10, -45) }, // Projects
            { pos: new THREE.Vector3(60, 12, -50), look: new THREE.Vector3(60, 5, -55) }, // Education
            { pos: new THREE.Vector3(75, 14, -60), look: new THREE.Vector3(80, 14, -65) }, // Certs
            { pos: new THREE.Vector3(95, 18, -75), look: new THREE.Vector3(110, 18, -100) } // Contact
        ]
    };

    // --- Three.js Setup ---
    const container = document.getElementById('three-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.01);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    container.appendChild(renderer.domElement);

    // --- Post-Processing (Neon Bloom) ---
    const renderScene = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, // strength
        0.4, // radius
        0.85 // threshold
    );

    const composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xa855f7, 2, 100);
    mainLight.position.set(0, 10, 0);
    scene.add(mainLight);

    // --- Background: Digital Universe & City Skyline ---
    function createBackground() {
        // Particles (Digital Grid)
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 2000; i++) {
            vertices.push(THREE.MathUtils.randFloatSpread(500), THREE.MathUtils.randFloatSpread(500), THREE.MathUtils.randFloatSpread(1000));
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ size: 0.7, color: 0x3b82f6, transparent: true, opacity: 0.5 });
        const stars = new THREE.Points(geometry, material);
        scene.add(stars);

        // Code City Skyline (Simplified logic buildings)
        const cityGroup = new THREE.Group();
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        for (let i = 0; i < 50; i++) {
            const h = Math.random() * 40 + 10;
            const building = new THREE.Mesh(
                boxGeo,
                new THREE.MeshStandardMaterial({ color: 0x020617, emissive: 0xa855f7, emissiveIntensity: 0.05, wireframe: true })
            );
            building.scale.set(5, h, 5);
            building.position.set(THREE.MathUtils.randFloatSpread(400), h / 2 - 50, THREE.MathUtils.randFloatSpread(800));
            cityGroup.add(building);
        }
        scene.add(cityGroup);
        return { stars, cityGroup };
    }
    const bgWorld = createBackground();

    // --- Camera Curve Path ---
    const curve = new THREE.CatmullRomCurve3(config.sceneCoordinates.map(c => c.pos));
    const lookCurve = new THREE.CatmullRomCurve3(config.sceneCoordinates.map(c => c.look));

    // --- Assets Generators ---
    const createGlassPanel = (pos, color = 0x06b6d4) => {
        const group = new THREE.Group();
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 5),
            new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
        );
        group.add(plane);
        const edges = new THREE.EdgesGeometry(plane.geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: color }));
        group.add(line);
        group.position.copy(pos);
        scene.add(group);
        return group;
    };

    // --- Zone Implementation ---
    // Zone 1: Floating code snippets
    const codeSnippets = [];
    for(let i=0; i<15; i++) {
        const snippet = createGlassPanel(new THREE.Vector3(Math.random()*20-10, Math.random()*10-5, Math.random()*-20), 0xa855f7);
        snippet.scale.set(0.2, 0.2, 0.2);
        codeSnippets.push(snippet);
    }

    // Zone 2: About Hub
    const aboutPanel = createGlassPanel(new THREE.Vector3(15, 0, -15), 0x3b82f6);
    aboutPanel.rotation.y = -Math.PI / 4;

    // Zone 3: Skills Planet
    const skillsGroup = new THREE.Group();
    skillsGroup.position.set(25, 4, -25);
    const coreSphere = new THREE.Mesh(
        new THREE.SphereGeometry(2, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, wireframe: true, emissive: 0x06b6d4, emissiveIntensity: 1 })
    );
    skillsGroup.add(coreSphere);
    
    const skills = ['JAVA', 'PYTHON', 'ANDROID', 'WEB', 'C++', 'SQL', 'DSA', 'CLOUD'];
    const orbitalIcons = [];
    skills.forEach((skill, i) => {
        const icon = createGlassPanel(new THREE.Vector3(0,0,0), 0x06b6d4);
        icon.scale.set(0.15, 0.1, 0.1);
        const angle = (i / skills.length) * Math.PI * 2;
        icon.position.set(Math.cos(angle) * 5, Math.sin(angle) * 5, 0);
        skillsGroup.add(icon);
        orbitalIcons.push(icon);
    });
    scene.add(skillsGroup);

    // Zone 4: Experience Tower
    const towerGeo = new THREE.CylinderGeometry(2, 3, 40, 6, 1, true);
    const tower = new THREE.Mesh(towerGeo, new THREE.MeshStandardMaterial({ color: 0xa855f7, wireframe: true, emissive: 0xa855f7, emissiveIntensity: 0.5 }));
    tower.position.set(30, 0, -35);
    scene.add(tower);

    // Zone 5: Projects Lab
    const labs = [
        createGlassPanel(new THREE.Vector3(50, 10, -45), 0x06b6d4),
        createGlassPanel(new THREE.Vector3(55, 12, -50), 0x3b82f6),
        createGlassPanel(new THREE.Vector3(60, 8, -40), 0xa855f7)
    ];

    // Zone 8: Contact Portal
    const portalGeo = new THREE.TorusGeometry(8, 0.5, 16, 100);
    const portal = new THREE.Mesh(portalGeo, new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 5 }));
    portal.position.set(110, 18, -100);
    portal.lookAt(config.sceneCoordinates[7].pos);
    scene.add(portal);

    // --- HUD System ---
    const hudItems = [];
    function setupHUD() {
        const itemsData = [
            { id: 'intro-hud', content: `<h1>PRACHI SUHAS PAWAR</h1><p class="typing-effect" id="hero-typing"></p>`, pos: config.sceneCoordinates[0].look },
            { id: 'about-hud', content: `<h3>ABOUT_PRACHI</h3><p>Prachi is a Computer Engineering student specializing in Web & Android. Internship at Mass Technologies gained her real software workflow experience. Passionate about solving real-world problems with code.</p>`, pos: new THREE.Vector3(15, 0, -15) },
            { id: 'skills-hud', content: `<h3>TECH_ARSENAL</h3><p>Java, C++, Python, MySQL, Android Studio, DSA, DBMS, Cloud Computing, Web Dev (HTML/CSS/JS).</p>`, pos: new THREE.Vector3(25, 4, -25) },
            { id: 'exp-hud', content: `<h3>INTERN_LOG</h3><p><strong>Mass Technologies</strong> (Jun-Sep 2025)<br>Developed responsive web applications and contributed to real software deployment workflows.</p>`, pos: new THREE.Vector3(30, 8, -35) },
            { id: 'projects-hud', content: `<h3>LAB_PROJECTS</h3><p><strong>HelpReach</strong>: Food redistribution platform.<br><strong>SmartMart</strong>: Android QR billing app.<br><strong>MindGuardian</strong>: Mental wellness tracker.</p>`, pos: new THREE.Vector3(50, 10, -45) },
            { id: 'edu-hud', content: `<h3>ACADEMIC_BADGE</h3><p>D.D.P Highschool Sarole<br>SSC: 92% (Maharashtra State Board)</p>`, pos: new THREE.Vector3(60, 12, -55) },
            { id: 'certs-hud', content: `<h3>VERIFIED</h3><p>AI Tools Workshop - Be10x<br>Project Management Certification</p>`, pos: new THREE.Vector3(80, 14, -65) },
            { id: 'contact-hud', content: `<h3>COLLABORATE</h3><p>Pune, India<br>prachipawar5133@gmail.com</p><div style="margin-top:15px;"><button class="btn btn-neon">LINKEDIN</button></div>`, pos: new THREE.Vector3(100, 18, -90) }
        ];

        itemsData.forEach(data => {
            const div = document.createElement('div');
            div.id = data.id;
            div.className = 'hud-item glass-card';
            div.innerHTML = data.content;
            if(data.id === 'intro-hud') div.className = 'hud-item hero-hud';
            document.getElementById('hud-overlay').appendChild(div);
            hudItems.push({ element: div, pos: data.pos });
        });
    }
    setupHUD();

    // --- Animation & Scroll Logic ---
    let scrollProgress = 0;
    const hudLinks = document.querySelectorAll('#hud-menu li');

    function updateScene() {
        const t = scrollProgress;
        const pos = curve.getPoint(t);
        const look = lookCurve.getPoint(t);
        
        camera.position.lerp(pos, 0.1);
        camera.lookAt(look);

        // Update Active HUD Link
        const activeZone = Math.min(Math.floor(t * 8), 7);
        hudLinks.forEach((link, idx) => {
            link.classList.toggle('active', idx === activeZone);
        });

        // HTML HUD Repositioning
        const widthHalf = window.innerWidth / 2;
        const heightHalf = window.innerHeight / 2;
        
        hudItems.forEach(item => {
            const vector = item.pos.clone();
            vector.project(camera);
            
            if (vector.z > 1) {
                item.element.classList.remove('active');
            } else {
                const x = (vector.x * widthHalf) + widthHalf;
                const y = -(vector.y * heightHalf) + heightHalf;
                item.element.style.left = `${x}px`;
                item.element.style.top = `${y}px`;

                const dist = camera.position.distanceTo(item.pos);
                if (dist < 15 && dist > 1) {
                    item.element.classList.add('active');
                } else {
                    item.element.classList.remove('active');
                }
            }
        });
    }

    function animate() {
        requestAnimationFrame(animate);
        
        updateScene();

        // Object Animations
        bgWorld.stars.rotation.y += 0.0002;
        bgWorld.cityGroup.rotation.y += 0.0001;
        
        coreSphere.rotation.y += 0.01;
        orbitalIcons.forEach((icon, i) => {
            const time = Date.now() * 0.001;
            icon.rotation.y += 0.02;
            icon.position.y += Math.sin(time + i) * 0.005;
        });

        tower.rotation.y += 0.005;
        portal.rotation.z += 0.01;

        composer.render();
    }

    // --- Interaction ---
    ScrollTrigger.create({
        trigger: "#scroll-track",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
        onUpdate: (self) => {
            scrollProgress = self.progress;
        }
    });

    hudLinks.forEach(link => {
        link.addEventListener('click', () => {
            const zone = parseInt(link.dataset.zone);
            const targetPos = (zone / 7) * (document.body.scrollHeight - window.innerHeight);
            window.scrollTo({ top: targetPos, behavior: 'smooth' });
        });
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    // Initial Fade In
    gsap.delayedCall(1, () => {
        gsap.to("#hero-typing", { text: "Computer Engineering Student | Aspiring Software Developer", duration: 3, ease: "none" });
    });

    animate();
});
