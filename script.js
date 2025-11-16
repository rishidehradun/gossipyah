/**
 * GossipYah - Fixed Form Submission Handler
 * Properly handles Google Apps Script Web App submissions
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('newsletterForm');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const submitButton = form.querySelector('.join-button');
    const formStatus = document.getElementById('form-status');
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');

    // Phone number validation for Indian numbers
    const validatePhone = (phone) => {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone);
    };

    // Name validation
    const validateName = (name) => {
        const nameRegex = /^[a-zA-Z\s]{2,}$/;
        return nameRegex.test(name.trim());
    };

    // Show error message
    const showError = (input, message) => {
        const errorElement = document.getElementById(`${input.id}-error`);
        errorElement.textContent = message;
        input.classList.add('error-shake');
        input.setAttribute('aria-invalid', 'true');
        
        setTimeout(() => {
            input.classList.remove('error-shake');
        }, 400);
    };

    // Clear error message
    const clearError = (input) => {
        const errorElement = document.getElementById(`${input.id}-error`);
        errorElement.textContent = '';
        input.setAttribute('aria-invalid', 'false');
    };

    // Real-time validation
    nameInput.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            showError(this, 'Please enter your name');
        } else if (!validateName(this.value)) {
            showError(this, 'Please enter a valid name (letters only)');
        } else {
            clearError(this);
        }
    });

    phoneInput.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            showError(this, 'Please enter your phone number');
        } else if (!validatePhone(this.value)) {
            showError(this, 'Please enter a valid 10-digit mobile number');
        } else {
            clearError(this);
        }
    });

    // Clear errors on input
    nameInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            clearError(this);
        }
    });

    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
        if (this.value.length > 0) {
            clearError(this);
        }
    });

    // Update status message
    const updateStatus = (message, type) => {
        formStatus.textContent = message;
        formStatus.className = `status-${type}`;
        formStatus.setAttribute('role', 'status');
    };

    // Disable form during submission
    const disableForm = () => {
        nameInput.disabled = true;
        phoneInput.disabled = true;
        checkboxes.forEach(cb => cb.disabled = true);
        submitButton.disabled = true;
        submitButton.classList.add('loading');
    };

    // Enable form after submission
    const enableForm = () => {
        nameInput.disabled = false;
        phoneInput.disabled = false;
        checkboxes.forEach(cb => cb.disabled = false);
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
    };

    // Form submission - FIXED VERSION
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Clear previous status
        updateStatus('', '');

        // Validate all fields
        let hasErrors = false;

        if (!validateName(nameInput.value)) {
            showError(nameInput, 'Please enter a valid name');
            hasErrors = true;
        }

        if (!validatePhone(phoneInput.value)) {
            showError(phoneInput, 'Please enter a valid 10-digit mobile number');
            hasErrors = true;
        }

        // Check checkboxes
        const termsChecked = form.querySelector('input[name="terms_agreement"]').checked;
        const consentChecked = form.querySelector('input[name="monthly_newsletter_consent"]').checked;

        if (!termsChecked || !consentChecked) {
            updateStatus('Please accept both terms and consent to continue', 'error');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        // Check honeypot
        const honeypot = form.querySelector('input[name="_gotcha"]');
        if (honeypot && honeypot.value !== '') {
            console.log('Bot detected');
            return;
        }

        // Disable form and show loading
        disableForm();
        updateStatus('Subscribing... Please wait', 'loading');

        try {
            // Create FormData object (Google Apps Script expects this format)
            const formData = new FormData();
            formData.append('name', nameInput.value.trim());
            formData.append('phone', phoneInput.value.trim());
            formData.append('terms_agreement', termsChecked ? 'agreed' : '');
            formData.append('monthly_newsletter_consent', consentChecked ? 'yes' : '');
            formData.append('_subject', 'GossipYah Newsletter Sign-Up - Gurgaon');
            formData.append('timestamp', new Date().toISOString());

            console.log('Submitting form data:', {
                name: nameInput.value.trim(),
                phone: phoneInput.value.trim(),
                terms: termsChecked,
                consent: consentChecked
            });

            // Submit to Google Apps Script
            // Note: We don't set Content-Type header - browser will set it automatically with boundary for FormData
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                redirect: 'follow'
            });

            console.log('Response status:', response.status);

            // Check if submission was successful
            if (response.ok || response.status === 0) {
                // Success!
                updateStatus('🎉 Success! Check WhatsApp for confirmation.', 'success');
                
                // Reset form
                form.reset();

                // Track conversion if analytics exists
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'conversion', {
                        'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
                        'value': 1.0,
                        'currency': 'INR'
                    });
                }

                // Show welcome message after delay
                setTimeout(() => {
                    updateStatus('You\'re all set! Welcome to GossipYah 💛', 'success');
                }, 3000);

            } else {
                throw new Error(`Server returned status: ${response.status}`);
            }

        } catch (error) {
            console.error('Submission error:', error);
            
            // Provide helpful error message
            updateStatus('Oops! Something went wrong. Please try again or contact us at contact@gossipyah.com', 'error');
            
            // Log error details for debugging
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
        } finally {
            enableForm();
        }
    });

    // ===== Smooth Scrolling =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                history.pushState(null, null, href);
            }
        });
    });

    // ===== Animation on Scroll =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                setTimeout(() => {
                    entry.target.classList.add('animation-complete');
                }, 1000);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(element => {
        observer.observe(element);
    });

    // ===== WhatsApp Float Button =====
    const whatsappFloat = document.querySelector('.whatsapp-float');
    const heroSection = document.querySelector('.hero-section');
    
    if (whatsappFloat && heroSection) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (window.innerWidth < 768) {
                        whatsappFloat.style.opacity = '0';
                        whatsappFloat.style.pointerEvents = 'none';
                    }
                } else {
                    whatsappFloat.style.opacity = '1';
                    whatsappFloat.style.pointerEvents = 'auto';
                }
            });
        }, { threshold: 0.5 });
        
        heroObserver.observe(heroSection);
    }

    // ===== Handle Network Changes =====
    if ('connection' in navigator) {
        const updateOnlineStatus = () => {
            if (!navigator.onLine) {
                updateStatus('You appear to be offline. Please check your connection.', 'error');
            }
        };

        window.addEventListener('online', () => {
            updateStatus('', '');
        });

        window.addEventListener('offline', updateOnlineStatus);
    }

    console.log('GossipYah Form Handler Loaded Successfully');
});

// ===== Utility Functions =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== Handle Resize Events =====
window.addEventListener('resize', debounce(() => {
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (whatsappFloat && window.innerWidth >= 768) {
        whatsappFloat.style.opacity = '1';
        whatsappFloat.style.pointerEvents = 'auto';
    }
}, 250));

// ===== Error Handling =====
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});