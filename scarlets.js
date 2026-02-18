
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
if (header) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("bg-black/80", "backdrop-blur-md", "shadow-lg");
            header.classList.remove("mix-blend-difference");
        } else {
            header.classList.remove("bg-black/80", "backdrop-blur-md", "shadow-lg");
            header.classList.add("mix-blend-difference");
        }
    });
}

// Initialize
window.addEventListener("load", initLoader);

// --------------------------------------------- //
// Tool Modals & Logic
// --------------------------------------------- //

const modalContainer = document.getElementById("modal-container");
const modals = document.querySelectorAll(".modal-content");

function openModal(modalId) {
    // Hide all modals first
    modals.forEach(m => m.classList.add("hidden"));

    // Show container and specific modal
    const targetModal = document.getElementById("modal-" + modalId);
    if (targetModal) {
        modalContainer.classList.remove("hidden");
        targetModal.classList.remove("hidden");
        document.body.style.overflow = "hidden"; // Prevent background scrolling

        // GSAP Animation for entrance
        gsap.fromTo(targetModal,
            { scale: 0.9, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
    }
}

function closeModal() {
    modalContainer.classList.add("hidden");
    modals.forEach(m => m.classList.add("hidden"));
    document.body.style.overflow = "";
}

// Close on Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
});

// --------------------------------------------- //
// Maps Scraper Logic
// --------------------------------------------- //

// Global AbortControllers
let mapsController = null;
let seoController = null;
let ideaController = null;

function cancelOperation(type) {
    if (type === 'maps' && mapsController) {
        mapsController.abort();
        mapsController = null;
        document.getElementById("maps-loading").classList.add("hidden");
        document.getElementById("maps-btn").disabled = false;
        console.log('Maps operation cancelled by user');
    }
    if (type === 'seo' && seoController) {
        seoController.abort();
        seoController = null;
        document.getElementById("seo-loading").classList.add("hidden");
        document.getElementById("seo-btn").disabled = false;
        console.log('SEO operation cancelled by user');
    }
    if (type === 'idea' && ideaController) {
        ideaController.abort();
        ideaController = null;
        document.getElementById("idea-loading").classList.add("hidden");
        document.getElementById("idea-btn").disabled = false;
        console.log('Idea operation cancelled by user');
    }
}



