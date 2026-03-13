document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    // --- Loading Screen ---
    const tlLoader = gsap.timeline();
    tlLoader.to(".progress-bar", {
        width: "100%",
        duration: 2.5,
        ease: "power2.inOut"
    })
    .to(".loading-screen", {
        y: "-100%",
        duration: 1,
        ease: "power4.inOut",
        onComplete: () => {
            document.body.style.overflow = "auto";
            startHeroAnimations();
        }
    });

    // --- Background Canvas ---
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = Math.random() > 0.5 ? '#a855f7' : '#3b82f6';
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    // --- Hero Animations ---
    function startHeroAnimations() {
        const tlHero = gsap.timeline();

        tlHero.from(".hello", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        })
        .from("#hero-name", {
            scale: 0.9,
            opacity: 0,
            duration: 1.2,
            ease: "expo.out"
        }, "-=0.4")
        .from(".hero-tagline", {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.6")
        .to("#typing-text", {
            duration: 3,
            text: "Building web applications, Android apps, and solving real-world problems through technology.",
            ease: "none"
        })
        .from(".btn", {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.2,
            ease: "back.out(1.7)"
        }, "-=0.5")
        .from(".scroll-indicator", {
            opacity: 0,
            y: -20,
            duration: 1,
            repeat: -1,
            yoyo: true
        });
    }

    // --- Hover Sound Effects (Mock) ---
    const buttons = document.querySelectorAll('.btn, .nav-item');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            // Play subtle tick sound if needed
            // const audio = new Audio('tick.mp3');
            // audio.volume = 0.1;
            // audio.play().catch(() => {});
        });
    });

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
    });

    // --- Scroll Transitions / Reveals ---
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                onEnter: () => el.classList.add('active')
            }
        });
    });

    // Timeline Animation
    gsap.from(".timeline-dot", {
        scrollTrigger: {
            trigger: ".timeline",
            start: "top 70%",
        },
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.3
    });

    gsap.from(".timeline-content", {
        scrollTrigger: {
            trigger: ".timeline",
            start: "top 70%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.3,
        ease: "power3.out"
    });

    // Skills Animation
    const skillBars = document.querySelectorAll('.skill-bar');
    skillBars.forEach(bar => {
        gsap.to(bar, {
            scrollTrigger: {
                trigger: bar,
                start: "top 90%",
            },
            width: bar.getAttribute('data-width'),
            duration: 1.5,
            ease: "power2.out"
        });
    });
});
