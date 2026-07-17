// La Clave Chat - Quick Replies Module
// Detecta cuando el usuario escribe "/" en el campo de mensaje y muestra respuestas rapidas.
(function() {
  'use strict';

  const QUICK_REPLIES = [
    {
      command: '/hola',
      title: 'Saludo inicial',
      text: '¡Hola! 👋 Bienvenido a La Clave Argentina. ¿En qué te podemos ayudar hoy?'
    },
    {
      command: '/planes',
      title: 'Planes disponibles',
      text: 'Estos son nuestros planes de Internet Ilimitado:\n\n• 50 MB - $X\n• 100 MB - $X\n• 200 MB - $X\n• 500 MB - $X\n\n¿Te interesa alguno?'
    },
    {
      command: '/pagar',
      title: 'Datos de pago',
      text: 'Para pagar tu servicio, podés transferir a:\n\n• Alias: laclave.mp\n• CBU: 0000003100010000000000\n• Mercado Pago: @laclave\n\nUna vez hecho, mandame el comprobante por acá.'
    },
    {
      command: '/asesor',
      title: 'Hablar con asesor',
      text: 'En un momento te atiende un asesor humano. Por favor, contame brevemente tu consulta mientras tanto.'
    },
    {
      command: '/gracias',
      title: 'Agradecimiento',
      text: '¡Gracias por contactarte con La Clave Argentina! Cualquier duda, estamos para ayudarte. 🚀'
    },
    {
      command: '/cobertura',
      title: 'Zona de cobertura',
      text: 'Nuestra cobertura incluye Mar del Plata y zona. ¿Me pasás tu dirección para verificar si llegamos a tu zona?'
    }
  ];

  let popupEl = null;
  let currentMatches = [];
  let activeIndex = 0;
  let observerAttached = false;
  let targetInput = null;

  function createPopup() {
    if (popupEl) return popupEl;
    popupEl = document.createElement('div');
    popupEl.id = 'laclav-quickreplies';
    popupEl.setAttribute('role', 'listbox');
    popupEl.innerHTML = `
      <div class="lqr-header">
        <span class="lqr-icon">⚡</span>
        <span class="lqr-title">Respuestas rápidas · La Clave</span>
        <button class="lqr-close" aria-label="Cerrar">×</button>
      </div>
      <div class="lqr-list" role="listbox"></div>
      <div class="lqr-footer">↑↓ navegar · Enter seleccionar · Esc cerrar</div>
    `;
    document.body.appendChild(popupEl);
    popupEl.querySelector('.lqr-close').addEventListener('click', hidePopup);
    return popupEl;
  }

  function renderMatches(matches) {
    if (!popupEl) return;
    const list = popupEl.querySelector('.lqr-list');
    if (matches.length === 0) {
      list.innerHTML = '<div class="lqr-empty">No hay sugerencias. Seguí escribiendo…</div>';
      return;
    }
    list.innerHTML = matches.map((r, i) => `
      <div class="lqr-item ${i === activeIndex ? 'active' : ''}" role="option" data-index="${i}">
        <div class="lqr-cmd">${escapeHtml(r.command)}</div>
        <div class="lqr-sub">${escapeHtml(r.title)}</div>
      </div>
    `).join('');
    list.querySelectorAll('.lqr-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.index, 10);
        selectReply(matches[idx]);
      });
      el.addEventListener('mouseenter', () => {
        activeIndex = parseInt(el.dataset.index, 10);
        renderMatches(currentMatches);
      });
    });
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function showPopup(query) {
    currentMatches = QUICK_REPLIES.filter(r =>
      r.command.toLowerCase().startsWith(query.toLowerCase())
    );
    activeIndex = 0;
    createPopup();
    renderMatches(currentMatches);
    if (targetInput) {
      const rect = targetInput.getBoundingClientRect();
      popupEl.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
      popupEl.style.left = Math.max(8, rect.left) + 'px';
      popupEl.style.width = Math.min(rect.width, 380) + 'px';
    }
    popupEl.classList.add('visible');
  }

  function hidePopup() {
    if (popupEl) popupEl.classList.remove('visible');
  }

  function selectReply(reply) {
    if (!targetInput) return;
    // Set the input value to the full message text
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    ).set;
    nativeSetter.call(targetInput, reply.text);
    targetInput.dispatchEvent(new Event('input', { bubbles: true }));
    targetInput.dispatchEvent(new Event('change', { bubbles: true }));
    targetInput.focus();
    targetInput.setSelectionRange(reply.text.length, reply.text.length);
    hidePopup();
  }

  function findInputField() {
    return document.querySelector('.input-message-input[contenteditable="true"]') ||
           document.querySelector('div[contenteditable="true"][data-peer-id], div[contenteditable="true"]');
  }

  function attachToInput(input) {
    if (observerAttached && targetInput === input) return;
    targetInput = input;
    observerAttached = true;

    let lastValue = '';

    input.addEventListener('input', () => {
      const text = (input.innerText || input.textContent || '').trim();
      if (text !== lastValue) {
        lastValue = text;
        if (text.startsWith('/') && text.length > 0) {
          // Find longest match
          const query = text.split(' ')[0];
          showPopup(query);
        } else {
          hidePopup();
        }
      }
    });

    input.addEventListener('keydown', (e) => {
      if (!popupEl || !popupEl.classList.contains('visible')) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, currentMatches.length - 1);
        renderMatches(currentMatches);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        renderMatches(currentMatches);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        if (currentMatches.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          selectReply(currentMatches[activeIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        hidePopup();
      }
    }, true);
  }

  // Polling for the input (Telegram dynamically renders the chat UI)
  function watchForInput() {
    const check = () => {
      const input = findInputField();
      if (input && input !== targetInput) {
        attachToInput(input);
      }
    };
    check();
    setInterval(check, 1500);
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchForInput);
  } else {
    watchForInput();
  }
})();
