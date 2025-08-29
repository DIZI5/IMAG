/**
 * Flash Toasts - повідомлення справа зверху
 * Показує стек повідомлень і ховає їх автоматично.
 * - Кожен .toast може мати data-lifetime (мс), дефолт 3000.
 * - Коли усі тости зникли, контейнер видаляється.
 */
(function (window, document) {
    'use strict';

    function initToasts() {
        var root = document.getElementById('toast-root');
        if (!root) return;

        var toasts = Array.prototype.slice.call(root.querySelectorAll('.toast'));
        if (!toasts.length) return;

        toasts.forEach(function (toast, index) {
            // showBrowserNotification(toast); // ВИДАЛЕНО

            var life = parseInt(toast.getAttribute('data-lifetime') || '3000', 10);
            var stagger = index * 150; // легка драбинка, щоб не мигало синхронно

            setTimeout(function () {
                toast.classList.add('hide');
                // прибираємо елемент після анімації
                setTimeout(function () {
                    toast.remove();
                    if (!root.children.length) {
                        root.remove();
                    }
                }, 240);
            }, life + stagger);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initToasts);
    } else {
        initToasts();
    }
})(window, document);