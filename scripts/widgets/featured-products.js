define([
    'modules/jquery-mozu',
    'bxslider'
],
    function ($, bxSlider) {
            var slider;
            var slide = {
                productCarousel: function () {
                    var minSlides,
                        maxSlides,
                        slideWidth,
                        slideMargin,
                        pager,
                        controls,
                        windowWidth = $(window).width();
                    if (windowWidth >= 480 || windowWidth <= 767) {
                        minSlides = 2;
                        maxSlides = 2;
                        slideMargin = 0;
                        slideWidth = 400;
                        pager = false;
                        controls = true;

                    }
                    if (windowWidth > 767) {
                        minSlides = 6;
                        maxSlides = 12;
                        slideWidth = 400;
                        slideMargin = 0;
                        pager = false;
                        controls = true;
                    }
                    slider = $(".mz-featured-products .mz-productlist-list").bxSlider({
                        auto: false,
                        speed: 600,
                        minSlides: minSlides,
                        maxSlides: maxSlides,
                        slideWidth: slideWidth,
                        moveSlides: 1,
                        slideMargin: slideMargin,
                        pager: pager,
                        controls: controls,
                        infiniteLoop: false,
                        touchEnabled: true,
                        stopAutoOnClick: true,
                        preloadImages: "all",
                        onSliderLoad: function () {
                            $(".slider").css("visibility", "visible");
                        }
                    });
                    window.slider = slider;
                }
            };
            slide.productCarousel();
            $(window).resize(function () {
                slider.destroySlider();
                slide.productCarousel();
            });
    });