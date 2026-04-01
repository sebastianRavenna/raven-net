// Archivo JavaScript combinado con envío AJAX y depuración mejorada

(function() {
    'use strict';

    // Configuración inicial (combinada de ambos archivos)
    const config = {
        animationDelay: 100, // De mainbootstrap.js
        scrollOffset: 80,    // De mainbootstrap.js
        formSubmissionDelay: 1000 // De mainbootstrap.js
    };

    // Variable global para depuración
    window.RavenNetDebug = {
        formFound: false,
        scriptLoaded: true,
        lastError: null
    };

    console.log('🚀 RavenNet JavaScript cargado correctamente');

    // Función principal de inicialización
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM cargado, inicializando componentes...');
        
        // Funciones de main.js
        initNavbar();
        initSmoothScroll();
        initFormValidation(); // Usaremos la versión mejorada de mainbootstrap.js
        initAnimations();
        hidePreloader();
        initWhatsAppButton();
        initAccessibility();

        // Funciones adicionales de mainbootstrap.js
        setTimeout(function() {
            document.body.classList.remove('is-preload');
        }, config.animationDelay);
        initContactIcons();

        console.log('✅ Todos los componentes inicializados');
    });

    // Navbar functionality (de main.js, con ajustes)
    function initNavbar() {
        const navbar = document.querySelector('.custom-navbar');
        const navLinks = document.querySelectorAll('.nav-link');
        
        if (!navbar) return; // Asegurarse de que el navbar existe

        // Cambiar estilo del navbar al hacer scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Cerrar navbar móvil al hacer clic en un enlace
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                const navbarCollapse = document.querySelector('.navbar-collapse');
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                
                if (bsCollapse && navbarCollapse.classList.contains('show')) {
                    bsCollapse.hide();
                }
            });
        });

        // Actualizar enlace activo basado en la sección visible
        window.addEventListener('scroll', updateActiveNavLink);
        updateActiveNavLink(); // Llamar inicialmente
    }

    // Actualizar enlace activo en la navegación (de main.js)
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        let currentSection = '';
        const scrollPosition = window.scrollY + 100; // Offset para mejor detección

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Smooth scrolling para enlaces internos (de main.js, con ajuste de offset de mainbootstrap.js)
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Verificar que no sea solo "#" o vacío
                if (href && href !== '#' && href.length > 1) {
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        e.preventDefault();
                        
                        const navbarHeight = document.querySelector('.navbar').offsetHeight;
                        // Usar el scrollOffset de mainbootstrap.js si es aplicable, o el cálculo de main.js
                        const offset = config.scrollOffset || navbarHeight;
                        const targetPosition = targetElement.offsetTop - offset;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });

                        // Cerrar navbar móvil si está abierto (de mainbootstrap.js)
                        const navbarCollapse = document.querySelector('.navbar-collapse');
                        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                            bsCollapse.hide();
                        }
                    }
                }
            });
        });
    }

    // Validación de formulario con envío AJAX (versión mejorada con depuración)
    function initFormValidation() {
        console.log('🔍 Buscando formulario de contacto...');
        
        // Buscar formulario con múltiples estrategias
        let form = document.getElementById('contact-form');
        if (!form) {
            form = document.getElementById('contactForm');
        }
        if (!form) {
            form = document.querySelector('form[action*="process_form"]');
        }
        if (!form) {
            form = document.querySelector('form');
        }
        
        if (!form) {
            console.error('❌ No se encontró ningún formulario en la página');
            window.RavenNetDebug.formFound = false;
            return;
        }

        console.log('✅ Formulario encontrado:', form);
        console.log('📋 ID del formulario:', form.id);
        console.log('📋 Action del formulario:', form.action);
        window.RavenNetDebug.formFound = true;

        // Buscar div de mensajes
        let messageDiv = document.getElementById('form-message');
        if (!messageDiv) {
            messageDiv = document.getElementById('form-messages');
        }
        
        if (!messageDiv) {
            console.warn('⚠️ No se encontró div para mensajes, se creará uno automáticamente');
            messageDiv = document.createElement('div');
            messageDiv.id = 'form-message';
            messageDiv.className = 'd-none';
            form.parentNode.insertBefore(messageDiv, form.nextSibling);
        }

        console.log('✅ Div de mensajes encontrado/creado:', messageDiv);

        // Validación en tiempo real
        const inputs = form.querySelectorAll('input, textarea');
        console.log('📝 Campos encontrados:', inputs.length);
        
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

        // Validación al enviar el formulario con AJAX
        form.addEventListener('submit', function(e) {
            console.log('📤 Formulario enviado, interceptando...');
            e.preventDefault(); // Siempre prevenir el envío nativo
            e.stopPropagation();

            const isValid = validateForm();
            
            if (!isValid) {
                console.log('❌ Validación falló');
                showMessage('Por favor, corrige los errores en el formulario.', 'danger');
                // Hacer scroll al primer campo con error
                const firstError = form.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            } else {
                console.log('✅ Validación exitosa, enviando vía AJAX...');
                // Si la validación es exitosa, enviar vía AJAX
                submitForm();
            }
        });

        console.log('🎯 Event listener del formulario agregado correctamente');

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

    // Envío del formulario vía AJAX
    function submitForm() {
        console.log('🚀 Iniciando envío AJAX...');
        
        const form = document.getElementById('contact-form') || document.getElementById('contactForm') || document.querySelector('form');
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Deshabilitar botón y mostrar loading
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando...';

        // Preparar datos del formulario
        const formData = new FormData(form);
        
        // Log de datos que se envían
        console.log('📦 Datos del formulario:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }

        // Determinar la URL de envío
        let actionUrl = form.action;
        if (actionUrl.includes('process_form.php')) {
            actionUrl = actionUrl.replace('process_form.php', 'process_form.php');
        } else if (!actionUrl.includes('process_form.php')) {
            actionUrl = 'process_form.php';
        }
        
        console.log('🎯 Enviando a:', actionUrl);

        // Enviar vía fetch
        fetch(actionUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('📡 Respuesta recibida:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📋 Datos de respuesta:', data);
            
            // Restaurar botón
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
            
            if (data.success) {
                console.log('✅ Mensaje enviado exitosamente');
                // Mostrar mensaje de éxito
                showMessage(data.message || '¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
                
                // Limpiar formulario
                form.reset();
                clearFormValidation();
            } else {
                console.log('❌ Error en el envío:', data.message);
                // Mostrar mensaje de error
                showMessage(data.message || 'Error al enviar el mensaje. Inténtalo de nuevo.', 'danger');
            }
            
            // Scroll al mensaje
            const messageDiv = document.getElementById('form-message') || document.getElementById('form-messages');
            if (messageDiv) {
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        })
        .catch(error => {
            console.error('💥 Error en AJAX:', error);
            window.RavenNetDebug.lastError = error.message;
            
            // Restaurar botón
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
            
            // Mostrar mensaje de error
            showMessage('Error al enviar el mensaje. Por favor, inténtalo de nuevo.', 'danger');
            
            // Scroll al mensaje
            const messageDiv = document.getElementById('form-message') || document.getElementById('form-messages');
            if (messageDiv) {
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // Validar un campo individual (combinada y mejorada)
    function validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Limpiar clases previas
        field.classList.remove('is-valid', 'is-invalid');

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

    // Validar todo el formulario (de mainbootstrap.js)
    function validateForm() {
        const form = document.getElementById('contact-form') || document.getElementById('contactForm') || document.querySelector('form');
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

    // Limpiar validación del formulario (de mainbootstrap.js)
    function clearFormValidation() {
        const form = document.getElementById('contact-form') || document.getElementById('contactForm') || document.querySelector('form');
        const fields = form.querySelectorAll('input, textarea');
        
        fields.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
            const feedback = field.parentNode.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = '';
            }
        });
    }

    // Obtener etiqueta del campo (de mainbootstrap.js)
    function getFieldLabel(fieldName) {
        const labels = {
            'name': 'Nombre',
            'email': 'Email',
            'phone': 'Teléfono',
            'message': 'Mensaje'
        };
        return labels[fieldName] || fieldName;
    }

    // Mostrar mensaje (combinada y mejorada)
    function showMessage(text, type) {
        let messageDiv = document.getElementById('form-message') || document.getElementById('form-messages');
        
        if (!messageDiv) {
            console.warn('⚠️ Creando div de mensajes automáticamente');
            messageDiv = document.createElement('div');
            messageDiv.id = 'form-message';
            const form = document.getElementById('contact-form') || document.getElementById('contactForm') || document.querySelector('form');
            if (form) {
                form.parentNode.insertBefore(messageDiv, form.nextSibling);
            }
        }

        // Mapear tipos de Bootstrap a tipos personalizados si es necesario
        const alertType = type === 'danger' ? 'danger' : type;

        // Si el mensaje es de main.js (form-messages), usar su estructura
        if (messageDiv.id === 'form-messages') {
            messageDiv.innerHTML = `
                <div class="form-message ${alertType}" role="alert">
                    <i class="fas fa-${alertType === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                    ${text}
                </div>
            `;
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else { // Si es de mainbootstrap.js (form-message), usar su estructura
            messageDiv.className = `alert alert-${alertType} alert-dismissible fade show`;
            messageDiv.innerHTML = `
                ${text}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            messageDiv.classList.remove('d-none');
        }

        console.log('💬 Mensaje mostrado:', text, 'Tipo:', alertType);
    }

    // Ocultar mensaje (combinada y mejorada)
    function hideMessage() {
        const messageDiv = document.getElementById('form-message') || document.getElementById('form-messages');
        if (messageDiv) {
            if (messageDiv.id === 'form-messages') {
                messageDiv.innerHTML = '';
            } else {
                messageDiv.classList.add('d-none');
            }
        }
    }

    // Inicializar animaciones (combinada)
    function initAnimations() {
        // Animaciones al hacer scroll (Intersection Observer) de main.js
        const animatedElementsMain = document.querySelectorAll('.card, .hero-content, .section-title');
        
        const observerOptionsMain = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observerMain = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observerMain.unobserve(entry.target);
                }
            });
        }, observerOptionsMain);
        
        animatedElementsMain.forEach(element => {
            observerMain.observe(element);
        });

        // Animación de entrada para las cards (de mainbootstrap.js, se superpone con la anterior pero se mantiene)
        const observerBootstrap = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observar elementos para animación (de mainbootstrap.js)
        const animatedElementsBootstrap = document.querySelectorAll('.card, .contact-icon');
        animatedElementsBootstrap.forEach(el => observerBootstrap.observe(el));

        // Animación para las cards al hover (de main.js)
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Preloader (de main.js)
    function hidePreloader() {
        const preloader = document.querySelector('.preloader');
        
        if (preloader) {
            window.addEventListener('load', function() {
                setTimeout(() => {
                    preloader.classList.add('fade-out');
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 500);
                }, 300);
            });
        }
    }

    // Funciones para botón de WhatsApp (de main.js)
    function initWhatsAppButton() {
        const whatsappButton = document.querySelector('.whatsapp-float');
        
        if (whatsappButton) {
            // Mostrar/ocultar basado en scroll
            window.addEventListener('scroll', throttle(() => {
                if (window.scrollY > 300) {
                    whatsappButton.style.opacity = '1';
                    whatsappButton.style.visibility = 'visible';
                } else {
                    whatsappButton.style.opacity = '0.7';
                }
            }, 100));
            
            // Efecto de pulsación
            whatsappButton.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 100);
                }, 100);
            });

            // Mejorar accesibilidad del botón de WhatsApp (de mainbootstrap.js)
            whatsappButton.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        }
    }

    // Inicializar mejoras de accesibilidad (de main.js y mainbootstrap.js)
    function initAccessibility() {
        // Manejar navegación por teclado (de main.js)
        document.addEventListener('keydown', function(e) {
            // Cerrar menú móvil con Escape
            if (e.key === 'Escape') {
                const navbarCollapse = document.querySelector('.navbar-collapse');
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                
                if (bsCollapse && navbarCollapse.classList.contains('show')) {
                    bsCollapse.hide();
                }
            }
        });
        
        // Mejorar focus visible (de main.js)
        document.addEventListener('focusin', function(e) {
            if (e.target.matches('button, a, input, textarea, select')) {
                e.target.setAttribute('data-focus-visible', '');
            }
        });
        
        document.addEventListener('focusout', function(e) {
            e.target.removeAttribute('data-focus-visible');
        });

        // Mejorar navegación por teclado (de mainbootstrap.js - focus outline)
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
    }

    // Inicializar efectos de iconos de contacto (de mainbootstrap.js)
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

    // Función para detectar si es móvil (de main.js)
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Función para throttle (limitar ejecución de eventos) (de main.js)
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Aplicar throttle al scroll para mejor rendimiento (de main.js)
    window.addEventListener('scroll', throttle(() => {
        updateActiveNavLink();
    }, 100));

    // Manejo de errores globales (de ambos, se mantiene una versión)
    window.addEventListener('error', function(e) {
        console.error('Error en la aplicación:', e.error);
        window.RavenNetDebug.lastError = e.error.message;
    });

    // Función para manejar el resize de la ventana (de main.js)
    window.addEventListener('resize', throttle(() => {
        // Cerrar menú móvil si se cambia a desktop
        if (window.innerWidth > 992) {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            
            if (bsCollapse && navbarCollapse.classList.contains('show')) {
                bsCollapse.hide();
            }
        }
    }, 250));

    // Utilidades adicionales de RavenNet (de mainbootstrap.js)
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
            const form = document.getElementById('contact-form') || document.getElementById('contactForm') || document.querySelector('form');
            if (form) {
                form.reset();
                clearFormValidation();
                hideMessage();
            }
        },

        // Función para depuración
        debug: function() {
            console.log('🔍 Estado de depuración RavenNet:');
            console.log('  Script cargado:', window.RavenNetDebug.scriptLoaded);
            console.log('  Formulario encontrado:', window.RavenNetDebug.formFound);
            console.log('  Último error:', window.RavenNetDebug.lastError);
            
            const form = document.getElementById('contact-form') || document.getElementById('contactForm') || document.querySelector('form');
            console.log('  Formulario actual:', form);
            
            if (form) {
                console.log('  ID del formulario:', form.id);
                console.log('  Action del formulario:', form.action);
                console.log('  Método del formulario:', form.method);
            }
        }
    };

    // Optimización de rendimiento (de mainbootstrap.js)
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

    // Mensaje de confirmación de carga
    console.log('🎉 RavenNet JavaScript completamente inicializado');

})();