async function runMapsScraper() {
    const q = document.getElementById("maps-q").value;
    const l = document.getElementById("maps-l").value;
    const n = parseInt(document.getElementById("maps-n").value) || 10;
    const btn = document.getElementById("maps-btn");
    const resultsContainer = document.getElementById("maps-results");
    const grid = document.getElementById("maps-results-grid");
    const loadingOverlay = document.getElementById("maps-loading");

    if (!q || !l) {
        alert("Please enter both a Keyword and a Location.");
        return;
    }

    // Reset Controller
    if (mapsController) mapsController.abort();
    mapsController = new AbortController();

    // Loading State
    loadingOverlay.classList.remove("hidden");
    btn.disabled = true;
    resultsContainer.classList.add("hidden");
    grid.innerHTML = "";

    try {
        const response = await fetch("https://prebronchial-rhythmlessly-regina.ngrok-free.dev/webhook/ScMAPS_SCRAPER", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q, l, n }),
            signal: mapsController.signal
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        let data = await response.json();

        // Handle n8n wrapping: sometimes it returns [ { body: ... } ] or [ { json: ... } ]
        if (Array.isArray(data) && data.length > 0 && (data[0].body || data[0].json)) {
            // Try to extract if it's wrapped
            if (Array.isArray(data[0].body)) data = data[0].body;
            else if (Array.isArray(data[0].json)) data = data[0].json;
        }

        // Render Results
        if (Array.isArray(data) && data.length > 0) {
            resultsContainer.classList.remove("hidden");

            // Limit results to N
            const limitedData = data.slice(0, n);

            limitedData.forEach((item, index) => {
                const card = document.createElement("div");
                card.className = "bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-colors flex flex-col h-full pdf-card break-inside-avoid page-break-inside-avoid"; // Optimized for PDF

                // Map URL
                const mapUrl = (item.lat && item.lng)
                    ? `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`
                    : (item.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}` : '#');

                card.innerHTML = `
                    <div class="h-48 bg-gray-800 relative group overflow-hidden">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">` :
                        '<div class="w-full h-full flex items-center justify-center text-white/20 bg-black/20"><iconify-icon icon="solar:gallery-wide-bold" width="48"></iconify-icon></div>'}
                        
                        <div class="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-yellow-400 flex items-center gap-1 shadow-lg">
                            <iconify-icon icon="solar:star-bold" width="12"></iconify-icon> ${item.rating || 'N/A'}
                        </div>

                        <div class="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent">
                             <span class="text-xs font-bold uppercase tracking-widest text-[#7600FF]">${item.category || 'Business'}</span>
                        </div>
                    </div>

                    <div class="p-5 flex flex-col flex-1 gap-4">
                        <div>
                            <h5 class="font-bold text-xl text-white mb-2 leading-tight">${item.name}</h5>
                            
                            ${item.address ? `
                            <div class="flex items-start gap-2 text-xs text-white/60">
                                <iconify-icon icon="solar:map-point-linear" class="min-w-[14px] mt-0.5 text-[#7600FF]"></iconify-icon>
                                <span class="line-clamp-2">${item.address}</span>
                            </div>` : ''}
                        </div>

                        <div class="mt-auto grid grid-cols-2 gap-2">
                             ${item.phone ? `
                            <a href="tel:${item.phone}" class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white transition-colors">
                                <iconify-icon icon="solar:phone-calling-linear" class="text-[#7600FF]"></iconify-icon>
                                Call
                            </a>` : ''}
                            
                            <a href="${mapUrl}" target="_blank" class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white transition-colors">
                                <iconify-icon icon="solar:map-arrow-right-bold" class="text-[#7600FF]"></iconify-icon>
                                Map
                            </a>

                            ${item.website ? `
                            <a href="${item.website}" target="_blank" class="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#7600FF]/10 hover:bg-[#7600FF]/20 border border-[#7600FF]/20 text-xs text-[#7600FF] font-bold transition-colors">
                                <iconify-icon icon="solar:link-circle-bold"></iconify-icon>
                                Visit Website
                            </a>` : ''}
                        </div>
                    </div>
                `;
                grid.appendChild(card);

                // Stagger Animation
                gsap.fromTo(card,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.4, delay: index * 0.05 }
                );
            });

            // Scroll to results
            resultsContainer.scrollIntoView({ behavior: "smooth", block: "start" });

        } else {
            alert("No results found. Please try a different location or keyword.");
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log("Request aborted");
        } else {
            console.error("Maps Scraper Error:", error);
            alert("An error occurred while displaying results.");
        }
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add("hidden");
        btn.disabled = false;
        mapsController = null;
    }
}

// --------------------------------------------- //
// SEO AI Logic
// --------------------------------------------- //

async function runSeoAnalysis() {
    const text = document.getElementById("seo-text").value;
    const btn = document.getElementById("seo-btn");
    const resultsContainer = document.getElementById("seo-results");
    const loadingOverlay = document.getElementById("seo-loading");

    if (!text) {
        alert("Please enter some content to analyze.");
        return;
    }

    // Reset Controller
    if (seoController) seoController.abort();
    seoController = new AbortController();

    // Loading State
    loadingOverlay.classList.remove("hidden");
    btn.disabled = true;
    resultsContainer.classList.add("hidden");

    try {
        const response = await fetch("https://prebronchial-rhythmlessly-regina.ngrok-free.dev/webhook/SEO_EnSCar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
            signal: seoController.signal
        });

        if (!response.ok) throw new Error("Failed to fetch analysis");

        const dataArray = await response.json();
        const data = dataArray[0];

        if (data) {
            resultsContainer.classList.remove("hidden");

            // 1. Overview & Stats
            const score = data.seo_analysis?.readability_score || 0;
            animateValue("seo-score", 0, score, 1500);

            document.getElementById("seo-h2-count").textContent = data.stats?.h2_count || 0;
            document.getElementById("seo-h3-count").textContent = data.stats?.h3_count || 0;
            document.getElementById("seo-kw-count").textContent = data.seo_analysis?.keyword_focus?.length || 0;


            // 2. Feedback Summary
            document.getElementById("seo-summary").textContent = data.seo_analysis?.improvement_summary || "No specific feedback provided.";

            // 3. Keywords
            const kwContainer = document.getElementById("seo-keywords");
            kwContainer.innerHTML = "";
            if (data.seo_analysis?.keyword_focus) {
                data.seo_analysis.keyword_focus.forEach(kw => {
                    const span = document.createElement("span");
                    span.className = "bg-white/5 text-xs font-bold text-white px-3 py-1.5 rounded-lg border border-white/5";
                    span.textContent = "# " + kw;
                    kwContainer.appendChild(span);
                });
            }

            // 4. Meta Preview
            document.getElementById("seo-meta-title").textContent = data.meta?.meta_title || "-";
            document.getElementById("seo-meta-desc").textContent = data.meta?.meta_description || "-";

            // 5. Structure Tree
            const structureContainer = document.getElementById("seo-structure");
            structureContainer.innerHTML = "";

            if (data.headings_flat && data.headings_flat.length > 0) {
                // Visualize as a simple tree
                data.headings_flat.forEach((h, i) => {
                    const row = document.createElement("div");
                    const isMain = h.level === 'h1';

                    row.className = `flex items-center gap-3 py-1 ${isMain ? 'mb-2' : ''}`;

                    // Create tree lines
                    let indentHTML = '';
                    if (h.level === 'h2') indentHTML = `<span class="text-white/10">├─</span>`;
                    if (h.level === 'h3') indentHTML = `<span class="text-white/10 ml-4">└─</span>`;

                    row.innerHTML = `
                        <div class="flex items-center font-mono text-white/40 select-none min-w-[50px]">
                            ${indentHTML} <span class="bg-[#1a1a1a] text-[9px] px-1 rounded ml-1 text-[#7600FF] border border-[#7600FF]/20">${h.level.toUpperCase()}</span>
                        </div>
                        <span class="${isMain ? 'text-white font-bold text-sm' : 'text-white/80 text-xs'} truncate" title="${h.text}">${h.text}</span>
                    `;
                    structureContainer.appendChild(row);
                });
            } else {
                structureContainer.innerHTML = "<div class='text-white/30 italic text-center py-4'>No headings detected in the text.</div>";
            }

            // Scroll to results
            setTimeout(() => {
                resultsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 500);
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log("SEO request aborted");
        } else {
            console.error(error);
            alert("An error occurred during analysis.");
        }
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add("hidden");
        btn.disabled = false;
        seoController = null;
    }
}

// --------------------------------------------- //
// Idea 2 Funnel Logic
// --------------------------------------------- //

async function runIdea2Funnel() {
    const text = document.getElementById("idea-text").value;
    const industry = document.getElementById("idea-industry").value || "General";
    const market = document.getElementById("idea-market").value || "Global";
    const budget = document.getElementById("idea-budget").value;
    const goal = document.getElementById("idea-goal").value;

    const btn = document.getElementById("idea-btn");
    const resultsContainer = document.getElementById("idea-results");
    const loadingOverlay = document.getElementById("idea-loading");

    if (!text || text.length < 10) {
        alert("Please describe your business idea in at least 10 characters.");
        return;
    }

    // Reset Controller
    if (ideaController) ideaController.abort();
    ideaController = new AbortController();

    // Loading State
    loadingOverlay.classList.remove("hidden");
    btn.disabled = true;
    resultsContainer.classList.add("hidden");

    try {
        const response = await fetch("https://prebronchial-rhythmlessly-regina.ngrok-free.dev/webhook/IDEi2Funnel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: text,
                context: {
                    industry: industry,
                    target_market: market,
                    budget_range: budget,
                    goal: goal
                },
                meta: {
                    source: "Scarlet Royal Website",
                    language: "en"
                }
            }),
            signal: ideaController.signal
        });

        if (!response.ok) throw new Error("Failed to generate blueprint");

        const dataArray = await response.json();
        const data = dataArray[0];

        if (data && data.funnel_blueprint) {
            const bp = data.funnel_blueprint;
            resultsContainer.classList.remove("hidden");

            // 1. Summary
            document.getElementById("idea-core").textContent = bp.project_summary?.core_idea || "N/A";
            document.getElementById("idea-positioning").textContent = bp.project_summary?.positioning_statement || "N/A";

            // Avatar formatted
            const avatar = bp.project_summary?.target_avatar;
            if (avatar) {
                let avatarHTML = `<strong>Demographics:</strong> ${avatar.demographics || 'N/A'}<br><br>`;
                if (avatar.pain_points) avatarHTML += `<strong>Pain Points:</strong><br>• ${avatar.pain_points.join('<br>• ')}<br><br>`;
                if (avatar.desired_outcomes) avatarHTML += `<strong>Desired Outcomes:</strong><br>• ${avatar.desired_outcomes.join('<br>• ')}`;
                document.getElementById("idea-avatar").innerHTML = avatarHTML;
            }

            // 2. Offer
            document.getElementById("idea-offer-main").textContent = bp.offer_engineering?.main_offer || "N/A";
            document.getElementById("idea-offer-price").textContent = bp.offer_engineering?.pricing_strategy || "N/A";
            document.getElementById("idea-offer-risk").textContent = bp.offer_engineering?.risk_reversal || "N/A";

            const stackList = document.getElementById("idea-offer-stack");
            stackList.innerHTML = "";
            if (bp.offer_engineering?.value_stack) {
                bp.offer_engineering.value_stack.forEach(item => {
                    const li = document.createElement("li");
                    li.className = "flex justify-between items-start gap-2 border-b border-white/5 pb-2 last:border-0";
                    li.innerHTML = `<span>${item.component}</span> <span class="text-[#7600FF] font-bold whitespace-nowrap">${item.perceived_value}</span>`;
                    stackList.appendChild(li);
                });
            }

            // 3. Funnel Steps
            const stepsContainer = document.getElementById("idea-funnel-steps");
            stepsContainer.innerHTML = "";
            if (bp.funnel_architecture?.steps) {
                bp.funnel_architecture.steps.forEach((step, i) => {
                    const stepDiv = document.createElement("div");
                    stepDiv.className = "bg-[#161616] border border-white/10 rounded-xl p-4";

                    let elementsHTML = "";
                    if (step.key_elements) {
                        elementsHTML = `<ul class="mt-3 space-y-1 text-xs text-white/50 pl-4 list-disc marker:text-[#7600FF]">
                            ${step.key_elements.map(el => `<li>${el}</li>`).join('')}
                        </ul>`;
                    }

                    stepDiv.innerHTML = `
                        <div class="flex items-center justify-between mb-2">
                            <h5 class="font-bold text-white text-sm flex items-center gap-2">
                                <span class="bg-white/10 text-xs w-6 h-6 rounded flex items-center justify-center text-white/60">${i + 1}</span>
                                ${step.step_name}
                            </h5>
                        </div>
                        <p class="text-xs text-[#7600FF] font-medium mb-2">${step.objective}</p>
                        ${elementsHTML}
                    `;
                    stepsContainer.appendChild(stepDiv);
                });
            }

            // 4. Traffic
            const trafficList = document.getElementById("idea-traffic-channels");
            trafficList.innerHTML = "";
            if (bp.traffic_strategy?.primary_channels) {
                bp.traffic_strategy.primary_channels.forEach(ch => {
                    const li = document.createElement("li");
                    li.className = "text-sm text-white/70 flex items-start gap-2";
                    li.innerHTML = `<iconify-icon icon="solar:check-circle-bold" class="text-[#7600FF] mt-0.5 min-w-[14px]"></iconify-icon> ${ch}`;
                    trafficList.appendChild(li);
                });
            }

            const anglesContainer = document.getElementById("idea-traffic-angles");
            anglesContainer.innerHTML = "";
            if (bp.traffic_strategy?.creative_angles) {
                bp.traffic_strategy.creative_angles.forEach(angle => {
                    const div = document.createElement("div");
                    div.className = "bg-black/20 p-3 rounded-lg border border-white/5";
                    div.innerHTML = `
                        <div class="text-xs font-bold text-white/80 mb-1">${angle.angle}</div>
                        <div class="text-[10px] text-white/50 italic">"${angle.message_core}"</div>
                    `;
                    anglesContainer.appendChild(div);
                });
            }

            // 5. Monetization
            const monetizationText = bp.monetization_model
                ? `<strong>Revenue Type:</strong> ${bp.monetization_model.revenue_type}<br><br><strong>Upsells:</strong><br>${bp.monetization_model.upsells?.join('<br>') || 'N/A'}`
                : "N/A";
            document.getElementById("idea-monetization").innerHTML = monetizationText;

            // Scroll to results
            setTimeout(() => {
                resultsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 500);

        } else {
            alert("Could not generate a valid blueprint from the response.");
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log("Idea request aborted");
        } else {
            console.error(error);
            alert("An error occurred during generation.");
        }
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add("hidden");
        btn.disabled = false;
        ideaController = null;
    }
}

// Helper: Animate Numbers
function animateValue(id, start, end, duration) {
    if (start === end) return;
    const obj = document.getElementById(id);
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));

    const timer = setInterval(function () {
        current += increment;
        obj.innerHTML = current;
        if (current == end) {
            clearInterval(timer);
            // Add color class at the end
            if (current >= 80) obj.className = "text-5xl font-black text-green-400 tracking-tighter";
            else if (current >= 60) obj.className = "text-5xl font-black text-yellow-400 tracking-tighter";
            else obj.className = "text-5xl font-black text-red-500 tracking-tighter";
        }
    }, stepTime);
}

// Helper: Copy Text
function copyText(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        // Simple toast or feedback could go here
        console.log('Copied!');
    });
}

// --------------------------------------------- //
// Mobile Menu Logic
// --------------------------------------------- //

(function () {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        });
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            const btn = document.getElementById('mobile-menu-btn');
            if (btn) {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMobileMenu();
                });
            }
        });
    }
})();

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const header = document.getElementById('main-header');

    if (!mobileMenu || !menuIcon) return;

    const isHidden = mobileMenu.classList.contains('opacity-0');
    if (isHidden) {
        mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
        menuIcon.setAttribute('icon', 'solar:close-circle-bold');
        document.body.style.overflow = 'hidden';
        // Remove mix-blend-difference so header stays clickable over menu overlay
        if (header) header.classList.remove('mix-blend-difference');
    } else {
        mobileMenu.classList.add('opacity-0', 'pointer-events-none');
        menuIcon.setAttribute('icon', 'solar:hamburger-menu-linear');
        document.body.style.overflow = '';
        // Restore mix-blend-difference only when not scrolled
        if (header && window.scrollY <= 50) {
            header.classList.add('mix-blend-difference');
        }
    }
}

