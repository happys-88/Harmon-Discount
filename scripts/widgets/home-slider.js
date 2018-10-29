require([
    'modules/jquery-mozu',
    'bxslider'
], function ($, bxSlider) {
    $('#mz-home-slider .slider').ready(function () {
            $('#mz-home-slider .slider').bxSlider({
                auto: false,
                useCSS: false,
                speed: 1000,
                minSlides: 1,
                maxSlides: 1,
                moveSlides: 1,
                slideMargin: 0,
                infiniteLoop: false,
                controls: true,
                pager: true,
                hideControlOnEnd: true,
                touchEnabled: true,
                onSliderLoad: function () {
                    $(".slider").css("visibility", "visible");
                }
            });
        });
});