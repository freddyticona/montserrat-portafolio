(function () {
    'use strict';

    var AUTHOR = 'TORRES MALL OFICIAL';
    var BASE = 'https://www.tiktok.com/@torresmall_oficial/video/';
    var EMBED_SRC = 'https://www.tiktok.com/embed.js';

    var VIDEOS = [
        { id: '7680963095631580437', label: 'El cierre del mes patrio' },
        { id: '7680403335580552469', label: 'La Paz desde la Torre C' },
        { id: '7679173875095080212', label: 'Maybelline · Colossal Bubble' },
        { id: '7678760207228390676', label: 'Izamal · skin care en La Paz' },
        { id: '7677995191609101589', label: '5 datos de Las Torres Mall' },
        { id: '7676889768877116693', label: 'Quiro · arte e identidad local' },
        { id: '7676608736424774933', label: 'Rifa Solidaria Fe y Alegría' },
        { id: '7675880249170595093', label: 'Best · hasta 50% OFF' },
        { id: '7675529349763845397', label: 'La Auténtica · Combo Patriota' },
        { id: '7675370774198357269', label: 'Kérastase · cabello de salón' },
        { id: '7674654179557707029', label: 'FacePhone · fundas iPhone 17' },
        { id: '7673985464424090901', label: 'Bata · festival de rebajas' },
        { id: '7673219483762232596', label: 'Urban Grill · almuerzo parrillero' },
        { id: '7671283706815958292', label: 'Usaflex · Agosto al costo' },
        { id: '7670229182319725844', label: 'Música en vivo · 5 de agosto' },
        { id: '7668761772135861525', label: 'TIB Bolivia · Embajadora del Turismo' },
        { id: '7668685111130524949', label: 'Ayvanna Ríver · rubores en crema' },
        { id: '7667966520668015893', label: "Wayq'a · inauguración" },
        { id: '7666875558784961813', label: 'Tienda Amiga · cocina de diseño' }
    ];

    var embedLoaded = false;

    function ensureEmbed(onOk, onFail) {
        if (embedLoaded) { onOk(); return; }
        if (document.querySelector('script[src*="embed.js"]')) { embedLoaded = true; onOk(); return; }
        var s = document.createElement('script');
        s.async = true;
        s.src = EMBED_SRC;
        s.onload = function () { embedLoaded = true; onOk(); };
        s.onerror = function () { onFail(); };
        document.body.appendChild(s);
    }

    function buildCard(v) {
        var cite = BASE + v.id;

        var phone = document.createElement('div');
        phone.className = 'ttk-phone';

        var notch = document.createElement('div');
        notch.className = 'ttk-notch';

        var box = document.createElement('div');
        box.className = 'ttk-embed-box';
        box.setAttribute('data-id', v.id);
        box.setAttribute('data-cite', cite);
        box.setAttribute('data-label', v.label);

        var skeleton = document.createElement('div');
        skeleton.className = 'ttk-skeleton';
        var spinner = document.createElement('div');
        spinner.className = 'ttk-spinner';
        var skText = document.createElement('span');
        skText.textContent = 'Cargando TikTok…';
        skeleton.appendChild(spinner);
        skeleton.appendChild(skText);

        var error = document.createElement('div');
        error.className = 'ttk-error';
        error.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        var errText = document.createElement('p');
        errText.textContent = 'Este video ya no está disponible.';
        var errLink = document.createElement('a');
        errLink.className = 'ttk-link';
        errLink.href = cite;
        errLink.target = '_blank';
        errLink.rel = 'noopener';
        errLink.textContent = 'Abrir en TikTok';
        error.appendChild(errText);
        error.appendChild(errLink);

        var screen = document.createElement('div');
        screen.className = 'ttk-screen';
        screen.appendChild(box);
        screen.appendChild(skeleton);
        screen.appendChild(error);
        phone.appendChild(notch);
        phone.appendChild(screen);

        var meta = document.createElement('div');
        meta.className = 'ttk-meta';
        var author = document.createElement('h6');
        author.textContent = v.author || AUTHOR;
        var label = document.createElement('p');
        label.textContent = v.label;
        meta.appendChild(author);
        meta.appendChild(label);

        var card = document.createElement('div');
        card.className = 'ttk-card';
        card.appendChild(phone);
        card.appendChild(meta);

        return card;
    }

    function injectBlockquote(box) {
        var id = box.getAttribute('data-id');
        var cite = box.getAttribute('data-cite');
        var bq = document.createElement('blockquote');
        bq.className = 'tiktok-embed';
        bq.setAttribute('cite', cite);
        bq.setAttribute('data-video-id', id);
        bq.style.maxWidth = '605px';
        bq.style.minWidth = '325px';
        bq.innerHTML = '<section><a target="_blank" rel="noopener" href="' + cite + '">Ver video en TikTok</a></section>';
        box.appendChild(bq);
    }

    function loaded(card) {
        card.classList.add('is-loaded');
    }

    function fail(card) {
        card.classList.add('is-error');
    }

    function watchEmbed(box, card) {
        var tries = 0;
        var retried = false;
        var timer = setInterval(function () {
            var frame = box.querySelector('iframe');
            if (frame) {
                clearInterval(timer);
                frame.addEventListener('load', function () { setTimeout(function () { loaded(card); }, 350); });
                setTimeout(function () { loaded(card); }, 4000);
            } else if (++tries === 10) {
                if (!retried) {
                    // El embed.js ya cargó y no lo procesó: reinsertamos el bloque
                    retried = true;
                    tries = 0;
                    var bq = box.querySelector('blockquote.tiktok-embed');
                    if (bq) { bq.remove(); box.appendChild(bq); }
                }
            } else if (tries > 60) {
                clearInterval(timer);
                fail(card);
            }
        }, 300);
    }

    function initCard(card) {
        if (card.getAttribute('data-init')) return;
        card.setAttribute('data-init', '1');

        var box = card.querySelector('.ttk-embed-box');
        ensureEmbed(function () {
            injectBlockquote(box);
            watchEmbed(box, card);
        }, function () {
            fail(card);
        });
    }

    function init() {
        var grid = document.getElementById('ttkGrid');
        if (!grid) return;

        VIDEOS.forEach(function (v) { grid.appendChild(buildCard(v)); });

        var cards = grid.querySelectorAll('.ttk-card');
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    io.unobserve(entry.target);
                    initCard(entry.target);
                });
            }, { rootMargin: '120px 0px' });
            cards.forEach(function (card) { io.observe(card); });
        } else {
            cards.forEach(function (card) { initCard(card); });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();