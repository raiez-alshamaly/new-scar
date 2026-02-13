
/* ------------------------------------------------
 * Scarlet Royal - Services & Tools Page Logic
 * ------------------------------------------------ */

gsap.registerPlugin(ScrollTrigger);

// --------------------------------------------- //
// Loader Logic (Simplified for Scarlets Page)
// --------------------------------------------- //
const loader = document.getElementById("loader");
const counter = document.getElementById("loader-counter");
const status = document.getElementById("loader-status");
const paths = document.querySelectorAll(".loader-path");

const statusMessages = [
    "Initializing tools",
    "Loading services",
    "Connecting to magic",
    "Almost ready",
];

function hideLoader() {
    if (loader) {
        loader.style.pointerEvents = "none";
        gsap.to(loader, { opacity: 0, duration: 0.6, ease: "power2.inOut", onComplete: () => loader.remove() });
    }
    // Reveal Hero Content
    const heroContent = document.querySelector("#hero-content");
    if (heroContent) {
        gsap.to(heroContent, { opacity: 1, duration: 1, ease: "power2.out" });
    }
    animateSections();
}

function initLoader() {
    document.body.style.overflow = "hidden";
    const prog = { v: 0 };

    gsap.to(prog, {
        v: 100,
        duration: 3, // Faster load for tools page
        ease: "power2.inOut",
        onUpdate: () => {
            const v = Math.round(prog.v);
            const progressFraction = prog.v / 100;
            if (counter) counter.textContent = v;
            if (status) status.textContent = statusMessages[Math.min(Math.floor(v / 30), statusMessages.length - 1)];

            paths.forEach((p) => {
                try {
                    const len = 1000;
                    p.style.strokeDashoffset = len * (1 - progressFraction);
                    p.style.fillOpacity = progressFraction;
                } catch (e) { }
            });
        },
        onComplete: () => {
            document.body.style.overflow = "";
            hideLoader();
        }
    });
}

// --------------------------------------------- //
// Animations
// --------------------------------------------- //

function animateSections() {
    // Animate Service Cards
    const cards = document.querySelectorAll(".tool-card");

    gsap.set(cards, { y: 50, opacity: 0 });

    ScrollTrigger.batch(cards, {
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: "power2.out"
        }),
        start: "top 85%"
    });

    // Animate Sections Titles
    const titles = document.querySelectorAll(".section-title");
    titles.forEach(title => {
        gsap.fromTo(title,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: title,
                    start: "top 80%"
                }
            }
        );
    });
}

// Header Scroll Effect
const header = document.getElementById("main-header");
window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        header.classList.add("bg-black/80", "backdrop-blur-md", "shadow-lg");
        header.classList.remove("mix-blend-difference");
    } else {
        header.classList.remove("bg-black/80", "backdrop-blur-md", "shadow-lg");
        header.classList.add("mix-blend-difference");
    }
});

// Initialize
window.addEventListener("load", initLoader);
