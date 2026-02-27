/**
 * Smooth Page Transitions (SPA-lite) V5 - FIX: Programmatic Modal Injection
 * This version ensures the modal exists even when navigating from pages missing it.
 */

console.log("Transitions JS V5: Loading...");

let isTransitioning = false;

function init() {
    console.log("Initializing Transitions & Modal...");
    injectMotionBlurFilter();
    injectModalStructure(); // Ensure modal exists on all pages
    initPage();
    setupDelegatedListeners();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function injectMotionBlurFilter() {
    if (document.getElementById('vertical-blur-filter')) return;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "vertical-blur-filter";
    svg.setAttribute("style", "position: absolute; width: 0; height: 0; overflow: hidden;");
    svg.innerHTML = `
        <defs>
            <filter id="vertical-blur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="0 50" result="blur" />
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
                <feDisplacementMap in="blur" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
                <feComponentTransfer>
                    <feFuncR type="linear" slope="1.2" />
                    <feFuncG type="linear" slope="1.2" />
                    <feFuncB type="linear" slope="1.2" />
                </feComponentTransfer>
            </filter>
        </defs>
    `;
    document.body.appendChild(svg);
}

function injectModalStructure() {
    if (document.getElementById('design-modal')) {
        console.log("Modal already exists in HTML");
        return;
    }
    const modal = document.createElement('div');
    modal.id = 'design-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <button class="modal-close" aria-label="Fermer">&times;</button>
            <div class="modal-body">
                <div class="modal-left"></div>
                <div class="modal-right">
                    <div id="modal-text" class="modal-description"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    console.log("Modal structure injected programmatically");
}

function initPage() {
    const container = document.querySelector('.container:not(.exiting)');
    if (container) {
        setTimeout(() => { container.classList.add('loaded'); }, 10);
    }
    if (window.initSmoothScroll) window.initSmoothScroll();
    initVideoHovers();
}

function initVideoHovers() {
    document.querySelectorAll('.video-container').forEach(container => {
        if (container.dataset.bound) return;
        const video = container.querySelector('video');
        if (!video) return;
        container.addEventListener('mouseenter', () => video.play().catch(() => { }));
        container.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
        container.dataset.bound = "true";
    });
}

function setupDelegatedListeners() {
    // Single global listener for better performance and reliability
    document.addEventListener('click', e => {
        // 1. Navigation
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            if (!isTransitioning && href && !href.includes('://') && !href.startsWith('#') &&
                !link.getAttribute('target') && !link.hasAttribute('download')) {
                e.preventDefault();
                loadPage(href);
                return;
            }
        }

        // 2. Modal Open
        const trigger = e.target.closest('.gallery-item, .video-container');
        if (trigger && !e.target.closest('a')) {
            handleMediaClick(trigger);
            return;
        }

        // 3. Modal Close (Void Clicking)
        const modal = document.getElementById('design-modal');
        if (modal && modal.classList.contains('active')) {
            const isMedia = e.target.closest('img, video, iframe');
            const isText = e.target.closest('.modal-description');
            const isCloseBtn = e.target.closest('.modal-close');

            // Close if we didn't click on media or text, or if we clicked the close button
            if ((!isMedia && !isText) || isCloseBtn) {
                console.log("Void click detected, closing modal");
                closeModal(modal);
            }
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('design-modal');
            if (modal && modal.classList.contains('active')) closeModal(modal);
        }
    });
}

function handleMediaClick(item) {
    const modal = document.getElementById('design-modal');
    if (!modal) return;

    const modalLeft = modal.querySelector('.modal-left');
    const modalText = document.getElementById('modal-text');
    if (!modalLeft || !modalText) return;

    const description = item.getAttribute('data-description') || "Projet Portfolio";
    const youtubeUrl = item.getAttribute('data-youtube-url');
    const videoElement = item.querySelector('video');
    const imgElement = item.querySelector('img');

    modalLeft.innerHTML = '';

    if (youtubeUrl) {
        const iframe = document.createElement('iframe');
        iframe.src = youtubeUrl + (youtubeUrl.includes('?') ? '&' : '?') + "autoplay=1&rel=0";
        iframe.allow = "autoplay; encrypted-media; fullscreen";
        iframe.allowFullscreen = true;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        modalLeft.appendChild(iframe);
    } else if (videoElement) {
        const video = document.createElement('video');
        video.src = videoElement.querySelector('source') ? videoElement.querySelector('source').src : videoElement.src;
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        modalLeft.appendChild(video);
    } else if (imgElement) {
        const img = document.createElement('img');
        img.src = imgElement.src;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        modalLeft.appendChild(img);
    }

    modalText.innerHTML = description;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.add('closing-up');
    setTimeout(() => {
        modal.classList.remove('active', 'closing-up');
        const modalLeft = modal.querySelector('.modal-left');
        if (modalLeft) modalLeft.innerHTML = '';
        document.body.style.overflow = '';
    }, 500);
}

async function loadPage(url) {
    if (isTransitioning) return;
    isTransitioning = true;
    const oldContainer = document.querySelector('.container.loaded');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("HTTP " + response.status);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContainer = doc.querySelector('.container');

        if (!newContainer) { window.location.href = url; return; }

        newContainer.classList.remove('loaded');
        newContainer.classList.add('entering');
        document.body.appendChild(newContainer);
        window.history.pushState({}, '', url);
        document.title = doc.title;

        if (oldContainer) {
            oldContainer.classList.remove('loaded');
            oldContainer.classList.add('exiting');
        }

        setTimeout(() => {
            newContainer.classList.add('loaded');
            setTimeout(() => {
                if (oldContainer) oldContainer.remove();
                isTransitioning = false;
                initPage();
            }, 650);
        }, 20);
    } catch (err) {
        window.location.href = url;
    }
}

window.addEventListener('popstate', () => window.location.reload());