/**
 * Tooltip Truncation w/ Instant Switch
 * - показує тултіп лише для обрізаних клітинок;
 * - зберігає перенесення рядків (CSS: pre-wrap);
 * - при переході на іншу клітинку — попередній тултіп закривається,
 *   новий відкривається БЕЗ затримки;
 * - перший показ має невеликий hold (щоб не блимало).
 */
(function (window, document) {
  'use strict';

  const SELECTOR_TEXT = 'td.cell-clip .cell-text';
  const SHOW_HOLD_MS  = 400;   // перший показ (коли жоден не відкритий). Змени на 0, якщо взагалі не хочеш холду.

  let openCell   = null;       // поточна відкрита клітинка

  /* ---------- helpers ---------- */
  const debounce = (fn, delay) => {
    let t = null; return function () { clearTimeout(t); t = setTimeout(() => fn.apply(this, arguments), delay); };
  };

  function isTruncated(el) {
    return (el.scrollWidth - el.clientWidth) > 1; // запас 1px
  }

  function setShowTimer(td, cb, delay) {
    clearShowTimer(td);
    td._showTimer = window.setTimeout(cb, delay);
  }
  function clearShowTimer(td) {
    if (td && td._showTimer) { clearTimeout(td._showTimer); td._showTimer = 0; }
  }

  /* ---------- open/close ---------- */
  function openTooltip(td) {
    if (openCell && openCell !== td) {
      // миттєво закриваємо попередній без пауз
      closeTooltip(openCell);
    }
    td.classList.add('open');
    openCell = td;
  }

  function closeTooltip(td) {
    td.classList.remove('open');
    if (openCell === td) openCell = null;
  }

  /* ---------- bind handlers ---------- */
  function bindHandlers(td) {
    if (td.dataset.bound === '1') return;
    td.dataset.bound = '1';

    td.addEventListener('mouseenter', () => {
      if (!td.classList.contains('trunc')) return;

      // якщо вже є відкритий тултіп і ми переходимо на інший — відкриваємо миттєво
      if (openCell && openCell !== td) {
        clearShowTimer(td);
        openTooltip(td); // без затримки
        return;
      }

      // якщо нічого не відкрито — невеликий холд для першого показу
      setShowTimer(td, () => {
        if (td.classList.contains('trunc') && td.matches(':hover')) {
          openTooltip(td);
        }
      }, SHOW_HOLD_MS);
    });

    td.addEventListener('mouseleave', () => {
      clearShowTimer(td);
      if (td.classList.contains('open')) {
        closeTooltip(td);
      }
    });

    // клік/тач — вручну відкрити/закрити (опційно)
    td.addEventListener('click', () => {
      if (!td.classList.contains('trunc')) return;
      if (td.classList.contains('open')) closeTooltip(td);
      else openTooltip(td);
    });
  }

  /* ---------- mark truncated ---------- */
  function markTruncatedCells() {
    const nodes = document.querySelectorAll(SELECTOR_TEXT);
    nodes.forEach((el) => {
      const td = el.closest('td.cell-clip');
      if (!td) return;

      const hasText   = (el.textContent || '').trim().length > 0;
      const truncated = isTruncated(el);

      td.classList.toggle('trunc', hasText && truncated);
      bindHandlers(td);
    });
  }
  const markTruncatedCellsDebounced = debounce(markTruncatedCells, 120);

  /* ---------- observe table ---------- */
  function observeTable() {
    const table = document.querySelector('.table-production');
    if (!table || !('MutationObserver' in window)) return;

    const mo = new MutationObserver(markTruncatedCellsDebounced);
    mo.observe(table, { childList: true, subtree: true, characterData: true });
  }

  /* ---------- public API ---------- */
  window.IMAG = window.IMAG || {};
  window.IMAG.Tooltips = {
    init() {
      markTruncatedCells();
      observeTable();

      window.addEventListener('resize', markTruncatedCellsDebounced, { passive: true });
      window.addEventListener('orientationchange', markTruncatedCellsDebounced, { passive: true });
      window.addEventListener('load', markTruncatedCells);
      window.addEventListener('pageshow', markTruncatedCells);

      // закрити, якщо клік поза активною клітинкою
      document.addEventListener('pointerdown', (e) => {
        if (!openCell) return;
        if (e.target && openCell.contains(e.target)) return;
        closeTooltip(openCell);
      });
    },
    rerun: markTruncatedCells
  };

  // автоініціалізація
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.IMAG.Tooltips.init());
  } else {
    window.IMAG.Tooltips.init();
  }
})(window, document);