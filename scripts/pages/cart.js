define(['modules/api', 'modules/backbone-mozu', 'underscore', 'modules/jquery-mozu', 'modules/models-cart', 'modules/cart-monitor', 'hyprlivecontext', 'hyprlive', 'modules/preserve-element-through-render', 'modules/block-ui',
    'modules/modal-dialog',
    'modules/on-image-load-error', 'modules/xpressPaypal'
], function(api, Backbone, _, $, CartModels, CartMonitor, HyprLiveContext, Hypr, preserveElement, blockUiLoader, modalDialog, onImageLoadError, paypal) {
    var pageContext = require.mozuData('pagecontext');
    var CartView = Backbone.MozuView.extend({
        templateName: "modules/cart/cart-table",
        additionalEvents: {
            "click .qty-counter": "updateQuantity",
            "input [data-mz-value='quantity']": "checkNumeric"
        },
        initialize: function() {

            this.pickerDialog = this.initializeStorePickerDialog();
            var me = this;

            //setup coupon code text box enter.
            this.listenTo(this.model, 'change:couponCode', this.onEnterCouponCode, this);
            this.codeEntered = !!this.model.get('couponCode');
            this.$el.on('keypress', 'input', function(e) {
                if (e.which === 13) {
                    if (me.codeEntered) {
                        me.handleEnterKey();
                    }
                    return false;
                }
            });

            this.listenTo(this.model.get('items'), 'quantityupdatefailed', this.onQuantityUpdateFailed, this);

            var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
            var pageContext = require.mozuData('pagecontext');
            if (visaCheckoutSettings.isEnabled) {
                window.onVisaCheckoutReady = initVisaCheckout;
                require([pageContext.visaCheckoutJavaScriptSdkUrl], initVisaCheckout);
            }


            //cache for storing info retrieved through API calls
            this.fulfillmentInfoCache = [];
            this.model.get('items').forEach(function(item) {
                var dataObject = {
                    cartItemId: item.id,
                    locations: []
                };
                me.fulfillmentInfoCache.push(dataObject);

            });

        },
        render: function() {
            blockUiLoader.unblockUi();
            // try {
            //     preserveElement(this, ['.v-button', '.p-button'], function() {
            //         Backbone.MozuView.prototype.render.call(this);
            //     });
            // } catch (e) {}
            // Backbone.MozuView.prototype.render.call(this);
            preserveElement(this, ['.v-button', '.p-button'], function () {
                Backbone.MozuView.prototype.render.call(this);
            });
            $("#cart img").on("error", function() {
                onImageLoadError.checkImage(this);
            });
        },
        updateQuantity: _.debounce(function(e) {
                var flag = true;
                var $qField = $(e.currentTarget),
                    newQuantity = parseInt($qField.attr("value"), 10),
                    id = $qField.data('mz-cart-item'),
                    item = this.model.get("items").get(id);
            
                    if ($qField.attr("id")==="plus"){
                        newQuantity = newQuantity+1;

                    }else{
                        if (newQuantity > 0) {
                        newQuantity = newQuantity -1;
                    }
                }
                if (newQuantity !== item.get('quantity')) {
                    var skuID = item.attributes.product.attributes.mfgPartNumber;
                    var limitAttribute = _.findWhere(item.attributes.product.get('properties'), { "attributeFQN": "tenant~limitPerOrder" });
                    var itemQuantity = item.attributes.quantity;
                    if (limitAttribute) {
                        var limitperorder = parseInt(JSON.parse(limitAttribute.values[0].stringValue)[skuID], 10);
                        if (newQuantity > limitperorder) {
                            flag = false;
                            item.set('quantity', limitperorder);
                            item.saveQuantity();
                            this.render();
                            if (pageContext.isMobile) {
                                $('div.mz-qty-xs-align').find('span#' + item.attributes.id).text("*Max " + limitperorder + " items are allowed.");
                            } else {
                                $('div.mz-desktop-align').find('span#' + item.attributes.id).text("*Max " + limitperorder + " items are allowed.");
                            }
                        } else {
                            if (item) {
                                if (newQuantity<=0){
                                    newQuantity=1;
                                }
                                item.set('quantity', newQuantity);
                                item.saveQuantity();
                                this.render();
                            }
                        }
                    } else {
                        if (item) {
                            if (newQuantity <= 0) {
                                newQuantity = 1;
                            }
                            item.set('quantity', newQuantity);
                            item.saveQuantity();
                            this.render();
                        }
                    }
                    $("[data-mz-cart-item=" + item.get('id') + "]").focus();
                    return flag;
                } else {
                    $("[data-mz-cart-item=" + item.get('id') + "]").blur();
                }
        }, 400),
        checkNumeric: function(e) {
            e.target.value = e.target.value.replace(/[^\d]/g, '');
        },
        onQuantityUpdateFailed: function(model, oldQuantity) {
            var field = this.$('[data-mz-cart-item=' + model.get('id') + ']');
            if (field) {
                field.val(oldQuantity);
            } /*else {
                this.render();
            }*/
            this.render();
        },
        removeItem: function(e) {
            blockUiLoader.globalLoader();
            if (require.mozuData('pagecontext').isEditMode) {
                // 65954
                // Prevents removal of test product while in editmode
                // on the cart template
                return false;
            }
            if ($(e.currentTarget).parents('.cart-item-qty').find('.mz-carttable-qty-field').val() < 1)
                return false;
            var $removeButton = $(e.currentTarget),
                id = $removeButton.data('mz-cart-item');
            this.model.removeItem(id);
            return false;
        },
        empty: function(e) {
            // cancel default behavior
            e.preventDefault();
            this.model.apiDel().then(function() {
                window.location.href = '/cart';
            });
        },
        initializeStorePickerDialog: function() {

            var me = this;

            var options = {
                elementId: "mz-location-selector",
                body: "", //to be populated by makeLocationPickerBody
                hasXButton: true,
                width: "400px",
                scroll: true,
                bodyHeight: "600px",
                backdrop: "static"

            };

            //Assures that each store select button has the right behavior
            $('#mz-location-selector').on('click', '.mz-store-select-button', function() {
                me.assignPickupLocation($(this).attr('mz-store-select-data'));
            });

            //Assures that the radio buttons reflect the accurate fulfillment method
            //if the dialog is closed before a store is picked.

            $('.modal-header').on('click', '.close', function() {
                var cartModelItems = window.cartView.cartView.model.get("items");
                var cartItemId = $(this).parent().parent().find('.modal-body').attr('mz-cart-item');
                var cartItem = me.model.get("items").get(cartItemId);
                me.render();
            });

            return modalDialog.init(options);

        },
        changeStore: function(e) {
            //click handler for change store link.launches store picker
            var cartItemId = $(e.currentTarget).data('mz-cart-item');
            var cartItem = this.model.get("items").get(cartItemId);
            var productCode = cartItem.apiModel.data.product.variationProductCode || cartItem.apiModel.data.product.productCode;
            this.pickStore(productCode, cartItemId);
        },
        pickStore: function(productCode, cartItemId) {
            /*
            Parent function for switching from ship to pickup from within cart
            or choosing a new pickup location from within cart. Runs a set of api
            calls using the cartItemId and that item's product code to get
            necessary inventory information and display a dialog containing that
            information.
            */
            var me = this;
            var listOfLocations = [];

            //before we get inventory data, we'll see if it's cached

            var filtered = this.fulfillmentInfoCache.filter(function(item) {
                return item.cartItemId == cartItemId;
            });
            var cachedItemInvData;

            if (filtered.length !== 0) {
                cachedItemInvData = filtered[0];
            } else {
                //NGCOM-344
                //If the filtered array is empty, it means the item we're checkoutSettings
                // was added to the cart some time after page load, probably during a BOGO
                //sale re-rendering.
                //Let's go ahead and add it to the cache, then stick it in our
                //cachedItemInvData variable.
                var newCacheData = {
                    cartItemId: cartItemId,
                    locations: []
                };
                me.fulfillmentInfoCache.push(newCacheData);
                cachedItemInvData = newCacheData;
            }

            var index = this.fulfillmentInfoCache.indexOf(cachedItemInvData);

            if (cachedItemInvData.locations.length === 0) {
                //The cache doesn't contain any data about the fulfillment
                //locations for this item. We'll do api calls to get that data
                //and update the cache.

                me.getInventoryData(cartItemId, productCode).then(function(inv) {
                    if (inv.totalCount === 0) {
                        //Something went wrong with getting inventory data.
                        var $bodyElement = $('#mz-location-selector').find('.modal-body');
                        me.pickerDialog.setBody(Hypr.getLabel("noNearbyLocationsProd"));
                        $bodyElement.attr('mz-cart-item', cartItemId);
                        me.pickerDialog.show();

                    } else {
                        //TO-DO: Make 1 call with GetLocations
                        var invItemsLength = inv.items.length;
                        inv.items.forEach(function(invItem, i) {
                            me.handleInventoryData(invItem).then(function(handled) {
                                    listOfLocations.push(handled);
                                    me.fulfillmentInfoCache[index].locations.push({
                                        name: handled.data.name,
                                        code: handled.data.code,
                                        locationData: handled,
                                        inventoryData: invItem
                                    });
                                    me.model.get('storeLocationsCache').addLocation(handled.data);

                                    if (i == invItemsLength - 1) {
                                        //We're in the midst of asynchrony, but we want this dialog
                                        //to go ahead and open right away if we're at the end of the
                                        //for loop.
                                        var $bodyElement = $('#mz-location-selector').find('.modal-body');
                                        me.pickerDialog.setBody(me.makeLocationPickerBody(listOfLocations, inv.items, cartItemId));
                                        $bodyElement.attr('mz-cart-item', cartItemId);
                                        me.pickerDialog.show();
                                    }
                                },
                                function(error) {
                                    //NGCOM-337
                                    //If the item had inventory information for a location that
                                    //doesn't exist anymore or was disabled, we end up here.
                                    //The only reason we would need to take any action here is if
                                    //the errored location happened to be at the end of the list,
                                    //and the above if statement gets skipped -
                                    //We need to make sure the dialog gets opened anyways.
                                    if (i == invItemsLength - 1) {
                                        var $bodyElement = $('#mz-location-selector').find('.modal-body');
                                        me.pickerDialog.setBody(me.makeLocationPickerBody(listOfLocations, inv.items, cartItemId));
                                        $bodyElement.attr('mz-cart-item', cartItemId);
                                        me.pickerDialog.show();
                                    }

                                });
                        });
                    }
                });


            } else {
                //This is information we've retrieved once since page load!
                //So we're skipping the API calls.
                var inventoryItems = [];
                this.fulfillmentInfoCache[index].locations.forEach(function(location) {
                    listOfLocations.push(location.locationData);
                    inventoryItems.push(location.inventoryData);
                });
                var $bodyElement = $('#mz-location-selector').find('.modal-body');
                me.pickerDialog.setBody(me.makeLocationPickerBody(listOfLocations, inventoryItems, cartItemId));
                me.pickerDialog.show();
            }

        },
        getInventoryData: function(id, productCode) {
            //Gets basic inventory data based on product code.
            return window.cartView.cartView.model.get('items').get(id).get('product').apiGetInventory({
                productCode: productCode
            });
        },
        handleInventoryData: function(invItem) {
            //Uses limited inventory location from product to get inventory names.
            return api.get('location', invItem.locationCode);
        },
        changeFulfillmentMethod: function(e) {
            //Called when a radio button is clicked.

            var me = this;
            var $radioButton = $(e.currentTarget),
                cartItemId = $radioButton.data('mz-cart-item'),
                value = $radioButton.val(),
                cartItem = this.model.get("items").get(cartItemId);

            if (cartItem.get('fulfillmentMethod') == value) {
                //The user clicked the radio button for the fulfillment type that
                //was already selected so we can just quit.
                return 0;
            }

            if (value == "Ship") {
                var oldFulfillmentMethod = cartItem.get('fulfillmentMethod');
                var oldPickupLocation = cartItem.get('fulfillmentLocationName');
                var oldLocationCode = cartItem.get('fulfillmentLocationCode');

                cartItem.set('fulfillmentMethod', value);
                cartItem.set('fulfillmentLocationName', '');
                cartItem.set('fulfillmentLocationCode', '');

                cartItem.apiUpdate().then(function(success) {}, function(error) {
                    cartItem.set('fulfillmentMethod', oldFulfillmentMethod);
                    cartItem.set('fulfillmentLocationName', oldPickupLocation);
                    cartItem.set('fulfillmentLocationCode', oldLocationCode);

                });


            } else if (value == "Pickup") {
                //first we get the correct product code for this item.
                //If the product is a variation, we want to pass that when searching for inventory.
                var productCode = cartItem.apiModel.data.product.variationProductCode || cartItem.apiModel.data.product.productCode;
                //pickStore function makes api calls, then builds/launches modal dialog
                this.pickStore(productCode, cartItemId);
            }

        },
        makeLocationPickerBody: function(locationList, locationInventoryInfo, cartItemId) {
            /*
            Uses a list of locations to build HTML to stick into the
            location picker. cartItemId is added as an attribute to each select
            button so that it can be used to assign the new pickup location to the
            right cart item.

            locationList should be a list of fulfillment locations with complete
            location data (what we need is the name). locationInventoryInfo will
            contain stock levels for the current product(cartItemId) by location code.

            */

            var me = this;

            var body = "";
            locationList.forEach(function(location) {
                //We find the inventory data that matches the location we're focusing on.
                var matchedInventory = locationInventoryInfo.filter(function(locationInventory) {
                    return locationInventory.locationCode == location.data.code;
                });
                //matchedInventory should be a list of one item.

                var stockLevel = matchedInventory[0].stockAvailable;
                var allowsBackorder = location.data.allowFulfillmentWithNoStock;

                //Piece together UI for a single location listing
                var locationSelectDiv = $('<div>', { "class": "location-select-option", "style": "display:flex", "data-mz-cart-item": cartItemId });
                var leftSideDiv = $('<div>', { "style": "flex:1" });
                var rightSideDiv = $('<div>', { "style": "flex:1" });
                leftSideDiv.append('<h4 style="margin: 6.25px 0 6.25px">' + location.data.name + '</h4>');
                //If there is enough stock or the store allows backorder,
                //we'll let the user click the select button.
                //Even if these two conditions are met, the user could still be
                //halted upon trying to proceed to checkout if
                //the product isn't configured to allow for backorder.

                var address = location.data.address;

                leftSideDiv.append($('<div>' + address.address1 + '</div>'));
                if (address.address2) { leftSideDiv.append($('<div>' + address.address2 + '</div>')); }
                if (address.address3) { leftSideDiv.append($('<div>' + address.address3 + '</div>')); }
                if (address.address4) { leftSideDiv.append($('<div>' + address.address4 + '</div>')); }
                leftSideDiv.append($('<div>' + address.cityOrTown + ', ' + address.stateOrProvince + ' ' + address.postalOrZipCode + '</div>'));
                var $selectButton;
                if (stockLevel > 0 || allowsBackorder) {
                    leftSideDiv.append("<p class='mz-locationselect-available'>" + Hypr.getLabel("availableNow") + "</p>");
                    var buttonData = {
                        locationCode: location.data.code,
                        locationName: location.data.name,
                        cartItemId: cartItemId
                    };

                    $selectButton = $("<button>", { "type": "button", "class": "mz-button mz-store-select-button", "style": "margin:25% 0 0 25%", "aria-hidden": "true", "mz-store-select-data": JSON.stringify(buttonData) });
                    $selectButton.text(Hypr.getLabel("selectStore"));
                    rightSideDiv.append($selectButton);


                } else {
                    leftSideDiv.append("<p class='mz-locationselect-unavailable'>" + Hypr.getLabel("outOfStock") + "</p>");
                    $selectButton = $("<button>", { "type": "button", "class": "mz-button is-disabled mz-store-select-button", "aria-hidden": "true", "disabled": "disabled", "style": "margin:25% 0 0 25%" });
                    $selectButton.text(Hypr.getLabel("selectStore"));
                    rightSideDiv.append($selectButton);
                }

                locationSelectDiv.append(leftSideDiv);
                locationSelectDiv.append(rightSideDiv);
                body += locationSelectDiv.prop('outerHTML');

            });

            return body;

        },
        assignPickupLocation: function(jsonStoreSelectData) {
            //called by Select Store button from store picker dialog.
            //Makes the actual change to the item using data held by the button
            //in the store picker.
            var me = this;
            this.pickerDialog.hide();

            var storeSelectData = JSON.parse(jsonStoreSelectData);
            var cartItem = this.model.get("items").get(storeSelectData.cartItemId);
            //in case there is an error with the api call, we want to get all of the
            //current data for the cartItem before we change it so that we can
            //change it back if we need to.
            var oldFulfillmentMethod = cartItem.get('fulfillmentMethod');
            var oldPickupLocation = cartItem.get('fulfillmentLocationName');
            var oldLocationCode = cartItem.get('fulfillmentLocationCode');

            cartItem.set('fulfillmentMethod', 'Pickup');
            cartItem.set('fulfillmentLocationName', storeSelectData.locationName);
            cartItem.set('fulfillmentLocationCode', storeSelectData.locationCode);
            cartItem.apiUpdate().then(function(success) {}, function(error) {
                cartItem.set('fulfillmentMethod', oldFulfillmentMethod);
                cartItem.set('fulfillmentLocationName', oldPickupLocation);
                cartItem.set('fulfillmentLocationCode', oldLocationCode);
                me.render();
            });


        },
        checkoutGuest: function() {
            blockUiLoader.globalLoader();
            var itemQuantity;
            var flag = true;
            var self = this;
            var items = window.cartView.cartView.model.attributes.items.models;
            var productCodes = [];
            for (var i = 0; i < items.length; i++) {
                var pdtCd = items[i].attributes.product.id;
                productCodes.push(pdtCd);
            }
            var filter = _.map(productCodes, function(c) {
                return "ProductCode eq " + c;
            }).join(' or ');
            api.get("search", { filter: filter, pageSize: productCodes.length }).then(function(collection) {
                var cartItems = collection.data.items;
                var obj = {};
                var skuID;
                for (var i = 0; i < cartItems.length; i++) {
                    var limitAttribute = _.findWhere(cartItems[i].properties, { "attributeFQN": "tenant~limitPerOrder" });
                    var limitAttributeModel = _.findWhere(items[i].properties, { "attributeFQN": "tenant~limitPerOrder" });
                    var limitperorder, limitperorderModel;
                    if (cartItems[i].mfgPartNumber) {
                        skuID = cartItems[i].mfgPartNumber.toString();
                        if (limitAttribute) {
                            limitperorder = parseInt(JSON.parse(limitAttribute.values[0].stringValue)[skuID], 10);
                            limitperorderModel = parseInt(JSON.parse(limitAttribute.values[0].stringValue)[skuID], 10);
                            obj[skuID] = limitperorder;
                            limitperorderModel = limitperorder;
                        }
                    } else {
                        if (cartItems[i].mfgPartNumbers) {
                            for (var j = 0; j < cartItems[i].mfgPartNumbers.length; j++) {
                                skuID = cartItems[i].mfgPartNumbers[j].toString();
                                if (limitAttribute) {
                                    limitperorder = parseInt(JSON.parse(limitAttribute.values[0].stringValue)[skuID], 10);
                                    limitperorderModel = parseInt(JSON.parse(limitAttribute.values[0].stringValue)[skuID], 10);
                                    obj[skuID] = limitperorder;
                                    limitperorderModel = limitperorder;
                                }
                            }
                        }
                    }
                }
                blockUiLoader.unblockUi();
                Object.keys(obj).forEach(function(key, index) {
                    for (var j = 0; j < items.length; j++) {
                        if (items[j].attributes.product.attributes.mfgPartNumber === key) {
                            itemQuantity = items[j].attributes.quantity;
                            if (itemQuantity > obj[key]) {
                                flag = false;
                                if (pageContext.isMobile) {
                                    $('div.mz-qty-xs-align').find('span#' + items[j].attributes.id).text("*Max " + obj[key] + " items are allowed.");
                                } else {
                                    $('div.mz-desktop-align').find('span#' + items[j].attributes.id).text("*Max " + obj[key] + " items are allowed.");
                                }
                                $("[data-mz-cart-item=" + items[j].get('id') + "]").focus();
                                break;
                            }
                        }
                    }
                });
                if (flag) {
                    $(".second-tab").hide();
                    $(".third-tab").show();
                    $('#liteRegistrationModal').modal('show');
                    window.isCheckoutGuest = true;
                    // self.model.isLoading(true);
                }
            }, function() {
                window.console.log("Got some error at cross sell in Global Cart");
            });
            return flag;
        },
        paypalCheckoutGuest: function(e) {
            $.cookie('paypal', 'true');
           // this.checkoutGuest(e);
        },
        proceedToCheckout: function(e) {
            e.preventDefault();
            var self = this;
            blockUiLoader.globalLoader();
            var itemQuantity;
            var flag = true;
            var items = window.cartView.cartView.model.attributes.items.models;
            var productCodes = [];
            for (var i = 0; i < items.length; i++) {
                var pdtCd = items[i].attributes.product.id;
                productCodes.push(pdtCd);
            }
            var filter = _.map(productCodes, function(c) {
                return "ProductCode eq " + c;
            }).join(' or ');
            api.get("search", { filter: filter, pageSize: productCodes.length }).then(function(collection) {
                var cartItems = collection.data.items;
                var obj = {};
                var skuID;
                for (var i = 0; i < cartItems.length; i++) {
                    var limitAttribute = _.findWhere(cartItems[i].properties, { "attributeFQN": "tenant~limitPerOrder" });
                    var limitAttributeModel = _.findWhere(items[i].properties, { "attributeFQN": "tenant~limitPerOrder" });
                    var limitperorder, limitperorderModel;
                    if (cartItems[i].mfgPartNumber) {
                        skuID = cartItems[i].mfgPartNumber.toString();
                        if (limitAttribute) {
                            limitperorder = parseInt(JSON.parse(limitAttribute.values[0].stringValue)[skuID], 10);
                            limitperorderModel = parseInt(JSON.parse(limitAttribute.values[0].stringValue)[skuID], 10);
                            obj[skuID] = limitperorder;
                            limitperorderModel = limitperorder;
                        }
                    } else {
                        if (cartItems[i].mfgPartNumbers) {
                            for (var j = 0; j < cartItems[i].mfgPartNumbers.length; j++) {
                                skuID = cartItems[i].mfgPartNumbers[j].toString();
                                if (limitAttribute) {
                                    limitperorder = parseInt(JSON.parse(limitAttribute.values[0].stringValue)[skuID], 10);
                                    limitperorderModel = parseInt(JSON.parse(limitAttribute.values[0].stringValue)[skuID], 10);
                                    obj[skuID] = limitperorder;
                                    limitperorderModel = limitperorder;
                                }
                            }
                        }
                    }
                }
                blockUiLoader.unblockUi();
                Object.keys(obj).forEach(function(key, index) {
                    for (var j = 0; j < items.length; j++) {
                        if (items[j].attributes.product.attributes.mfgPartNumber === key) {
                            itemQuantity = items[j].attributes.quantity;
                            if (itemQuantity > obj[key]) {
                                flag = false;
                                if (pageContext.isMobile) {
                                    $('div.mz-qty-xs-align').find('span#' + items[j].attributes.id).text("*Max " + obj[key] + " items are allowed.");
                                } else {
                                    $('div.mz-desktop-align').find('span#' + items[j].attributes.id).text("*Max " + obj[key] + " items are allowed.");
                                }
                                $("[data-mz-cart-item=" + items[j].get('id') + "]").focus();
                                break;
                            }
                        }
                    }
                });
                if (flag) {
                    self.model.isLoading(true);
                    $('#cartform').attr('action', window.location.origin + '/cart/checkout');
                    $('#cartform').submit();
                    return;
                }
            }, function() {
                window.console.log("Got some error at cross sell in Global Cart");
            });
            return flag;
        },
        paypalCheckout: function(e) {
            $.cookie('paypal', 'true');
            //this.proceedToCheckout(e);
        },
        addCoupon: function() {
            var self = this;
            if (!$('#coupon-code').val()) {
                $('[data-mz-validationmessage-for="couponcode"]').text(Hypr.getLabel('couponCodeRequired'));
                return false;
            } else {
                $('[data-mz-validationmessage-for="couponcode"]').text('');
            }
            blockUiLoader.globalLoader();
            this.model.addCoupon().ensure(function() {
                self.model.unset('couponCode');
                self.render();
            });
        },
        removeCoupon: function() {
            var self = this;
            var getCouponCode = this.$el.find('#coupon-detail span').attr('id');
            var apiData = require.mozuData('apicontext');
            blockUiLoader.globalLoader();
            var serviceurl = '/api/commerce/carts/' + this.model.get('id') + '/coupons/' + getCouponCode;
            api.request('DELETE', serviceurl).then(function(response) {
                blockUiLoader.unblockUi();
                self.model.set(response);
                self.render();
                $("#couponDisclaimer").text("");
            }, function(err) {
                self.trigger('error', {
                    message: Hypr.getLabel('promoCodeError', getCouponCode)
                });
            });
        },
        onEnterCouponCode: function (model, code) {
            if (code && !this.codeEntered) {
                this.codeEntered = true;
            }
            if (!code && this.codeEntered) {
                this.codeEntered = false;
            }
        },
        autoUpdate: [
            'couponCode'
        ],
        handleEnterKey: function() {
            this.addCoupon();
        }
    });

    function renderVisaCheckout(model) {

        var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
        var apiKey = visaCheckoutSettings.apiKey;
        var clientId = visaCheckoutSettings.clientId;

        //In case for some reason a model is not passed
        if (!model) {
            model = CartModels.Cart.fromCurrent();
        }

        function initVisa() {
            var delay = 200;
            if (window.V) {
                window.V.init({
                    apikey: apiKey,
                    clientId: clientId,
                    paymentRequest: {
                        currencyCode: model ? model.get('currencyCode') : 'USD',
                        subtotal: "" + model.get('subtotal')
                    }
                });
                return;
            }
            _.delay(initVisa, delay);
        }

        initVisa();

    }
    /* begin visa checkout */
    function initVisaCheckout(model, subtotal) {
        var delay = 500;
        var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
        var apiKey = visaCheckoutSettings.apiKey;
        var clientId = visaCheckoutSettings.clientId;

        // if this function is being called on init rather than after updating cart total
        if (!model) {
            model = CartModels.Cart.fromCurrent();
            subtotal = model.get('subtotal');
            delay = 0;

            if (!window.V) {
                //console.warn( 'visa checkout has not been initilized properly');
                return false;
            }
            // on success, attach the encoded payment data to the window
            // then turn the cart into an order and advance to checkout
            window.V.on("payment.success", function(payment) {
                // payment here is an object, not a string. we'll stringify it later
                var $form = $('#cartform');

                _.each({

                    digitalWalletData: JSON.stringify(payment),
                    digitalWalletType: "VisaCheckout"

                }, function(value, key) {

                    $form.append($('<input />', {
                        type: 'hidden',
                        name: key,
                        value: value
                    }));

                });

                $form.submit();

            });

        }

        // delay V.init() while we wait for MozuView to re-render
        // we could probably listen for a "render" event instead
        _.delay(window.V.init, delay, {
            apikey: apiKey,
            clientId: clientId,
            paymentRequest: {
                currencyCode: model ? model.get('currencyCode') : 'USD',
                subtotal: "" + subtotal
            }
        });
    }
    /* end visa checkout */

    $(document).ready(function() {
        var cartModel = CartModels.Cart.fromCurrent(),
            cartViews = {

                cartView: new CartView({
                    el: $('#cart'),
                    model: cartModel,
                    messagesEl: $('[data-mz-message-bar]')
                })
            };

        cartModel.on('ordercreated', function(order) {
            cartModel.isLoading(true);
            window.location = "/checkout/" + order.prop('id');
        });

        cartModel.on('sync', function() {
            // if (this.isEmpty())
            //     window.location.reload();
            // else
                CartMonitor.update();
        });

        cartModel.on('error', function(e) {
            $('.mz-carttable-qty-field').prop('disabled', false);
        });

        window.cartView = cartViews;

        CartMonitor.setCount(cartModel.count());

       _.invoke(cartViews, 'render');

        renderVisaCheckout(cartModel);
        var querystring = window.location.search.substring(1);
        if (querystring === 'isLimit=false') {
            cartViews.cartView.checkoutGuest();
        }

         paypal.loadScript();
    });

});