define([
        'modules/jquery-mozu',
        'underscore',
        'modules/backbone-mozu',
        "modules/api",
        'slick' 
    ],
    function($, _, Backbone, api, slickSlider) {     
        var RTIView = Backbone.MozuView.extend({
            templateName: "modules/category/rti-recommendations"
        });
        var rti = {     
            update: function() {
                var self = this;
                $('.quick-view-btn').click(function(){
                    self.qvUpdate($(this).attr("data-target"));
                });
             },
             qvUpdate: function(prodCode) {
                api.request("POST", "/commonRoute", {'prodCode':prodCode}).then(function (response){
                   if(response !== "FAILED") {
                       var StateModel = Backbone.Model.extend();
                       var rtiData = new StateModel(response);                       
                       // console.log("State Model : "+ JSON.stringify(rtiData));
                       var slots = rtiData.attributes[0].slotResults;
                       _.each(slots, function(slot){
                        var url = slot.url;
                        var urlLink = new URL(url);
                        var host = urlLink.origin;
                            // console.log("SLot URL : "+slot.url);
                            slot.url = url.replace(host,'');
                       });
                       rtiData.attributes[0].slotResults = slots;
                       var view = new RTIView({
                            model: rtiData,
                            el: $('#qve-rti')
                        });
                        view.render(); 

                        // Call slick slider
                        $('.qv-rti-content .rti-product-slider').slick({  
                            infinite: false,
                            slidesToShow: 4, 
                            prevArrow: '<i class="fa fa-angle-left" aria-hidden="true"></i>',
                            nextArrow: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
                            responsive: [
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
                }, function(err) {
                    console.log("Error : "+JSON.stringify(err));
                });
             }
        };
     window.update=rti.update();
     return rti;
    }); 
