/**
 * Tooltip Truncation
 * Показує тултіп над клітинкою таблиці лише коли текст реально обрізано.
 * - додає клас .trunc до <td class="cell-clip"> якщо її .cell-text не влазить;
 * - працює на завантаженні, ресайзі, зміні орієнтації й при зміні DOM (MutationObserver).
 */
(function (window, document) {
  'use strict';

  const SELECTOR = 'td.cell-clip .cell-text';

  /** debounce utility */
  function debounce(fn, delay) {
    let t = null;
    return function debounced() {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, arguments), delay);
    };
  }

  /** чи обрізано текст (із запасом в 1px на похибки рендерингу) */
  function isTruncated(el) {
    return (el.scrollWidth - el.clientWidth) > 1;
  }

  /** основна розмітка клітинок */
  function markTruncatedCells() {
    const nodes = document.querySelectorAll(SELECTOR);
    nodes.forEach((el) => {
      const td = el.closest('td.cell-clip');
      if (!td) return;

      const hasText = (el.textContent || '').trim().length > 0;
      const truncated = isTruncated(el);

      td.classList.toggle('trunc', hasText && truncated);
    });
  }

  const markTruncatedCellsDebounced = debounce(markTruncatedCells, 120);

  /** спостерігаємо за таблицею — на випадок, якщо рядки додаються/редагуються */
  function observeTable() {
    const table = document.querySelector('.table-production');
    if (!table || !('MutationObserver' in window)) return;

    const mo = new MutationObserver(markTruncatedCellsDebounced);
    mo.observe(table, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  /** публічний API (можна викликати вручну: window.IMAG.Tooltips.rerun()) */
  window.IMAG = window.IMAG || {};
  window.IMAG.Tooltips = {
    init() {
      markTruncatedCells();
      observeTable();

      // події середовища
      window.addEventListener('resize', markTruncatedCellsDebounced, { passive: true });
      window.addEventListener('orientationchange', markTruncatedCellsDebounced, { passive: true });
      window.addEventListener('load', markTruncatedCells);
      // pageshow для навігації back/forward з cache
      window.addEventListener('pageshow', markTruncatedCells);
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