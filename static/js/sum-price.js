/**
 * Sum Footer
 * Рахує:
 *  - ∑ ціна (колонка 9)
 *  - ∑ (ціна × кількість) (опційно)
 * Працює на завантаженні, ресайзі і при змінах у таблиці (MutationObserver).
 */
(function (window, document) {
    'use strict';

    var TABLE_SELECTOR = '.table-production';
    var TBODY_SELECTOR = '.table-production tbody';
    var COL_QTY_INDEX = 7;   // 0-based: 8-ма колонка "Кількість"
    var COL_PRICE_INDEX = 8; // 0-based: 9-та колонка "Ціна"

    function parseMoney(text) {
        if (!text) return NaN;
        // забираємо пробіли, валюти і перетворюємо кому в крапку
        var clean = String(text)
            .replace(/[^\d,.\-]+/g, '')   // лишаємо цифри, крапку, кому, -
            .replace(/\s+/g, '')
            .replace(',', '.');
        var val = parseFloat(clean);
        return isNaN(val) ? NaN : val;
    }

    function onlyVisible(row) {
        // ігноруємо приховані рядки (на випадок фільтрів)
        return !!(row.offsetParent !== null);
    }

    function formatEUR(value) {
        try {
            return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value || 0);
        } catch(e) {
            return '€' + (Math.round((value || 0) * 100) / 100).toLocaleString('uk-UA');
        }
    }

    function computeSums() {
        var tbody = document.querySelector(TBODY_SELECTOR);
        if (!tbody) return { sumPrice: 0, sumTotal: 0 };

        var rows = Array.prototype.slice.call(tbody.rows).filter(onlyVisible);

        var sumPrice = 0;
        var sumTotal = 0;

        rows.forEach(function (tr) {
            var priceCell = tr.cells[COL_PRICE_INDEX];
            var qtyCell = tr.cells[COL_QTY_INDEX];

            if (!priceCell) return;

            var price = parseMoney(priceCell.textContent);
            if (!isNaN(price)) {
                sumPrice += price;
            }

            var qty = qtyCell ? parseFloat(String(qtyCell.textContent).replace(/[^\d.\-]/g, '')) : NaN;
            if (!isNaN(price) && !isNaN(qty)) {
                sumTotal += price * qty;
            }
        });

        return { sumPrice: sumPrice, sumTotal: sumTotal };
    }

    function renderSums() {
        var sums = computeSums();
        var priceEl = document.getElementById('sum-price');
        var totalEl = document.getElementById('sum-total'); // може бути відсутній

        if (priceEl) priceEl.textContent = formatEUR(sums.sumPrice);
        if (totalEl) totalEl.textContent = formatEUR(sums.sumTotal);
    }

    // Debounce утиліта
    function debounce(fn, delay) {
        var t = null;
        return function () {
            clearTimeout(t);
            var args = arguments, ctx = this;
            t = setTimeout(function(){ fn.apply(ctx, args); }, delay);
        };
    }

    function initSumFooter() {
        var table = document.querySelector(TABLE_SELECTOR);
        if (!table) return;

        var debouncedRender = debounce(renderSums, 120);

        // первинний рендер
        renderSums();

        // слухачі середовища
        window.addEventListener('load', renderSums);
        window.addEventListener('resize', debouncedRender);
        window.addEventListener('pageshow', renderSums);
        window.addEventListener('orientationchange', debouncedRender);

        // слідкуємо за змінами у таблиці (додавання/видалення/редагування рядків)
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