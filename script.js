document.addEventListener('DOMContentLoaded', function() {

    // --- AOS Initialization ---
    AOS.init({
        duration: 1000,
        once: true,
        offset: 50,
        delay: 100,
    });

    // --- Sticky Navbar ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

     // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navbarLogoLink = document.querySelector('.navbar-logo-link'); // Get logo link

    if (menuToggle && navLinks) {
        const icon = menuToggle.querySelector('i');
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            if (icon) {
                icon.classList.toggle('fa-bars', !navLinks.classList.contains('active'));
                icon.classList.toggle('fa-times', navLinks.classList.contains('active'));
            }
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                     }
                }
            });
        });

        // Close menu if clicking outside nav/toggle (and not on the mobile logo)
        document.addEventListener('click', (event) => {
            const isClickInsideNav = navLinks.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            const isClickOnLogo = navbarLogoLink ? navbarLogoLink.contains(event.target) : false; // Check if click is on logo

            // Close only if click is outside nav, toggle, and logo (if logo exists)
            if (!isClickInsideNav && !isClickOnToggle && !isClickOnLogo && navLinks.classList.contains('active')) {
                 navLinks.classList.remove('active');
                 if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                 }
            }
        });
    }


    // --- Testimonial Slider (REVISED V4 - Visibility API Fix) ---
    const slider = document.querySelector('.testimonial-slider');
    const wrapper = document.querySelector('.testimonial-wrapper');
    const slides = wrapper ? Array.from(wrapper.querySelectorAll('.testimonial-slide')) : [];
    const dotsContainer = document.querySelector('.slider-dots');

    let currentSlideIndex = 0;
    let autoSlideIntervalId = null;
    let userHasInteracted = false;

    const autoSlideDelay = 3000;
    const transitionDuration = 700;

    function adjustWrapperHeight() {
        // ... (adjustWrapperHeight code remains the same) ...
        if (!wrapper || slides.length === 0) return;
        let maxHeight = 0;
        slides.forEach(slide => {
            const originalStyles = { position: slide.style.position, visibility: slide.style.visibility, display: slide.style.display, height: slide.style.height, transition: slide.style.transition };
            slide.style.position = 'relative'; slide.style.visibility = 'hidden'; slide.style.display = 'flex'; slide.style.height = 'auto'; slide.style.transition = 'none';
            maxHeight = Math.max(maxHeight, slide.scrollHeight);
            slide.style.position = originalStyles.position; slide.style.visibility = originalStyles.visibility; slide.style.display = originalStyles.display; slide.style.height = originalStyles.height;
            setTimeout(() => { slide.style.transition = ''; }, 10);
        });
        if (maxHeight > 0) { wrapper.style.minHeight = `${maxHeight}px`; }
        setActiveSlide(currentSlideIndex, true);
    }

    function updateDots() {
        // ... (updateDots code remains the same) ...
        if (!dotsContainer) return;
        dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
            const isActive = (i === currentSlideIndex);
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-label', `Go to slide ${i + 1}${isActive ? ', current slide' : ''}`);
            dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    }

     function setActiveSlide(newIndex, isInstant = false) {
        // ... (setActiveSlide code remains the same) ...
        slides.forEach((slide, index) => {
            const shouldBeActive = (index === newIndex);
            slide.classList.remove('exiting');
            if (isInstant) slide.style.transition = 'none';
            slide.classList.toggle('active', shouldBeActive);
            slide.setAttribute('aria-hidden', !shouldBeActive);
            if (isInstant) { setTimeout(() => { slide.style.transition = ''; }, 10); }
        });
     }

    function showSlide(newIndex) {
        // ... (showSlide code remains the same) ...
        if (!slides || slides.length === 0) return;
        const slideCount = slides.length;
        const normalizedNewIndex = (newIndex % slideCount + slideCount) % slideCount;
        if (normalizedNewIndex === currentSlideIndex) {
            if(!slides[currentSlideIndex].classList.contains('active')){ setActiveSlide(currentSlideIndex, true); }
            return;
        }
        const outgoingSlide = slides[currentSlideIndex];
        const incomingSlide = slides[normalizedNewIndex];
        outgoingSlide.classList.add('exiting'); outgoingSlide.classList.remove('active'); outgoingSlide.setAttribute('aria-hidden', 'true');
        setTimeout(() => { outgoingSlide.classList.remove('exiting'); }, transitionDuration);
        incomingSlide.classList.remove('exiting'); incomingSlide.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => { incomingSlide.classList.add('active'); });
        currentSlideIndex = normalizedNewIndex;
        updateDots();
    }

    function nextSlide() { showSlide(currentSlideIndex + 1); }
    function stopAutoSlide() { if (autoSlideIntervalId !== null) { clearInterval(autoSlideIntervalId); autoSlideIntervalId = null; } }
    function startAutoSlide(forceRestart = false) {
        // ... (startAutoSlide code remains the same) ...
        stopAutoSlide();
        if (userHasInteracted && !forceRestart) return;
        if (!slides || slides.length <= 1) return;
        if (document.hidden) return;
        autoSlideIntervalId = setInterval(nextSlide, autoSlideDelay);
    }

    function handleVisibilityChange() {
        // ... (handleVisibilityChange code remains the same) ...
        if (document.hidden) { stopAutoSlide(); }
        else { startAutoSlide(); setActiveSlide(currentSlideIndex, true); }
    }

    // Initialize Slider
    if (slides && slides.length > 0 && slider && wrapper) {
        // ... (Slider initialization code remains the same) ...
        adjustWrapperHeight();
        let resizeTimeout;
        window.addEventListener('resize', () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(() => { stopAutoSlide(); adjustWrapperHeight(); startAutoSlide(); }, 250); });
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slides.forEach((_, i) => { const dot = document.createElement('button'); dot.classList.add('dot'); dot.setAttribute('type', 'button'); dot.addEventListener('click', () => { if (i === currentSlideIndex) return; userHasInteracted = true; stopAutoSlide(); showSlide(i); }); dotsContainer.appendChild(dot); });
        }
        setActiveSlide(currentSlideIndex, true); updateDots();
        const pauseEvents = ['mouseenter', 'focusin', 'pointerdown']; const resumeEvents = ['mouseleave', 'focusout', 'pointerup'];
        pauseEvents.forEach(event => { slider.addEventListener(event, (e) => { if (event !== 'mouseenter') { userHasInteracted = true; } stopAutoSlide(); }); });
        resumeEvents.forEach(event => { slider.addEventListener(event, () => { if(event === 'mouseleave'){ startAutoSlide(); } }); });
        slider.setAttribute('tabindex', '0');
        slider.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { userHasInteracted = true; stopAutoSlide(); showSlide(e.key === 'ArrowRight' ? currentSlideIndex + 1 : currentSlideIndex - 1); e.preventDefault(); } });
        if (typeof document.hidden !== "undefined") { document.addEventListener("visibilitychange", handleVisibilityChange, false); }
        startAutoSlide(true);
    }


    // --- Animated Numbers ---
    const animatedNumbers = document.querySelectorAll('.animated-number');
    const animateNumber = (element) => {
        // ... (animateNumber code remains the same) ...
        const target = +element.getAttribute('data-target'); const duration = 1500; const stepTime = 20; const steps = duration / stepTime;
        let increment = target / steps; let current = 0; if (target === 0) { element.innerText = '0'; return; }
        if (Math.abs(increment) < 1 && target !== 0) increment = target > 0 ? 1 : -1; else if (increment === 0 && target !== 0) increment = target > 0 ? 1 : -1;
        const timer = setInterval(() => { current += increment; const finished = (increment > 0 && current >= target) || (increment < 0 && current <= target);
            if (finished) { element.innerText = Math.floor(target).toLocaleString(); clearInterval(timer); } else { element.innerText = Math.floor(current).toLocaleString(); } }, stepTime);
    };
    if ('IntersectionObserver' in window) {
        // ... (IntersectionObserver code remains the same) ...
        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.5 };
        const numberObserver = new IntersectionObserver((entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { animateNumber(entry.target); observer.unobserve(entry.target); } }); }, observerOptions);
        animatedNumbers.forEach(num => { num.innerText = '0'; numberObserver.observe(num); });
    } else { animatedNumbers.forEach(num => { num.innerText = '0'; animateNumber(num); }); }


    // --- Form Interaction (Focus Handling) ---
     const formInputs = document.querySelectorAll('#contactForm input, #contactForm textarea');
     formInputs.forEach(input => {
        // ... (Form focus handling code remains the same) ...
        const label = input.labels ? input.labels[0] : null;
        const updateLabel = () => { if (!label) return; const hasValue = input.value.trim() !== ''; const hasFocus = document.activeElement === input;
             if (hasValue || hasFocus) { input.classList.add('has-content'); label.style.top = '-10px'; label.style.fontSize = '0.8rem'; label.style.color = 'var(--primary-color)'; }
             else { input.classList.remove('has-content'); label.style.top = ''; label.style.fontSize = ''; label.style.color = ''; } };
        updateLabel(); input.addEventListener('focus', updateLabel); input.addEventListener('blur', updateLabel); input.addEventListener('input', updateLabel);
     });


    // --- Form Submission to Google Sheet ---
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');
    // IMPORTANT: Replace with YOUR actual deployed Web App URL
    const googleSheetURL = 'https://script.google.com/macros/s/AKfycbxL2qgSe-ZyvJHbG9z-Orv2KrUJ0hFCwycbm2ZaR2U5ZBrbFozTK93Ibzb9DLq2AqR0ZQ/exec'; // <<<--- MAKE SURE YOU REPLACE THIS!!!

    console.log("Form Script Initializing..."); // DEBUG: Check if script runs
    console.log(" - Found Form:", contactForm); // DEBUG: Check if form element exists
    console.log(" - Found Status Div:", formStatus); // DEBUG: Check if status element exists
    console.log(" - Google Sheet URL:", googleSheetURL); // DEBUG: Check the URL value

     // Check if all necessary elements and the URL are correctly set up
     if (contactForm && formStatus && googleSheetURL && googleSheetURL !== 'YOUR_DEPLOYED_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {

        console.log("All checks passed. Attaching submit listener to form."); // DEBUG LINE 1

        contactForm.addEventListener('submit', function(e) {
            console.log("Submit event listener FIRED!"); // DEBUG LINE 2 - Check if this appears on click

            e.preventDefault(); // Prevent default form submission (THE KEY PART!)
            console.log("preventDefault() called."); // DEBUG LINE 3 - Confirm preventDefault ran

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (!submitBtn) {
                console.error("Submit button not found inside the form!");
                return;
            }
            const originalText = submitBtn.textContent;

            // Provide immediate feedback
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            formStatus.textContent = ''; // Clear previous status
            formStatus.className = 'form-status-message'; // Reset classes
            console.log("UI updated to 'Sending...'"); // DEBUG

            const formData = new FormData(contactForm);
            console.log("FormData prepared:", formData); // DEBUG

            fetch(googleSheetURL, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                console.log("Fetch response received. Status:", response.status); // DEBUG
                if (!response.ok) { // Check for HTTP errors (like 404, 500)
                     throw new Error(`Network response was not ok (${response.status})`);
                }
                return response.json(); // Expect a JSON response from Apps Script
             })
            .then(data => {
                console.log('Parsed JSON Success Response:', data); // DEBUG
                if (data.result === "success") {
                    formStatus.textContent = 'Message Sent Successfully! We\'ll be in touch.';
                    formStatus.classList.add('form-success');
                    contactForm.reset(); // Clear the form
                     console.log("Form reset and success message shown."); // DEBUG
                    // Trigger label update for cleared fields
                    formInputs.forEach(input => { input.dispatchEvent(new Event('blur')); });
                } else {
                    // Handle potential errors reported by the script itself
                    console.error("Apps Script reported an error:", data.message); // DEBUG
                    throw new Error(data.message || 'Submission failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error); // DEBUG
                formStatus.textContent = 'Oops! Something went wrong. Please try again later.';
                formStatus.classList.add('form-error');
            })
            .finally(() => {
                console.log("Fetch 'finally' block executed."); // DEBUG
                // Re-enable button and restore text regardless of success/error
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                // Optional: Hide status message after a delay
                setTimeout(() => {
                    formStatus.textContent = '';
                    formStatus.className = 'form-status-message';
                }, 6000); // Hide after 6 seconds
            });
        });
     } else {
         // Log *why* the listener wasn't attached
         console.warn("Submit listener NOT attached. Conditions check:");
         console.log(" - contactForm found:", !!contactForm);
         console.log(" - formStatus found:", !!formStatus);
         console.log(" - googleSheetURL exists:", !!googleSheetURL);
         console.log(" - googleSheetURL is not placeholder:", googleSheetURL !== 'YOUR_DEPLOYED_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE');
         console.log(" - Full URL value:", googleSheetURL);

         // Disable button if setup is incomplete
         if (googleSheetURL === 'YOUR_DEPLOYED_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
             console.warn("Google Sheet URL is still the placeholder. Form submission disabled.");
             const submitBtn = contactForm?.querySelector('button[type="submit"]');
             if (submitBtn) {
                 submitBtn.disabled = true;
                 submitBtn.title = "Form submission is currently disabled (URL not configured).";
             }
         } else if (!contactForm || !formStatus) {
              console.error("Crucial HTML elements (contactForm or formStatus) not found. Form submission disabled.");
              const submitBtn = contactForm?.querySelector('button[type="submit"]');
             if (submitBtn) {
                 submitBtn.disabled = true;
                 submitBtn.title = "Form submission is currently disabled (HTML structure issue).";
             }
         }
     }

}); // End DOMContentLoaded