define([
        'modules/jquery-mozu',
        'underscore',
        'hyprlive',
        'hyprlivecontext',
        'modules/backbone-mozu',
        "modules/api",
        "async"
    ],
    function($, _, Hypr, hyprlivecontext, Backbone, api, async) {
        var RTIView = Backbone.MozuView.extend({
            templateName: "modules/category/rti-recommendations"
        });

        $(document).ready(function() {
            alert("Ok");
            $('.quick-view-btn').click(function(){
                console.log("Hello");
                var url = "https://costplus-harmon.baynote.net/recs/1/costplus_harmon?&attrs=Price&attrs=ProductId&attrs=ThumbUrl&attrs=Title&attrs=url&attrs=ProductCode&productId=800897836566&page=pdp&format=json";
                api.request("GET", "/commonRoute").then(function (response){
                   console.log("Success");    
                   if(response !== "FAILED") {
                        console.log("SUCCESS : " +response);
                   }
                   var StateModel = Backbone.Model.extend();
                   var rtiData = new StateModel(JSON.stringify(response));
                   console.log("State Model : "+ JSON.stringify(rtiData));
                   var view = new RTIView({
                        model: rtiData,
                        el: $('#qve-rti')
                    });
                    view.render();
                }, function(err) {
                    console.log("Error : "+JSON.stringify(err));
                });
                /*api.get(url).then(function(summary) {
                    console.log("SUCCESS : "+JSON.stringify(summary));
                }, 
                function(err){
                    console.log("Error : "+err);
                });*/
            });
        });
    });
