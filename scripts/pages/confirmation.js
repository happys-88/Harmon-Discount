define(['modules/api',
        'modules/backbone-mozu',
        'underscore',
        'modules/jquery-mozu',
        'modules/models-orders',
        'hyprlivecontext',
        'hyprlive',
        'modules/preserve-element-through-render'],
        function (api, Backbone, _, $, OrderModels, HyprLiveContext, Hypr, preserveElement) {
          /*
          Our Order Confirmation page doesn't involve too much logic, but our
          order model doesn't include enough details about pickup locations.
          We are running an api call with the fulfillmentLocationCodes of the
          items in the order. The model on the confirmation page will then
          include an array of locationDetails.
          */
          console.log("Load JS");
          $.cookie('paypal', null);
          $.cookie('GSIPaypal', null);
          $.cookie('PaypalAmnt', null);
          $.cookie('token', null);
          $.cookie('PayerID', null);
          var ConfirmationView = Backbone.MozuView.extend({
            templateName: 'modules/confirmation/confirmation-detail',
            render: function() {
              Backbone.MozuView.prototype.render.apply(this);
            }
          });

          var ConfirmationModel = OrderModels.Order.extend({
          getLocationData: function(){
            var codes = [];
            var items = this.get('items');

            items.forEach(function(item){
              if (codes.indexOf(item.get('fulfillmentLocationCode'))==-1)
              codes.push(item.get('fulfillmentLocationCode'));
            });

            var queryString = "";
            codes.forEach(function(code, index){
              if (index != codes.length-1){
                queryString += "code eq "+code+" or ";
              } else {
                queryString += "code eq "+code;
              }
            });
            return api.get('locations', {filter: queryString});
          }
        });

        var CJView = Backbone.MozuView.extend({
            templateName: "modules/checkout/commission-junction-view"
        });

          $(document).ready(function(){
                console.log("V1");
                var confModel = ConfirmationModel.fromCurrent();
                confModel.getLocationData().then(function(response){
                  confModel.set('locationDetails', response.data.items);

                  var confirmationView = new ConfirmationView({
                      el: $('#confirmation-container'),
                      model: confModel
                  });
                  confirmationView.render();
                  });

                var orderData = require.mozuData('order');
                var orderModel = Backbone.Model.extend(); 
                var order = new orderModel(orderData);
                var CjUrl = getCjURL(order);
                var merkelUrl = getMerkelUrl(order);
                console.log("UL : "+JSON.stringify(merkelUrl));
                var NewModal = Backbone.Model.extend();
                var urlModal = new NewModal({CjUrl:CjUrl, merkelUrl: merkelUrl});
                console.log("JSONSS: "+JSON.stringify(urlModal));
                var cjView = new CJView({
                    model: urlModal,
                    el: $('#CJIntegration')
                });
                cjView.render();  

            });

          function getCjURL(order){
            var url = "https://www/emjcd.com/tags/c?containerTagId=27891&TYPE=406572&CID=1519664";
                url = url+"&"+order.id;
                var amp = "&";
                var count = 1;
                var coupons='';
                _.each(order.get('items'), function(item){
                    // console.log("Data: "+date.format('YYYYMMDDHHMMSS'));
                    var pCode = item.product.variationProductCode ? item.product.variationProductCode : item.product.productCode;
                    url = url+amp+"ITEM"+count+"="+pCode;
                    url = url+amp+"AMT"+count+"="+item.subtotal;
                    url = url+amp+"QTY"+count+"="+item.quantity;
                    count++;
                });
                url = url+amp+"OID="+order.id;
                url = url+amp+"DISCOUNT="+order.get('discountTotal');
                url = url+amp+"CURRENCY=USD";
                if(order.get('couponCodes').length > 0){
                  count = 1;
                  _.each(order.get('couponCodes'), function(coupon) {
                      coupons = coupons+coupon;
                      if(count < order.get('couponCodes').length) {
                          coupons = coupons+",";
                      }
                      count++;
                  });
                  url = url+amp+"COUPON="+coupons;
                }
                // url = url+amp+"COUPON="+order.couponCodes;
                console.log("URL : "+url);
                console.log();
                url = '<iframe height="1" width="1" frameborder="0" scrolling="no" src="'+url;
                if(readCookie(Hypr.getLabel('cjEventCookie'))) {
                  url = url + '&CJEVENT='+readCookie(Hypr.getLabel('cjEventCookie'))+'"';  
                } else {
                  url = url + '"';
                }
                url = url + ' name="cj_conversion"></iframe>';
              return url;
          }

          function getMerkelUrl(order) {
              var url = '<script type="text/javascript" src="https://cdn.merklesearch.com/merkle_track.js"></script>';
              url = url + '<script type="text/javascript">try {';
              
              var count = 1;
              _.each(order.get('items'), function(item){
                    var pCode = item.product.variationProductCode ? item.product.variationProductCode : item.product.productCode;
                    var icent = item.subtotal*100;
                    url = url+'merklesearch.sendOrder( {';
                    url = url + 'mid: "'+Hypr.getThemeSetting('MerkelMid')+'", oid: "'+order.id+'", lid: "'+count+'", ' ;
                    url = url + 'iid:"'+pCode+'", icent:"'+icent+'", ';
                    url = url + 'iqty: "'+item.quantity+'", iname:"'+escape(item.product.name)+'} ); } catch(e) {} </script>';
                    count++;
                });
              console.log("Merkel ULR : "+url);
              return url;
          }

          function readCookie(name) {
              var nameEQ = name + "=";
              var ca = document.cookie.split(';');
              for(var i=0;i < ca.length;i++) {
                  var c = ca[i];
                  while (c.charAt(0)==' ') c = c.substring(1,c.length);
                  if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
              }
              return null;
          }
        });
