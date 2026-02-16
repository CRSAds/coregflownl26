/**
 * ✅ ui-core.js — Gecentraliseerde UI Componenten & Modal Engine
 * Verantwoordelijk voor: Scroll-lock, Modals, Overlays en herbruikbare UI elementen.
 */

(function (window) {
  const UI = {
    modalId: 'global-funnel-modal',
    
    // --- Scroll Management ---
    lockScroll() {
      document.documentElement.classList.add("modal-open");
      document.body.classList.add("modal-open");
    },

    unlockScroll() {
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
    },

    // --- Modal Systeem ---
    initModal() {
      if (document.getElementById(this.modalId)) return;

      const modalHTML = `
        <div id="${this.modalId}" class="global-modal" style="display:none;">
          <div class="modal-overlay"></div>
          <div class="modal-container" role="dialog" aria-modal="true">
            <button class="modal-close" aria-label="Sluiten">×</button>
            <div id="modal-dynamic-content" class="modal-body"></div>
          </div>
        </div>
      `;
      
      const div = document.createElement('div');
      div.innerHTML = modalHTML.trim();
      document.body.appendChild(div.firstChild);

      // Event listeners voor sluiten
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
          this.closeModal();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeModal();
      });
    },

    openModal(contentHtml) {
      this.initModal();
      const body = document.getElementById('modal-dynamic-content');
      if (body) {
        body.innerHTML = contentHtml;
        document.getElementById(this.modalId).style.display = 'flex';
        this.lockScroll();
      }
    },

    closeModal() {
      const modal = document.getElementById(this.modalId);
      if (modal) {
        modal.style.display = 'none';
        this.unlockScroll();
      }
    }
  };

  // Expose aan window object
  window.FunnelUI = UI;

  // Injecteer basis CSS voor modals (High-End styling)
  const style = document.createElement("style");
  style.textContent = `
    .global-modal { position: fixed; inset: 0; display: flex; justify-content: center; align-items: center; z-index: 2147483647; isolation: isolate; font-family: 'Inter', sans-serif; }
    .modal-overlay { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); }
    .modal-container { position: relative; background: #fff; padding: 40px; width: min(94vw, 850px); max-height: 85vh; overflow-y: auto; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); z-index: 2; }
    .modal-close { position: absolute; top: 15px; right: 20px; font-size: 28px; border: none; background: none; cursor: pointer; color: #64748b; transition: color 0.2s; }
    .modal-close:hover { color: #0f172a; }
    .modal-body { color: #334155; line-height: 1.7; font-size: 15px; }
    .modal-body h2 { font-family: 'Montserrat', sans-serif; font-weight: 800; color: #0f172a; margin-top: 0; }
    html.modal-open, body.modal-open { overflow: hidden !important; }
    @media (max-width: 768px) { .modal-container { padding: 25px; border-radius: 12px; } }
  `;
  document.head.appendChild(style);

})(window);
