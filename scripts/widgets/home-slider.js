require([
    'modules/jquery-mozu',
    'bxslider'
], function ($, bxSlider) {
    $('#mz-home-slider .slider').ready(function () {
        $('#mz-home-slider .slider').bxSlider({
            auto: true,
            useCSS: false,
            speed: 1000,
            minSlides: 1,
            maxSlides: 1,
            moveSlides: 1,
            pause: 8000,
            slideMargin: 0,
            infiniteLoop: true,
            controls: true,
            pager: true,
            hideControlOnEnd: true,
            touchEnabled: true,
            adaptiveHeight: true,
            onSliderLoad: function () {
                $(".slider").css("visibility", "visible");
            }
        });
    });
});