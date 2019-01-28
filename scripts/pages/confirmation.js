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
          $.cookie('paypal', null);
          $.cookie('GSIPaypal', null);
          $.cookie('PaypalAmnt', null);
          $.cookie('token', null);
          $.cookie('PayerID', null);


          var SignupGuest = Backbone.MozuView.extend({
              templateName: "modules/checkout/confirmation-signup",
              additionalEvents: {
                "click [data-mz-value=submitAccount]":"signup"
            },
            validate: function (payload) {
              var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
              if(!filter.test(payload.account.emailAddress)) return this.displayMessage(Hypr.getLabel('emailMissing')), false;
              if (!payload.account.emailAddress) return this.displayMessage(Hypr.getLabel('emailMissing')), false;
                    if (!payload.password) return this.displayMessage(Hypr.getLabel('passwordMissing')), false;
                    if (payload.password !== $('#confirmPasswordSignUp').val()) return this.displayMessage(Hypr.getLabel('passwordsDoNotMatch')), false;
                    return true;
                },
            displayMessage: function (msg) {
                  // this.setLoading("false");
                  $('#errorMessageSignUp').html('<span class="mz-validationmessage">' + msg + '</span>');
            },
            displayApiMessage: function (xhr) {
                if(typeof xhr.message !== 'undefined' && xhr.message !== '') {
                    var errorMsg = xhr.message;
                    if(errorMsg.toLowerCase().indexOf('missing') > -1 ) {
                        var val = errorMsg.split(':');
                        errorMsg = val[1].trim();
                        errorMsg = errorMsg.substr(errorMsg.indexOf(' ')+1, errorMsg.length);
                    }
                    $('#errorMessageSignUp').html('<span class="mz-validationmessage">' + errorMsg + '</span>');
                }
            },
            showForm: function(e) {
                  var event = e.target.checked;
                  if(event) {
                      $('#signupform').show();
                      $('#emailAddressSignup').val(this.model.attributes.email);
                  } else {
                      $('#signupform').hide();
                  }                  
            },
            signup: function () {
                  var self = this,
                      email = $('#emailAddressSignup').val(),
                      firstName = '',
                      lastName = '',
                      password = $('#passwordSignup').val(),
                      payload = {
                          account: {
                              emailAddress: email,
                              userName: email,
                              firstName: firstName,
                              lastName: lastName,
                              contacts: [{
                                  email: email,
                                  firstName: firstName,
                                  lastNameOrSurname: lastName
                              }]
                          },
                          password: $('#passwordSignup').val()
                      };
                  if (this.validate(payload)) {   
                    //var user = api.createSync('user', payload);
                      // this.setLoading(true);
                      return api.action('customer', 'createStorefront', payload).then(function () {
                          $('#createAccountSignUp').hide();
                          $('#accountCreatedSignUp').show();
                      }, self.displayApiMessage);
                  }
              } 
          });

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
                var orderData = require.mozuData('order');
                var orderModel = Backbone.Model.extend(); 
                var order = new orderModel(orderData);
                var view = new SignupGuest({
                  model: order,
                  el: $('#guestUserSignUp')
                });
                view.render();

                var confModel = ConfirmationModel.fromCurrent();
                confModel.getLocationData().then(function(response){
                  confModel.set('locationDetails', response.data.items);

                  var confirmationView = new ConfirmationView({
                      el: $('#confirmation-container'),
                      model: confModel
                  });
                  confirmationView.render();
                  });

                
                var CjUrl = getCjURL(order);
                var merkelUrl = getMerkelUrl(order);
                var NewModal = Backbone.Model.extend();
                var urlModal = new NewModal({CjUrl:CjUrl, merkelUrl: merkelUrl});
                // console.log("URL MOdal : "+JSON.stringify(urlModal));
                var cjView = new CJView({
                    model: urlModal,
                    el: $('#CJIntegration')
                });
                cjView.render();  

            });

          function getCjURL(order){
            var url = "https://www/emjcd.com/tags/c?containerTagId=27891&TYPE=406572&CID=1519664";
                // url = url+"&"+order.id;
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

                url = '<iframe height="1" width="1" frameborder="0" scrolling="no" src="'+url;
                if(readCookie(Hypr.getLabel('cjEventCookie'))) {
                  url = url + '&CJEVENT='+readCookie(Hypr.getLabel('cjEventCookie'))+'"';  
                } else {
                  url = url + '"';
                }
                url = url + ' name="cj_conversion"></iframe>';
                console.log("URL : "+url);
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
                    url = url + 'mid: "'+Hypr.getThemeSetting('merkelMid')+'", oid: "'+order.id+'", lid: "'+count+'", ' ;
                    url = url + 'iid:"'+pCode+'", icent:"'+icent+'", ';
                    url = url + 'iqty: "'+item.quantity+'", iname:"'+escape(item.product.name)+'"} );';
                    count++;
                });
              url = url +'} catch(e) {} </script>'; 
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
