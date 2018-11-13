define(
    ['modules/jquery-mozu', 'modules/backbone-mozu','hyprlive'],
    function($, Backbone, Hypr) {
        $(function() {
            $('#global-header-wrapper').each(function(index, globalHeader) {
                globalHeader = $(globalHeader);
                var globalHeaderIncludeClosed = sessionStorage.getItem('globalHeaderIncludeClosed');
                if (!globalHeaderIncludeClosed) {
                    globalHeader.slideDown();
                }

                globalHeader.on('click', '#globalHeaderIncludeCloseBtn', function() {
                    globalHeader.slideUp();
                    sessionStorage.setItem('globalHeaderIncludeClosed', true);
                });
            });
            $('#home-promo-wrapper').each(function(index, promo) {
                promo = $(promo);
                var homePromoClosed = sessionStorage.getItem('homePromoClosed');
                if (!homePromoClosed) {
                    promo.slideDown();
                }

                promo.on('click', '#homePromoCloseBtn', function() {
                    promo.slideUp();
                    sessionStorage.setItem('homePromoClosed', true);
                });
            });
            $("#btnFindStore").click(function(e) {
                e.preventDefault();
                var zipcode = $.trim($("#footerZipCodeInput").val());
                // zipcode = (zipcode.length === 0 ? "Enter+Zip" : zipcode);
                if(zipcode.length > 4) {
                    $('#zipcodeHelpBlock').text('');
                    window.location.href = window.location.origin + "/store-locator?zipcode=" + zipcode;
                } else {
                    $('#zipcodeHelpBlock').text(Hypr.getLabel('zipCodeEmpty'));
                }
            });
            $("#footerZipCodeInput").keydown(function(e) {
                if (e.which === 13) {
                    $("#btnFindStore").trigger("click");
                }
            });
            $("#footerSignUpInput").keydown(function(e) {
                if (e.which === 13) {
                    $("#emailSignUp").trigger("click");
                }
            });

             $("#emailSignUp").click(function(e) {                 
                e.preventDefault();
                if (Hypr.getThemeSetting('enableEmailSubscription')){
                    var email=$("#footerSignUpInput").val();
                    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if(re.test(email.toLowerCase())){
                         $("#emailHelpBlock").text("");
                         $("#footerSignUpInput").val("");
                        window.open(Hypr.getThemeSetting('emailSubscriptionUrl')+email,'hhm2m','height=640,width=960,resizable=yes,scrollbars=yes,status=no,titlebar=no');
                    } else {
                        $("#emailHelpBlock").text('Please enter a valid email');
                    }
                    return false;
               }
            });

            $("#headerEmailSignUp").click(function(e) {                 
                e.preventDefault();
                if (Hypr.getThemeSetting('enableEmailSubscription')){
                    window.open(Hypr.getThemeSetting('emailSubscriptionUrl'),'hhm2m','height=640,width=960,resizable=yes,scrollbars=yes,status=no,titlebar=no');
                    return false;
               }
            });

            var aoscookie = $.cookie("aos");
            if (aoscookie) {
                var aoscookieVal = JSON.parse(aoscookie);
                var aosBar = Backbone.MozuView.extend({
                    templateName: "modules/aos/aos-bar",
                    additionalEvents: {
                        "click #log-out": "logout"
                    },
                    render: function() {
                        var me = this;
                        Backbone.MozuView.prototype.render.apply(this);
                        $("#associate-login-container").css('display', 'block');
                    },
                    logout: function(e) {
                        e.preventDefault();
                        $.removeCookie('aos', { path: "/" });
                        window.location = '/aos';
                    }
                });
                var Model = Backbone.MozuModel.extend();
                var aos = new aosBar({
                    el: $('#associate-login-container'),
                    model: new Model(aoscookieVal)
                });
                aos.render();
            }
        });
    }
);