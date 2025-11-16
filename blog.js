/**
 * GossipYah Blog - Filter and Load More Functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // === Filter Functionality ===
    const filterButtons = document.querySelectorAll('.filter-btn');
    const blogCards = document.querySelectorAll('.blog-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards
            blogCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    card.classList.remove('hidden');
                    // Add fade-in animation
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.classList.add('hidden');
                }
            });
            
            // Scroll to grid after filtering (smooth UX)
            setTimeout(() => {
                const blogGrid = document.querySelector('.blog-grid');
                blogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        });
    });
    
    
    // === Load More Functionality ===
    const loadMoreBtn = document.querySelector('.load-more-btn');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Show loading state
            const originalText = this.textContent;
            this.textContent = 'Loading More Gossip...';
            this.disabled = true;
            
            // Simulate loading (replace with actual API call)
            setTimeout(() => {
                // In production, you would fetch more articles here
                // For now, just show a message
                this.textContent = 'No More Posts (For Now)';
                this.style.opacity = '0.6';
                
                // Optionally, hide the button after showing message
                setTimeout(() => {
                    this.style.display = 'none';
                    document.querySelector('.load-more-text').innerHTML = 
                        '<em>That\'s all the gossip for now. Check back soon for more! Or just <a href="index.html#subscribe" style="color: var(--color-gold);">subscribe to the newsletter</a>.</em>';
                }, 2000);
            }, 1000);
        });
    }
    
    
    // === Smooth Scrolling for Navigation Links ===
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
            }
        });
    });
    
    
    // === Add fade-in animation on scroll ===
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe all blog cards
    blogCards.forEach(card => {
        observer.observe(card);
    });
    
    
    // === WhatsApp Float Button Visibility ===
    const whatsappFloat = document.querySelector('.whatsapp-float');
    const heroSection = document.querySelector('.blog-hero');
    
    if (whatsappFloat && heroSection) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    whatsappFloat.style.opacity = '0';
                    whatsappFloat.style.pointerEvents = 'none';
                } else {
                    whatsappFloat.style.opacity = '1';
                    whatsappFloat.style.pointerEvents = 'auto';
                }
            });
        }, { threshold: 0.5 });
        
        heroObserver.observe(heroSection);
    }
    
    
    console.log('GossipYah Blog loaded successfully! 🎉');
});


// === Add CSS animation keyframes dynamically ===
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);