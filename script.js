document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.page-section');

    // Toggle menu state
    const toggleMenu = () => {
        const isExpanded = sidebar.classList.contains('expanded');

        if (isExpanded) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    const openMenu = () => {
        sidebar.classList.add('expanded');
        overlay.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
    };

    const closeMenu = () => {
        sidebar.classList.remove('expanded');
        overlay.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');

        // Optional: close all submenus when sidebar closes
        document.querySelectorAll('.has-submenu').forEach(item => {
            item.classList.remove('open');
            const submenu = item.querySelector('.submenu');
            if (submenu) submenu.style.maxHeight = null;
        });
    };

    // Event listeners for opening/closing main menu
    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    // Hover logic for desktop (screen width > 1200px)
    sidebar.addEventListener('mouseenter', () => {
        if (window.innerWidth > 1200) {
            openMenu();
        }
    });

    sidebar.addEventListener('mouseleave', () => {
        if (window.innerWidth > 1200) {
            closeMenu();
        }
    });

    // Submenu Toggle Logic
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();

            // If the sidebar is closed, open it first when trying to interact with submenu
            if (!sidebar.classList.contains('expanded')) {
                openMenu();
                // Wait for the animation to finish before calculating height
                setTimeout(() => {
                    toggleSubmenu(toggle);
                }, 300);
            } else {
                toggleSubmenu(toggle);
            }
        });
    });

    const toggleSubmenu = (toggle) => {
        const parentLi = toggle.parentElement;
        const submenu = parentLi.querySelector('.submenu');
        const isOpen = parentLi.classList.contains('open');

        // Close all other open submenus (Accordion effect)
        document.querySelectorAll('.has-submenu.open').forEach(openItem => {
            if (openItem !== parentLi) {
                openItem.classList.remove('open');
                const otherSubmenu = openItem.querySelector('.submenu');
                if (otherSubmenu) otherSubmenu.style.maxHeight = null;
            }
        });

        // Toggle the clicked submenu
        if (isOpen) {
            parentLi.classList.remove('open');
            if (submenu) submenu.style.maxHeight = null;
        } else {
            parentLi.classList.add('open');
            if (submenu) submenu.style.maxHeight = submenu.scrollHeight + "px";
        }
    };

    // Page Navigation Logic
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');
            if (!targetId) return;

            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');

            // Hide all sections
            pageSections.forEach(section => section.classList.remove('active'));

            // Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Close menu if desired (or specifically on mobile)
            if (window.innerWidth <= 768) {
                closeMenu();
            }
        });
    });

    // Close menu on ESC key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (lightbox.classList.contains('active')) {
                closeLightbox();
            } else if (sidebar.classList.contains('expanded')) {
                closeMenu();
            }
        }
    });

    // ===== Lightbox =====
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightbox-content');

    const openLightbox = () => {
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        // Clean up iframe after transition to stop playback
        setTimeout(() => {
            if (!lightbox.classList.contains('active')) {
                lightboxContent.innerHTML = '';
            }
        }, 500);
    };

    // Click on backdrop → close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Prevent clicks on the content area from closing
    lightboxContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Images: click to open in lightbox
    document.querySelectorAll('.img-wrapper img').forEach(img => {
        img.addEventListener('click', () => {
            const clone = document.createElement('img');
            clone.src = img.src;
            clone.alt = img.alt;
            lightboxContent.innerHTML = '';
            lightboxContent.appendChild(clone);
            openLightbox();
        });
    });

    // Videos: click wrapper to open enlarged iframe in lightbox
    document.querySelectorAll('.video-wrapper').forEach(wrapper => {
        const iframe = wrapper.querySelector('iframe');
        if (!iframe) return;

        // Add a transparent click-catcher over the iframe
        const clickCatcher = document.createElement('div');
        clickCatcher.style.cssText = 'position:absolute;inset:0;z-index:1;cursor:pointer;';
        wrapper.appendChild(clickCatcher);

        clickCatcher.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const src = iframe.src;
            const isLong = wrapper.classList.contains('video-wrapper-long');

            // Determine dimensions
            const vw = window.innerWidth * 0.85;
            const vh = window.innerHeight * 0.85;
            let width, height;

            if (isLong) {
                // 16:9
                width = Math.min(vw, vh * (16 / 9));
                height = width * (9 / 16);
            } else {
                // 9:16
                height = Math.min(vh, vw * (16 / 9));
                width = height * (9 / 16);
            }

            const newIframe = document.createElement('iframe');
            newIframe.src = src + (src.includes('?') ? '&' : '?') + 'autoplay=1';
            newIframe.setAttribute('frameborder', '0');
            newIframe.setAttribute('allowfullscreen', '');
            newIframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            newIframe.style.width = Math.round(width) + 'px';
            newIframe.style.height = Math.round(height) + 'px';

            lightboxContent.innerHTML = '';
            lightboxContent.appendChild(newIframe);
            openLightbox();
        });
    });
    // ===== About panel: dynamic top fade on scroll =====
    const aboutPanel = document.querySelector('.about-panel');
    if (aboutPanel) {
        aboutPanel.addEventListener('scroll', () => {
            const scrollTop = aboutPanel.scrollTop;
            // Fade in the top mask over the first 80px of scroll
            const fadePercent = Math.min(scrollTop / 80, 1) * 15;
            aboutPanel.style.setProperty('--mask-top', fadePercent + '%');
        });
    }
});
