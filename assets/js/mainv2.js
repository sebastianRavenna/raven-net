// JavaScript personalizado para Raven-Net con Bootstrap
(function() {
    'use strict';

    // Configuración inicial
    const config = {
        animationDelay: 100,
        scrollOffset: 80,
        formSubmissionDelay: 1000
    };

    // Inicialización cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });

    // Función principal de inicialización
    function initializeApp() {
        // Remover clase de precarga después de un breve delay
        setTimeout(function() {
            document.body.classList.remove('is-preload');
        }, config.animationDelay);

        // Inicializar componentes
        initSmoothScrolling();
        initNavbarBehavior();
        initFormValidation();
        initAnimations();
        initContactIcons();
    }

    // Smooth scrolling para enlaces internos
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '') return;
                
                const target = document.querySelector(href);
                if (!target) return;
                
                e.preventDefault();
                
                const offsetTop = target.offsetTop - config.scrollOffset;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Cerrar navbar móvil si está abierto
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                    bsCollapse.hide();
                }
            });
        });
    }

    // Comportamiento de la navbar
    function initNavbarBehavior() {
        const navbar = document.getElementById('main-nav');
        if (!navbar) return;

        // Cambiar estilo de navbar al hacer scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(0, 0, 0, 0.9)';
            } else {
                navbar.style.background = 'rgba(0, 0, 0, 0.1)';
            }
        });

        // Actualizar enlaces activos basado en scroll
        const sections = document.querySelectorAll('section[id], header[id], footer[id]');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

        window.addEventListener('scroll', function() {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 150;
                const sectionHeight = section.offsetHeight;
                
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    // Validación de formulario con Bootstrap
    function initFormValidation() {
        const form = document.getElementById('contact-form');
        const messageDiv = document.getElementById('form-message');
        
        if (!form) return;

        // Validación en tiempo real
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            // Validación al perder el foco
            input.addEventListener('blur', function() {
                validateField(this);
            });

            // Limpiar errores al escribir
            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    this.classList.remove('is-invalid');
                    const feedback = this.parentNode.querySelector('.invalid-feedback');
                    if (feedback) {
                        feedback.textContent = '';
                    }
                }
            });
        });

        // Validación al enviar el formulario
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const isValid = validateForm();
            
            if (isValid) {
                submitForm();
            } else {
                showMessage('Por favor, corrige los errores en el formulario.', 'danger');
                // Hacer scroll al primer campo con error
                const firstError = form.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });

        // Reset del formulario
        const resetButton = form.querySelector('button[type="reset"]');
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                setTimeout(() => {
                    clearFormValidation();
                    hideMessage();
                }, 10);
            });
        }
    }

    // Validar un campo individual
    function validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Validación de campo requerido
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = `El campo ${getFieldLabel(fieldName)} es obligatorio.`;
        }
        // Validación de email
        else if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Por favor, ingresa un email válido.';
            }
        }
        // Validación de teléfono
        else if (fieldType === 'tel' && value) {
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Por favor, ingresa un número de teléfono válido.';
            }
        }
        // Validación de nombre
        else if (fieldName === 'name' && value) {
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'El nombre debe tener al menos 2 caracteres.';
            }
        }
        // Validación de mensaje
        else if (fieldName === 'message' && value) {
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'El mensaje debe tener al menos 10 caracteres.';
            }
        }

        // Aplicar estilos de validación
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }

        // Mostrar mensaje de error
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = errorMessage;
        }

        return isValid;
    }

    // Validar todo el formulario
    function validateForm() {
        const form = document.getElementById('contact-form');
        const fields = form.querySelectorAll('input[required], textarea[required]');
        let isFormValid = true;

        fields.forEach(field => {
            const isFieldValid = validateField(field);
            if (!isFieldValid) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    // Limpiar validación del formulario
    function clearFormValidation() {
        const form = document.getElementById('contact-form');
        const fields = form.querySelectorAll('input, textarea');
        
        fields.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
            const feedback = field.parentNode.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = '';
            }
        });
    }

    // Obtener etiqueta del campo
    function getFieldLabel(fieldName) {
        const labels = {
            'name': 'Nombre',
            'email': 'Email',
            'phone': 'Teléfono',
            'message': 'Mensaje'
        };
        return labels[fieldName] || fieldName;
    }

    // Simular envío del formulario
    function submitForm() {
        const form = document.getElementById('contact-form');
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Deshabilitar botón y mostrar loading
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando...';

        // Simular delay de envío
        setTimeout(() => {
            // Restaurar botón
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
            
            // Mostrar mensaje de éxito
            showMessage('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
            
            // Limpiar formulario
            form.reset();
            clearFormValidation();
            
            // Scroll al mensaje
            const messageDiv = document.getElementById('form-message');
            if (messageDiv) {
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, config.formSubmissionDelay);
    }

    // Mostrar mensaje
    function showMessage(text, type) {
        const messageDiv = document.getElementById('form-message');
        if (!messageDiv) return;

        messageDiv.className = `alert alert-${type} alert-dismissible fade show`;
        messageDiv.innerHTML = `
            ${text}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        messageDiv.classList.remove('d-none');
    }

    // Ocultar mensaje
    function hideMessage() {
        const messageDiv = document.getElementById('form-message');
        if (messageDiv) {
            messageDiv.classList.add('d-none');
        }
    }

    // Inicializar animaciones
    function initAnimations() {
        // Animación de entrada para las cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observar elementos para animación
        const animatedElements = document.querySelectorAll('.card, .contact-icon');
        animatedElements.forEach(el => observer.observe(el));
    }

    // Inicializar efectos de iconos de contacto
    function initContactIcons() {
        const icons = document.querySelectorAll('.contact-icon');
        
        icons.forEach(icon => {
            icon.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1) rotate(5deg)';
            });
            
            icon.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    }

    // Utilidades adicionales
    window.RavenNet = {
        // Función para mostrar mensajes personalizados
        showNotification: function(message, type = 'info') {
            showMessage(message, type);
        },
        
        // Función para validar formulario manualmente
        validateForm: function() {
            return validateForm();
        },
        
        // Función para limpiar formulario
        clearForm: function() {
            const form = document.getElementById('contact-form');
            if (form) {
                form.reset();
                clearFormValidation();
                hideMessage();
            }
        }
    };

})();

// Funciones adicionales para compatibilidad
document.addEventListener('DOMContentLoaded', function() {
    // Mejorar accesibilidad del botón de WhatsApp
    const whatsappButton = document.querySelector('.whatsapp-float');
    if (whatsappButton) {
        whatsappButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }

    // Mejorar navegación por teclado
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--primary-color)';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
});

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
});

// Optimización de rendimiento
if ('requestIdleCallback' in window) {
    requestIdleCallback(function() {
        // Precargar imágenes importantes
        const importantImages = [
            './images/Sin título-1.png',
            './images/Icono_-_copia-removebg-preview.png'
        ];
        
        importantImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    });
}

