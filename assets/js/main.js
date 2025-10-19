/* AMZ Conversion Studio - Main Script (minify for production) */
(function () {
  const root = document.documentElement;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const THEME_KEY = 'amz-conversion-theme';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    const toggleLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', toggleLabel);
      themeToggle.querySelector('[data-theme-label]').textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    }
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
  }

  function handleThemeToggle() {
    if (!themeToggle) return;
    themeToggle.addEventListener('click', function () {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  function initReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || revealElements.length === 0) {
      revealElements.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
    });

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  function serializeForm(form) {
    const formData = new FormData(form);
    return {
      firstName: formData.get('firstName') || '',
      lastName: formData.get('lastName') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      preferredContact: formData.get('preferredContact') || '',
      projectType: formData.get('projectType') || '',
      message: formData.get('message') || '',
      consent: formData.get('consent') === 'on',
    };
  }

  function formatMessage(values) {
    const intro = `Hello, I'm ${values.firstName} ${values.lastName}.`;
    const project = values.projectType ? ` Project type: ${values.projectType}.` : '';
    const contact = values.preferredContact ? ` Preferred contact: ${values.preferredContact}.` : '';
    const brief = values.message ? ` Brief: ${values.message}` : '';
    return `${intro}${project}${contact}${brief}`.trim();
  }

  function validateForm(values) {
    const errors = {};
    if (!values.firstName.trim()) {
      errors.firstName = 'First name is required.';
    }
    if (!values.lastName.trim()) {
      errors.lastName = 'Last name is required.';
    }
    if (!values.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (values.phone.trim() && !/^\+?[0-9\s()-]{7,}$/.test(values.phone.trim())) {
      errors.phone = 'Enter a valid phone number.';
    }
    if (!values.consent) {
      errors.consent = 'Consent is required to proceed.';
    }
    return errors;
  }

  function displayErrors(form, errors) {
    form.querySelectorAll('[data-error]').forEach(function (el) {
      el.textContent = '';
    });
    Object.keys(errors).forEach(function (key) {
      const fieldError = form.querySelector('[data-error="' + key + '"]');
      if (fieldError) {
        fieldError.textContent = errors[key];
      }
    });
  }

  function handleContactForm() {
    const form = document.querySelector('.js-contact-form');
    if (!form) return;

    const whatsappBtn = form.querySelector('[data-action="whatsapp"]');
    const emailBtn = form.querySelector('[data-action="email"]');
    const confirmation = form.querySelector('[data-confirmation]');

    function handleAction(action) {
      const values = serializeForm(form);
      const errors = validateForm(values);
      displayErrors(form, errors);

      if (Object.keys(errors).length > 0) {
        confirmation.textContent = '';
        confirmation.classList.remove('notice');
        return;
      }

      const message = formatMessage(values);
      if (action === 'whatsapp') {
        const number = '1234567890'; // TODO: Replace with business WhatsApp number
        const url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
        window.open(url, '_blank');
      }
      if (action === 'email') {
        const recipient = 'hello@amzconversionstudio.com'; // TODO: Replace with business email
        const subject = 'Project inquiry from ' + values.firstName + ' ' + values.lastName;
        const body = message;
        const mailto = 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        window.location.href = mailto;
        // Example Formspree integration:
        // fetch('https://formspree.io/f/{form_id}', { method: 'POST', body: new FormData(form) });
      }
      confirmation.textContent = 'Thanks! We just opened your preferred contact channel.';
      confirmation.classList.add('notice');
    }

    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', function (event) {
        event.preventDefault();
        handleAction('whatsapp');
      });
    }

    if (emailBtn) {
      emailBtn.addEventListener('click', function (event) {
        event.preventDefault();
        handleAction('email');
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      handleAction('email');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    handleThemeToggle();
    initReveal();
    handleContactForm();
  });
})();
