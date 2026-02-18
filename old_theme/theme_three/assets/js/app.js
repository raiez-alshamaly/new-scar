/*! ------------------------------------------------
 * Scarlet Royal - Modern Landing Page Logic
 * ------------------------------------------------ */

gsap.registerPlugin(ScrollTrigger);

// --------------------------------------------- //
// Loader & Loading Animation Start
// --------------------------------------------- //

// Ensure elements exist
const loader = document.getElementById("loader");
const counter = document.getElementById("loader-counter");
const status = document.getElementById("loader-status");
const paths = document.querySelectorAll(".loader-path");

const statusMessages = [
  "Initializing experience",
  "Loading brand assets",
  "Preparing magic",
  "Almost ready",
  "Welcome aboard",
];

// Check for imagesLoaded dependency
const content = document.querySelector('body');
let imgLoad;
if (typeof imagesLoaded !== 'undefined') {
  imgLoad = imagesLoaded(content);
}

let loaderDone = false;

function hideLoader() {
  if (loaderDone) return;
  loaderDone = true;

  if (loader) {
    loader.style.pointerEvents = "none";
    gsap.to(loader, { opacity: 0, duration: 0.6, ease: "power2.inOut", onComplete: () => loader.remove() });
  }

  // Trigger Hero Reveal defined in index.html
  if (window.revealHero) {
    window.revealHero();
  }
}

function initLoaderAnimation() {
  document.body.style.overflow = "hidden";

  // Progress & Counter Animation
  const prog = { v: 0 };
  gsap.to(prog, {
    v: 100,
    duration: 5.5,
    ease: "power2.inOut",
    onUpdate: () => {
      const v = Math.round(prog.v);
      const progressFraction = prog.v / 100;

      if (counter) counter.textContent = v;
      if (status) status.textContent = statusMessages[Math.min(Math.floor(v / 25), statusMessages.length - 1)];

      // Sync SVG Stroke and Fill
      paths.forEach((p) => {
        try {
          // Default to 1000 if dasharray not set (css handles it usually)
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

// Start Loader
initLoaderAnimation();

// --------------------------------------------- //
// Global Utils
// --------------------------------------------- //

// Prevent Image Dragging
document.querySelectorAll("img, a").forEach(el => {
  el.addEventListener("dragstart", e => e.preventDefault());
});

// Staggered Team Card Animation
const teamCards = document.querySelectorAll(".team-card");
if (teamCards && teamCards.length > 0) {
  gsap.set(teamCards, { y: 50, opacity: 0 });
  ScrollTrigger.batch(teamCards, {
    interval: 0.1,
    batchMax: 4,
    onEnter: batch => gsap.to(batch, {
      opacity: 1,
      y: 0,
      stagger: 0.15,
      overwrite: true,
      ease: "power2.out",
      duration: 0.8
    }),
  });
}

// Refresh ScrollTrigger on Load
window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});
