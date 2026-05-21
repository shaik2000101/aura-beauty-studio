/* 
 * ==========================================
 * LUXURY MINIMAL BEAUTY PORTFOLIO - JS
 * ==========================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. STICKY NAVBAR & NAVIGATION HIGHLIGHTS
    // ==========================================
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Sticky transition class
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active page indicator highlighting
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 200; // Offset for accuracy

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // ==========================================
    // 2. MOBILE MENU / HAMBURGER OVERLAY
    // ==========================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navMenu.classList.toggle('open');
        });

        // Close menu on clicking any navigation link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });
    }

    // ==========================================
    // 3. SCROLL REVEAL (INTERSECTION OBSERVER)
    // ==========================================
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // ==========================================
    // 4. INTERACTIVE BEFORE/AFTER SLIDER
    // ==========================================
    const baSlider = document.getElementById('ba-slider');
    const baAfterImg = document.getElementById('ba-after-img');
    const baHandle = document.getElementById('ba-handle');

    if (baSlider && baAfterImg && baHandle) {
        let isDragging = false;

        const updateSlider = (clientX) => {
            const rect = baSlider.getBoundingClientRect();
            // Calculate percentage from left margin
            let position = ((clientX - rect.left) / rect.width) * 100;
            
            // Limit bounds to avoid clipping out of view
            if (position < 0) position = 0;
            if (position > 100) position = 100;

            // Apply clip-path and move coordinate line
            baAfterImg.style.clipPath = `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)`;
            baHandle.style.left = `${position}%`;
        };

        // Desktop mouse events
        baSlider.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateSlider(e.clientX);
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updateSlider(e.clientX);
        });

        // Mobile touch events
        baSlider.addEventListener('touchstart', (e) => {
            isDragging = true;
            updateSlider(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            updateSlider(e.touches[0].clientX);
        }, { passive: true });
    }

    // ==========================================
    // 5. FILTERABLE PORTFOLIO GALLERY
    // ==========================================
    const portfolioTabs = document.querySelectorAll('.portfolio-tab');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    // Store active image data for Lightbox compatibility
    let activeGalleryData = [];

    const rebuildActiveGalleryData = () => {
        activeGalleryData = [];
        portfolioItems.forEach(item => {
            if (item.style.display !== 'none') {
                const img = item.querySelector('.portfolio-img');
                const title = item.querySelector('.portfolio-item-title');
                const category = item.querySelector('.portfolio-item-category');
                
                activeGalleryData.push({
                    src: img.getAttribute('src'),
                    title: title ? title.textContent : '',
                    category: category ? category.textContent : '',
                    element: item
                });
            }
        });
    };

    portfolioTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab styling
            portfolioTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    // Smooth scaling on transition
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 400); // Sync with CSS transition delay
                }
            });

            // Rebuild gallery list index after filtering
            setTimeout(rebuildActiveGalleryData, 450);
        });
    });

    // Run once at start to compile item indices
    rebuildActiveGalleryData();

    // ==========================================
    // 6. PORTFOLIO LIGHTBOX PREVIEW MODAL
    // ==========================================
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    let currentImageIndex = 0;

    window.openLightbox = (originalIndex) => {
        // Find matching item based on src
        const clickedItem = portfolioItems[originalIndex];
        const clickedSrc = clickedItem.querySelector('.portfolio-img').getAttribute('src');
        
        // Find index inside currently filtered activeGalleryData list
        currentImageIndex = activeGalleryData.findIndex(item => item.src === clickedSrc);
        if (currentImageIndex === -1) currentImageIndex = 0;

        showLightboxImage();
        
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock scrolling
    };

    const showLightboxImage = () => {
        const item = activeGalleryData[currentImageIndex];
        if (item) {
            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.setAttribute('src', item.src);
                lightboxImg.setAttribute('alt', item.title);
                lightboxCaption.innerHTML = `<span>${item.category}</span> — ${item.title}`;
                lightboxImg.style.opacity = '1';
            }, 150);
        }
    };

    const cycleLightbox = (direction) => {
        currentImageIndex += direction;
        if (currentImageIndex < 0) {
            currentImageIndex = activeGalleryData.length - 1;
        } else if (currentImageIndex >= activeGalleryData.length) {
            currentImageIndex = 0;
        }
        showLightboxImage();
    };

    if (lightboxModal && lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Restore scroll
        });

        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            cycleLightbox(-1);
        });

        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            cycleLightbox(1);
        });

        // Close on clicking backdrop
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                lightboxModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });

        // Keyboard navigation keys
        document.addEventListener('keydown', (e) => {
            if (!lightboxModal.classList.contains('active')) return;
            if (e.key === 'Escape') {
                lightboxModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            } else if (e.key === 'ArrowLeft') {
                cycleLightbox(-1);
            } else if (e.key === 'ArrowRight') {
                cycleLightbox(1);
            }
        });
    }

    // ==========================================
    // 7. AUTO-SLIDING TESTIMONIAL CAROUSEL
    // ==========================================
    const testimonialsWrapper = document.getElementById('testimonials-wrapper');
    const testimonialDots = document.querySelectorAll('.testimonial-dot');
    let currentSlide = 0;
    let slideInterval;

    const showSlide = (index) => {
        testimonialDots.forEach(dot => dot.classList.remove('active'));
        testimonialDots[index].classList.add('active');
        
        testimonialsWrapper.style.transform = `translateX(-${index * 100}%)`;
        currentSlide = index;
    };

    const startSlideTimer = () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            let nextSlide = currentSlide + 1;
            if (nextSlide >= testimonialDots.length) {
                nextSlide = 0;
            }
            showSlide(nextSlide);
        }, 5000); // Rotate every 5 seconds
    };

    testimonialDots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            showSlide(idx);
            startSlideTimer(); // Reset auto-play cycle on manual action
        });
    });

    if (testimonialsWrapper && testimonialDots.length > 0) {
        startSlideTimer();
    }

    // ==========================================
    // 8. FAQ ACCORDION TRANSITIONS
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question-btn');
        const answer = item.querySelector('.faq-answer');

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all open items first for a single-open visual menu
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = '0';
            });

            // Toggle selected item
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = `${answer.scrollHeight}px`; // Expand smoothly using dynamic scroll height
            } else {
                item.classList.remove('active');
                answer.style.maxHeight = '0';
            }
        });
    });

    // ==========================================
    // 9. BOOKING FORM SUBMISSION & WHATSAPP REDIRECT
    // ==========================================
    const bookingForm = document.getElementById('booking-form');
    const formSuccessOverlay = document.getElementById('form-success-overlay');
    const successWaBtn = document.getElementById('success-wa-btn');

    // Make prefillBooking available globally
    window.prefillBooking = (serviceName) => {
        const selectElement = document.getElementById('interested-service');
        const contactSection = document.getElementById('contact');
        
        if (selectElement) {
            // Find and select matching value
            selectElement.value = serviceName;
            
            // Trigger floating label update
            selectElement.dispatchEvent(new Event('change'));
            
            // Scroll smoothly down to contact section
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Extract input values
            const name = document.getElementById('client-name').value.trim();
            const phone = document.getElementById('client-phone').value.trim();
            const service = document.getElementById('interested-service').value;
            const date = document.getElementById('preferred-date').value;
            const customNotes = document.getElementById('booking-message').value.trim();

            // Format date for reader friendliness (e.g. YYYY-MM-DD to DD-MM-YYYY)
            let formattedDate = date;
            try {
                const parsedDate = new Date(date);
                if (!isNaN(parsedDate)) {
                    formattedDate = parsedDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                }
            } catch (err) {
                formattedDate = date;
            }

            // WhatsApp formatting message setup
            const studioPhone = "15550199"; // Studio number
            let messageText = `Hi Aura Beauty Studio! ✨\n\nI'd like to book an appointment with you:\n\n`;
            messageText += `👤 *Name:* ${name}\n`;
            messageText += `📞 *Phone:* ${phone}\n`;
            messageText += `💄 *Service:* ${service}\n`;
            messageText += `📅 *Date:* ${formattedDate}\n`;
            
            if (customNotes) {
                messageText += `✉ *Notes:* ${customNotes}\n`;
            }
            
            messageText += `\nPlease confirm if this date is available. Thank you!`;

            // Construct deep link URL
            const encodedMessage = encodeURIComponent(messageText);
            const waUrl = `https://wa.me/${studioPhone}?text=${encodedMessage}`;

            // Set link to final action button
            successWaBtn.setAttribute('href', waUrl);

            // Display luxurious success screen
            formSuccessOverlay.classList.add('active');

            // Automatically open link in new window/tab after 2.5 seconds
            setTimeout(() => {
                window.open(waUrl, '_blank');
            }, 2500);
        });
    }

});
