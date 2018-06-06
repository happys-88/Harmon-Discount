
define('modules/views-productimages',['modules/jquery-mozu', 'underscore', "modules/backbone-mozu", 'hyprlive', "hyprlivecontext"], function($, _, Backbone, Hypr, HyprLiveContext) {

    var width_thumb = HyprLiveContext.locals.themeSettings.maxProductImageThumbnailSize;
    var width_pdp = HyprLiveContext.locals.themeSettings.productImagePdpMaxWidth;
    var width_zoom = HyprLiveContext.locals.themeSettings.productZoomImageMaxWidth;

    //using GET request CheckImage function checks whether an image exist or not
    var checkImage = function(imagepath, callback) {
        $.get(imagepath).done(function() {
            callback(true); //return true if image exist
        }).error(function() {
            callback(false);
        });
    };

    var ProductPageImagesView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-images',
        events: {
            'mouseenter [data-mz-productimage-thumb]': 'onMouseEnterChangeThumbImage',
            'mouseleave [data-mz-productimage-thumb]': 'onMouseLeaveResetThumbImage',
            'click [data-mz-productimage-thumb]': 'switchImage'
        },
        initialize: function() {
            // preload images
            var imageCache = this.imageCache = {},
                cacheKey = Hypr.engine.options.locals.siteContext.generalSettings.cdnCacheBustKey;
            _.each(this.model.get('content').get('productImages'), function(img) {
                var i = new Image();
                i.src = img.imageUrl + '?maxWidth=' + Hypr.getThemeSetting('productImagePdpMaxWidth') + '&_mzCb=' + cacheKey;
                i.zoomsrc = img.imageUrl + '?maxWidth=' + Hypr.getThemeSetting('productZoomImageMaxWidth') + '&_mzCb=' + cacheKey;
                if (img.altText) {
                    i.alt = img.altText;
                }
                imageCache[img.sequence.toString()] = i;
            });
        },
        onMouseEnterChangeThumbImage: function(_e){
            var img_url = $(_e.currentTarget).find('img').attr('src');
            img_url = img_url.replace('maxWidth='+width_thumb, 'maxWidth='+width_pdp);
            this.mainImage = $('.mz-productimages-mainimage').attr('src');
            var videoId = require.mozuData('Video_Id');
            if(videoId){
                if($(_e.currentTarget).attr('data-label')===videoId.stringValue+'.jpg'){
                    $("#videoOverlay").addClass("video-overlay");
                    $("#playButton").addClass("play-button-main");
                }
            }
            checkImage(img_url, function(response) {
                if (response) {
                    $('.mz-productimages-mainimage').attr('src', img_url);
                }
            });
        },
        onMouseLeaveResetThumbImage: function(_e){
            var img_url = $('.mz-productimages-mainimage').data('zoom-image').replace('maxWidth='+width_zoom, 'maxWidth='+width_pdp);
            var videoId = require.mozuData('Video_Id');
            if(videoId){
                if($(_e.currentTarget).attr('data-label')===videoId.stringValue+'.jpg'){
                    $("#videoOverlay").removeClass("video-overlay");
                    $("#playButton").removeClass("play-button-main");
                }
            }
            checkImage(img_url, function(response) {
                if (response) {
                    $('.mz-productimages-mainimage').attr('src', img_url);
                }
            });
        },
        switchImage: function(e) {
            $(e.currentTarget).parents("ul").find("li").removeClass("active");
            $(e.currentTarget).addClass("active");
            var $thumb = $(e.currentTarget).find('img');
            this.selectedMainImageSrc = $thumb.attr('src');
            this.selectedMainImageAltText = $thumb.attr('alt');
            this.updateMainImage();
            return false;
        },
        updateMainImage: function() {
            var self = this;
            if (!$('#zoom').length) {
                $('.mz-productimages-main').html('<img class="mz-productimages-mainimage" data-mz-productimage-main="" id="zoom" itemprop="image">');
            }
            checkImage(this.selectedMainImageSrc.replace('maxWidth='+width_thumb, 'maxWidth=' + Hypr.getThemeSetting('productImagePdpMaxWidth')), function(response) {
                if (response) {
                    self.$('#zoom')
                        .prop('src', self.selectedMainImageSrc.replace('maxWidth='+width_thumb, 'maxWidth=' + Hypr.getThemeSetting('productImagePdpMaxWidth')))
                        .prop('alt', self.selectedMainImageAltText);
                    $('.zoomContainer').remove();
                    $('#zoom').removeData('elevateZoom').data('zoom-image', self.selectedMainImageSrc.replace('maxWidth='+width_thumb, 'maxWidth=' + Hypr.getThemeSetting('productZoomImageMaxWidth'))).elevateZoom({ zoomType: "inner", cursor: "crosshair", responsive: true });
                 }
            });
        },
        render: function() {
            //Backbone.MozuView.prototype.render.apply(this, arguments);
            //this.updateMainImage();
        }
    });


    return {
        ProductPageImagesView: ProductPageImagesView
    };

});
!function(i){"function"==typeof define&&define.amd?define('slick',["jquery"],i):"undefined"!=typeof exports?module.exports=i(require("jquery")):i(jQuery)}(function(i){var e=window.Slick||{};(e=function(){var e=0;return function(t,o){var s,n=this;n.defaults={accessibility:!0,adaptiveHeight:!1,appendArrows:i(t),appendDots:i(t),arrows:!0,asNavFor:null,prevArrow:'<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',nextArrow:'<button class="slick-next" aria-label="Next" type="button">Next</button>',autoplay:!1,autoplaySpeed:3e3,centerMode:!1,centerPadding:"50px",cssEase:"ease",customPaging:function(e,t){return i('<button type="button" />').text(t+1)},dots:!1,dotsClass:"slick-dots",draggable:!0,easing:"linear",edgeFriction:.35,fade:!1,focusOnSelect:!1,focusOnChange:!1,infinite:!0,initialSlide:0,lazyLoad:"ondemand",mobileFirst:!1,pauseOnHover:!0,pauseOnFocus:!0,pauseOnDotsHover:!1,respondTo:"window",responsive:null,rows:1,rtl:!1,slide:"",slidesPerRow:1,slidesToShow:1,slidesToScroll:1,speed:500,swipe:!0,swipeToSlide:!1,touchMove:!0,touchThreshold:5,useCSS:!0,useTransform:!0,variableWidth:!1,vertical:!1,verticalSwiping:!1,waitForAnimate:!0,zIndex:1e3},n.initials={animating:!1,dragging:!1,autoPlayTimer:null,currentDirection:0,currentLeft:null,currentSlide:0,direction:1,$dots:null,listWidth:null,listHeight:null,loadIndex:0,$nextArrow:null,$prevArrow:null,scrolling:!1,slideCount:null,slideWidth:null,$slideTrack:null,$slides:null,sliding:!1,slideOffset:0,swipeLeft:null,swiping:!1,$list:null,touchObject:{},transformsEnabled:!1,unslicked:!1},i.extend(n,n.initials),n.activeBreakpoint=null,n.animType=null,n.animProp=null,n.breakpoints=[],n.breakpointSettings=[],n.cssTransitions=!1,n.focussed=!1,n.interrupted=!1,n.hidden="hidden",n.paused=!0,n.positionProp=null,n.respondTo=null,n.rowCount=1,n.shouldClick=!0,n.$slider=i(t),n.$slidesCache=null,n.transformType=null,n.transitionType=null,n.visibilityChange="visibilitychange",n.windowWidth=0,n.windowTimer=null,s=i(t).data("slick")||{},n.options=i.extend({},n.defaults,o,s),n.currentSlide=n.options.initialSlide,n.originalSettings=n.options,void 0!==document.mozHidden?(n.hidden="mozHidden",n.visibilityChange="mozvisibilitychange"):void 0!==document.webkitHidden&&(n.hidden="webkitHidden",n.visibilityChange="webkitvisibilitychange"),n.autoPlay=i.proxy(n.autoPlay,n),n.autoPlayClear=i.proxy(n.autoPlayClear,n),n.autoPlayIterator=i.proxy(n.autoPlayIterator,n),n.changeSlide=i.proxy(n.changeSlide,n),n.clickHandler=i.proxy(n.clickHandler,n),n.selectHandler=i.proxy(n.selectHandler,n),n.setPosition=i.proxy(n.setPosition,n),n.swipeHandler=i.proxy(n.swipeHandler,n),n.dragHandler=i.proxy(n.dragHandler,n),n.keyHandler=i.proxy(n.keyHandler,n),n.instanceUid=e++,n.htmlExpr=/^(?:\s*(<[\w\W]+>)[^>]*)$/,n.registerBreakpoints(),n.init(!0)}}()).prototype.activateADA=function(){this.$slideTrack.find(".slick-active").attr({"aria-hidden":"false"}).find("a, input, button, select").attr({tabindex:"0"})},e.prototype.addSlide=e.prototype.slickAdd=function(e,t,o){var s=this;if("boolean"==typeof t)o=t,t=null;else if(t<0||t>=s.slideCount)return!1;s.unload(),"number"==typeof t?0===t&&0===s.$slides.length?i(e).appendTo(s.$slideTrack):o?i(e).insertBefore(s.$slides.eq(t)):i(e).insertAfter(s.$slides.eq(t)):!0===o?i(e).prependTo(s.$slideTrack):i(e).appendTo(s.$slideTrack),s.$slides=s.$slideTrack.children(this.options.slide),s.$slideTrack.children(this.options.slide).detach(),s.$slideTrack.append(s.$slides),s.$slides.each(function(e,t){i(t).attr("data-slick-index",e)}),s.$slidesCache=s.$slides,s.reinit()},e.prototype.animateHeight=function(){var i=this;if(1===i.options.slidesToShow&&!0===i.options.adaptiveHeight&&!1===i.options.vertical){var e=i.$slides.eq(i.currentSlide).outerHeight(!0);i.$list.animate({height:e},i.options.speed)}},e.prototype.animateSlide=function(e,t){var o={},s=this;s.animateHeight(),!0===s.options.rtl&&!1===s.options.vertical&&(e=-e),!1===s.transformsEnabled?!1===s.options.vertical?s.$slideTrack.animate({left:e},s.options.speed,s.options.easing,t):s.$slideTrack.animate({top:e},s.options.speed,s.options.easing,t):!1===s.cssTransitions?(!0===s.options.rtl&&(s.currentLeft=-s.currentLeft),i({animStart:s.currentLeft}).animate({animStart:e},{duration:s.options.speed,easing:s.options.easing,step:function(i){i=Math.ceil(i),!1===s.options.vertical?(o[s.animType]="translate("+i+"px, 0px)",s.$slideTrack.css(o)):(o[s.animType]="translate(0px,"+i+"px)",s.$slideTrack.css(o))},complete:function(){t&&t.call()}})):(s.applyTransition(),e=Math.ceil(e),!1===s.options.vertical?o[s.animType]="translate3d("+e+"px, 0px, 0px)":o[s.animType]="translate3d(0px,"+e+"px, 0px)",s.$slideTrack.css(o),t&&setTimeout(function(){s.disableTransition(),t.call()},s.options.speed))},e.prototype.getNavTarget=function(){var e=this,t=e.options.asNavFor;return t&&null!==t&&(t=i(t).not(e.$slider)),t},e.prototype.asNavFor=function(e){var t=this.getNavTarget();null!==t&&"object"==typeof t&&t.each(function(){var t=i(this).slick("getSlick");t.unslicked||t.slideHandler(e,!0)})},e.prototype.applyTransition=function(i){var e=this,t={};!1===e.options.fade?t[e.transitionType]=e.transformType+" "+e.options.speed+"ms "+e.options.cssEase:t[e.transitionType]="opacity "+e.options.speed+"ms "+e.options.cssEase,!1===e.options.fade?e.$slideTrack.css(t):e.$slides.eq(i).css(t)},e.prototype.autoPlay=function(){var i=this;i.autoPlayClear(),i.slideCount>i.options.slidesToShow&&(i.autoPlayTimer=setInterval(i.autoPlayIterator,i.options.autoplaySpeed))},e.prototype.autoPlayClear=function(){var i=this;i.autoPlayTimer&&clearInterval(i.autoPlayTimer)},e.prototype.autoPlayIterator=function(){var i=this,e=i.currentSlide+i.options.slidesToScroll;i.paused||i.interrupted||i.focussed||(!1===i.options.infinite&&(1===i.direction&&i.currentSlide+1===i.slideCount-1?i.direction=0:0===i.direction&&(e=i.currentSlide-i.options.slidesToScroll,i.currentSlide-1==0&&(i.direction=1))),i.slideHandler(e))},e.prototype.buildArrows=function(){var e=this;!0===e.options.arrows&&(e.$prevArrow=i(e.options.prevArrow).addClass("slick-arrow"),e.$nextArrow=i(e.options.nextArrow).addClass("slick-arrow"),e.slideCount>e.options.slidesToShow?(e.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),e.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),e.htmlExpr.test(e.options.prevArrow)&&e.$prevArrow.prependTo(e.options.appendArrows),e.htmlExpr.test(e.options.nextArrow)&&e.$nextArrow.appendTo(e.options.appendArrows),!0!==e.options.infinite&&e.$prevArrow.addClass("slick-disabled").attr("aria-disabled","true")):e.$prevArrow.add(e.$nextArrow).addClass("slick-hidden").attr({"aria-disabled":"true",tabindex:"-1"}))},e.prototype.buildDots=function(){var e,t,o=this;if(!0===o.options.dots){for(o.$slider.addClass("slick-dotted"),t=i("<ul />").addClass(o.options.dotsClass),e=0;e<=o.getDotCount();e+=1)t.append(i("<li />").append(o.options.customPaging.call(this,o,e)));o.$dots=t.appendTo(o.options.appendDots),o.$dots.find("li").first().addClass("slick-active")}},e.prototype.buildOut=function(){var e=this;e.$slides=e.$slider.children(e.options.slide+":not(.slick-cloned)").addClass("slick-slide"),e.slideCount=e.$slides.length,e.$slides.each(function(e,t){i(t).attr("data-slick-index",e).data("originalStyling",i(t).attr("style")||"")}),e.$slider.addClass("slick-slider"),e.$slideTrack=0===e.slideCount?i('<div class="slick-track"/>').appendTo(e.$slider):e.$slides.wrapAll('<div class="slick-track"/>').parent(),e.$list=e.$slideTrack.wrap('<div class="slick-list"/>').parent(),e.$slideTrack.css("opacity",0),!0!==e.options.centerMode&&!0!==e.options.swipeToSlide||(e.options.slidesToScroll=1),i("img[data-lazy]",e.$slider).not("[src]").addClass("slick-loading"),e.setupInfinite(),e.buildArrows(),e.buildDots(),e.updateDots(),e.setSlideClasses("number"==typeof e.currentSlide?e.currentSlide:0),!0===e.options.draggable&&e.$list.addClass("draggable")},e.prototype.buildRows=function(){var i,e,t,o,s,n,r,l=this;if(o=document.createDocumentFragment(),n=l.$slider.children(),l.options.rows>1){for(r=l.options.slidesPerRow*l.options.rows,s=Math.ceil(n.length/r),i=0;i<s;i++){var d=document.createElement("div");for(e=0;e<l.options.rows;e++){var a=document.createElement("div");for(t=0;t<l.options.slidesPerRow;t++){var c=i*r+(e*l.options.slidesPerRow+t);n.get(c)&&a.appendChild(n.get(c))}d.appendChild(a)}o.appendChild(d)}l.$slider.empty().append(o),l.$slider.children().children().children().css({width:100/l.options.slidesPerRow+"%",display:"inline-block"})}},e.prototype.checkResponsive=function(e,t){var o,s,n,r=this,l=!1,d=r.$slider.width(),a=window.innerWidth||i(window).width();if("window"===r.respondTo?n=a:"slider"===r.respondTo?n=d:"min"===r.respondTo&&(n=Math.min(a,d)),r.options.responsive&&r.options.responsive.length&&null!==r.options.responsive){s=null;for(o in r.breakpoints)r.breakpoints.hasOwnProperty(o)&&(!1===r.originalSettings.mobileFirst?n<r.breakpoints[o]&&(s=r.breakpoints[o]):n>r.breakpoints[o]&&(s=r.breakpoints[o]));null!==s?null!==r.activeBreakpoint?(s!==r.activeBreakpoint||t)&&(r.activeBreakpoint=s,"unslick"===r.breakpointSettings[s]?r.unslick(s):(r.options=i.extend({},r.originalSettings,r.breakpointSettings[s]),!0===e&&(r.currentSlide=r.options.initialSlide),r.refresh(e)),l=s):(r.activeBreakpoint=s,"unslick"===r.breakpointSettings[s]?r.unslick(s):(r.options=i.extend({},r.originalSettings,r.breakpointSettings[s]),!0===e&&(r.currentSlide=r.options.initialSlide),r.refresh(e)),l=s):null!==r.activeBreakpoint&&(r.activeBreakpoint=null,r.options=r.originalSettings,!0===e&&(r.currentSlide=r.options.initialSlide),r.refresh(e),l=s),e||!1===l||r.$slider.trigger("breakpoint",[r,l])}},e.prototype.changeSlide=function(e,t){var o,s,n,r=this,l=i(e.currentTarget);switch(l.is("a")&&e.preventDefault(),l.is("li")||(l=l.closest("li")),n=r.slideCount%r.options.slidesToScroll!=0,o=n?0:(r.slideCount-r.currentSlide)%r.options.slidesToScroll,e.data.message){case"previous":s=0===o?r.options.slidesToScroll:r.options.slidesToShow-o,r.slideCount>r.options.slidesToShow&&r.slideHandler(r.currentSlide-s,!1,t);break;case"next":s=0===o?r.options.slidesToScroll:o,r.slideCount>r.options.slidesToShow&&r.slideHandler(r.currentSlide+s,!1,t);break;case"index":var d=0===e.data.index?0:e.data.index||l.index()*r.options.slidesToScroll;r.slideHandler(r.checkNavigable(d),!1,t),l.children().trigger("focus");break;default:return}},e.prototype.checkNavigable=function(i){var e,t;if(e=this.getNavigableIndexes(),t=0,i>e[e.length-1])i=e[e.length-1];else for(var o in e){if(i<e[o]){i=t;break}t=e[o]}return i},e.prototype.cleanUpEvents=function(){var e=this;e.options.dots&&null!==e.$dots&&(i("li",e.$dots).off("click.slick",e.changeSlide).off("mouseenter.slick",i.proxy(e.interrupt,e,!0)).off("mouseleave.slick",i.proxy(e.interrupt,e,!1)),!0===e.options.accessibility&&e.$dots.off("keydown.slick",e.keyHandler)),e.$slider.off("focus.slick blur.slick"),!0===e.options.arrows&&e.slideCount>e.options.slidesToShow&&(e.$prevArrow&&e.$prevArrow.off("click.slick",e.changeSlide),e.$nextArrow&&e.$nextArrow.off("click.slick",e.changeSlide),!0===e.options.accessibility&&(e.$prevArrow&&e.$prevArrow.off("keydown.slick",e.keyHandler),e.$nextArrow&&e.$nextArrow.off("keydown.slick",e.keyHandler))),e.$list.off("touchstart.slick mousedown.slick",e.swipeHandler),e.$list.off("touchmove.slick mousemove.slick",e.swipeHandler),e.$list.off("touchend.slick mouseup.slick",e.swipeHandler),e.$list.off("touchcancel.slick mouseleave.slick",e.swipeHandler),e.$list.off("click.slick",e.clickHandler),i(document).off(e.visibilityChange,e.visibility),e.cleanUpSlideEvents(),!0===e.options.accessibility&&e.$list.off("keydown.slick",e.keyHandler),!0===e.options.focusOnSelect&&i(e.$slideTrack).children().off("click.slick",e.selectHandler),i(window).off("orientationchange.slick.slick-"+e.instanceUid,e.orientationChange),i(window).off("resize.slick.slick-"+e.instanceUid,e.resize),i("[draggable!=true]",e.$slideTrack).off("dragstart",e.preventDefault),i(window).off("load.slick.slick-"+e.instanceUid,e.setPosition)},e.prototype.cleanUpSlideEvents=function(){var e=this;e.$list.off("mouseenter.slick",i.proxy(e.interrupt,e,!0)),e.$list.off("mouseleave.slick",i.proxy(e.interrupt,e,!1))},e.prototype.cleanUpRows=function(){var i,e=this;e.options.rows>1&&((i=e.$slides.children().children()).removeAttr("style"),e.$slider.empty().append(i))},e.prototype.clickHandler=function(i){!1===this.shouldClick&&(i.stopImmediatePropagation(),i.stopPropagation(),i.preventDefault())},e.prototype.destroy=function(e){var t=this;t.autoPlayClear(),t.touchObject={},t.cleanUpEvents(),i(".slick-cloned",t.$slider).detach(),t.$dots&&t.$dots.remove(),t.$prevArrow&&t.$prevArrow.length&&(t.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display",""),t.htmlExpr.test(t.options.prevArrow)&&t.$prevArrow.remove()),t.$nextArrow&&t.$nextArrow.length&&(t.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display",""),t.htmlExpr.test(t.options.nextArrow)&&t.$nextArrow.remove()),t.$slides&&(t.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function(){i(this).attr("style",i(this).data("originalStyling"))}),t.$slideTrack.children(this.options.slide).detach(),t.$slideTrack.detach(),t.$list.detach(),t.$slider.append(t.$slides)),t.cleanUpRows(),t.$slider.removeClass("slick-slider"),t.$slider.removeClass("slick-initialized"),t.$slider.removeClass("slick-dotted"),t.unslicked=!0,e||t.$slider.trigger("destroy",[t])},e.prototype.disableTransition=function(i){var e=this,t={};t[e.transitionType]="",!1===e.options.fade?e.$slideTrack.css(t):e.$slides.eq(i).css(t)},e.prototype.fadeSlide=function(i,e){var t=this;!1===t.cssTransitions?(t.$slides.eq(i).css({zIndex:t.options.zIndex}),t.$slides.eq(i).animate({opacity:1},t.options.speed,t.options.easing,e)):(t.applyTransition(i),t.$slides.eq(i).css({opacity:1,zIndex:t.options.zIndex}),e&&setTimeout(function(){t.disableTransition(i),e.call()},t.options.speed))},e.prototype.fadeSlideOut=function(i){var e=this;!1===e.cssTransitions?e.$slides.eq(i).animate({opacity:0,zIndex:e.options.zIndex-2},e.options.speed,e.options.easing):(e.applyTransition(i),e.$slides.eq(i).css({opacity:0,zIndex:e.options.zIndex-2}))},e.prototype.filterSlides=e.prototype.slickFilter=function(i){var e=this;null!==i&&(e.$slidesCache=e.$slides,e.unload(),e.$slideTrack.children(this.options.slide).detach(),e.$slidesCache.filter(i).appendTo(e.$slideTrack),e.reinit())},e.prototype.focusHandler=function(){var e=this;e.$slider.off("focus.slick blur.slick").on("focus.slick blur.slick","*",function(t){t.stopImmediatePropagation();var o=i(this);setTimeout(function(){e.options.pauseOnFocus&&(e.focussed=o.is(":focus"),e.autoPlay())},0)})},e.prototype.getCurrent=e.prototype.slickCurrentSlide=function(){return this.currentSlide},e.prototype.getDotCount=function(){var i=this,e=0,t=0,o=0;if(!0===i.options.infinite)if(i.slideCount<=i.options.slidesToShow)++o;else for(;e<i.slideCount;)++o,e=t+i.options.slidesToScroll,t+=i.options.slidesToScroll<=i.options.slidesToShow?i.options.slidesToScroll:i.options.slidesToShow;else if(!0===i.options.centerMode)o=i.slideCount;else if(i.options.asNavFor)for(;e<i.slideCount;)++o,e=t+i.options.slidesToScroll,t+=i.options.slidesToScroll<=i.options.slidesToShow?i.options.slidesToScroll:i.options.slidesToShow;else o=1+Math.ceil((i.slideCount-i.options.slidesToShow)/i.options.slidesToScroll);return o-1},e.prototype.getLeft=function(i){var e,t,o,s,n=this,r=0;return n.slideOffset=0,t=n.$slides.first().outerHeight(!0),!0===n.options.infinite?(n.slideCount>n.options.slidesToShow&&(n.slideOffset=n.slideWidth*n.options.slidesToShow*-1,s=-1,!0===n.options.vertical&&!0===n.options.centerMode&&(2===n.options.slidesToShow?s=-1.5:1===n.options.slidesToShow&&(s=-2)),r=t*n.options.slidesToShow*s),n.slideCount%n.options.slidesToScroll!=0&&i+n.options.slidesToScroll>n.slideCount&&n.slideCount>n.options.slidesToShow&&(i>n.slideCount?(n.slideOffset=(n.options.slidesToShow-(i-n.slideCount))*n.slideWidth*-1,r=(n.options.slidesToShow-(i-n.slideCount))*t*-1):(n.slideOffset=n.slideCount%n.options.slidesToScroll*n.slideWidth*-1,r=n.slideCount%n.options.slidesToScroll*t*-1))):i+n.options.slidesToShow>n.slideCount&&(n.slideOffset=(i+n.options.slidesToShow-n.slideCount)*n.slideWidth,r=(i+n.options.slidesToShow-n.slideCount)*t),n.slideCount<=n.options.slidesToShow&&(n.slideOffset=0,r=0),!0===n.options.centerMode&&n.slideCount<=n.options.slidesToShow?n.slideOffset=n.slideWidth*Math.floor(n.options.slidesToShow)/2-n.slideWidth*n.slideCount/2:!0===n.options.centerMode&&!0===n.options.infinite?n.slideOffset+=n.slideWidth*Math.floor(n.options.slidesToShow/2)-n.slideWidth:!0===n.options.centerMode&&(n.slideOffset=0,n.slideOffset+=n.slideWidth*Math.floor(n.options.slidesToShow/2)),e=!1===n.options.vertical?i*n.slideWidth*-1+n.slideOffset:i*t*-1+r,!0===n.options.variableWidth&&(o=n.slideCount<=n.options.slidesToShow||!1===n.options.infinite?n.$slideTrack.children(".slick-slide").eq(i):n.$slideTrack.children(".slick-slide").eq(i+n.options.slidesToShow),e=!0===n.options.rtl?o[0]?-1*(n.$slideTrack.width()-o[0].offsetLeft-o.width()):0:o[0]?-1*o[0].offsetLeft:0,!0===n.options.centerMode&&(o=n.slideCount<=n.options.slidesToShow||!1===n.options.infinite?n.$slideTrack.children(".slick-slide").eq(i):n.$slideTrack.children(".slick-slide").eq(i+n.options.slidesToShow+1),e=!0===n.options.rtl?o[0]?-1*(n.$slideTrack.width()-o[0].offsetLeft-o.width()):0:o[0]?-1*o[0].offsetLeft:0,e+=(n.$list.width()-o.outerWidth())/2)),e},e.prototype.getOption=e.prototype.slickGetOption=function(i){return this.options[i]},e.prototype.getNavigableIndexes=function(){var i,e=this,t=0,o=0,s=[];for(!1===e.options.infinite?i=e.slideCount:(t=-1*e.options.slidesToScroll,o=-1*e.options.slidesToScroll,i=2*e.slideCount);t<i;)s.push(t),t=o+e.options.slidesToScroll,o+=e.options.slidesToScroll<=e.options.slidesToShow?e.options.slidesToScroll:e.options.slidesToShow;return s},e.prototype.getSlick=function(){return this},e.prototype.getSlideCount=function(){var e,t,o=this;return t=!0===o.options.centerMode?o.slideWidth*Math.floor(o.options.slidesToShow/2):0,!0===o.options.swipeToSlide?(o.$slideTrack.find(".slick-slide").each(function(s,n){if(n.offsetLeft-t+i(n).outerWidth()/2>-1*o.swipeLeft)return e=n,!1}),Math.abs(i(e).attr("data-slick-index")-o.currentSlide)||1):o.options.slidesToScroll},e.prototype.goTo=e.prototype.slickGoTo=function(i,e){this.changeSlide({data:{message:"index",index:parseInt(i)}},e)},e.prototype.init=function(e){var t=this;i(t.$slider).hasClass("slick-initialized")||(i(t.$slider).addClass("slick-initialized"),t.buildRows(),t.buildOut(),t.setProps(),t.startLoad(),t.loadSlider(),t.initializeEvents(),t.updateArrows(),t.updateDots(),t.checkResponsive(!0),t.focusHandler()),e&&t.$slider.trigger("init",[t]),!0===t.options.accessibility&&t.initADA(),t.options.autoplay&&(t.paused=!1,t.autoPlay())},e.prototype.initADA=function(){var e=this,t=Math.ceil(e.slideCount/e.options.slidesToShow),o=e.getNavigableIndexes().filter(function(i){return i>=0&&i<e.slideCount});e.$slides.add(e.$slideTrack.find(".slick-cloned")).attr({"aria-hidden":"true",tabindex:"-1"}).find("a, input, button, select").attr({tabindex:"-1"}),null!==e.$dots&&(e.$slides.not(e.$slideTrack.find(".slick-cloned")).each(function(t){var s=o.indexOf(t);i(this).attr({role:"tabpanel",id:"slick-slide"+e.instanceUid+t,tabindex:-1}),-1!==s&&i(this).attr({"aria-describedby":"slick-slide-control"+e.instanceUid+s})}),e.$dots.attr("role","tablist").find("li").each(function(s){var n=o[s];i(this).attr({role:"presentation"}),i(this).find("button").first().attr({role:"tab",id:"slick-slide-control"+e.instanceUid+s,"aria-controls":"slick-slide"+e.instanceUid+n,"aria-label":s+1+" of "+t,"aria-selected":null,tabindex:"-1"})}).eq(e.currentSlide).find("button").attr({"aria-selected":"true",tabindex:"0"}).end());for(var s=e.currentSlide,n=s+e.options.slidesToShow;s<n;s++)e.$slides.eq(s).attr("tabindex",0);e.activateADA()},e.prototype.initArrowEvents=function(){var i=this;!0===i.options.arrows&&i.slideCount>i.options.slidesToShow&&(i.$prevArrow.off("click.slick").on("click.slick",{message:"previous"},i.changeSlide),i.$nextArrow.off("click.slick").on("click.slick",{message:"next"},i.changeSlide),!0===i.options.accessibility&&(i.$prevArrow.on("keydown.slick",i.keyHandler),i.$nextArrow.on("keydown.slick",i.keyHandler)))},e.prototype.initDotEvents=function(){var e=this;!0===e.options.dots&&(i("li",e.$dots).on("click.slick",{message:"index"},e.changeSlide),!0===e.options.accessibility&&e.$dots.on("keydown.slick",e.keyHandler)),!0===e.options.dots&&!0===e.options.pauseOnDotsHover&&i("li",e.$dots).on("mouseenter.slick",i.proxy(e.interrupt,e,!0)).on("mouseleave.slick",i.proxy(e.interrupt,e,!1))},e.prototype.initSlideEvents=function(){var e=this;e.options.pauseOnHover&&(e.$list.on("mouseenter.slick",i.proxy(e.interrupt,e,!0)),e.$list.on("mouseleave.slick",i.proxy(e.interrupt,e,!1)))},e.prototype.initializeEvents=function(){var e=this;e.initArrowEvents(),e.initDotEvents(),e.initSlideEvents(),e.$list.on("touchstart.slick mousedown.slick",{action:"start"},e.swipeHandler),e.$list.on("touchmove.slick mousemove.slick",{action:"move"},e.swipeHandler),e.$list.on("touchend.slick mouseup.slick",{action:"end"},e.swipeHandler),e.$list.on("touchcancel.slick mouseleave.slick",{action:"end"},e.swipeHandler),e.$list.on("click.slick",e.clickHandler),i(document).on(e.visibilityChange,i.proxy(e.visibility,e)),!0===e.options.accessibility&&e.$list.on("keydown.slick",e.keyHandler),!0===e.options.focusOnSelect&&i(e.$slideTrack).children().on("click.slick",e.selectHandler),i(window).on("orientationchange.slick.slick-"+e.instanceUid,i.proxy(e.orientationChange,e)),i(window).on("resize.slick.slick-"+e.instanceUid,i.proxy(e.resize,e)),i("[draggable!=true]",e.$slideTrack).on("dragstart",e.preventDefault),i(window).on("load.slick.slick-"+e.instanceUid,e.setPosition),i(e.setPosition)},e.prototype.initUI=function(){var i=this;!0===i.options.arrows&&i.slideCount>i.options.slidesToShow&&(i.$prevArrow.show(),i.$nextArrow.show()),!0===i.options.dots&&i.slideCount>i.options.slidesToShow&&i.$dots.show()},e.prototype.keyHandler=function(i){var e=this;i.target.tagName.match("TEXTAREA|INPUT|SELECT")||(37===i.keyCode&&!0===e.options.accessibility?e.changeSlide({data:{message:!0===e.options.rtl?"next":"previous"}}):39===i.keyCode&&!0===e.options.accessibility&&e.changeSlide({data:{message:!0===e.options.rtl?"previous":"next"}}))},e.prototype.lazyLoad=function(){function e(e){i("img[data-lazy]",e).each(function(){var e=i(this),t=i(this).attr("data-lazy"),o=i(this).attr("data-srcset"),s=i(this).attr("data-sizes")||n.$slider.attr("data-sizes"),r=document.createElement("img");r.onload=function(){e.animate({opacity:0},100,function(){o&&(e.attr("srcset",o),s&&e.attr("sizes",s)),e.attr("src",t).animate({opacity:1},200,function(){e.removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading")}),n.$slider.trigger("lazyLoaded",[n,e,t])})},r.onerror=function(){e.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"),n.$slider.trigger("lazyLoadError",[n,e,t])},r.src=t})}var t,o,s,n=this;if(!0===n.options.centerMode?!0===n.options.infinite?s=(o=n.currentSlide+(n.options.slidesToShow/2+1))+n.options.slidesToShow+2:(o=Math.max(0,n.currentSlide-(n.options.slidesToShow/2+1)),s=n.options.slidesToShow/2+1+2+n.currentSlide):(o=n.options.infinite?n.options.slidesToShow+n.currentSlide:n.currentSlide,s=Math.ceil(o+n.options.slidesToShow),!0===n.options.fade&&(o>0&&o--,s<=n.slideCount&&s++)),t=n.$slider.find(".slick-slide").slice(o,s),"anticipated"===n.options.lazyLoad)for(var r=o-1,l=s,d=n.$slider.find(".slick-slide"),a=0;a<n.options.slidesToScroll;a++)r<0&&(r=n.slideCount-1),t=(t=t.add(d.eq(r))).add(d.eq(l)),r--,l++;e(t),n.slideCount<=n.options.slidesToShow?e(n.$slider.find(".slick-slide")):n.currentSlide>=n.slideCount-n.options.slidesToShow?e(n.$slider.find(".slick-cloned").slice(0,n.options.slidesToShow)):0===n.currentSlide&&e(n.$slider.find(".slick-cloned").slice(-1*n.options.slidesToShow))},e.prototype.loadSlider=function(){var i=this;i.setPosition(),i.$slideTrack.css({opacity:1}),i.$slider.removeClass("slick-loading"),i.initUI(),"progressive"===i.options.lazyLoad&&i.progressiveLazyLoad()},e.prototype.next=e.prototype.slickNext=function(){this.changeSlide({data:{message:"next"}})},e.prototype.orientationChange=function(){var i=this;i.checkResponsive(),i.setPosition()},e.prototype.pause=e.prototype.slickPause=function(){var i=this;i.autoPlayClear(),i.paused=!0},e.prototype.play=e.prototype.slickPlay=function(){var i=this;i.autoPlay(),i.options.autoplay=!0,i.paused=!1,i.focussed=!1,i.interrupted=!1},e.prototype.postSlide=function(e){var t=this;t.unslicked||(t.$slider.trigger("afterChange",[t,e]),t.animating=!1,t.slideCount>t.options.slidesToShow&&t.setPosition(),t.swipeLeft=null,t.options.autoplay&&t.autoPlay(),!0===t.options.accessibility&&(t.initADA(),t.options.focusOnChange&&i(t.$slides.get(t.currentSlide)).attr("tabindex",0).focus()))},e.prototype.prev=e.prototype.slickPrev=function(){this.changeSlide({data:{message:"previous"}})},e.prototype.preventDefault=function(i){i.preventDefault()},e.prototype.progressiveLazyLoad=function(e){e=e||1;var t,o,s,n,r,l=this,d=i("img[data-lazy]",l.$slider);d.length?(t=d.first(),o=t.attr("data-lazy"),s=t.attr("data-srcset"),n=t.attr("data-sizes")||l.$slider.attr("data-sizes"),(r=document.createElement("img")).onload=function(){s&&(t.attr("srcset",s),n&&t.attr("sizes",n)),t.attr("src",o).removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading"),!0===l.options.adaptiveHeight&&l.setPosition(),l.$slider.trigger("lazyLoaded",[l,t,o]),l.progressiveLazyLoad()},r.onerror=function(){e<3?setTimeout(function(){l.progressiveLazyLoad(e+1)},500):(t.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"),l.$slider.trigger("lazyLoadError",[l,t,o]),l.progressiveLazyLoad())},r.src=o):l.$slider.trigger("allImagesLoaded",[l])},e.prototype.refresh=function(e){var t,o,s=this;o=s.slideCount-s.options.slidesToShow,!s.options.infinite&&s.currentSlide>o&&(s.currentSlide=o),s.slideCount<=s.options.slidesToShow&&(s.currentSlide=0),t=s.currentSlide,s.destroy(!0),i.extend(s,s.initials,{currentSlide:t}),s.init(),e||s.changeSlide({data:{message:"index",index:t}},!1)},e.prototype.registerBreakpoints=function(){var e,t,o,s=this,n=s.options.responsive||null;if("array"===i.type(n)&&n.length){s.respondTo=s.options.respondTo||"window";for(e in n)if(o=s.breakpoints.length-1,n.hasOwnProperty(e)){for(t=n[e].breakpoint;o>=0;)s.breakpoints[o]&&s.breakpoints[o]===t&&s.breakpoints.splice(o,1),o--;s.breakpoints.push(t),s.breakpointSettings[t]=n[e].settings}s.breakpoints.sort(function(i,e){return s.options.mobileFirst?i-e:e-i})}},e.prototype.reinit=function(){var e=this;e.$slides=e.$slideTrack.children(e.options.slide).addClass("slick-slide"),e.slideCount=e.$slides.length,e.currentSlide>=e.slideCount&&0!==e.currentSlide&&(e.currentSlide=e.currentSlide-e.options.slidesToScroll),e.slideCount<=e.options.slidesToShow&&(e.currentSlide=0),e.registerBreakpoints(),e.setProps(),e.setupInfinite(),e.buildArrows(),e.updateArrows(),e.initArrowEvents(),e.buildDots(),e.updateDots(),e.initDotEvents(),e.cleanUpSlideEvents(),e.initSlideEvents(),e.checkResponsive(!1,!0),!0===e.options.focusOnSelect&&i(e.$slideTrack).children().on("click.slick",e.selectHandler),e.setSlideClasses("number"==typeof e.currentSlide?e.currentSlide:0),e.setPosition(),e.focusHandler(),e.paused=!e.options.autoplay,e.autoPlay(),e.$slider.trigger("reInit",[e])},e.prototype.resize=function(){var e=this;i(window).width()!==e.windowWidth&&(clearTimeout(e.windowDelay),e.windowDelay=window.setTimeout(function(){e.windowWidth=i(window).width(),e.checkResponsive(),e.unslicked||e.setPosition()},50))},e.prototype.removeSlide=e.prototype.slickRemove=function(i,e,t){var o=this;if(i="boolean"==typeof i?!0===(e=i)?0:o.slideCount-1:!0===e?--i:i,o.slideCount<1||i<0||i>o.slideCount-1)return!1;o.unload(),!0===t?o.$slideTrack.children().remove():o.$slideTrack.children(this.options.slide).eq(i).remove(),o.$slides=o.$slideTrack.children(this.options.slide),o.$slideTrack.children(this.options.slide).detach(),o.$slideTrack.append(o.$slides),o.$slidesCache=o.$slides,o.reinit()},e.prototype.setCSS=function(i){var e,t,o=this,s={};!0===o.options.rtl&&(i=-i),e="left"==o.positionProp?Math.ceil(i)+"px":"0px",t="top"==o.positionProp?Math.ceil(i)+"px":"0px",s[o.positionProp]=i,!1===o.transformsEnabled?o.$slideTrack.css(s):(s={},!1===o.cssTransitions?(s[o.animType]="translate("+e+", "+t+")",o.$slideTrack.css(s)):(s[o.animType]="translate3d("+e+", "+t+", 0px)",o.$slideTrack.css(s)))},e.prototype.setDimensions=function(){var i=this;!1===i.options.vertical?!0===i.options.centerMode&&i.$list.css({padding:"0px "+i.options.centerPadding}):(i.$list.height(i.$slides.first().outerHeight(!0)*i.options.slidesToShow),!0===i.options.centerMode&&i.$list.css({padding:i.options.centerPadding+" 0px"})),i.listWidth=i.$list.width(),i.listHeight=i.$list.height(),!1===i.options.vertical&&!1===i.options.variableWidth?(i.slideWidth=Math.ceil(i.listWidth/i.options.slidesToShow),i.$slideTrack.width(Math.ceil(i.slideWidth*i.$slideTrack.children(".slick-slide").length))):!0===i.options.variableWidth?i.$slideTrack.width(5e3*i.slideCount):(i.slideWidth=Math.ceil(i.listWidth),i.$slideTrack.height(Math.ceil(i.$slides.first().outerHeight(!0)*i.$slideTrack.children(".slick-slide").length)));var e=i.$slides.first().outerWidth(!0)-i.$slides.first().width();!1===i.options.variableWidth&&i.$slideTrack.children(".slick-slide").width(i.slideWidth-e)},e.prototype.setFade=function(){var e,t=this;t.$slides.each(function(o,s){e=t.slideWidth*o*-1,!0===t.options.rtl?i(s).css({position:"relative",right:e,top:0,zIndex:t.options.zIndex-2,opacity:0}):i(s).css({position:"relative",left:e,top:0,zIndex:t.options.zIndex-2,opacity:0})}),t.$slides.eq(t.currentSlide).css({zIndex:t.options.zIndex-1,opacity:1})},e.prototype.setHeight=function(){var i=this;if(1===i.options.slidesToShow&&!0===i.options.adaptiveHeight&&!1===i.options.vertical){var e=i.$slides.eq(i.currentSlide).outerHeight(!0);i.$list.css("height",e)}},e.prototype.setOption=e.prototype.slickSetOption=function(){var e,t,o,s,n,r=this,l=!1;if("object"===i.type(arguments[0])?(o=arguments[0],l=arguments[1],n="multiple"):"string"===i.type(arguments[0])&&(o=arguments[0],s=arguments[1],l=arguments[2],"responsive"===arguments[0]&&"array"===i.type(arguments[1])?n="responsive":void 0!==arguments[1]&&(n="single")),"single"===n)r.options[o]=s;else if("multiple"===n)i.each(o,function(i,e){r.options[i]=e});else if("responsive"===n)for(t in s)if("array"!==i.type(r.options.responsive))r.options.responsive=[s[t]];else{for(e=r.options.responsive.length-1;e>=0;)r.options.responsive[e].breakpoint===s[t].breakpoint&&r.options.responsive.splice(e,1),e--;r.options.responsive.push(s[t])}l&&(r.unload(),r.reinit())},e.prototype.setPosition=function(){var i=this;i.setDimensions(),i.setHeight(),!1===i.options.fade?i.setCSS(i.getLeft(i.currentSlide)):i.setFade(),i.$slider.trigger("setPosition",[i])},e.prototype.setProps=function(){var i=this,e=document.body.style;i.positionProp=!0===i.options.vertical?"top":"left","top"===i.positionProp?i.$slider.addClass("slick-vertical"):i.$slider.removeClass("slick-vertical"),void 0===e.WebkitTransition&&void 0===e.MozTransition&&void 0===e.msTransition||!0===i.options.useCSS&&(i.cssTransitions=!0),i.options.fade&&("number"==typeof i.options.zIndex?i.options.zIndex<3&&(i.options.zIndex=3):i.options.zIndex=i.defaults.zIndex),void 0!==e.OTransform&&(i.animType="OTransform",i.transformType="-o-transform",i.transitionType="OTransition",void 0===e.perspectiveProperty&&void 0===e.webkitPerspective&&(i.animType=!1)),void 0!==e.MozTransform&&(i.animType="MozTransform",i.transformType="-moz-transform",i.transitionType="MozTransition",void 0===e.perspectiveProperty&&void 0===e.MozPerspective&&(i.animType=!1)),void 0!==e.webkitTransform&&(i.animType="webkitTransform",i.transformType="-webkit-transform",i.transitionType="webkitTransition",void 0===e.perspectiveProperty&&void 0===e.webkitPerspective&&(i.animType=!1)),void 0!==e.msTransform&&(i.animType="msTransform",i.transformType="-ms-transform",i.transitionType="msTransition",void 0===e.msTransform&&(i.animType=!1)),void 0!==e.transform&&!1!==i.animType&&(i.animType="transform",i.transformType="transform",i.transitionType="transition"),i.transformsEnabled=i.options.useTransform&&null!==i.animType&&!1!==i.animType},e.prototype.setSlideClasses=function(i){var e,t,o,s,n=this;if(t=n.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden","true"),n.$slides.eq(i).addClass("slick-current"),!0===n.options.centerMode){var r=n.options.slidesToShow%2==0?1:0;e=Math.floor(n.options.slidesToShow/2),!0===n.options.infinite&&(i>=e&&i<=n.slideCount-1-e?n.$slides.slice(i-e+r,i+e+1).addClass("slick-active").attr("aria-hidden","false"):(o=n.options.slidesToShow+i,t.slice(o-e+1+r,o+e+2).addClass("slick-active").attr("aria-hidden","false")),0===i?t.eq(t.length-1-n.options.slidesToShow).addClass("slick-center"):i===n.slideCount-1&&t.eq(n.options.slidesToShow).addClass("slick-center")),n.$slides.eq(i).addClass("slick-center")}else i>=0&&i<=n.slideCount-n.options.slidesToShow?n.$slides.slice(i,i+n.options.slidesToShow).addClass("slick-active").attr("aria-hidden","false"):t.length<=n.options.slidesToShow?t.addClass("slick-active").attr("aria-hidden","false"):(s=n.slideCount%n.options.slidesToShow,o=!0===n.options.infinite?n.options.slidesToShow+i:i,n.options.slidesToShow==n.options.slidesToScroll&&n.slideCount-i<n.options.slidesToShow?t.slice(o-(n.options.slidesToShow-s),o+s).addClass("slick-active").attr("aria-hidden","false"):t.slice(o,o+n.options.slidesToShow).addClass("slick-active").attr("aria-hidden","false"));"ondemand"!==n.options.lazyLoad&&"anticipated"!==n.options.lazyLoad||n.lazyLoad()},e.prototype.setupInfinite=function(){var e,t,o,s=this;if(!0===s.options.fade&&(s.options.centerMode=!1),!0===s.options.infinite&&!1===s.options.fade&&(t=null,s.slideCount>s.options.slidesToShow)){for(o=!0===s.options.centerMode?s.options.slidesToShow+1:s.options.slidesToShow,e=s.slideCount;e>s.slideCount-o;e-=1)t=e-1,i(s.$slides[t]).clone(!0).attr("id","").attr("data-slick-index",t-s.slideCount).prependTo(s.$slideTrack).addClass("slick-cloned");for(e=0;e<o+s.slideCount;e+=1)t=e,i(s.$slides[t]).clone(!0).attr("id","").attr("data-slick-index",t+s.slideCount).appendTo(s.$slideTrack).addClass("slick-cloned");s.$slideTrack.find(".slick-cloned").find("[id]").each(function(){i(this).attr("id","")})}},e.prototype.interrupt=function(i){var e=this;i||e.autoPlay(),e.interrupted=i},e.prototype.selectHandler=function(e){var t=this,o=i(e.target).is(".slick-slide")?i(e.target):i(e.target).parents(".slick-slide"),s=parseInt(o.attr("data-slick-index"));s||(s=0),t.slideCount<=t.options.slidesToShow?t.slideHandler(s,!1,!0):t.slideHandler(s)},e.prototype.slideHandler=function(i,e,t){var o,s,n,r,l,d=null,a=this;if(e=e||!1,!(!0===a.animating&&!0===a.options.waitForAnimate||!0===a.options.fade&&a.currentSlide===i))if(!1===e&&a.asNavFor(i),o=i,d=a.getLeft(o),r=a.getLeft(a.currentSlide),a.currentLeft=null===a.swipeLeft?r:a.swipeLeft,!1===a.options.infinite&&!1===a.options.centerMode&&(i<0||i>a.getDotCount()*a.options.slidesToScroll))!1===a.options.fade&&(o=a.currentSlide,!0!==t?a.animateSlide(r,function(){a.postSlide(o)}):a.postSlide(o));else if(!1===a.options.infinite&&!0===a.options.centerMode&&(i<0||i>a.slideCount-a.options.slidesToScroll))!1===a.options.fade&&(o=a.currentSlide,!0!==t?a.animateSlide(r,function(){a.postSlide(o)}):a.postSlide(o));else{if(a.options.autoplay&&clearInterval(a.autoPlayTimer),s=o<0?a.slideCount%a.options.slidesToScroll!=0?a.slideCount-a.slideCount%a.options.slidesToScroll:a.slideCount+o:o>=a.slideCount?a.slideCount%a.options.slidesToScroll!=0?0:o-a.slideCount:o,a.animating=!0,a.$slider.trigger("beforeChange",[a,a.currentSlide,s]),n=a.currentSlide,a.currentSlide=s,a.setSlideClasses(a.currentSlide),a.options.asNavFor&&(l=(l=a.getNavTarget()).slick("getSlick")).slideCount<=l.options.slidesToShow&&l.setSlideClasses(a.currentSlide),a.updateDots(),a.updateArrows(),!0===a.options.fade)return!0!==t?(a.fadeSlideOut(n),a.fadeSlide(s,function(){a.postSlide(s)})):a.postSlide(s),void a.animateHeight();!0!==t?a.animateSlide(d,function(){a.postSlide(s)}):a.postSlide(s)}},e.prototype.startLoad=function(){var i=this;!0===i.options.arrows&&i.slideCount>i.options.slidesToShow&&(i.$prevArrow.hide(),i.$nextArrow.hide()),!0===i.options.dots&&i.slideCount>i.options.slidesToShow&&i.$dots.hide(),i.$slider.addClass("slick-loading")},e.prototype.swipeDirection=function(){var i,e,t,o,s=this;return i=s.touchObject.startX-s.touchObject.curX,e=s.touchObject.startY-s.touchObject.curY,t=Math.atan2(e,i),(o=Math.round(180*t/Math.PI))<0&&(o=360-Math.abs(o)),o<=45&&o>=0?!1===s.options.rtl?"left":"right":o<=360&&o>=315?!1===s.options.rtl?"left":"right":o>=135&&o<=225?!1===s.options.rtl?"right":"left":!0===s.options.verticalSwiping?o>=35&&o<=135?"down":"up":"vertical"},e.prototype.swipeEnd=function(i){var e,t,o=this;if(o.dragging=!1,o.swiping=!1,o.scrolling)return o.scrolling=!1,!1;if(o.interrupted=!1,o.shouldClick=!(o.touchObject.swipeLength>10),void 0===o.touchObject.curX)return!1;if(!0===o.touchObject.edgeHit&&o.$slider.trigger("edge",[o,o.swipeDirection()]),o.touchObject.swipeLength>=o.touchObject.minSwipe){switch(t=o.swipeDirection()){case"left":case"down":e=o.options.swipeToSlide?o.checkNavigable(o.currentSlide+o.getSlideCount()):o.currentSlide+o.getSlideCount(),o.currentDirection=0;break;case"right":case"up":e=o.options.swipeToSlide?o.checkNavigable(o.currentSlide-o.getSlideCount()):o.currentSlide-o.getSlideCount(),o.currentDirection=1}"vertical"!=t&&(o.slideHandler(e),o.touchObject={},o.$slider.trigger("swipe",[o,t]))}else o.touchObject.startX!==o.touchObject.curX&&(o.slideHandler(o.currentSlide),o.touchObject={})},e.prototype.swipeHandler=function(i){var e=this;if(!(!1===e.options.swipe||"ontouchend"in document&&!1===e.options.swipe||!1===e.options.draggable&&-1!==i.type.indexOf("mouse")))switch(e.touchObject.fingerCount=i.originalEvent&&void 0!==i.originalEvent.touches?i.originalEvent.touches.length:1,e.touchObject.minSwipe=e.listWidth/e.options.touchThreshold,!0===e.options.verticalSwiping&&(e.touchObject.minSwipe=e.listHeight/e.options.touchThreshold),i.data.action){case"start":e.swipeStart(i);break;case"move":e.swipeMove(i);break;case"end":e.swipeEnd(i)}},e.prototype.swipeMove=function(i){var e,t,o,s,n,r,l=this;return n=void 0!==i.originalEvent?i.originalEvent.touches:null,!(!l.dragging||l.scrolling||n&&1!==n.length)&&(e=l.getLeft(l.currentSlide),l.touchObject.curX=void 0!==n?n[0].pageX:i.clientX,l.touchObject.curY=void 0!==n?n[0].pageY:i.clientY,l.touchObject.swipeLength=Math.round(Math.sqrt(Math.pow(l.touchObject.curX-l.touchObject.startX,2))),r=Math.round(Math.sqrt(Math.pow(l.touchObject.curY-l.touchObject.startY,2))),!l.options.verticalSwiping&&!l.swiping&&r>4?(l.scrolling=!0,!1):(!0===l.options.verticalSwiping&&(l.touchObject.swipeLength=r),t=l.swipeDirection(),void 0!==i.originalEvent&&l.touchObject.swipeLength>4&&(l.swiping=!0,i.preventDefault()),s=(!1===l.options.rtl?1:-1)*(l.touchObject.curX>l.touchObject.startX?1:-1),!0===l.options.verticalSwiping&&(s=l.touchObject.curY>l.touchObject.startY?1:-1),o=l.touchObject.swipeLength,l.touchObject.edgeHit=!1,!1===l.options.infinite&&(0===l.currentSlide&&"right"===t||l.currentSlide>=l.getDotCount()&&"left"===t)&&(o=l.touchObject.swipeLength*l.options.edgeFriction,l.touchObject.edgeHit=!0),!1===l.options.vertical?l.swipeLeft=e+o*s:l.swipeLeft=e+o*(l.$list.height()/l.listWidth)*s,!0===l.options.verticalSwiping&&(l.swipeLeft=e+o*s),!0!==l.options.fade&&!1!==l.options.touchMove&&(!0===l.animating?(l.swipeLeft=null,!1):void l.setCSS(l.swipeLeft))))},e.prototype.swipeStart=function(i){var e,t=this;if(t.interrupted=!0,1!==t.touchObject.fingerCount||t.slideCount<=t.options.slidesToShow)return t.touchObject={},!1;void 0!==i.originalEvent&&void 0!==i.originalEvent.touches&&(e=i.originalEvent.touches[0]),t.touchObject.startX=t.touchObject.curX=void 0!==e?e.pageX:i.clientX,t.touchObject.startY=t.touchObject.curY=void 0!==e?e.pageY:i.clientY,t.dragging=!0},e.prototype.unfilterSlides=e.prototype.slickUnfilter=function(){var i=this;null!==i.$slidesCache&&(i.unload(),i.$slideTrack.children(this.options.slide).detach(),i.$slidesCache.appendTo(i.$slideTrack),i.reinit())},e.prototype.unload=function(){var e=this;i(".slick-cloned",e.$slider).remove(),e.$dots&&e.$dots.remove(),e.$prevArrow&&e.htmlExpr.test(e.options.prevArrow)&&e.$prevArrow.remove(),e.$nextArrow&&e.htmlExpr.test(e.options.nextArrow)&&e.$nextArrow.remove(),e.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden","true").css("width","")},e.prototype.unslick=function(i){var e=this;e.$slider.trigger("unslick",[e,i]),e.destroy()},e.prototype.updateArrows=function(){var i=this;Math.floor(i.options.slidesToShow/2),!0===i.options.arrows&&i.slideCount>i.options.slidesToShow&&!i.options.infinite&&(i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false"),i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled","false"),0===i.currentSlide?(i.$prevArrow.addClass("slick-disabled").attr("aria-disabled","true"),i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled","false")):i.currentSlide>=i.slideCount-i.options.slidesToShow&&!1===i.options.centerMode?(i.$nextArrow.addClass("slick-disabled").attr("aria-disabled","true"),i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false")):i.currentSlide>=i.slideCount-1&&!0===i.options.centerMode&&(i.$nextArrow.addClass("slick-disabled").attr("aria-disabled","true"),i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false")))},e.prototype.updateDots=function(){var i=this;null!==i.$dots&&(i.$dots.find("li").removeClass("slick-active").end(),i.$dots.find("li").eq(Math.floor(i.currentSlide/i.options.slidesToScroll)).addClass("slick-active"))},e.prototype.visibility=function(){var i=this;i.options.autoplay&&(document[i.hidden]?i.interrupted=!0:i.interrupted=!1)},i.fn.slick=function(){var i,t,o=this,s=arguments[0],n=Array.prototype.slice.call(arguments,1),r=o.length;for(i=0;i<r;i++)if("object"==typeof s||void 0===s?o[i].slick=new e(o[i],s):t=o[i].slick[s].apply(o[i].slick,n),void 0!==t)return t;return o}});
define('modules/product/recently-viewed-products',[
    'modules/jquery-mozu',
    'underscore',
    'modules/api',
    'modules/backbone-mozu',
    'hyprlivecontext',
    'slick',
    'sdk'
], function($, _, api, Backbone, HyprLiveContext, slickSlider, sdk) {
    var sitecontext = HyprLiveContext.locals.siteContext,
        cdn = sitecontext.cdnPrefix,
        siteID = cdn.substring(cdn.lastIndexOf('-') + 1),
        imagefilepath = cdn + '/cms/' + siteID + '/files',
        pageContext = require.mozuData('pagecontext'),
        rviEnable = HyprLiveContext.locals.themeSettings.rviEnable,
        rviNumberCookie = parseInt(HyprLiveContext.locals.themeSettings.rviNumberCookie, 10),
        rviExpirationDuration = parseInt(HyprLiveContext.locals.themeSettings.rviExpirationDuration, 10)||1,
        rviDuration = parseInt(rviExpirationDuration, 10)*24*60*60*1000,
        cookieName = 'recentProducts',
        cookieValue = [];

        //Product List Item View
        var ProductListItemView = Backbone.MozuView.extend({
            tagName: 'div',
            className: 'mz-recentproductlist-item',
            templateName: 'modules/product/recent/recent-products',
            initialize: function() {
                var self = this;
                self.listenTo(self.model, 'change', self.render);
            },
            render: function() {
                Backbone.MozuView.prototype.render.apply(this);
                return this;
            }
        });

        var Model = Backbone.MozuModel.extend();

        function getProductCodeFromUrl() {
            return require.mozuData('pagecontext').productCode||null;
        }

        function validateAndAddProduct(productCode) {
            var thisTime = new Date();
            for(var i=0;i<cookieValue.length;i++) {
                var currentVal = cookieValue[i];
                if (currentVal.pCode == productCode) {
                    deleteProduct(productCode);
                    break;
                }
            }
            cookieValue.unshift({"pCode": productCode, "last": thisTime.getTime()});
            if(cookieValue.length > rviNumberCookie ) {
                cookieValue = cookieValue.slice(0, rviNumberCookie + 1);
            }
            $.cookie(cookieName, JSON.stringify(cookieValue), {expires: rviExpirationDuration, path: '/'});
        }

        function getCurrentProducts() {
            var products = [];
            for(var i=0;i<cookieValue.length;i++) {
                if(cookieValue[i].last + rviDuration > (new Date()).getTime() && cookieValue[i].pCode != require.mozuData('pagecontext').productCode) {
                    products.push(cookieValue[i].pCode);
                }
            }
            return products;
        }

        function addProduct() {
            var productCode = getProductCodeFromUrl();
            if(productCode) {
                validateAndAddProduct(productCode);
            }
        }

        function showLoader() {
            $(".rvi-loading").show();
        }

        function hideLoader() {
            $(".rvi-loading").hide();
        }

        function renderRVI(container) {
            if (!container) {
                container = '#rvi-auto';
            }
            if($.cookie(cookieName)) {
                try{
                    cookieValue = JSON.parse($.cookie(cookieName));
                }
                catch(e) {
                    cookieValue = [];
                }
            }
            addProduct();
            if ($(container).length > 0) {
                var filter = getCurrentProducts().join(" or productCode+eq+");
                if (filter !== "" && filter !== " or ") {
                    showLoader();
                    var serviceurl = sdk.getServiceUrls().searchService + 'search/?startIndex=0&pageSize='+rviNumberCookie+'&filter=productCode+eq+'+filter;
                    api.request('GET', serviceurl).then(function(productslist){
                        var orderedProductList = [];
                        for(var i = 0;i<cookieValue.length;i++) {
                            var productAvailable = _.findWhere(productslist.items, {productCode: cookieValue[i].pCode});
                            if (productAvailable) {
                                orderedProductList.push(productAvailable);
                                continue;
                            }
                        }
                        if(orderedProductList.length > 0) {
                            $(container).removeClass('hide').append('<div class="row"><div class="col-xs-12"><div class="recently-viewed-list"></div></div></div><div class="clearfix"></div>');
                            for(var p=0;p<orderedProductList.length;p++) {
                                var view = new ProductListItemView({ model: new Model(orderedProductList[p]) });
                                var renderedView = view.render().el;
                                $(container + ' .recently-viewed-list').append(renderedView);
                            }
                            if(orderedProductList.length > 1){
                                $(container + ' .recently-viewed-list').slick({
                                    infinite: false,
                                    slidesToShow: 7,
                                    prevArrow: '<i class="fa fa-angle-left" aria-hidden="true"></i>',
                                    nextArrow: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
                                    responsive: [{
                                            breakpoint: 992,
                                            settings: {
                                                arrows: true,
                                                slidesToShow: 5
                                            }
                                        },
                                        {
                                            breakpoint: 768,
                                            settings: {
                                                arrows: true,
                                                slidesToShow: 2
                                            }
                                        }
                                    ]
                                });
                            }
                        }
                        hideLoader();
                    }, function(){
                        hideLoader();
                    });    
                }
            }
        }

        function deleteProduct(product) {
            var isExist = false;
            for(var i=0;i<cookieValue.length;i++) {
                if(cookieValue[i].pCode == product) {
                    cookieValue.splice(i, 1);
                    isExist = true;
                    break;
                }
            }
            if(isExist) {
                deleteProduct(product);
            }
            else {
                $.cookie(cookieName, JSON.stringify(cookieValue), {expires: rviExpirationDuration, path: '/'});
            }
        }

        function getSize() {
            var size = 0;
            for(var i=0;i<cookieValue.length;i++) {
                if(cookieValue[i].last + rviDuration > (new Date()).getTime()) {
                    size++;
                }
            }
            return size;
        }

    return {
        addProduct: addProduct,
        deleteProduct: deleteProduct,
        renderRVI: renderRVI,
        getSize: getSize
    };
});
define('pages/family',[
    'modules/jquery-mozu',
    'underscore',
    "modules/api",
    "modules/backbone-mozu",
    'hyprlivecontext',
    "bxslider",
    'modules/block-ui',
    "hyprlive",
    'modules/models-product',
    'modules/general-functions'
], function($, _, api, Backbone, HyprLiveContext, bxslider, blockUiLoader, Hypr, ProductModels, generalFunctions) {
    var sitecontext = HyprLiveContext.locals.siteContext,
    cdn = sitecontext.cdnPrefix,
    siteID = cdn.substring(cdn.lastIndexOf('-') + 1),
    imagefilepath = cdn + '/cms/' + siteID + '/files',
    width_fam = HyprLiveContext.locals.themeSettings.familyProductImageMaxWidth,
    deviceType = navigator.userAgent.match(/Android|BlackBerry|iPhone|iPod|Opera Mini|IEMobile/i);    

    var FamilyItemView = Backbone.MozuView.extend({
        tagName: 'div',
        className: 'mz-familylist-item col-xs-12',
        templateName: 'modules/product/family/family-item',
        additionalEvents: {
            "click [data-mz-product-option-attribute]": "onOptionChangeAttribute",
            "click [data-mz-qty-minus]": "quantityMinus",
            "click [data-mz-qty-plus]": "quantityPlus",
            'mouseenter .color-options': 'onMouseEnterChangeImage',
            'mouseleave .color-options': 'onMouseLeaveResetImage'
        },
        initialize: function() {
            var self = this;
            self.listenTo(self.model, 'change', self.render);
        },
        render: function() {
            var oneSizeOption = "",
                id = Hypr.getThemeSetting('oneSizeAttributeName');
            if(this.model.get('options') && this.model.get('options').length)
                oneSizeOption = this.model.get('options').get(id);
            if (oneSizeOption) {
                var onlyEnabledOneSizeOption = _.find(oneSizeOption.get('values'), function(value) { return value.isEnabled; });
                oneSizeOption.set('value', onlyEnabledOneSizeOption.value);
            }
            Backbone.MozuView.prototype.render.apply(this);
            return this;
        },
        checkLimitOfSku: function(skuID,itemQuantity, callback) {
            //var itemQuantity = this.model.get('quantity');
            var pdtCode= this.model.get('productCode');
            var limitAttribute = _.findWhere(this.model.get('properties'), { "attributeFQN": "tenant~limitPerOrder" });
            api.get("cart").then(function(resp) {
                var cartItems = resp.data.items;
                for (var i = 0; i < cartItems.length; i++) {
                    if (cartItems[i].product.mfgPartNumber === skuID) {
                        itemQuantity += cartItems[i].quantity;
                    }
                }                 
                if (limitAttribute) {
                    var limitperorder = parseInt(JSON.parse(limitAttribute.values[0].stringValue)[skuID], 10);
                    if (itemQuantity > limitperorder) {
                        $('#'+pdtCode).find("[data-mz-validationmessage-for='quantity']").text("*Max " + limitperorder + " items are allowed.");
                        $('#'+pdtCode).find("[data-mz-qty-plus]").prop('disabled', true);
                        callback(false);
                    } else {
                        $('#'+pdtCode).find("[data-mz-validationmessage-for='quantity']").text("");
                        $('#'+pdtCode).find("[data-mz-qty-plus]").prop('disabled', false);
                        callback(true);
                    }
                } else {
                    callback(true);
                }
            });

        },
        quantityMinus: function() {
        	var self=this;
            this.model.messages.reset();
            var qty = this.model.get('quantity');
            if (qty === 0) {
                //this.model.trigger('error', {message: Hypr.getLabel("quantityZeroError")});
                return;
            }            
            var skuID;
            var limitAttribute = _.findWhere(this.model.get('properties'), { "attributeFQN": "tenant~limitPerOrder" });
            	
		            if (this.model.attributes.variationProductCode) {
		                skuID = this.model.attributes.variationProductCode;
		            } else {
		                skuID = this.model.attributes.mfgPartNumber;
		            }
		            var qntyMns=qty-1;
		            blockUiLoader.globalLoader();
		            this.checkLimitOfSku(skuID,qntyMns, function(response) {
		                blockUiLoader.unblockUi();
		               if (response) {
		                    self.model.set('quantity',--qty);
		                }
		            });
        		
        },
        quantityPlus: function() {
        	var self=this;
            this.model.messages.reset();
            var qty = this.model.get('quantity');
            var skuID;
            var limitAttribute = _.findWhere(this.model.get('properties'), { "attributeFQN": "tenant~limitPerOrder" });
            
                if (this.model.attributes.variationProductCode) {
                    skuID = this.model.attributes.variationProductCode;
                } else {
                    skuID = this.model.attributes.mfgPartNumber;
                }
                var qntyPls=qty+1;
                blockUiLoader.globalLoader();
                this.checkLimitOfSku(skuID,qntyPls, function(response) {
                    blockUiLoader.unblockUi();
                    if (response) {                        
                       self.model.set('quantity',++qty);
                    }
                });
            
        },
        onOptionChangeAttribute: function(e) {
            return this.configureAttribute($(e.currentTarget));
        },
        configureAttribute: function($optionEl) {
            var $this = this;
            if (!$optionEl.hasClass("active")) {
                if ($optionEl.attr('disabled') == 'disabled') {
                    return false;
                } else {
                    blockUiLoader.globalLoader();
                    var newValue = $optionEl.data('value'),
                        oldValue,
                        id = $optionEl.data('mz-product-option-attribute'),
                        optionEl = $optionEl[0],
                        isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked,
                        option = this.model.get('options').get(id);
                    if (!option) {
                        var byIDVal = JSON.parse(JSON.stringify(this.model.get('options')._byId));
                        for (var key in byIDVal) {
                            if (id === byIDVal[key].attributeFQN) {
                                option = this.model.get('options').get(key);
                            }
                        }
                    }
                    if (option) {
                        if (option.get('attributeDetail').inputType === "YesNo") {
                            option.set("value", isPicked);
                        } else if (isPicked) {
                            oldValue = option.get('value');
                            if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                                option.set('value', newValue);
                            }
                        }
                    }
                    this.model.whenReady(function() { 
                        setTimeout(function() {
                            blockUiLoader.unblockUi();
                            $this.isColorClicked = false; 
                        }, 1000);
                    });
                }
            }
        },
        onMouseEnterChangeImage: function(_e) {
            if (!deviceType) {                          
                this.mainImage = $(_e.delegateTarget).find('img').attr('src');                
                var colorCode = $(_e.currentTarget).data('mz-swatch-color');
                this.changeImages(_e,colorCode, 'N');
            }
        },
        onMouseLeaveResetImage: function(_e) {
            if (!this.isColorClicked && !deviceType) {
                var colorCode = $(_e.delegateTarget).find('ul.product-color-swatches').find('li.active').data('mz-swatch-color');
                if (typeof colorCode != 'undefined') {
                    this.changeImages(_e,colorCode, 'N');
                } else if (typeof this.mainImage != 'undefined') {
                    $(_e.delegateTarget).find('img').attr('src', this.mainImage);
                } else {
                    $('.mz-productimages-main').html('<span class="mz-productlisting-imageplaceholder img-responsive"><span class="mz-productlisting-imageplaceholdertext">[no image]</span></span>');
                }
            }
        },
        selectSwatch: function(e) {
            this.isColorClicked = true;
            var colorCode = $(e.currentTarget).data('mz-swatch-color');
            this.changeImages(e,colorCode, 'Y');

        },
        changeImages: function(_e,colorCode, _updateThumbNails) {
            var self = this;
            var version = 1;
       
            var imagepath = imagefilepath + '/' + this.model.attributes.productCode + '_' + colorCode + '_v' + version + '.jpg';
            var mainImage = imagepath + '?maxWidth='+ width_fam;
      
            var _this = this;
            //TODO: following function is checking if images exist on server or not
            generalFunctions.checkImage(imagepath, function(response) {
                if (response) {
                        $(_e.delegateTarget).find('img').attr('src', mainImage);
                        if(self.isColorClicked)
                            self.model.set('mainImage', imagepath);
                } else if (typeof self.mainImage === 'undefined') {
                    $('.mz-productimages-main').html('<span class="mz-productlisting-imageplaceholder img-responsive"><span class="mz-productlisting-imageplaceholdertext">[no image]</span></span>');
                }
               
            });
        }
    });
    var Model = Backbone.MozuModel.extend();
    return FamilyItemView;
});

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define('async',["exports"],t):t(e.async=e.async||{})}(this,function(exports){function apply(e,t,r){switch(r.length){case 0:return e.call(t);case 1:return e.call(t,r[0]);case 2:return e.call(t,r[0],r[1]);case 3:return e.call(t,r[0],r[1],r[2])}return e.apply(t,r)}function overRest$1(e,t,r){return t=nativeMax(void 0===t?e.length-1:t,0),function(){for(var n=arguments,o=-1,i=nativeMax(n.length-t,0),a=Array(i);++o<i;)a[o]=n[t+o];o=-1;for(var s=Array(t+1);++o<t;)s[o]=n[o];return s[t]=r(a),apply(e,this,s)}}function identity(e){return e}function rest(e,t){return overRest$1(e,t,identity)}function isObject(e){var t=typeof e;return null!=e&&("object"==t||"function"==t)}function asyncify(e){return initialParams(function(t,r){var n;try{n=e.apply(this,t)}catch(e){return r(e)}isObject(n)&&"function"==typeof n.then?n.then(function(e){r(null,e)},function(e){r(e.message?e:new Error(e))}):r(null,n)})}function supportsAsync(){var supported;try{supported=isAsync(eval("(async function () {})"))}catch(e){supported=!1}return supported}function isAsync(e){return supportsSymbol&&"AsyncFunction"===e[Symbol.toStringTag]}function wrapAsync(e){return isAsync(e)?asyncify(e):e}function applyEach$1(e){return rest(function(t,r){var n=initialParams(function(r,n){var o=this;return e(t,function(e,t){wrapAsync$1(e).apply(o,r.concat(t))},n)});return r.length?n.apply(this,r):n})}function getRawTag(e){var t=hasOwnProperty.call(e,symToStringTag$1),r=e[symToStringTag$1];try{e[symToStringTag$1]=void 0;var n=!0}catch(e){}var o=nativeObjectToString.call(e);return n&&(t?e[symToStringTag$1]=r:delete e[symToStringTag$1]),o}function objectToString(e){return nativeObjectToString$1.call(e)}function baseGetTag(e){return null==e?void 0===e?undefinedTag:nullTag:(e=Object(e),symToStringTag&&symToStringTag in e?getRawTag(e):objectToString(e))}function isFunction(e){if(!isObject(e))return!1;var t=baseGetTag(e);return t==funcTag||t==genTag||t==asyncTag||t==proxyTag}function isLength(e){return"number"==typeof e&&e>-1&&e%1==0&&e<=MAX_SAFE_INTEGER}function isArrayLike(e){return null!=e&&isLength(e.length)&&!isFunction(e)}function noop(){}function once(e){return function(){if(null!==e){var t=e;e=null,t.apply(this,arguments)}}}function baseTimes(e,t){for(var r=-1,n=Array(e);++r<e;)n[r]=t(r);return n}function isObjectLike(e){return null!=e&&"object"==typeof e}function baseIsArguments(e){return isObjectLike(e)&&baseGetTag(e)==argsTag}function stubFalse(){return!1}function isIndex(e,t){return t=null==t?MAX_SAFE_INTEGER$1:t,!!t&&("number"==typeof e||reIsUint.test(e))&&e>-1&&e%1==0&&e<t}function baseIsTypedArray(e){return isObjectLike(e)&&isLength(e.length)&&!!typedArrayTags[baseGetTag(e)]}function baseUnary(e){return function(t){return e(t)}}function arrayLikeKeys(e,t){var r=isArray(e),n=!r&&isArguments(e),o=!r&&!n&&isBuffer(e),i=!r&&!n&&!o&&isTypedArray(e),a=r||n||o||i,s=a?baseTimes(e.length,String):[],c=s.length;for(var u in e)!t&&!hasOwnProperty$1.call(e,u)||a&&("length"==u||o&&("offset"==u||"parent"==u)||i&&("buffer"==u||"byteLength"==u||"byteOffset"==u)||isIndex(u,c))||s.push(u);return s}function isPrototype(e){var t=e&&e.constructor,r="function"==typeof t&&t.prototype||objectProto$5;return e===r}function overArg(e,t){return function(r){return e(t(r))}}function baseKeys(e){if(!isPrototype(e))return nativeKeys(e);var t=[];for(var r in Object(e))hasOwnProperty$3.call(e,r)&&"constructor"!=r&&t.push(r);return t}function keys(e){return isArrayLike(e)?arrayLikeKeys(e):baseKeys(e)}function createArrayIterator(e){var t=-1,r=e.length;return function(){return++t<r?{value:e[t],key:t}:null}}function createES2015Iterator(e){var t=-1;return function(){var r=e.next();return r.done?null:(t++,{value:r.value,key:t})}}function createObjectIterator(e){var t=keys(e),r=-1,n=t.length;return function(){var o=t[++r];return r<n?{value:e[o],key:o}:null}}function iterator(e){if(isArrayLike(e))return createArrayIterator(e);var t=getIterator(e);return t?createES2015Iterator(t):createObjectIterator(e)}function onlyOnce(e){return function(){if(null===e)throw new Error("Callback was already called.");var t=e;e=null,t.apply(this,arguments)}}function _eachOfLimit(e){return function(t,r,n){function o(e,t){if(c-=1,e)s=!0,n(e);else{if(t===breakLoop||s&&c<=0)return s=!0,n(null);i()}}function i(){for(;c<e&&!s;){var t=a();if(null===t)return s=!0,void(c<=0&&n(null));c+=1,r(t.value,t.key,onlyOnce(o))}}if(n=once(n||noop),e<=0||!t)return n(null);var a=iterator(t),s=!1,c=0;i()}}function eachOfLimit(e,t,r,n){_eachOfLimit(t)(e,wrapAsync$1(r),n)}function doLimit(e,t){return function(r,n,o){return e(r,t,n,o)}}function eachOfArrayLike(e,t,r){function n(e,t){e?r(e):++i!==a&&t!==breakLoop||r(null)}r=once(r||noop);var o=0,i=0,a=e.length;for(0===a&&r(null);o<a;o++)t(e[o],o,onlyOnce(n))}function doParallel(e){return function(t,r,n){return e(eachOf,t,wrapAsync$1(r),n)}}function _asyncMap(e,t,r,n){n=n||noop,t=t||[];var o=[],i=0,a=wrapAsync$1(r);e(t,function(e,t,r){var n=i++;a(e,function(e,t){o[n]=t,r(e)})},function(e){n(e,o)})}function doParallelLimit(e){return function(t,r,n,o){return e(_eachOfLimit(r),t,wrapAsync$1(n),o)}}function arrayEach(e,t){for(var r=-1,n=null==e?0:e.length;++r<n&&t(e[r],r,e)!==!1;);return e}function createBaseFor(e){return function(t,r,n){for(var o=-1,i=Object(t),a=n(t),s=a.length;s--;){var c=a[e?s:++o];if(r(i[c],c,i)===!1)break}return t}}function baseForOwn(e,t){return e&&baseFor(e,t,keys)}function baseFindIndex(e,t,r,n){for(var o=e.length,i=r+(n?1:-1);n?i--:++i<o;)if(t(e[i],i,e))return i;return-1}function baseIsNaN(e){return e!==e}function strictIndexOf(e,t,r){for(var n=r-1,o=e.length;++n<o;)if(e[n]===t)return n;return-1}function baseIndexOf(e,t,r){return t===t?strictIndexOf(e,t,r):baseFindIndex(e,baseIsNaN,r)}function arrayMap(e,t){for(var r=-1,n=null==e?0:e.length,o=Array(n);++r<n;)o[r]=t(e[r],r,e);return o}function isSymbol(e){return"symbol"==typeof e||isObjectLike(e)&&baseGetTag(e)==symbolTag}function baseToString(e){if("string"==typeof e)return e;if(isArray(e))return arrayMap(e,baseToString)+"";if(isSymbol(e))return symbolToString?symbolToString.call(e):"";var t=e+"";return"0"==t&&1/e==-INFINITY?"-0":t}function baseSlice(e,t,r){var n=-1,o=e.length;t<0&&(t=-t>o?0:o+t),r=r>o?o:r,r<0&&(r+=o),o=t>r?0:r-t>>>0,t>>>=0;for(var i=Array(o);++n<o;)i[n]=e[n+t];return i}function castSlice(e,t,r){var n=e.length;return r=void 0===r?n:r,!t&&r>=n?e:baseSlice(e,t,r)}function charsEndIndex(e,t){for(var r=e.length;r--&&baseIndexOf(t,e[r],0)>-1;);return r}function charsStartIndex(e,t){for(var r=-1,n=e.length;++r<n&&baseIndexOf(t,e[r],0)>-1;);return r}function asciiToArray(e){return e.split("")}function hasUnicode(e){return reHasUnicode.test(e)}function unicodeToArray(e){return e.match(reUnicode)||[]}function stringToArray(e){return hasUnicode(e)?unicodeToArray(e):asciiToArray(e)}function toString(e){return null==e?"":baseToString(e)}function trim(e,t,r){if(e=toString(e),e&&(r||void 0===t))return e.replace(reTrim,"");if(!e||!(t=baseToString(t)))return e;var n=stringToArray(e),o=stringToArray(t),i=charsStartIndex(n,o),a=charsEndIndex(n,o)+1;return castSlice(n,i,a).join("")}function parseParams(e){return e=e.toString().replace(STRIP_COMMENTS,""),e=e.match(FN_ARGS)[2].replace(" ",""),e=e?e.split(FN_ARG_SPLIT):[],e=e.map(function(e){return trim(e.replace(FN_ARG,""))})}function autoInject(e,t){var r={};baseForOwn(e,function(e,t){function n(t,r){var n=arrayMap(o,function(e){return t[e]});n.push(r),wrapAsync$1(e).apply(null,n)}var o,i=isAsync(e),a=!i&&1===e.length||i&&0===e.length;if(isArray(e))o=e.slice(0,-1),e=e[e.length-1],r[t]=o.concat(o.length>0?n:e);else if(a)r[t]=e;else{if(o=parseParams(e),0===e.length&&!i&&0===o.length)throw new Error("autoInject task functions require explicit parameters.");i||o.pop(),r[t]=o.concat(n)}}),auto(r,t)}function fallback(e){setTimeout(e,0)}function wrap(e){return rest(function(t,r){e(function(){t.apply(null,r)})})}function DLL(){this.head=this.tail=null,this.length=0}function setInitial(e,t){e.length=1,e.head=e.tail=t}function queue(e,t,r){function n(e,t,r){if(null!=r&&"function"!=typeof r)throw new Error("task callback must be a function");if(u.started=!0,isArray(e)||(e=[e]),0===e.length&&u.idle())return setImmediate$1(function(){u.drain()});for(var n=0,o=e.length;n<o;n++){var i={data:e[n],callback:r||noop};t?u._tasks.unshift(i):u._tasks.push(i)}setImmediate$1(u.process)}function o(e){return rest(function(t){a-=1;for(var r=0,n=e.length;r<n;r++){var o=e[r],i=baseIndexOf(s,o,0);i>=0&&s.splice(i),o.callback.apply(o,t),null!=t[0]&&u.error(t[0],o.data)}a<=u.concurrency-u.buffer&&u.unsaturated(),u.idle()&&u.drain(),u.process()})}if(null==t)t=1;else if(0===t)throw new Error("Concurrency must not be zero");var i=wrapAsync$1(e),a=0,s=[],c=!1,u={_tasks:new DLL,concurrency:t,payload:r,saturated:noop,unsaturated:noop,buffer:t/4,empty:noop,drain:noop,error:noop,started:!1,paused:!1,push:function(e,t){n(e,!1,t)},kill:function(){u.drain=noop,u._tasks.empty()},unshift:function(e,t){n(e,!0,t)},process:function(){if(!c){for(c=!0;!u.paused&&a<u.concurrency&&u._tasks.length;){var e=[],t=[],r=u._tasks.length;u.payload&&(r=Math.min(r,u.payload));for(var n=0;n<r;n++){var l=u._tasks.shift();e.push(l),t.push(l.data)}0===u._tasks.length&&u.empty(),a+=1,s.push(e[0]),a===u.concurrency&&u.saturated();var f=onlyOnce(o(e));i(t,f)}c=!1}},length:function(){return u._tasks.length},running:function(){return a},workersList:function(){return s},idle:function(){return u._tasks.length+a===0},pause:function(){u.paused=!0},resume:function(){u.paused!==!1&&(u.paused=!1,setImmediate$1(u.process))}};return u}function cargo(e,t){return queue(e,1,t)}function reduce(e,t,r,n){n=once(n||noop);var o=wrapAsync$1(r);eachOfSeries(e,function(e,r,n){o(t,e,function(e,r){t=r,n(e)})},function(e){n(e,t)})}function concat$1(e,t,r,n){var o=[];e(t,function(e,t,n){r(e,function(e,t){o=o.concat(t||[]),n(e)})},function(e){n(e,o)})}function doSeries(e){return function(t,r,n){return e(eachOfSeries,t,wrapAsync$1(r),n)}}function _createTester(e,t){return function(r,n,o,i){i=i||noop;var a,s=!1;r(n,function(r,n,i){o(r,function(n,o){n?i(n):e(o)&&!a?(s=!0,a=t(!0,r),i(null,breakLoop)):i()})},function(e){e?i(e):i(null,s?a:t(!1))})}}function _findGetResult(e,t){return t}function consoleFunc(e){return rest(function(t,r){wrapAsync$1(t).apply(null,r.concat(rest(function(t,r){"object"==typeof console&&(t?console.error&&console.error(t):console[e]&&arrayEach(r,function(t){console[e](t)}))})))})}function doDuring(e,t,r){function n(e,t){return e?r(e):t?void o(a):r(null)}r=onlyOnce(r||noop);var o=wrapAsync$1(e),i=wrapAsync$1(t),a=rest(function(e,t){return e?r(e):(t.push(n),void i.apply(this,t))});n(null,!0)}function doWhilst(e,t,r){r=onlyOnce(r||noop);var n=wrapAsync$1(e),o=rest(function(e,i){return e?r(e):t.apply(this,i)?n(o):void r.apply(null,[null].concat(i))});n(o)}function doUntil(e,t,r){doWhilst(e,function(){return!t.apply(this,arguments)},r)}function during(e,t,r){function n(e){return e?r(e):void a(o)}function o(e,t){return e?r(e):t?void i(n):r(null)}r=onlyOnce(r||noop);var i=wrapAsync$1(t),a=wrapAsync$1(e);a(o)}function _withoutIndex(e){return function(t,r,n){return e(t,n)}}function eachLimit(e,t,r){eachOf(e,_withoutIndex(wrapAsync$1(t)),r)}function eachLimit$1(e,t,r,n){_eachOfLimit(t)(e,_withoutIndex(wrapAsync$1(r)),n)}function ensureAsync(e){return isAsync(e)?e:initialParams(function(t,r){var n=!0;t.push(function(){var e=arguments;n?setImmediate$1(function(){r.apply(null,e)}):r.apply(null,e)}),e.apply(this,t),n=!1})}function notId(e){return!e}function baseProperty(e){return function(t){return null==t?void 0:t[e]}}function filterArray(e,t,r,n){var o=new Array(t.length);e(t,function(e,t,n){r(e,function(e,r){o[t]=!!r,n(e)})},function(e){if(e)return n(e);for(var r=[],i=0;i<t.length;i++)o[i]&&r.push(t[i]);n(null,r)})}function filterGeneric(e,t,r,n){var o=[];e(t,function(e,t,n){r(e,function(r,i){r?n(r):(i&&o.push({index:t,value:e}),n())})},function(e){e?n(e):n(null,arrayMap(o.sort(function(e,t){return e.index-t.index}),baseProperty("value")))})}function _filter(e,t,r,n){var o=isArrayLike(t)?filterArray:filterGeneric;o(e,t,wrapAsync$1(r),n||noop)}function forever(e,t){function r(e){return e?n(e):void o(r)}var n=onlyOnce(t||noop),o=wrapAsync$1(ensureAsync(e));r()}function mapValuesLimit(e,t,r,n){n=once(n||noop);var o={},i=wrapAsync$1(r);eachOfLimit(e,t,function(e,t,r){i(e,t,function(e,n){return e?r(e):(o[t]=n,void r())})},function(e){n(e,o)})}function has(e,t){return t in e}function memoize(e,t){var r=Object.create(null),n=Object.create(null);t=t||identity;var o=wrapAsync$1(e),i=initialParams(function(e,i){var a=t.apply(null,e);has(r,a)?setImmediate$1(function(){i.apply(null,r[a])}):has(n,a)?n[a].push(i):(n[a]=[i],o.apply(null,e.concat(rest(function(e){r[a]=e;var t=n[a];delete n[a];for(var o=0,i=t.length;o<i;o++)t[o].apply(null,e)}))))});return i.memo=r,i.unmemoized=e,i}function _parallel(e,t,r){r=r||noop;var n=isArrayLike(t)?[]:{};e(t,function(e,t,r){wrapAsync$1(e)(rest(function(e,o){o.length<=1&&(o=o[0]),n[t]=o,r(e)}))},function(e){r(e,n)})}function parallelLimit(e,t){_parallel(eachOf,e,t)}function parallelLimit$1(e,t,r){_parallel(_eachOfLimit(t),e,r)}function race(e,t){if(t=once(t||noop),!isArray(e))return t(new TypeError("First argument to race must be an array of functions"));if(!e.length)return t();for(var r=0,n=e.length;r<n;r++)wrapAsync$1(e[r])(t)}function reduceRight(e,t,r,n){var o=slice.call(e).reverse();reduce(o,t,r,n)}function reflect(e){var t=wrapAsync$1(e);return initialParams(function(e,r){return e.push(rest(function(e,t){if(e)r(null,{error:e});else{var n=null;1===t.length?n=t[0]:t.length>1&&(n=t),r(null,{value:n})}})),t.apply(this,e)})}function reject$1(e,t,r,n){_filter(e,t,function(e,t){r(e,function(e,r){t(e,!r)})},n)}function reflectAll(e){var t;return isArray(e)?t=arrayMap(e,reflect):(t={},baseForOwn(e,function(e,r){t[r]=reflect.call(this,e)})),t}function constant$1(e){return function(){return e}}function retry(e,t,r){function n(e,t){if("object"==typeof t)e.times=+t.times||i,e.intervalFunc="function"==typeof t.interval?t.interval:constant$1(+t.interval||a),e.errorFilter=t.errorFilter;else{if("number"!=typeof t&&"string"!=typeof t)throw new Error("Invalid arguments for async.retry");e.times=+t||i}}function o(){c(function(e){e&&u++<s.times&&("function"!=typeof s.errorFilter||s.errorFilter(e))?setTimeout(o,s.intervalFunc(u)):r.apply(null,arguments)})}var i=5,a=0,s={times:i,intervalFunc:constant$1(a)};if(arguments.length<3&&"function"==typeof e?(r=t||noop,t=e):(n(s,e),r=r||noop),"function"!=typeof t)throw new Error("Invalid arguments for async.retry");var c=wrapAsync$1(t),u=1;o()}function series(e,t){_parallel(eachOfSeries,e,t)}function sortBy(e,t,r){function n(e,t){var r=e.criteria,n=t.criteria;return r<n?-1:r>n?1:0}var o=wrapAsync$1(t);map(e,function(e,t){o(e,function(r,n){return r?t(r):void t(null,{value:e,criteria:n})})},function(e,t){return e?r(e):void r(null,arrayMap(t.sort(n),baseProperty("value")))})}function timeout(e,t,r){function n(){s||(i.apply(null,arguments),clearTimeout(a))}function o(){var t=e.name||"anonymous",n=new Error('Callback function "'+t+'" timed out.');n.code="ETIMEDOUT",r&&(n.info=r),s=!0,i(n)}var i,a,s=!1,c=wrapAsync$1(e);return initialParams(function(e,r){i=r,a=setTimeout(o,t),c.apply(null,e.concat(n))})}function baseRange(e,t,r,n){for(var o=-1,i=nativeMax$1(nativeCeil((t-e)/(r||1)),0),a=Array(i);i--;)a[n?i:++o]=e,e+=r;return a}function timeLimit(e,t,r,n){var o=wrapAsync$1(r);mapLimit(baseRange(0,e,1),t,o,n)}function transform(e,t,r,n){arguments.length<=3&&(n=r,r=t,t=isArray(e)?[]:{}),n=once(n||noop);var o=wrapAsync$1(r);eachOf(e,function(e,r,n){o(t,e,r,n)},function(e){n(e,t)})}function unmemoize(e){return function(){return(e.unmemoized||e).apply(null,arguments)}}function whilst(e,t,r){r=onlyOnce(r||noop);var n=wrapAsync$1(t);if(!e())return r(null);var o=rest(function(t,i){return t?r(t):e()?n(o):void r.apply(null,[null].concat(i))});n(o)}function until(e,t,r){whilst(function(){return!e.apply(this,arguments)},t,r)}var nativeMax=Math.max,initialParams=function(e){return rest(function(t){var r=t.pop();e.call(this,t,r)})},supportsSymbol="function"==typeof Symbol,wrapAsync$1=supportsAsync()?wrapAsync:identity,freeGlobal="object"==typeof global&&global&&global.Object===Object&&global,freeSelf="object"==typeof self&&self&&self.Object===Object&&self,root=freeGlobal||freeSelf||Function("return this")(),Symbol$1=root.Symbol,objectProto=Object.prototype,hasOwnProperty=objectProto.hasOwnProperty,nativeObjectToString=objectProto.toString,symToStringTag$1=Symbol$1?Symbol$1.toStringTag:void 0,objectProto$1=Object.prototype,nativeObjectToString$1=objectProto$1.toString,nullTag="[object Null]",undefinedTag="[object Undefined]",symToStringTag=Symbol$1?Symbol$1.toStringTag:void 0,asyncTag="[object AsyncFunction]",funcTag="[object Function]",genTag="[object GeneratorFunction]",proxyTag="[object Proxy]",MAX_SAFE_INTEGER=9007199254740991,breakLoop={},iteratorSymbol="function"==typeof Symbol&&Symbol.iterator,getIterator=function(e){return iteratorSymbol&&e[iteratorSymbol]&&e[iteratorSymbol]()},argsTag="[object Arguments]",objectProto$3=Object.prototype,hasOwnProperty$2=objectProto$3.hasOwnProperty,propertyIsEnumerable=objectProto$3.propertyIsEnumerable,isArguments=baseIsArguments(function(){return arguments}())?baseIsArguments:function(e){return isObjectLike(e)&&hasOwnProperty$2.call(e,"callee")&&!propertyIsEnumerable.call(e,"callee")},isArray=Array.isArray,freeExports="object"==typeof exports&&exports&&!exports.nodeType&&exports,freeModule=freeExports&&"object"==typeof module&&module&&!module.nodeType&&module,moduleExports=freeModule&&freeModule.exports===freeExports,Buffer=moduleExports?root.Buffer:void 0,nativeIsBuffer=Buffer?Buffer.isBuffer:void 0,isBuffer=nativeIsBuffer||stubFalse,MAX_SAFE_INTEGER$1=9007199254740991,reIsUint=/^(?:0|[1-9]\d*)$/,argsTag$1="[object Arguments]",arrayTag="[object Array]",boolTag="[object Boolean]",dateTag="[object Date]",errorTag="[object Error]",funcTag$1="[object Function]",mapTag="[object Map]",numberTag="[object Number]",objectTag="[object Object]",regexpTag="[object RegExp]",setTag="[object Set]",stringTag="[object String]",weakMapTag="[object WeakMap]",arrayBufferTag="[object ArrayBuffer]",dataViewTag="[object DataView]",float32Tag="[object Float32Array]",float64Tag="[object Float64Array]",int8Tag="[object Int8Array]",int16Tag="[object Int16Array]",int32Tag="[object Int32Array]",uint8Tag="[object Uint8Array]",uint8ClampedTag="[object Uint8ClampedArray]",uint16Tag="[object Uint16Array]",uint32Tag="[object Uint32Array]",typedArrayTags={};typedArrayTags[float32Tag]=typedArrayTags[float64Tag]=typedArrayTags[int8Tag]=typedArrayTags[int16Tag]=typedArrayTags[int32Tag]=typedArrayTags[uint8Tag]=typedArrayTags[uint8ClampedTag]=typedArrayTags[uint16Tag]=typedArrayTags[uint32Tag]=!0,typedArrayTags[argsTag$1]=typedArrayTags[arrayTag]=typedArrayTags[arrayBufferTag]=typedArrayTags[boolTag]=typedArrayTags[dataViewTag]=typedArrayTags[dateTag]=typedArrayTags[errorTag]=typedArrayTags[funcTag$1]=typedArrayTags[mapTag]=typedArrayTags[numberTag]=typedArrayTags[objectTag]=typedArrayTags[regexpTag]=typedArrayTags[setTag]=typedArrayTags[stringTag]=typedArrayTags[weakMapTag]=!1;var freeExports$1="object"==typeof exports&&exports&&!exports.nodeType&&exports,freeModule$1=freeExports$1&&"object"==typeof module&&module&&!module.nodeType&&module,moduleExports$1=freeModule$1&&freeModule$1.exports===freeExports$1,freeProcess=moduleExports$1&&freeGlobal.process,nodeUtil=function(){try{return freeProcess&&freeProcess.binding("util")}catch(e){}}(),nodeIsTypedArray=nodeUtil&&nodeUtil.isTypedArray,isTypedArray=nodeIsTypedArray?baseUnary(nodeIsTypedArray):baseIsTypedArray,objectProto$2=Object.prototype,hasOwnProperty$1=objectProto$2.hasOwnProperty,objectProto$5=Object.prototype,nativeKeys=overArg(Object.keys,Object),objectProto$4=Object.prototype,hasOwnProperty$3=objectProto$4.hasOwnProperty,eachOfGeneric=doLimit(eachOfLimit,1/0),eachOf=function(e,t,r){var n=isArrayLike(e)?eachOfArrayLike:eachOfGeneric;n(e,wrapAsync$1(t),r)},map=doParallel(_asyncMap),applyEach=applyEach$1(map),mapLimit=doParallelLimit(_asyncMap),mapSeries=doLimit(mapLimit,1),applyEachSeries=applyEach$1(mapSeries),apply$2=rest(function(e,t){return rest(function(r){return e.apply(null,t.concat(r))})}),baseFor=createBaseFor(),auto=function(e,t,r){function n(e,t){g.push(function(){s(e,t)})}function o(){if(0===g.length&&0===y)return r(null,p);for(;g.length&&y<t;){var e=g.shift();e()}}function i(e,t){var r=d[e];r||(r=d[e]=[]),r.push(t)}function a(e){var t=d[e]||[];arrayEach(t,function(e){e()}),o()}function s(e,t){if(!m){var n=onlyOnce(rest(function(t,n){if(y--,n.length<=1&&(n=n[0]),t){var o={};baseForOwn(p,function(e,t){o[t]=e}),o[e]=n,m=!0,d=Object.create(null),r(t,o)}else p[e]=n,a(e)}));y++;var o=wrapAsync$1(t[t.length-1]);t.length>1?o(p,n):o(n)}}function c(){for(var e,t=0;h.length;)e=h.pop(),t++,arrayEach(u(e),function(e){0===--b[e]&&h.push(e)});if(t!==f)throw new Error("async.auto cannot execute tasks due to a recursive dependency")}function u(t){var r=[];return baseForOwn(e,function(e,n){isArray(e)&&baseIndexOf(e,t,0)>=0&&r.push(n)}),r}"function"==typeof t&&(r=t,t=null),r=once(r||noop);var l=keys(e),f=l.length;if(!f)return r(null);t||(t=f);var p={},y=0,m=!1,d=Object.create(null),g=[],h=[],b={};baseForOwn(e,function(t,r){if(!isArray(t))return n(r,[t]),void h.push(r);var o=t.slice(0,t.length-1),a=o.length;return 0===a?(n(r,t),void h.push(r)):(b[r]=a,void arrayEach(o,function(s){if(!e[s])throw new Error("async.auto task `"+r+"` has a non-existent dependency `"+s+"` in "+o.join(", "));i(s,function(){a--,0===a&&n(r,t)})}))}),c(),o()},symbolTag="[object Symbol]",INFINITY=1/0,symbolProto=Symbol$1?Symbol$1.prototype:void 0,symbolToString=symbolProto?symbolProto.toString:void 0,rsAstralRange="\\ud800-\\udfff",rsComboMarksRange="\\u0300-\\u036f\\ufe20-\\ufe23",rsComboSymbolsRange="\\u20d0-\\u20f0",rsVarRange="\\ufe0e\\ufe0f",rsZWJ="\\u200d",reHasUnicode=RegExp("["+rsZWJ+rsAstralRange+rsComboMarksRange+rsComboSymbolsRange+rsVarRange+"]"),rsAstralRange$1="\\ud800-\\udfff",rsComboMarksRange$1="\\u0300-\\u036f\\ufe20-\\ufe23",rsComboSymbolsRange$1="\\u20d0-\\u20f0",rsVarRange$1="\\ufe0e\\ufe0f",rsAstral="["+rsAstralRange$1+"]",rsCombo="["+rsComboMarksRange$1+rsComboSymbolsRange$1+"]",rsFitz="\\ud83c[\\udffb-\\udfff]",rsModifier="(?:"+rsCombo+"|"+rsFitz+")",rsNonAstral="[^"+rsAstralRange$1+"]",rsRegional="(?:\\ud83c[\\udde6-\\uddff]){2}",rsSurrPair="[\\ud800-\\udbff][\\udc00-\\udfff]",rsZWJ$1="\\u200d",reOptMod=rsModifier+"?",rsOptVar="["+rsVarRange$1+"]?",rsOptJoin="(?:"+rsZWJ$1+"(?:"+[rsNonAstral,rsRegional,rsSurrPair].join("|")+")"+rsOptVar+reOptMod+")*",rsSeq=rsOptVar+reOptMod+rsOptJoin,rsSymbol="(?:"+[rsNonAstral+rsCombo+"?",rsCombo,rsRegional,rsSurrPair,rsAstral].join("|")+")",reUnicode=RegExp(rsFitz+"(?="+rsFitz+")|"+rsSymbol+rsSeq,"g"),reTrim=/^\s+|\s+$/g,FN_ARGS=/^(?:async\s+)?(function)?\s*[^\(]*\(\s*([^\)]*)\)/m,FN_ARG_SPLIT=/,/,FN_ARG=/(=.+)?(\s*)$/,STRIP_COMMENTS=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm,hasSetImmediate="function"==typeof setImmediate&&setImmediate,hasNextTick="object"==typeof process&&"function"==typeof process.nextTick,_defer;_defer=hasSetImmediate?setImmediate:hasNextTick?process.nextTick:fallback;var setImmediate$1=wrap(_defer);DLL.prototype.removeLink=function(e){return e.prev?e.prev.next=e.next:this.head=e.next,e.next?e.next.prev=e.prev:this.tail=e.prev,e.prev=e.next=null,this.length-=1,e},DLL.prototype.empty=DLL,DLL.prototype.insertAfter=function(e,t){t.prev=e,t.next=e.next,e.next?e.next.prev=t:this.tail=t,e.next=t,this.length+=1},DLL.prototype.insertBefore=function(e,t){t.prev=e.prev,t.next=e,e.prev?e.prev.next=t:this.head=t,e.prev=t,this.length+=1},DLL.prototype.unshift=function(e){this.head?this.insertBefore(this.head,e):setInitial(this,e)},DLL.prototype.push=function(e){this.tail?this.insertAfter(this.tail,e):setInitial(this,e)},DLL.prototype.shift=function(){return this.head&&this.removeLink(this.head)},DLL.prototype.pop=function(){return this.tail&&this.removeLink(this.tail)};var eachOfSeries=doLimit(eachOfLimit,1),seq$1=rest(function(e){var t=arrayMap(e,wrapAsync$1);return rest(function(e){var r=this,n=e[e.length-1];"function"==typeof n?e.pop():n=noop,reduce(t,e,function(e,t,n){t.apply(r,e.concat(rest(function(e,t){n(e,t)})))},function(e,t){n.apply(r,[e].concat(t))})})}),compose=rest(function(e){return seq$1.apply(null,e.reverse())}),concat=doParallel(concat$1),concatSeries=doSeries(concat$1),constant=rest(function(e){var t=[null].concat(e);return initialParams(function(e,r){return r.apply(this,t)})}),detect=doParallel(_createTester(identity,_findGetResult)),detectLimit=doParallelLimit(_createTester(identity,_findGetResult)),detectSeries=doLimit(detectLimit,1),dir=consoleFunc("dir"),eachSeries=doLimit(eachLimit$1,1),every=doParallel(_createTester(notId,notId)),everyLimit=doParallelLimit(_createTester(notId,notId)),everySeries=doLimit(everyLimit,1),filter=doParallel(_filter),filterLimit=doParallelLimit(_filter),filterSeries=doLimit(filterLimit,1),groupByLimit=function(e,t,r,n){n=n||noop;var o=wrapAsync$1(r);mapLimit(e,t,function(e,t){o(e,function(r,n){return r?t(r):t(null,{key:n,val:e})})},function(e,t){for(var r={},o=Object.prototype.hasOwnProperty,i=0;i<t.length;i++)if(t[i]){var a=t[i].key,s=t[i].val;o.call(r,a)?r[a].push(s):r[a]=[s]}return n(e,r)})},groupBy=doLimit(groupByLimit,1/0),groupBySeries=doLimit(groupByLimit,1),log=consoleFunc("log"),mapValues=doLimit(mapValuesLimit,1/0),mapValuesSeries=doLimit(mapValuesLimit,1),_defer$1;_defer$1=hasNextTick?process.nextTick:hasSetImmediate?setImmediate:fallback;var nextTick=wrap(_defer$1),queue$1=function(e,t){var r=wrapAsync$1(e);return queue(function(e,t){r(e[0],t)},t,1)},priorityQueue=function(e,t){var r=queue$1(e,t);return r.push=function(e,t,n){if(null==n&&(n=noop),"function"!=typeof n)throw new Error("task callback must be a function");if(r.started=!0,isArray(e)||(e=[e]),0===e.length)return setImmediate$1(function(){r.drain()});t=t||0;for(var o=r._tasks.head;o&&t>=o.priority;)o=o.next;for(var i=0,a=e.length;i<a;i++){var s={data:e[i],priority:t,callback:n};o?r._tasks.insertBefore(o,s):r._tasks.push(s)}setImmediate$1(r.process)},delete r.unshift,r},slice=Array.prototype.slice,reject=doParallel(reject$1),rejectLimit=doParallelLimit(reject$1),rejectSeries=doLimit(rejectLimit,1),retryable=function(e,t){t||(t=e,e=null);var r=wrapAsync$1(t);return initialParams(function(t,n){function o(e){r.apply(null,t.concat(e))}e?retry(e,o,n):retry(o,n)})},some=doParallel(_createTester(Boolean,identity)),someLimit=doParallelLimit(_createTester(Boolean,identity)),someSeries=doLimit(someLimit,1),nativeCeil=Math.ceil,nativeMax$1=Math.max,times=doLimit(timeLimit,1/0),timesSeries=doLimit(timeLimit,1),waterfall=function(e,t){function r(o){if(n===e.length)return t.apply(null,[null].concat(o));var i=onlyOnce(rest(function(e,n){return e?t.apply(null,[e].concat(n)):void r(n)}));o.push(i);var a=wrapAsync$1(e[n++]);a.apply(null,o)}if(t=once(t||noop),!isArray(e))return t(new Error("First argument to waterfall must be an array of functions"));if(!e.length)return t();var n=0;r([])},index={applyEach:applyEach,applyEachSeries:applyEachSeries,apply:apply$2,asyncify:asyncify,auto:auto,autoInject:autoInject,cargo:cargo,compose:compose,concat:concat,concatSeries:concatSeries,constant:constant,detect:detect,detectLimit:detectLimit,detectSeries:detectSeries,dir:dir,doDuring:doDuring,doUntil:doUntil,doWhilst:doWhilst,during:during,each:eachLimit,eachLimit:eachLimit$1,eachOf:eachOf,eachOfLimit:eachOfLimit,eachOfSeries:eachOfSeries,eachSeries:eachSeries,ensureAsync:ensureAsync,every:every,everyLimit:everyLimit,everySeries:everySeries,filter:filter,filterLimit:filterLimit,filterSeries:filterSeries,forever:forever,groupBy:groupBy,groupByLimit:groupByLimit,groupBySeries:groupBySeries,log:log,map:map,mapLimit:mapLimit,mapSeries:mapSeries,mapValues:mapValues,mapValuesLimit:mapValuesLimit,mapValuesSeries:mapValuesSeries,memoize:memoize,nextTick:nextTick,parallel:parallelLimit,parallelLimit:parallelLimit$1,priorityQueue:priorityQueue,queue:queue$1,race:race,reduce:reduce,reduceRight:reduceRight,reflect:reflect,reflectAll:reflectAll,reject:reject,rejectLimit:rejectLimit,rejectSeries:rejectSeries,retry:retry,retryable:retryable,seq:seq$1,series:series,setImmediate:setImmediate$1,some:some,someLimit:someLimit,someSeries:someSeries,sortBy:sortBy,timeout:timeout,times:times,timesLimit:timeLimit,timesSeries:timesSeries,transform:transform,unmemoize:unmemoize,until:until,waterfall:waterfall,whilst:whilst,all:every,any:some,forEach:eachLimit,forEachSeries:eachSeries,forEachLimit:eachLimit$1,forEachOf:eachOf,forEachOfSeries:eachOfSeries,forEachOfLimit:eachOfLimit,inject:reduce,foldl:reduce,foldr:reduceRight,select:filter,selectLimit:filterLimit,selectSeries:filterSeries,wrapSync:asyncify};exports.default=index,exports.applyEach=applyEach,exports.applyEachSeries=applyEachSeries,exports.apply=apply$2,exports.asyncify=asyncify,exports.auto=auto,exports.autoInject=autoInject,exports.cargo=cargo,exports.compose=compose,exports.concat=concat,exports.concatSeries=concatSeries,exports.constant=constant,exports.detect=detect,exports.detectLimit=detectLimit,exports.detectSeries=detectSeries,exports.dir=dir,exports.doDuring=doDuring,exports.doUntil=doUntil,exports.doWhilst=doWhilst,exports.during=during,exports.each=eachLimit,exports.eachLimit=eachLimit$1,exports.eachOf=eachOf,exports.eachOfLimit=eachOfLimit,exports.eachOfSeries=eachOfSeries,exports.eachSeries=eachSeries,exports.ensureAsync=ensureAsync,exports.every=every,exports.everyLimit=everyLimit,exports.everySeries=everySeries,exports.filter=filter,exports.filterLimit=filterLimit,exports.filterSeries=filterSeries,exports.forever=forever,exports.groupBy=groupBy,exports.groupByLimit=groupByLimit,exports.groupBySeries=groupBySeries,exports.log=log,exports.map=map,exports.mapLimit=mapLimit,exports.mapSeries=mapSeries,exports.mapValues=mapValues,exports.mapValuesLimit=mapValuesLimit,exports.mapValuesSeries=mapValuesSeries,exports.memoize=memoize,exports.nextTick=nextTick,exports.parallel=parallelLimit,exports.parallelLimit=parallelLimit$1,exports.priorityQueue=priorityQueue,exports.queue=queue$1,exports.race=race,exports.reduce=reduce,exports.reduceRight=reduceRight,exports.reflect=reflect,exports.reflectAll=reflectAll,exports.reject=reject,exports.rejectLimit=rejectLimit,exports.rejectSeries=rejectSeries,exports.retry=retry,exports.retryable=retryable,exports.seq=seq$1,exports.series=series,exports.setImmediate=setImmediate$1,exports.some=some,exports.someLimit=someLimit,exports.someSeries=someSeries,exports.sortBy=sortBy,exports.timeout=timeout,exports.times=times,exports.timesLimit=timeLimit,exports.timesSeries=timesSeries,exports.transform=transform,exports.unmemoize=unmemoize,exports.until=until,exports.waterfall=waterfall,exports.whilst=whilst,exports.all=every,exports.allLimit=everyLimit,exports.allSeries=everySeries,exports.any=some,exports.anyLimit=someLimit,exports.anySeries=someSeries,exports.find=detect,exports.findLimit=detectLimit,exports.findSeries=detectSeries,exports.forEach=eachLimit,exports.forEachSeries=eachSeries,exports.forEachLimit=eachLimit$1,exports.forEachOf=eachOf,exports.forEachOfSeries=eachOfSeries,exports.forEachOfLimit=eachOfLimit,exports.inject=reduce,exports.foldl=reduce,exports.foldr=reduceRight,exports.select=filter,exports.selectLimit=filterLimit,exports.selectSeries=filterSeries,exports.wrapSync=asyncify,Object.defineProperty(exports,"__esModule",{value:!0})});
require([
    "modules/jquery-mozu",
    "underscore",
    "bxslider",
    "elevatezoom",
    'modules/block-ui',
    "hyprlive",
    "hyprlivecontext",
    "modules/backbone-mozu",
    "modules/cart-monitor",
    "modules/models-product",
    "modules/views-productimages",
    "modules/product/recently-viewed-products",
    "pages/family",
    "modules/api",
    "async",
    'modules/general-functions'
], function($, _, bxslider, elevatezoom, blockUiLoader, Hypr, HyprLiveContext, Backbone, CartMonitor, ProductModels, ProductImageViews, RVIModel, FamilyItemView, api, async, generalFunctions) {

    var sitecontext = HyprLiveContext.locals.siteContext,
        pagecontext = HyprLiveContext.locals.pageContext,
        cdn = sitecontext.cdnPrefix,
        siteID = cdn.substring(cdn.lastIndexOf('-') + 1),
        imagefilepath = cdn + '/cms/' + siteID + '/files',
        slider,
        slider_mobile,
        productInitialImages,
        priceModel,
        width_thumb = HyprLiveContext.locals.themeSettings.maxProductImageThumbnailSize,
        width_pdp = HyprLiveContext.locals.themeSettings.productImagePdpMaxWidth,
        width_zoom = HyprLiveContext.locals.themeSettings.productZoomImageMaxWidth,
        current_zoom_id_added,
        deviceType = navigator.userAgent.match(/Android|BlackBerry|iPhone|iPod|Opera Mini|IEMobile/i);

    function initSlider() {
        slider = $('#productpager-Carousel').bxSlider({
            slideWidth: 90,
            minSlides: 4,
            maxSlides: 4,
            moveSlides: 1,
            slideMargin: 15,
            nextText: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
            prevText: '<i class="fa fa-angle-left" aria-hidden="true"></i>',
            infiniteLoop: false,
            hideControlOnEnd: true,
            pager: false
        });
        window.slider = slider;
    }

    function initslider_mobile() {
        var id;
        if (current_zoom_id_added)
            id = $(current_zoom_id_added)[0].attributes.id.value.replace('zoom_', '') - 1;
        slider_mobile = $('#productmobile-Carousel').bxSlider({
            slideWidth: 300,
            minSlides: 1,
            maxSlides: 1,
            moveSlides: 1,
            preloadImages: 'all',
            onSliderLoad: function(currentIndex) {
                $('ul#productmobile-Carousel li').eq(currentIndex).find('img').addClass("active");
                $("#productmobile-Carousel,#productCarousel-pager").css("visibility", "visible");
            },
            onSlideAfter: function($slideElement, oldIndex, newIndex) {
                $('.zoomContainer').remove();
                current_zoom_id_added.elevateZoom({ zoomType: "inner", cursor: "crosshair" }).addClass('active');
                var bkimg = $(current_zoom_id_added)[0].attributes['data-zoom-image'].value;
                $(".mz-productimages-pager div").removeClass("activepager").eq(newIndex).addClass("activepager");
                setTimeout(function() {
                    $('div.zoomWindowContainer div').css({ 'background-image': 'url(' + bkimg + ')' });
                }, 500);

            },
            onSlideBefore: function(currentSlide, totalSlides, currentSlideHtmlObject) {
                var current_zoom_id = '#' + $('#productmobile-Carousel>li').eq(currentSlideHtmlObject).find('img').attr('id');
                $('.zoomContainer').remove();
                $(current_zoom_id).removeData('elevateZoom');
                current_zoom_id_added = $('#productmobile-Carousel>li').eq(currentSlideHtmlObject).find('img');
                $('ul#productmobile-Carousel li img').removeClass('active');
            },
            startSlide: id ? id : 0,
            nextText: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
            prevText: '<i class="fa fa-angle-left" aria-hidden="true"></i>',
            infiniteLoop: false,
            hideControlOnEnd: true,
            pager: true,
            pagerCustom: '#productCarousel-pager'
        });
    }


    function updateImages(productInitialImages) {
        if (productInitialImages && productInitialImages.mainImage) {
            var mainImage = productInitialImages.mainImage.src + '?maxWidth=' + width_pdp;
            var zoomImage = productInitialImages.mainImage.src + '?maxWidth=' + width_zoom;
            $('body div.zoomContainer').remove();
            $('#zoom').removeData('elevateZoom');
            $('.mz-productimages-mainimage').attr('src', mainImage).data('zoom-image', zoomImage);
            $('#zoom').elevateZoom({ zoomType: "inner", cursor: "crosshair" });
            try {
                slider.destroySlider();
            } catch (e) {}
        }
        if (productInitialImages && productInitialImages.thumbImages) {
            var slideCount = productInitialImages.thumbImages.length;
            for (var i = 1; i <= productInitialImages.thumbImages.length; i++) {
                $(".mz-productimages-thumbs li:eq(" + (i - 1) + ") .mz-productimages-thumb img")
                    .attr({
                        "src": productInitialImages.thumbImages[i - 1].src + '?maxWidth=' + width_thumb,
                        "data-orig-src": productInitialImages.thumbImages[i - 1].src + '?maxWidth=' + width_pdp,
                        "data-orig-zoom": productInitialImages.thumbImages[i - 1].src + '?maxWidth=' + width_zoom
                    });
            }
            if (slideCount > 4) {
                initSlider();
            }
            initslider_mobile();
        }
    }
    window.family = [];
    var ProductView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-detail',
        autoUpdate: ['quantity'],
        renderOnChange: [
            'quantity',
            'stockInfo'
        ],
        additionalEvents: {
            "change [data-mz-product-option]": "onOptionChange",
            "blur [data-mz-product-option]": "onOptionChange",
            "click [data-mz-product-option-attribute]": "onOptionChangeAttribute",
            "click [data-mz-qty-minus]": "quantityMinus",
            "click [data-mz-qty-plus]": "quantityPlus",
            'mouseenter .color-options': 'onMouseEnterChangeImage',
            'mouseleave .color-options': 'onMouseLeaveResetImage',
            'click li.mz-productlist-item': 'checkCookie',
            'click .mz-productlist-item': 'checkCookie',
            'click .mz-recentproductlist-item': 'checkCookie'
        },
        checkCookie: function() {
            generalFunctions.checkCookie();
        },
        render: function() {
            var me = this;
            var oneSizeOption = "",
                id = Hypr.getThemeSetting('oneSizeAttributeName');
            if(this.model.get('options') && this.model.get('options').length)
                oneSizeOption = this.model.get('options').get(id);
            if (oneSizeOption) {
                var onlyEnabledOneSizeOption = _.find(oneSizeOption.get('values'), function(value) { return value.isEnabled; });
                oneSizeOption.set('value', onlyEnabledOneSizeOption.value);
            }
            Backbone.MozuView.prototype.render.apply(this);
            this.$('[data-mz-is-datepicker]').each(function(ix, dp) {
                $(dp).dateinput().css('color', Hypr.getThemeSetting('textColor')).on('change  blur', _.bind(me.onOptionChangeAttribute, me));
            });
            $(".family-details [data-mz-action='addToCart']").addClass('hide');
            $(".mz-productdetail-conversion-buttons").removeClass('hide');

            if (this.model.get('productType') === Hypr.getThemeSetting('familyProductType')) {
                try {
                    blockUiLoader.globalLoader();
                    $('.family-details .mz-productdetail-shortdesc, .family-details .stock-info, .family-details .mz-reset-padding-left, .family-details #SelectValidOption').remove();
                    var familyData = me.model.get('family');
                    $("#mz-family-container .family-members").empty();
                    var familyItemModelOnready = function() {
                        var product = familyData.models[this.index];
                        if (typeof product.get('inventoryInfo').onlineStockAvailable !== 'undefined' && product.get('inventoryInfo').onlineStockAvailable === 0 && product.get('inventoryInfo').outOfStockBehavior === "HideProduct") {
                            //if all family members are out of stock, disable add to cart button.
                            if (window.outOfStockFamily) {
                                $(".family-details [data-mz-action='addToCart']").addClass('hide');
                                $("[data-mz-action='addToCart']").addClass('button_disabled').attr("disabled", "disabled");
                            }
                        } else {
                            var productCode = product.get('productCode');
                            var view = new FamilyItemView({
                                model: product,
                                messagesEl: $('#family-item-error-' + productCode + " [data-mz-message-bar]")
                            });
                            window.family.push(view);
                            var renderedView = view.render().el;
                            $("#mz-family-container").find("#" + productCode).append(renderedView);
                            $(".family-details [data-mz-action='addToCart']").removeClass('hide');
                            //if all family members are out of stock, disable add to cart button.
                            if (window.outOfStockFamily) {
                                $("[data-mz-action='addToCart']").addClass('button_disabled').attr("disabled", "disabled");
                            }
                        }
                    };
                    if (familyData.models.length) {
                        for (var i = 0; i < familyData.models.length; i++) {
                            //var x = this.model.checkVariationCode(familyData.models[i]);
                            var familyItemModel = familyData.models[i];
                            if (familyItemModel.get("isReady")) {
                                familyItemModel.off('ready');
                                familyItemModelOnready.call({ index: i });
                            } else {
                                familyItemModel.on('ready', familyItemModelOnready.bind({ index: i }));
                                if (i === (familyData.models.length - 1)) {
                                    blockUiLoader.unblockUi();
                                }
                            }
                        }
                    } else {
                        $(".family-details [data-mz-action='addToCart']").addClass('hide');
                        $("[data-mz-action='addToCart']").addClass('button_disabled').attr("disabled", "disabled");
                        blockUiLoader.unblockUi();
                    }
                } catch (e) {}
            }
            var promoStatus = generalFunctions.checkPromo(this.model);
            if (promoStatus) {
                $('#product-detail .promo').show();
            }
        },
        checkLimitOfSku: function(skuID, callback) {
            var itemQuantity = window.productView.model.get('quantity');
            api.get("cart").then(function(resp) {
                var cartItems = resp.data.items;
                for (var i = 0; i < cartItems.length; i++) {
                    if (cartItems[i].product.mfgPartNumber === skuID) {
                        itemQuantity += cartItems[i].quantity;
                    }
                }
                if (require.mozuData('limit') && require.mozuData('limit').stringValue !== "") {

                    var limitperorder = parseInt(JSON.parse(require.mozuData('limit').stringValue)[skuID], 10);
                    if (itemQuantity > limitperorder) {
                        //$('[data-mz-validationmessage-for="quantity"]').text("*Max " + limitperorder + " items are allowed.");
                        callback(limitperorder);
                    } else {
                        //$('[data-mz-validationmessage-for="quantity"]').css('visibility', "visible").text("");
                        callback(false);
                    }
                } else {
                    callback(false);
                }
            });

        },
        quantityMinus: function() {
            this.model.messages.reset();
            var qty = this.model.get('quantity');
            if (qty === 1) {
                return;
            }
            this.model.set('quantity', --qty);
            /*$('[data-mz-validationmessage-for="quantity"]').text('');
            var value = parseInt($('.mz-productdetail-qty').val(), 10);
            //var value = this.model.get('quantity');
            if (value == 1) {
                $('[data-mz-validationmessage-for="quantity"]').text("Quantity can't be zero.");
                return;
            }
            --value;
            $('.mz-productdetail-qty').val(value);
            //this.model.set('quantity',--value);*/
            var skuID;
            if (window.productView.model.attributes.variationProductCode) {
                skuID = window.productView.model.attributes.variationProductCode;
            } else {
                skuID = window.productView.model.attributes.mfgPartNumber;
            }
            blockUiLoader.globalLoader();
            this.checkLimitOfSku(skuID, function(response) {
                blockUiLoader.unblockUi();
                if (typeof window.productView.model.attributes.inventoryInfo.onlineStockAvailable !== "undefined" && window.productView.model.attributes.inventoryInfo.outOfStockBehavior != "AllowBackOrder") {
                    var onlineStock = window.productView.model.attributes.inventoryInfo.onlineStockAvailable;
                    /*if (onlineStock >= window.productView.model.get('quantity')){
                        $("#add-to-cart").removeClass("button_disabled");
                    }*/
                    if (response) {
                        if (response <= onlineStock) {
                            $('[data-mz-validationmessage-for="quantity"]').css('visibility', "visible").text("*Max " + response + " items are allowed.");
                            $("[data-mz-action='addToCart']").addClass("button_disabled");
                            $('#plus').addClass('disabled btn-disable-color');
                        }
                        if (onlineStock !== 0 && onlineStock < response) {
                            $('[data-mz-validationmessage-for="quantity"]').css('visibility', "visible").text("*Only " + onlineStock + " left in stock.");
                            $("[data-mz-action='addToCart']").addClass("button_disabled");
                            $('#plus').addClass('disabled btn-disable-color');
                        }
                    } else {
                        if (onlineStock >= window.productView.model.get('quantity')) {
                            $("[data-mz-action='addToCart']").removeClass("button_disabled");
                            $('#plus').removeClass('disabled btn-disable-color');
                        }
                    }
                }
            });
        },
        quantityPlus: function() {
            if (this.model.attributes.soldOut === false && !$("#plus").hasClass('disabled')) {
                this.model.messages.reset();
                var qty = this.model.get('quantity');
                this.model.set('quantity', ++qty);
                /*$('[data-mz-validationmessage-for="quantity"]').text('');
                var value = parseInt($('.mz-productdetail-qty').val(), 10);
                //var value = this.model.get('quantity');
                if (value == 99) {
                    $('[data-mz-validationmessage-for="quantity"]').text("Quantity can't be greater than 99.");
                    return;
                }
                ++value;
                $('.mz-productdetail-qty').val(value);
                //this.model.set('quantity',++value);*/
                var skuID;
                if (window.productView.model.attributes.variationProductCode) {
                    skuID = window.productView.model.attributes.variationProductCode;
                } else {
                    skuID = window.productView.model.attributes.mfgPartNumber;
                }
                blockUiLoader.globalLoader();
                this.checkLimitOfSku(skuID, function(response) {
                    blockUiLoader.unblockUi();
                    if (typeof window.productView.model.attributes.inventoryInfo.onlineStockAvailable !== "undefined" && window.productView.model.attributes.inventoryInfo.outOfStockBehavior != "AllowBackOrder") {
                        var onlineStock = window.productView.model.attributes.inventoryInfo.onlineStockAvailable;
                        /*if (onlineStock >= window.productView.model.get('quantity')){
                            $("#add-to-cart").removeClass("button_disabled");
                        }*/
                        if (response) {
                            if (response <= onlineStock) {
                                $('[data-mz-validationmessage-for="quantity"]').css('visibility', "visible").text("*Max " + response + " items are allowed.");
                                $("[data-mz-action='addToCart']").addClass("button_disabled");
                                $('#plus').addClass('disabled btn-disable-color');
                            }
                            if (onlineStock !== 0 && onlineStock < response) {
                                $('[data-mz-validationmessage-for="quantity"]').css('visibility', "visible").text("*Only " + onlineStock + " left in stock.");
                                $("[data-mz-action='addToCart']").addClass("button_disabled");
                                $('#plus').addClass('disabled btn-disable-color');
                            }
                        } else {
                            if (onlineStock < window.productView.model.get('quantity')) {
                                $('[data-mz-validationmessage-for="quantity"]').css('visibility', "visible").text("*Only " + onlineStock + " left in stock.");
                                $("[data-mz-action='addToCart']").addClass("button_disabled");
                                $('#plus').addClass('disabled btn-disable-color');
                            }
                            if (onlineStock >= window.productView.model.get('quantity')) {
                                $("[data-mz-action='addToCart']").removeClass("button_disabled");
                            }
                        }
                    }
                });
            }
        },
        onOptionChangeAttribute: function(e) {
            return this.configureAttribute($(e.currentTarget));
        },
        configureAttribute: function($optionEl) {
            var $this = this;
            if (!$optionEl.hasClass("active")) {
                if ($optionEl.attr('disabled') == 'disabled') {
                    return false;
                } else {
                    blockUiLoader.globalLoader();
                    var newValue = $optionEl.data('value'),
                        oldValue,
                        id = $optionEl.data('mz-product-option-attribute'),
                        optionEl = $optionEl[0],
                        isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked,
                        option = this.model.get('options').get(id);
                    if (!option) {
                        var byIDVal = JSON.parse(JSON.stringify(this.model.get('options')._byId));
                        for (var key in byIDVal) {
                            if (id === byIDVal[key].attributeFQN) {
                                option = this.model.get('options').get(key);
                            }
                        }
                    }
                    if (option) {
                        if (option.get('attributeDetail').inputType === "YesNo") {
                            option.set("value", isPicked);
                        } else if (isPicked) {
                            oldValue = option.get('value');
                            if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                                option.set('value', newValue);
                                this.render();
                            }
                        }
                    }
                    this.model.whenReady(function() {
                        setTimeout(function() {
                            if (window.productView.model.get('variationProductCode') && typeof window.productView.model.get('variationProductCode') !== "undefined") {
                                $(".mz-productcodes-productcode").text(Hypr.getLabel('sku') + " # " + window.productView.model.get('variationProductCode'));
                            }
                            $('.mz-productdetail-price.prize-mobile-view').html($('.mz-l-stack-section.mz-productdetail-conversion .mz-productdetail-price').html());
                            blockUiLoader.unblockUi();
                            $this.isColorClicked = false;
                        }, 1000);
                    });
                }
            }
        },
        onOptionChange: function(e) {
            return this.configure($(e.currentTarget));
        },
        configure: function($optionEl) {
            var newValue = $optionEl.val(),
                oldValue,
                id = $optionEl.data('mz-product-option'),
                optionEl = $optionEl[0],
                isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked,
                option = this.model.get('options').get(id);
            if (option) {
                if (option.get('attributeDetail').inputType === "YesNo") {
                    option.set("value", isPicked);
                } else if (isPicked) {
                    oldValue = option.get('value');
                    if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                        option.set('value', newValue);
                    }
                }
            }
        },
        addToCart: _.debounce(function() {
            var me = this;
            me.model.messages.reset();
            //If Family Products
            if (this.model.get('productType') === Hypr.getThemeSetting('familyProductType')) {
                blockUiLoader.globalLoader();
                /* jshint ignore:start */
                var promises = [];
                var productsAdded = [];
                for (var i = 0; i < this.model.get('family').models.length; i++) {
                    promises.push((function(callback) {
                        var familyItem = me.model.get('family').models[this.index];
                        var productCode = familyItem.get('productCode');
                        familyItem.addToCart().then(function(e) {
                            //Clear options and set Qty to 0
                            for (var j = 0; j < window.family.length; j++) {
                                if (window.family[j].model.get('productCode') === productCode) {
                                    var optionModels = window.family[j].model.get('options').models;
                                    for (var k = 0; k < optionModels.length; k++) {
                                        optionModels[k].unset('value');
                                    }
                                    window.family[j].model.set('quantity', 0);
                                    window.family[j].model.unset('stockInfo');
                                    window.family[j].model.set('addedtocart', true);
                                }
                            }
                            productsAdded.push(e);
                            callback(null, e);
                        }, function(e) {
                            callback(null, e);
                        });
                    }).bind({ index: i }))
                }
                var errors = { "items": [] };
                async.series(promises, function(err, results) {
                        var resp = results.reduce(
                            function(flag, value) {
                                return flag && results[0] === value;
                            },
                            true
                        );
                        if (resp === true) {
                            window.productView.model.trigger('error', { message: Hypr.getLabel('selectValidOption') });
                            blockUiLoader.unblockUi();
                            return;
                        }
                        if (results) {
                            var failureNames = [];
                            var successNames = [];
                            for (var i = 0; i < results.length; i++) {
                                if (results[i].errorCode) {
                                    var errorMessage = results[i].message.split(':');
                                    failureNames.push(errorMessage[2]);
                                } else if (typeof results[i].attributes === 'undefined' && results[i].indexOf("Please enter quantity of ") !== -1) {
                                    failureNames.push(results[i]);
                                } else if (typeof results[i].attributes === 'undefined' && results[i].indexOf("Select Valid Option(s) for ") !== -1) {
                                    failureNames.push(results[i]);
                                } else if (typeof results[i].attributes !== 'undefined') {
                                    successNames.push(results[i].get('content').get('productName'));
                                }
                            }
                            if (failureNames.length) {
                                errors.items.push({
                                    "name": "error",
                                    "message": Hypr.getLabel('productaddToCartError') + ": " + failureNames.join(', ')
                                });
                            }
                            if (successNames.length) {
                                errors.items.push({
                                    "name": 'success',
                                    "message": Hypr.getLabel('successfullyAddedItems') + ": " + successNames.join(', '),
                                    "messageType": "success"
                                });
                            }
                            if (failureNames.length || successNames.length)
                                me.model.trigger("error", errors);
                        }
                        if (productsAdded.length)
                            CartMonitor.update('showGlobalCart');
                        if (!deviceType) {
                            $('html,body').animate({
                                scrollTop: $('figure.mz-productimages-main').offset().top
                            }, 1000);
                        } else {
                            $('html,body').animate({
                                scrollTop: $('.mz-product-top-content').offset().top
                            }, 1000);
                        }
                        blockUiLoader.unblockUi();
                    })
                    /* jshint ignore:end */
            } else if (typeof me.model.get('inventoryInfo').onlineStockAvailable !== 'undefined' && me.model.get('inventoryInfo').outOfStockBehavior === "AllowBackOrder") {
                me.model.addToCart();
            } else if (typeof me.model.get('inventoryInfo').onlineStockAvailable !== "undefined" && me.model.get('inventoryInfo').onlineStockAvailable === 0 && me.model.get('inventoryInfo').outOfStockBehavior === "DisplayMessage") {
                blockUiLoader.productValidationMessage();
                $('#SelectValidOption').children('span').html(Hypr.getLabel('productOutOfStock'));
            } else if (typeof me.model.get('inventoryInfo').onlineStockAvailable === "undefined" || $(".mz-productoptions-optioncontainer").length != $(".mz-productoptions-optioncontainer .active").length) {
                blockUiLoader.productValidationMessage();
            } else if (me.model.get('inventoryInfo').onlineStockAvailable) {
                if (me.model.get('inventoryInfo').onlineStockAvailable < me.model.get('quantity')) {
                    $('[data-mz-validationmessage-for="quantity"]').css('visibility', "visible").text("*Only " + me.model.get('inventoryInfo').onlineStockAvailable + " left in stock.");
                    return false;
                }
                var skuID;
                if (window.productView.model.attributes.variationProductCode) {
                    skuID = window.productView.model.attributes.variationProductCode;
                } else {
                    skuID = window.productView.model.attributes.mfgPartNumber;
                }
                this.checkLimitOfSku(skuID, function(response) {
                    if (!response) {
                        me.model.addToCart();
                    } else {
                        $("#add-to-cart").addClass("button_disabled");
                        $('[data-mz-validationmessage-for="quantity"]').css('visibility', "visible").text("*Max " + response + " items are allowed.");
                    }
                });
            }
        }, 1500),
        addToWishlist: function() {
            this.model.addToWishlist();
        },
        checkLocalStores: function(e) {
            var me = this;
            e.preventDefault();
            this.model.whenReady(function() {
                var $localStoresForm = $(e.currentTarget).parents('[data-mz-localstoresform]'),
                    $input = $localStoresForm.find('[data-mz-localstoresform-input]');
                if ($input.length > 0) {
                    $input.val(JSON.stringify(me.model.toJSON()));
                    $localStoresForm[0].submit();
                }
            });

        },
        onMouseEnterChangeImage: function(_e) {
            if (!deviceType) {
                this.mainImage = $('.mz-productimages-mainimage').attr('src');
                var colorCode = $(_e.currentTarget).data('mz-swatch-color');
                this.changeImages(colorCode, 'N');
            }
        },
        onMouseLeaveResetImage: function(_e) {
            if (!this.isColorClicked && !deviceType) {
                var colorCode = $("ul.product-color-swatches").find('li.active').data('mz-swatch-color');
                if (typeof colorCode != 'undefined') {
                    this.changeImages(colorCode, 'N');
                } else if (typeof this.mainImage != 'undefined') {
                    $('.mz-productimages-mainimage').attr('src', this.mainImage);
                } else {
                    $('.mz-productimages-main').html('<span class="mz-productlisting-imageplaceholder img-responsive"><span class="mz-productlisting-imageplaceholdertext">[no image]</span></span>');
                }
            }
        },
        selectSwatch: function(e) {
            this.isColorClicked = true;
            var colorCode = $(e.currentTarget).data('mz-swatch-color');
            this.changeImages(colorCode, 'Y');

        },
        changeImages: function(colorCode, _updateThumbNails) {
            var self = this;
            var version = 1;
            if (deviceType && $("figure.mz-productimages-thumbs ul.products_list_mobile li img.active").length > 0) {
                version = $("figure.mz-productimages-thumbs ul.products_list_mobile li img.active").data("mz-productimage-mobile");
            } else if ($("figure.mz-productimages-thumbs ul.products_list li.active").length > 0) {
                version = $("figure.mz-productimages-thumbs ul.products_list li.active").data("mz-productimage-thumb");
            }
            var imagepath = imagefilepath + '/' + this.model.attributes.productCode + '_' + colorCode + '_v' + version + '.jpg?maxWidth=';
            var mainImage = imagepath + width_pdp;
            var zoomimagepath = imagepath + width_zoom;
            var _this = this;
            //TODO: following function is checking if images exist on server or not
            generalFunctions.checkImage(imagepath, function(response) {
                if (response) {
                    if (!$('#zoom').length) {
                        $('.mz-productimages-main').html('<img class="mz-productimages-mainimage" data-mz-productimage-main="" id="zoom" itemprop="image">');
                    }
                    if (_updateThumbNails == 'Y') {
                        $('body div.zoomContainer').remove();
                        if (deviceType && $('ul.products_list_mobile').length) {
                            //slider_mobile.goToSlide(0);
                            $('body div.zoomContainer').remove();
                            $("img").removeData('elevateZoom');
                            $(current_zoom_id_added).attr('src', imagepath).data('zoom-image', zoomimagepath).elevateZoom({ zoomType: "inner", cursor: "crosshair" });
                        } else {
                            $('#zoom').removeData('elevateZoom');
                            $('.mz-productimages-mainimage').attr('src', mainImage).data('zoom-image', zoomimagepath);
                            $('#zoom').elevateZoom({ zoomType: "inner", cursor: "crosshair" });
                            $('.mz-productimages-mainimage').attr('src', mainImage);
                        }
                    } else {
                        $('.mz-productimages-mainimage').attr('src', mainImage);
                    }
                } else if (typeof self.mainImage === 'undefined') {
                    $('.mz-productimages-main').html('<span class="mz-productlisting-imageplaceholder img-responsive"><span class="mz-productlisting-imageplaceholdertext">[no image]</span></span>');
                }
                if ($("figure.mz-productimages-thumbs").length && $("figure.mz-productimages-thumbs").data("length") && _updateThumbNails == 'Y') {
                    _this.updateAltImages(colorCode);
                }
            });
        },
        updateAltImages: function(colorCode) {
            try {
                slider.destroySlider();
            } catch (e) {}
            try {
                slider_mobile.destroySlider();
            } catch (e) {}
            var slideCount = parseInt($("figure.mz-productimages-thumbs").data("length"), 10);
            var productCode = this.model.attributes.productCode;
            for (var i = 1; i <= slideCount; i++) {
                $(".mz-productimages-thumbs .products_list li:eq(" + (i - 1) + ") .mz-productimages-thumb img")
                    .attr({
                        "src": imagefilepath + '/' + this.model.attributes.productCode + '_' + colorCode + '_v' + i + '.jpg?maxWidth=' + width_thumb,
                        "data-orig-src": imagefilepath + '/' + this.model.attributes.productCode + '_' + colorCode + '_v' + i + '.jpg?maxWidth=' + width_pdp,
                        "data-orig-zoom": imagefilepath + '/' + this.model.attributes.productCode + '_' + colorCode + '_v' + i + '.jpg?maxWidth=' + width_zoom
                    });
                $(".mz-productimages-thumbs .products_list_mobile li:eq(" + (i - 1) + ") img")
                    .attr({
                        "src": imagefilepath + '/' + this.model.attributes.productCode + '_' + colorCode + '_v' + i + '.jpg?maxWidth=' + width_pdp,
                        "data-orig-src": imagefilepath + '/' + this.model.attributes.productCode + '_' + colorCode + '_v' + i + '.jpg?maxWidth=' + width_pdp,
                        "data-orig-zoom": imagefilepath + '/' + this.model.attributes.productCode + '_' + colorCode + '_v' + i + '.jpg?maxWidth=' + width_zoom,
                        "data-zoom-image": imagefilepath + '/' + this.model.attributes.productCode + '_' + colorCode + '_v' + i + '.jpg?maxWidth=' + width_zoom
                    });
            }
            if (slideCount > 4) {
                initSlider();
            }
            initslider_mobile();
        },
        initialize: function() {
            // handle preset selects, etc
            var me = this;
            //create div for family members
            if (this.model.get('family').models.length) {
                for (var i = 0; i < this.model.get('family').models.length; i++) {
                    var html = "";
                    html += '<div id="' + this.model.get('family').models[i].get('productCode') + '" class="family-members"></div>';
                    $("#mz-family-container").append(html);
                }
            }
            me.isColorClicked = false;
            me.mainImage = '';
            if (deviceType && me.model.get('content').get('productImages').length > 1)
                $('#zoom_1').elevateZoom({ zoomType: "inner", cursor: "crosshair", responsive: true });
            else
                $('#zoom').elevateZoom({ zoomType: "inner", cursor: "crosshair", responsive: true });
            this.$('[data-mz-product-option]').each(function() {
                var $this = $(this),
                    isChecked, wasChecked;
                if ($this.val()) {
                    switch ($this.attr('type')) {
                        case "checkbox":
                        case "radio":
                            isChecked = $this.prop('checked');
                            wasChecked = !!$this.attr('checked');
                            if ((isChecked && !wasChecked) || (wasChecked && !isChecked)) {
                                me.configure($this);
                            }
                            break;
                        default:
                            me.configure($this);
                    }
                }
            });
        }
    });

    RVIModel.renderRVI('#rvi-container');

    $(document).ready(function() {
        var product = ProductModels.Product.fromCurrent();

        if ($('.mz-product-detail-tabs ul.tabs li').length === 0)
            $('.mz-product-detail-tabs').remove();

        /*$('body').click("#promo-detail .promo-modal-close", function(){
            $('#promo-detail').modal('hide');
        }); */
        $('body').on('click', '#surcharge-details', function() {
            $('.del-surcharge-popup').modal('show');
        });
        product.on('addedtocart', function(cartitem) {
            if (cartitem && cartitem.prop('id')) {
                //product.isLoading(true);
                CartMonitor.addToCount(product.get('quantity'));
                $('html,body').animate({
                    scrollTop: $('header').offset().top
                }, 1000);
                CartMonitor.update('showGlobalCart');
                product.set('quantity', 1);
                var oneSizeOption = "",
                id = Hypr.getThemeSetting('oneSizeAttributeName');
                if(product.get('options') && product.get('options').length)
                    oneSizeOption = product.get('options').get(id);
                if (product.get('options') && product.get('options').length && !oneSizeOption) {
                    var optionModels = product.get('options').models;
                    for (var k = 0; k < product.get('options').models.length; k++) {
                        optionModels[k].set('value', null);
                        $("[data-mz-action='addToCart']").addClass('button_disabled');
                    }
                }
                if (oneSizeOption) {
                    var onlyEnabledOneSizeOption = _.find(oneSizeOption.get('values'), function(value) { return value.isEnabled; });
                    oneSizeOption.set('value', onlyEnabledOneSizeOption.value);
                    $("[data-mz-action='addToCart']").removeClass('button_disabled');
                }
                product.unset('stockInfo');
                var priceDiscountTemplate = Hypr.getTemplate("modules/product/price-stack");
                $('.mz-productdetail-price').html(priceDiscountTemplate.render({
                    model: priceModel
                }));
                $(".mz-productcodes-productcode").text(Hypr.getLabel('item') + " # " + product.get('productCode'));
            } else {
                product.trigger("error", { message: Hypr.getLabel('unexpectedError') });
            }
        });

        initSlider();
        initslider_mobile();
        //Custom Functions related to slider
        function createPager(carousal) {
            var totalSlides = carousal.getSlideCount();
            var newPager = $(".mz-productimages-pager");
            for (var i = 0; i < totalSlides; i++) {
                if (i === 0) {
                    newPager.append("<div data-mz-productimage-thumb=" + (i + 1) + " class=\"activepager\"></div>");
                } else {
                    newPager.append("<div data-mz-productimage-thumb=" + (i + 1) + " class=\"\"></div>");
                }
            }
            newPager.find('div').click(function() {
                var indx = $(".mz-productimages-pager div").index($(this));
                slider_mobile.goToSlide(indx);
                $(".mz-productimages-pager div").removeClass("activepager").eq(indx).addClass("activepager");
            });
        }
        if ($('#productmobile-Carousel').length) {
            createPager(slider_mobile);
        }

        var productView = new ProductView({
            el: $('.product-detail'),
            model: product,
            messagesEl: $('[data-mz-message-bar]')
        });

        var productImagesView = new ProductImageViews.ProductPageImagesView({
            el: $('[data-mz-productimages]'),
            model: product
        });

        window.productView = productView;
        window.familyLength = window.productView.model.attributes.family.models.length;

        productView.render();
        //IF on page laod Variation code is available then Displays UPC messages
        if (window.productView.model.get('variationProductCode')) {
            var sp_price = "";
            if (window.productView.model.get('inventoryInfo').onlineStockAvailable && typeof window.productView.model.get('inventoryInfo').onlineStockAvailable !== "undefined") {
                if (typeof window.productView.model.get('price').get('salePrice') != 'undefined')
                    sp_price = window.productView.model.get('price').get('salePrice');
                else
                    sp_price = window.productView.model.get('price').get('price');
                var price = Hypr.engine.render("{{price|currency}}", { locals: { price: sp_price } });
                $('.stock-info').show().html("In Stock <span class='stock-price'>" + price + "</span>");
            }
        }
        productInitialImages = {
            mainImage: product.attributes.mainImage,
            thumbImages: product.attributes.content.attributes.productImages
        };
        if (product.attributes.hasPriceRange) {
            priceModel = {
                hasPriceRange: product.attributes.hasPriceRange,
                priceRange: {
                    lower: product.attributes.priceRange.attributes.lower.attributes,
                    upper: product.attributes.priceRange.attributes.upper.attributes
                },
                price: product.attributes.price.attributes
            };
        } else {
            priceModel = {
                hasPriceRange: product.attributes.hasPriceRange,
                price: product.attributes.price.attributes
            };
        }
        var skuID;
        if (product.attributes.variationProductCode) {
            skuID = product.attributes.variationProductCode;
        } else {
            skuID = product.attributes.mfgPartNumber;
        }

        var itemQuantity = 1;
        api.get("cart").then(function(resp) {
            var cartItems = resp.data.items;
            for (var i = 0; i < cartItems.length; i++) {
                if (cartItems[i].product.mfgPartNumber === skuID) {
                    itemQuantity += cartItems[i].quantity;
                }
            }
            if (require.mozuData('limit') && require.mozuData('limit').stringValue !== "") {
                var limitperorder = parseInt(JSON.parse(require.mozuData('limit').stringValue)[skuID], 10);
                if (itemQuantity > limitperorder) {
                    $('[data-mz-validationmessage-for="quantity"]').css('visibility', "visible").text("*Max " + limitperorder + " items are allowed.");
                    $("[data-mz-action='addToCart']").addClass("button_disabled");
                } else {
                    $('[data-mz-validationmessage-for="quantity"]').css('visibility', "visible").text("");
                    $("[data-mz-action='addToCart']").removeClass("button_disabled");
                }
            }
        });
        $(".tab_content").hide();
        $(".tab_content:first").show();
        /* if in tab mode */
        $("ul.tabs li").click(function() {
            $(".tab_content").hide();
            var activeTab = $(this).attr("rel");
            $("#" + activeTab).fadeIn();
            $("ul.tabs li").removeClass("active");
            $(this).addClass("active");
            $(".tab_drawer_heading").removeClass("d_active");
            $(".tab_drawer_heading[rel^='" + activeTab + "']").addClass("d_active");
        });
        /* if in mobile mode */
        $(".tab_drawer_heading").click(function() {
            $(".tab_content").hide();
            var d_activeTab = $(this).attr("rel");
            $("#" + d_activeTab).fadeIn();
            $(".tab_drawer_heading").removeClass("d_active");
            $(this).addClass("d_active");
            $("ul.tabs li").removeClass("active");
            $("ul.tabs li[rel^='" + d_activeTab + "']").addClass("active");
        });
        $('body').on('click', '#mz-close-button', function(e) {
            e.preventDefault();
            blockUiLoader.unblockUi();
        });

    }).bind("touchstart", function(e) {
        var container = $(".ipad > div:visible");
        if (!$(e.target).closest(container).length) {
            var isDisplayed = (container.length > 0) ? container.css('visibility', 'hidden') : container.css('visibility', 'visible');
        }
    });
});
define("pages/product", function(){});
