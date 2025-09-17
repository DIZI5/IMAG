/**
 * Sum Footer (поліпшена версія)
 * - парсить числа у форматах "1234.56", "1.234,56", "1 234,56", "€ 1 234,56" тощо
 * - рахує тільки рядки з класом "sub-row" (рядки продуктів)
 * - не перезаписує серверну суму, якщо парсинг не вдався
 */
(function (window, document) {
    'use strict';

    var TBODY_SELECTOR = '.table-production tbody';
    var COL_QTY_INDEX = 7;   // 0-based: 8-ма колонка "Кількість"
    var COL_PRICE_INDEX = 8; // 0-based: 9-та колонка "Ціна"

    // Чистий парсер грошей: враховує крапку як thousands/dot або decimal,
    // кому як decimal; видаляє групові роздільники.
    function parseMoney(text) {
        if (!text) return NaN;
        var s = String(text).trim();

        // видаляємо валютні символи та непотрібні букви
        s = s.replace(/[^0-9,.\-\u00A0\s]/g, ''); // залишаємо цифри, крапку, кому, дефіс і пробіли/NBSP

        // нормалізуємо пробіли (звичайні і NBSP)
        s = s.replace(/[\u00A0\s]+/g, '');

        // Якщо є і крапка, і кома — припускаємо, що крапка = thousands, кома = decimal
        if (s.indexOf('.') !== -1 && s.indexOf(',') !== -1) {
            s = s.replace(/\./g, '');    // видаляємо thousands dots
            s = s.replace(/,/g, '.');    // кома -> десяткова крапка
        } else if (s.indexOf(',') !== -1 && s.indexOf('.') === -1) {
            // лише кома — приймаємо як десяткову
            s = s.replace(/,/g, '.');
        } else {
            // лише крапка або ні — залишаємо як є
        }

        var v = parseFloat(s);
        return isNaN(v) ? NaN : v;
    }

    function onlyVisible(row) {
        return !!(row.offsetParent !== null);
    }

    function computeSums() {
        var tbody = document.querySelector(TBODY_SELECTOR);
        if (!tbody) return { sumPrice: 0, sumTotal: 0, productRowCount: 0 };

        // Беремо лише рядки продуктів — у шаблоні вони мають class="sub-row"
        var allRows = Array.prototype.slice.call(tbody.rows).filter(onlyVisible);
        var productRows = allRows.filter(function (r) {
            return r.classList && r.classList.contains('sub-row');
        });

        var sumPrice = 0;
        var sumTotal = 0;
        var productRowCount = productRows.length;

        productRows.forEach(function (tr) {
            var priceCell = tr.cells[COL_PRICE_INDEX];
            var qtyCell = tr.cells[COL_QTY_INDEX];

            if (!priceCell) return;

            var price = parseMoney(priceCell.textContent || priceCell.innerText);
            if (!isNaN(price)) {
                sumPrice += price;
            }

            var qty = NaN;
            if (qtyCell) {
                // простіший парсинг кількості (ціль — отримати число)
                var qtxt = String(qtyCell.textContent || qtyCell.innerText).trim().replace(/[^\d.\-\,]/g, '');
                qtxt = qtxt.replace(',', '.');
                qty = parseFloat(qtxt);
            }
            if (!isNaN(price) && !isNaN(qty)) {
                sumTotal += price * qty;
            }
        });

        return { sumPrice: sumPrice, sumTotal: sumTotal, productRowCount: productRowCount };
    }

    function formatEUR(value) {
        try {
            return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value || 0);
        } catch (e) {
            return '€' + (Math.round((value || 0) * 100) / 100).toLocaleString('uk-UA');
        }
    }

    function renderSums() {
        var sums = computeSums();
        var priceEl = document.getElementById('sum-price');
        var totalEl = document.getElementById('sum-total');

        // Якщо немає рядків продуктів — показуємо 0 (логічно)
        if (sums.productRowCount === 0) {
            if (priceEl) priceEl.textContent = formatEUR(0);
            if (totalEl) totalEl.textContent = formatEUR(0);
            return;
        }

        // Якщо є продуктні рядки але сума = 0 => ймовірно помилка парсингу => не перезаписуємо серверну суму
        var suspiciousZero = (sums.sumPrice === 0 && sums.productRowCount > 0);

        if (priceEl && !suspiciousZero) priceEl.textContent = formatEUR(sums.sumPrice);
        if (totalEl && !suspiciousZero) totalEl.textContent = formatEUR(sums.sumTotal);
    }

    // Debounce
    function debounce(fn, delay) {
        var t = null;
        return function () {
            clearTimeout(t);
            var args = arguments, ctx = this;
            t = setTimeout(function () { fn.apply(ctx, args); }, delay);
        };
    }

    function initSumFooter() {
        var table = document.querySelector('.table-production');
        if (!table) return;

        var debouncedRender = debounce(renderSums, 120);

        // initial render
        renderSums();

        window.addEventListener('load', renderSums);
        window.addEventListener('resize', debouncedRender);
        window.addEventListener('pageshow', renderSums);
        window.addEventListener('orientationchange', debouncedRender);

        if ('MutationObserver' in window) {
            var mo = new MutationObserver(debouncedRender);
            mo.observe(table, { childList: true, subtree: true, characterData: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSumFooter);
    } else {
        initSumFooter();
    }
})(window, document);