$(function () {
    var isMp4 = function (src) {
        return src && /\.mp4$/i.test(src);
    };

    var tiktokId = function (src) {
        if (!src || !/tiktok\.com/i.test(src)) return null;
        var m = src.match(/tiktok\.com\/@[^\/]+\/video\/(\d{10,25})/i);
        if (!m) m = src.match(/(\d{15,25})(?:[?&#]|$)/i);
        return m ? m[1] : null;
    };

    function createMp4Player(src, title) {
        return $('<video>', {
            src: src,
            title: title,
            controls: 'controls',
            autoplay: 'autoplay',
            playsinline: 'playsinline',
            preload: 'auto',
            style: 'width:100%;height:100%;background-color:#000;',
            class: 'video-iframe'
        });
    }

    // Miniatura oficial de cada TikTok (miniaturas únicas en el grid)
    var thumbs = window.TIKTOK_THUMBS || {};
    $('.video-container[data-url]').each(function () {
        var $c = $(this), id = tiktokId($c.data('url'));
        if (id && thumbs[id]) $c.css('background-image', 'url(' + thumbs[id] + ')');
    });

    $('.video-container[data-url]').each(function () {
        var $c = $(this), src = $c.data('url'), title = $c.data('title');
        var id = tiktokId(src), isT = !!id;

        // Tarjetas sin video en línea: "Próximamente en TikTok"
        if ($c.attr('data-coming') === '1') {
            $('<span>', { class: 'coming-tag', text: 'Próximamente en TikTok' }).appendTo($c);
            return;
        }

        var $preview = null, leaveTimer = null;

        if (isT) {
            $('<div>', { class: 'tiktok-layer' }).appendTo($c).on('click', function () {
                window.open(src, '_blank', 'noopener');
            });
        }

        function makePreview() {
            if (isT) {
                return $('<iframe>', {
                    src: 'https://www.tiktok.com/embed/v2/' + id + '?autoplay=1',
                    frameborder: 0,
                    title: title,
                    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
                    class: 'video-preview'
                });
            }
            return $('<video>', {
                src: src,
                muted: 'muted',
                loop: 'loop',
                autoplay: 'autoplay',
                playsinline: 'playsinline',
                preload: 'metadata',
                style: 'width:100%;height:100%;object-fit:cover;background:#000;',
                class: 'video-preview'
            });
        }

        $c.on('mouseenter focusin', function () {
            clearTimeout(leaveTimer);
            if ($c.find('.video-iframe').length) return;
            if (!$preview) $preview = makePreview().appendTo($c);
            $c.find('.img-overlay').css('opacity', isT ? 0.35 : 0.55);
        });

        $c.on('mouseleave', function () {
            leaveTimer = setTimeout(function () {
                if ($preview && !$c.find('.video-iframe').length) $preview.remove();
                $preview = null;
                $c.find('.img-overlay').css('opacity', '');
            }, isT ? 3000 : 250);
        });

        if (!isT) {
            $c.on('click', function () {
                if ($c.find('.video-iframe').length) return;
                $c.find('.img-overlay, .play-wrapper, .poster-video, .video-preview').remove();
                $c.find('.poster-caption').addClass('d-none');
                $c.append(createMp4Player(src, title));
            });
        }
    });

    // Primer frame real como miniatura de los MP4 locales
    $('.video-container[data-url]').each(function () {
        var $c = $(this), src = $c.data('url');
        if (!isMp4(src)) return;

        var video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.className = 'poster-video';
        video.disablePictureInPicture = true;
        video.src = src;

        video.addEventListener('loadedmetadata', function () {
            var seek = Math.min(1, (video.duration || 4) * 0.15);
            try { video.currentTime = seek; } catch (e) {}
        });

        $c.prepend(video);
    });
});