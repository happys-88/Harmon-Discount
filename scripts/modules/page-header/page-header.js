define([
    'modules/jquery-mozu',
    'modules/api',
    'modules/backbone-mozu',
    'modules/models-product'

], function($, api, Backbone, ProductModels) { 
           var quickview = Backbone.MozuView.extend({
                templateName: 'modules/page-header/threshold-Msg'          
            });
     api.request("GET", "/api/commerce/carts/current").then(function(res) {
        console.log("test");
       // console.log(res.discountThresholdMessages[0].message);
        console.log(JSON.stringify(res));
        console.log("test222");
            var product = new ProductModels.Product(res);
            var Quickview = new quickview({
            model: product,
            el: $('#thresholdMsg')
            });
            Quickview.render();
        });
    
    });

