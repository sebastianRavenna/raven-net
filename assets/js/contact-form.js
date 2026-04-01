(function () {
  'use strict';

  var RATE_LIMIT_KEY = 'rn_form_last_submit';
  var RATE_LIMIT_MS = 30000;

  function getById(id) {
    return document.getElementById(id);
  }

  function showError(fieldId, msg) {
    var el = getById(fieldId + '-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function clearErrors() {
    var errors = document.querySelectorAll('.field-error');
    for (var i = 0; i < errors.length; i++) {
      errors[i].textContent = '';
      errors[i].style.display = 'none';
    }
  }

  function setFeedback(msg, isSuccess) {
    var el = getById('form-feedback');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.style.background = isSuccess ? '#d4edda' : '#f8d7da';
    el.style.color = isSuccess ? '#155724' : '#721c24';
    el.style.border = '1px solid ' + (isSuccess ? '#c3e6cb' : '#f5c6cb');
  }

  function initContactForm() {
    var form = getById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      // Honeypot
      var honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) {
        setFeedback('Mensaje enviado correctamente. Te contactaremos pronto.', true);
        return;
      }

      // Rate limit cliente
      var lastSubmit = localStorage.getItem(RATE_LIMIT_KEY);
      if (lastSubmit && Date.now() - parseInt(lastSubmit, 10) < RATE_LIMIT_MS) {
        setFeedback('Por favor esperá unos segundos antes de enviar otro mensaje.', false);
        return;
      }

      var name    = (getById('contact-name').value    || '').trim();
      var email   = (getById('contact-email').value   || '').trim();
      var phone   = (getById('contact-phone').value   || '').trim();
      var message = (getById('contact-message').value || '').trim();

      var valid = true;

      if (!name || name.length < 2) {
        showError('contact-name', 'El nombre debe tener al menos 2 caracteres');
        valid = false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('contact-email', 'Ingresá un email válido');
        valid = false;
      }
      if (!phone) {
        showError('contact-phone', 'El teléfono es obligatorio');
        valid = false;
      }
      if (!message || message.length < 10) {
        showError('contact-message', 'El mensaje debe tener al menos 10 caracteres');
        valid = false;
      }

      if (!valid) return;

      var submitBtn = getById('contact-submit');
      submitBtn.disabled = true;
      submitBtn.value = 'Enviando...';

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, phone: phone, message: message }),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
            setFeedback(data.message, true);
            form.reset();
            setTimeout(function () {
              var el = getById('form-feedback');
              if (el) el.style.display = 'none';
            }, 8000);
          } else {
            setFeedback(data.message || 'Error al enviar. Intentá de nuevo.', false);
          }
        })
        .catch(function () {
          setFeedback('Error de conexión. Escribinos a info@raven-net.com.ar', false);
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.value = 'Enviar';
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();
