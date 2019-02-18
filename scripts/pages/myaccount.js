﻿define(['modules/backbone-mozu', 'hyprlive', 'hyprlivecontext', 'modules/jquery-mozu', 'underscore', 'modules/models-customer', 'modules/views-paging', 'modules/editable-view', 'modules/block-ui', 'modules/url-dispatcher', 'modules/intent-emitter', 'modules/get-partial-view', 'modules/on-image-load-error'], function (Backbone, Hypr, HyprLiveContext, $, _, CustomerModels, PagingViews, EditableView, blockUiLoader, UrlDispatcher, IntentEmitter, getPartialView, onImageLoadError) {

    var _dispatcher = UrlDispatcher;
    var AccountSettingsView = EditableView.extend({
        templateName: 'modules/my-account/my-account-settings',
        autoUpdate: [
            'firstName',
            'lastName',
            'emailAddress',
            'acceptsMarketing'
        ],
        constructor: function () {
            EditableView.apply(this, arguments);
            this.editing = false;
            this.invalidFields = {};
        },
        initialize: function () {
            return this.model.getAttributes().then(function (customer) {
                customer.get('attributes').each(function (attribute) {
                    attribute.set('attributeDefinitionId', attribute.get('id'));
                });

                return customer;
            });
        },
        updateAttribute: function (e) {
            var self = this;
            var attributeFQN = e.currentTarget.getAttribute('data-mz-attribute');
            var attribute = this.model.get('attributes').findWhere({ attributeFQN: attributeFQN });
            var nextValue = attribute.get('inputType') === 'YesNo' ? $(e.currentTarget).prop('checked') : $(e.currentTarget).val();

            attribute.set('values', [nextValue]);
            attribute.validate('values', {
                valid: function (view, attr, error) {
                    self.$('[data-mz-attribute="' + attributeFQN + '"]').removeClass('is-invalid')
                        .next('[data-mz-validationmessage-for="' + attr + '"]').text('');
                },
                invalid: function (view, attr, error) {
                    self.$('[data-mz-attribute="' + attributeFQN + '"]').addClass('is-invalid')
                        .next('[data-mz-validationmessage-for="' + attr + '"]').text(error);
                }
            });
        },
        startEdit: function (event) {
            event.preventDefault();
            this.editing = true;
            if ($("#account-settings-name").text() !== "" && this.beforeEditModel) {
                this.model.set("firstName", this.beforeEditModel.firstName);
                this.model.set("lastName", this.beforeEditModel.lastName);
                this.model.set("emailAddress", this.beforeEditModel.emailAddress);
                this.model.set("acceptsMarketing", this.beforeEditModel.acceptsMarketing);
            }
            this.beforeEditModel = {
                firstName: this.model.get('firstName'),
                lastName: this.model.get('lastName'),
                emailAddress: this.model.get('emailAddress'),
                acceptsMarketing: this.model.get('acceptsMarketing')
            };
            this.render();
        },
        cancelEdit: function () {
            var self = this;
            this.editing = false;
            this.model.set("firstName", this.beforeEditModel.firstName);
            this.model.set("lastName", this.beforeEditModel.lastName);
            this.model.set("emailAddress", this.beforeEditModel.emailAddress);
            this.model.set("acceptsMarketing", this.beforeEditModel.acceptsMarketing);
            self.render();
        },
        finishEdit: function () {
            var self = this;
            $('.mz-validationmessage').text('');
            if (!self.model.apiModel.data.firstName) {
                $('[data-mz-validationmessage-for="firstName"]').text(Hypr.getLabel("firstNameMissing"));
                return false;
            }
            if (!self.model.apiModel.data.lastName) {
                $('[data-mz-validationmessage-for="lastName"]').text(Hypr.getLabel("lastNameMissing"));
                return false;
            }
            if (!self.model.apiModel.data.emailAddress) {
                $('[data-mz-validationmessage-for="emailAddress"]').text(Hypr.getLabel("emailMissing"));
                return false;
            }
            if (!(Backbone.Validation.patterns.email.test(self.model.apiModel.data.emailAddress))) {
                $('[data-mz-validationmessage-for="emailAddress"]').text(Hypr.getLabel("emailwrongpattern"));
                return false;
            }
            this.beforeEditModel = {
                firstName: self.model.apiModel.data.firstName,
                lastName: self.model.apiModel.data.lastName,
                emailAddress: self.model.apiModel.data.emailAddress,
                acceptsMarketing: self.model.apiModel.data.acceptsMarketing
            };
            this.doModelAction('apiUpdate').then(function () {
                self.editing = false;
            }).otherwise(function () {
                self.editing = true;
            }).ensure(function () {
                self.afterEdit();
            });
        },
        afterEdit: function () {
            var self = this;

            self.initialize().ensure(function () {
                self.render();
            });
        }
    });

    var PasswordView = EditableView.extend({
        templateName: 'modules/my-account/my-account-password',
        autoUpdate: [
            'oldPassword',
            'password',
            'confirmPassword'
        ],
        startEditPassword: function () {
            this.editing.password = true;
            this.render();
        },
        finishEditPassword: function () {
            var self = this;
            self.model.messages.reset();
            $('.mz-validationmessage').text('');
            if ($('#account-oldpassword').val() === "" || !self.model.apiModel.data.oldPassword) {
                $('[data-mz-validationmessage-for="oldPassword"]').text(Hypr.getLabel("oldPasswordMissing"));
                return false;
            }
            if ($('#account-password').val() === "" || !self.model.apiModel.data.password) {
                $('[data-mz-validationmessage-for="password"]').text(Hypr.getLabel("newPasswordMissing"));
                return false;
            }
            if (self.model.apiModel.data.password && self.model.apiModel.data.password.length < Hypr.getThemeSetting('passwordMinLength')) {
                $('[data-mz-validationmessage-for="password"]').text(Hypr.getLabel('passwordminlength').replace('{0}', Hypr.getThemeSetting('passwordMinLength')));
                return false;
            } else if (self.model.apiModel.data.password && self.model.apiModel.data.password.search(/\d/) == -1) {
                $('[data-mz-validationmessage-for="password"]').text(Hypr.getLabel('passwordminlength').replace('{0}', Hypr.getThemeSetting('passwordMinLength')));
                return false;
            } else if (self.model.apiModel.data.password && self.model.apiModel.data.password.search(/[a-zA-Z]/) == -1) {
                $('[data-mz-validationmessage-for="password"]').text(Hypr.getLabel('passwordminlength').replace('{0}', Hypr.getThemeSetting('passwordMinLength')));
                return false;
            } else if (self.model.apiModel.data.password && self.model.apiModel.data.password.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+\.\,\;\:]/) != -1) {
                $('[data-mz-validationmessage-for="password"]').text(Hypr.getLabel('passwordminlength').replace('{0}', Hypr.getThemeSetting('passwordMinLength')));
                return false;
            }
            if ($('#account-confirmpassword').val() === "" || !self.model.apiModel.data.confirmPassword) {
                $('[data-mz-validationmessage-for="confirmPassword"]').text(Hypr.getLabel("confirmPasswordMissing"));
                return false;
            }
            if (self.model.apiModel.data.password && self.model.apiModel.data.confirmPassword && (self.model.apiModel.data.password !== self.model.apiModel.data.confirmPassword)) {
                $('[data-mz-validationmessage-for="confirmPassword"]').text(Hypr.getLabel("passwordsDoNotMatch"));
                return false;
            }
            this.doModelAction('changePassword').then(function () {
                _.delay(function () {
                    self.$('[data-mz-validationmessage-for="passwordChanged"]').show().text(Hypr.getLabel('passwordChanged')).fadeOut(3000);
                }, 250);
            }, function () {
                self.editing.password = true;
            });
            this.editing.password = false;
        },
        cancelEditPassword: function () {
            this.editing.password = false;
            this.render();
        }
    });

    var WishListView = EditableView.extend({
        templateName: 'modules/my-account/my-account-wishlist',
        addItemToCart: function (e) {
            var self = this, $target = $(e.currentTarget),
                id = $target.data('mzItemId');
            if (id) {
                this.editing.added = id;
                return this.doModelAction('addItemToCart', id);
            }
        },
        doNotRemove: function () {
            this.editing.added = false;
            this.editing.remove = false;
            this.render();
        },
        beginRemoveItem: function (e) {
            var self = this;
            var id = $(e.currentTarget).data('mzItemId');
            if (id) {
                this.editing.remove = id;
                this.render();
            }
        },
        finishRemoveItem: function (e) {
            var self = this;
            var id = $(e.currentTarget).data('mzItemId');
            if (id) {
                var removeWishId = id;
                return this.model.apiDeleteItem(id).then(function () {
                    self.editing.remove = false;
                    var itemToRemove = self.model.get('items').where({ id: removeWishId });
                    if (itemToRemove) {
                        self.model.get('items').remove(itemToRemove);
                        self.render();
                    }
                });
            }
        }
    });

    function updateUi(response) {
        $('html, body').animate({ scrollTop: $("h3.mz-l-stack-sectiontitle").offset().top - 10 }, 3000, function () {
            setTimeout(function () {
                $("#orderhistory img").each(function () {
                    if (this.height === 0 && this.width === 0)
                        onImageLoadError.checkImage(this);
                });
            }, 3000);            
            if($('ul.mz-orderlist').find('.mst-parent').length === 0){
                createMstLi();
            }
            blockUiLoader.unblockUi();
        });
    }

    function createMstLi(){
        var temp=0;
        var incVal = 4;
        var CheckoutNumber = "";
        $("ul.mz-orderlist>li").each(function(){
            var orderNumber = "";
            var x = $('.mz-propertylist dt').length;
            for (var i = 0; i < x; i++) { 
                   var orderDiv =  $('.mz-propertylist dt').eq(i).html();
                   if (temp == i){
                       if (orderDiv ==="Order Number"){
                            orderNumber = $('.mz-propertylist dd').eq(i).html();
                        }
                     }
            }
            if(orderNumber!=""){                
                CheckoutNumber = $(this).data('mzParentcheckoutnumber');
                $(this).before('<li class="mst-parent"> Order Number: '+orderNumber+'</li>');
            }
           temp = temp + incVal;
        });
    }

    var navigationIntents = IntentEmitter(
        $('#account-orderhistory'), [
            'click [data-mz-pagingcontrols] a',
            'click [data-mz-pagenumbers] a',
            'change [data-mz-value="pageSize"]'
        ],
        intentToUrl
    );

    function intentToUrl(e) {
        //show loading
        blockUiLoader.globalLoader();
        var elm = e.currentTarget;
        var url;
        url = elm.getAttribute('data-mz-url') || elm.getAttribute('href') || '';
        if (url && url[0] != "/") {
            var parser = document.createElement('a');
            parser.href = url;
            url = window.location.pathname + parser.search;
        }
        getPartialView(url, "modules/my-account/order-history-list").then(updateUi);
    }
    navigationIntents.on('data', function (url, e) {
    });

    var OrderHistoryView = Backbone.MozuView.extend({
        templateName: "modules/my-account/order-history-list",
        getRenderContext: function() {
            var context = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            context.returning = this.returning;
            if (!this.returning) {
                context.returning = [];
            }
            context.returningPackage = this.returningPackage;
            return context;
        },
        render: function() {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this, arguments);

            $.each(this.$el.find('[data-mz-order-history-listing]'), function(index, val) {

                var orderId = $(this).data('mzOrderId');
                var myOrder = self.model.get('items').get(orderId);
                var orderHistoryListingView = new OrderHistoryListingView({
                    el: $(this).find('.listing'),
                    model: myOrder,
                    messagesEl: $(this).find('[data-order-message-bar]')
                });
                orderHistoryListingView.render();
            });
        },
        selectReturnItems: function() {
            if (typeof this.returning == 'object') {
                $.each(this.returning, function(index, value) {
                    $('[data-mz-start-return="' + value + '"]').prop('checked', 'checked');
                });
            }
        },
        addReturnItem: function(itemId) {
            if (typeof this.returning == 'object') {
                this.returning.push(itemId);
                return;
            }
            this.returning = [itemId];
        },
        removeReturnItem: function(itemId) {
            if (typeof this.returning == 'object') {
                if (this.returning.length === 0) {
                    delete this.returning;
                } else {
                    var itemIdx = this.returning.indexOf(itemId);
                    if (itemIdx != -1) {
                        this.returning.splice(itemIdx, 1);
                    }
                }
            }
        }
    });

    var OrderHistoryListingView = Backbone.MozuView.extend({
        templateName: "modules/my-account/order-history-listing",
        initialize: function() {
            this._views = {
                standardView: this,
                returnView: null
            };
        },
        views: function() {
            return this._views;
        },
        getRenderContext: function() {
            var context = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            context.returning = this.returning;
            if (!this.returning) {
                context.returning = [];
            }
            context.returningPackage = this.returningPackage;
            return context;
        },
        render: function() {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this, arguments);

            if (!this._views.returnView) {
                this._views.returnView = new ReturnOrderListingView({
                    el: self.el,
                    model: self.model
                });
                this.views().returnView.on('renderMessage', this.renderMessage, this);
                this.views().returnView.on('returnCancel', this.returnCancel, this);
                this.views().returnView.on('returnSuccess', this.returnSuccess, this);
                this.views().returnView.on('returnFailure', this.returnFailure, this);
            }
        },
        renderMessage: function(message) {
            var self = this;
            if (message) {
                if (message.messageType) {
                    message.autoFade = true;
                    this.model.messages.reset([message]);
                    this.messageView.render();
                }
            }
        },
        returnSuccess: function() {
            this.renderMessage({
                messageType: 'returnSuccess'
            });
            this.render();
        },
        returnFailure: function() {
            this.renderMessage({
                messageType: 'returnFailure'
            });
            this.render();
        },
        returnCancel: function() {
            this.render();
        },
        selectReturnItems: function() {
            if (typeof this.returning == 'object') {
                $.each(this.returning, function(index, value) {
                    $('[data-mz-start-return="' + value + '"]').prop('checked', 'checked');
                });
            }
        },
        addReturnItem: function(itemId) {
            if (typeof this.returning == 'object') {
                this.returning.push(itemId);
                return;
            }
            this.returning = [itemId];
        },
        removeReturnItem: function(itemId) {
            if (typeof this.returning == 'object') {
                if (this.returning.length === 0) {
                    delete this.returning;
                } else {
                    var itemIdx = this.returning.indexOf(itemId);
                    if (itemIdx != -1) {
                        this.returning.splice(itemIdx, 1);
                    }
                }
            }
        },
        startOrderReturn: function(e) {
            this.model.clearReturn();
            this.views().returnView.render();
        }
    });

    var ReturnOrderListingView = Backbone.MozuView.extend({
        templateName: "modules/my-account/order-history-listing-return",
        getRenderContext: function() {
            var context = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            var order = this.model;
            if (order) {
                this.order = order;
                context.order = order.toJSON();
            }
            return context;
        },
        render: function() {
            var self = this;
            var returnItemViews = [];

            self.model.fetchReturnableItems().then(function(data) {
                var returnableItems = self.model.returnableItems(data.items);
                if (self.model.getReturnableItems().length < 1) {
                    self.trigger('renderMessage', {
                        messageType: 'noReturnableItems'
                    });
                    //self.$el.find('[data-mz-message-for="noReturnableItems"]').show().text(Hypr.getLabel('noReturnableItems')).fadeOut(6000);
                    return false;
                }
                Backbone.MozuView.prototype.render.apply(self, arguments);

                $.each(self.$el.find('[data-mz-order-history-listing-return-item]'), function(index, val) {
                    var packageItem = returnableItems.find(function(model) {
                        if($(val).data('mzOrderLineId') == model.get('orderLineId')){
                            if ($(val).data('mzOptionAttributeFqn')) {
                                return (model.get('orderItemOptionAttributeFQN') == $(val).data('mzOptionAttributeFqn') && model.uniqueProductCode() == $(val).data('mzProductCode'));
                            }
                            return (model.uniqueProductCode() == $(val).data('mzProductCode'));
                        }
                        return false;
                    });

                    returnItemViews.push(new ReturnOrderItemView({
                        el: this,
                        model: packageItem
                    }));
                });

                _.invoke(returnItemViews, 'render');

            });

        },
        clearOrderReturn: function() {
            this.$el.find('[data-mz-value="isSelectedForReturn"]:checked').click();
        },
        cancelOrderReturn: function() {
            this.clearOrderReturn();
            this.trigger('returnCancel');
        },
        finishOrderReturn: function() {
            var self = this,
                op = this.model.finishReturn();
            if (op) {
                return op.then(function(data) {
                    self.model.isLoading(false);
                    self.clearOrderReturn();
                    self.trigger('returnSuccess');
                }, function(res) {
                    self.model.isLoading(false);
                    // self.clearOrderReturn();
                    self.trigger('returnFailure');
                });
            }
        }
    });

    var ReturnOrderItemView = Backbone.MozuView.extend({
        templateName: "modules/my-account/order-history-listing-return-item",
        autoUpdate: [
            'isSelectedForReturn',
            'rmaReturnType',
            'rmaReason',
            'rmaQuantity',
            'rmaComments'
        ],
        dataTypes: {
            'isSelectedForReturn': Backbone.MozuModel.DataTypes.Boolean
        },
        startReturnItem: function(e) {
            var $target = $(e.currentTarget);

            if (this.model.uniqueProductCode()) {
                if (!e.currentTarget.checked) {
                    this.model.set('isSelectedForReturn', false);
                    //var itemDetails = packageItem.getItemDetails();
                    this.model.cancelReturn();
                    this.render();

                    return;
                }

                this.model.set('isSelectedForReturn', true);
                this.model.startReturn();
                this.render();
            }
        },
        render: function() {
            Backbone.MozuView.prototype.render.apply(this, arguments);
        }
    });

    var ReturnHistoryView = Backbone.MozuView.extend({
        templateName: "modules/my-account/return-history-list",
        initialize: function() {
            var self = this;
            this.listenTo(this.model, "change:pageSize", _.bind(this.model.changePageSize, this.model));
            this.listenTo(this.model, 'returndisplayed', function(id) {
                var $retView = self.$('[data-mz-id="' + id + '"]');
                if ($retView.length === 0) $retView = self.$el;
                $retView.ScrollTo({
                    axis: 'y'
                });
            });
        },
        printReturnLabel: function(e) {
            var self = this,
                $target = $(e.currentTarget);

            //Get Whatever Info we need to our shipping label
            var returnId = $target.data('mzReturnid'),
                returnObj = self.model.get('items').findWhere({
                    id: returnId
                });

            var printReturnLabelView = new PrintView({
                model: returnObj
            });

            var _totalRequestCompleted = 0;

            _.each(returnObj.get('packages'), function(value, key, list) {
                window.accountModel.apiGetReturnLabel({
                    'returnId': returnId,
                    'packageId': value.id,
                    'returnAsBase64Png': true
                }).then(function(data) {
                    value.labelImageSrc = 'data:image/png;base64,' + data;
                    _totalRequestCompleted++;
                    if (_totalRequestCompleted == list.length) {
                        printReturnLabelView.render();
                        printReturnLabelView.loadPrintWindow();
                    }
                });
            });

        }
    });

    var PrintView = Backbone.MozuView.extend({
        templateName: "modules/my-account/my-account-print-window",
        el: $('#mz-printReturnLabelView'),
        initialize: function() {},
        loadPrintWindow: function() {
            var host = HyprLiveContext.locals.siteContext.cdnPrefix,
                printScript = host + "/scripts/modules/print-window.js",
                printStyles = host + "/stylesheets/modules/my-account/print-window.css";

            var my_window,
                self = this,
                width = window.screen.width - (window.screen.width / 2),
                height = window.screen.height - (window.screen.height / 2),
                offsetTop = 200,
                offset = window.screen.width * 0.25;


            my_window = window.open("", 'mywindow' + Math.random() + ' ', 'width=' + width + ',height=' + height + ',top=' + offsetTop + ',left=' + offset + ',status=1');
            my_window.document.write('<html><head>');
            my_window.document.write('<link rel="stylesheet" href="' + printStyles + '" type="text/css">');
            my_window.document.write('</head>');

            my_window.document.write('<body>');
            my_window.document.write($('#mz-printReturnLabelView').html());

            my_window.document.write('<script src="' + printScript + '"></script>');

            my_window.document.write('</body></html>');
        }
    });
    
    //var scrollBackUp = _.debounce(function () {
    //    $('#orderhistory').ScrollTo({ axis: 'y', offsetTop: Hypr.getThemeSetting('gutterWidth') });
    //}, 100);
    //var OrderHistoryPageNumbers = PagingViews.PageNumbers.extend({
    //    previous: function () {
    //        var op = PagingViews.PageNumbers.prototype.previous.apply(this, arguments);
    //        if (op) op.then(scrollBackUp);
    //    },
    //    next: function () {
    //        var op = PagingViews.PageNumbers.prototype.next.apply(this, arguments);
    //        if (op) op.then(scrollBackUp);
    //    },
    //    page: function () {
    //        var op = PagingViews.PageNumbers.prototype.page.apply(this, arguments);
    //        if (op) op.then(scrollBackUp);
    //    }
    //});

    var orderHistoryPaging = PagingViews.PageNumbers.extend({
        templateName: 'modules/my-account/order-history-paging-controls',
        autoUpdate: ['pageSize'],
        updatePageSize: function (e) {
            var newSize = parseInt($(e.currentTarget).attr('value'), 10),
                currentSize = this.model.get('pageSize');
            if (isNaN(newSize)) throw new SyntaxError("Cannot set page size to a non-number!");
            if (newSize !== currentSize) {
                this.model.set('pageSize', newSize);
            }
        }
    });

    var PaymentMethodsView = EditableView.extend({
        templateName: "modules/my-account/my-account-paymentmethods",
        autoUpdate: [
            'editingCard.isDefaultPayMethod',
            'editingCard.paymentOrCardType',
            'editingCard.nameOnCard',
            'editingCard.cardNumberPartOrMask',
            'editingCard.expireMonth',
            'editingCard.expireYear',
            'editingCard.cvv',
            'editingCard.isCvvOptional',
            'editingCard.contactId',
            'editingContact.firstName',
            'editingContact.lastNameOrSurname',
            'editingContact.address.address1',
            'editingContact.address.address2',
            'editingContact.address.address3',
            'editingContact.address.cityOrTown',
            'editingContact.address.countryCode',
            'editingContact.address.stateOrProvince',
            'editingContact.address.postalOrZipCode',
            'editingContact.address.addressType',
            'editingContact.phoneNumbers.home',
            'editingContact.isBillingContact',
            'editingContact.isPrimaryBillingContact',
            'editingContact.isShippingContact',
            'editingContact.isPrimaryShippingContact'
        ],
        renderOnChange: [
            'editingCard.isDefaultPayMethod',
            'editingCard.contactId',
            'editingContact.address.countryCode'
        ],
        additionalEvents: {
            "blur #mz-payment-credit-card-number": "changeCardType"
        },
        changeCardType: function(e) {
            var number = e.target.value;
            var cardType = '';
            // visa
            var re = new RegExp("^4");
            if (number.match(re) !== null) {
                cardType = "VISA";
            }

            // Mastercard 
            // Updated for Mastercard 2017 BINs expansion
            if (/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(number))
                cardType = "MC";

            // AMEX
            re = new RegExp("^3[47]");
            if (number.match(re) !== null)
                cardType = "AMEX";

            // Discover
            re = new RegExp("^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)");
            if (number.match(re) !== null)
                cardType = "DISCOVER";

            $('.mz-card-type-images').find('span').removeClass('active');
            if (cardType) {
                this.model.set('card.paymentOrCardType', cardType);
                // $("#mz-payment-credit-card-type").val(cardType);
                $('#mz-payment-credit-card-type').find('option[value="' +cardType+ '"]').prop("selected", true).change();
                $('.mz-card-type-images').find('span[data-mz-card-type-image="' + cardType + '"]').addClass('active');
            } else {
                this.model.set('card.paymentOrCardType', null);
            }
            
        },
        beginEditCard: function (e) {
            var id = this.editing.card = e.currentTarget.getAttribute('data-mz-card');
            this.model.beginEditCard(id);
            this.render();
        },
        finishEditCard: function () {
            var self = this;
            var operation = this.doModelAction('saveCard');
            if (operation) {
                operation.otherwise(function () {
                    self.editing.card = true;
                });
                this.editing.card = false;
            }
        },
        cancelEditCard: function () {
            this.editing.card = false;
            this.model.endEditCard();
            this.render();
        },
        beginDeleteCard: function (e) {
            var self = this,
                id = e.currentTarget.getAttribute('data-mz-card'),
                card = this.model.get('cards').get(id);
            if (window.confirm(Hypr.getLabel('confirmDeleteCard', card.get('cardNumberPart')))) {
                this.doModelAction('deleteCard', id);
            }
        }
    });

    var AddressBookView = EditableView.extend({
        templateName: "modules/my-account/my-account-addressbook",
        autoUpdate: [
            'editingContact.firstName',
            'editingContact.lastNameOrSurname',
            'editingContact.address.address1',
            'editingContact.address.address2',
            'editingContact.address.address3',
            'editingContact.address.cityOrTown',
            'editingContact.address.countryCode',
            'editingContact.address.stateOrProvince',
            'editingContact.address.postalOrZipCode',
            'editingContact.address.addressType',
            'editingContact.phoneNumbers.home',
            'editingContact.isBillingContact',
            'editingContact.isPrimaryBillingContact',
            'editingContact.isShippingContact',
            'editingContact.isPrimaryShippingContact'
        ],
        renderOnChange: [
            'editingContact.address.countryCode',
            'editingContact.address.candidateValidatedAddresses',
            'editingContact.isBillingContact',
            'editingContact.isShippingContact'
        ],
        choose: function (e) {
            var self = this;
            var idx = parseInt($(e.currentTarget).val(), 10);
            var addr = self.model.get('editingContact.address');
            if (idx !== -1) {
                var valAddr = addr.get('candidateValidatedAddresses')[idx];
                for (var k in valAddr) {
                    addr.set(k, valAddr[k]);
                }
            }
            addr.set('candidateValidatedAddresses', null);
            addr.set('isValidated', true);
            this.render();
        },
        beginAddContact: function () {
            this.editing.contact = "new";
            this.render();
        },
        beginEditContact: function (e) {
            var id = this.editing.contact = e.currentTarget.getAttribute('data-mz-contact');
            this.model.beginEditContact(id);
            this.render();
        },
        finishEditContact: function () {
            blockUiLoader.globalLoader();
            var self = this,
                isAddressValidationEnabled = HyprLiveContext.locals.siteContext.generalSettings.isAddressValidationEnabled;
            var operation = this.doModelAction('saveContact', { forceIsValid: isAddressValidationEnabled, editingView: self }); // hack in advance of doing real validation in the myaccount page, tells the model to add isValidated: true
            if (operation) {
                operation.otherwise(function () {
                    self.editing.contact = true;
                });
                this.editing.contact = false;
            }
        },
        cancelEditContact: function () {
            this.editing.contact = false;
            this.model.endEditContact();
            this.render();
            $('html, body').animate({ scrollTop: $("h3.mz-l-stack-sectiontitle").offset().top - 10 }, 1000);
        },
        beginDeleteContact: function (e) {
            var self = this,
                contact = this.model.get('contacts').get(e.currentTarget.getAttribute('data-mz-contact')),
                associatedCards = this.model.get('cards').where({ contactId: contact.id }),
                windowMessage = Hypr.getLabel('confirmDeleteContact', contact.get('address').get('address1')),
                doDeleteContact = function () {
                    return self.doModelAction('deleteContact', contact.id);
                },
                go = doDeleteContact;


            if (associatedCards.length > 0) {
                windowMessage += ' ' + Hypr.getLabel('confirmDeleteContact2');
                go = function () {
                    return self.doModelAction('deleteMultipleCards', _.pluck(associatedCards, 'id')).then(doDeleteContact);
                };

            }

            if (window.confirm(windowMessage)) {
                return go();
            }
        }
    });

    var StoreCreditView = Backbone.MozuView.extend({
        templateName: 'modules/my-account/my-account-storecredit',
        addStoreCredit: function (e) {
            var self = this;
            var id = this.$('[data-mz-entering-credit]').val();
            if (id) return this.model.addStoreCredit(id).then(function () {
                return self.model.getStoreCredits();
            });
        }
    });


    $(document).ready(function () {
        var accountModel = window.accountModel = CustomerModels.EditableCustomer.fromCurrent();

        var $accountSettingsEl = $('#account-settings'),
            $passwordEl = $('#password-section'),
            $orderHistoryEl = $('#account-orderhistory'),
            $returnHistoryEl = $('#account-returnhistory'),
            $paymentMethodsEl = $('#account-paymentmethods'),
            $addressBookEl = $('#account-addressbook'),
            $wishListEl = $('#account-wishlist'),
            $messagesEl = $('#account-messages'),
            $storeCreditEl = $('#account-storecredit'),
            orderHistory = accountModel.get('orderHistory'),
            returnHistory = accountModel.get('returnHistory');

        var accountViews = window.accountViews = {
            settings: new AccountSettingsView({
                el: $accountSettingsEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            password: new PasswordView({
                el: $passwordEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            orderHistory: new OrderHistoryView({
                el: $orderHistoryEl.find('[data-mz-orderlist]'),
                model: orderHistory
            }),
            orderHistoryPagingControls: new PagingViews.PagingControls({
                templateName: 'modules/my-account/order-history-paging-controls',
                el: $orderHistoryEl.find('[data-mz-pagingcontrols]'),
                model: orderHistory
            }),
            orderHistoryPageNumbers: new PagingViews.PageNumbers({
                el: $orderHistoryEl.find('[data-mz-pagenumbers]'),
                model: orderHistory
            }),
            returnHistory: new ReturnHistoryView({
                el: $returnHistoryEl.find('[data-mz-orderlist]'),
                model: returnHistory
            }),
            returnHistoryPagingControls: new PagingViews.PagingControls({
                templateName: 'modules/my-account/order-history-paging-controls',
                el: $returnHistoryEl.find('[data-mz-pagingcontrols]'),
                model: returnHistory
            }),
            returnHistoryPageNumbers: new PagingViews.PageNumbers({
                el: $returnHistoryEl.find('[data-mz-pagenumbers]'),
                model: returnHistory
            }),
            paymentMethods: new PaymentMethodsView({
                el: $paymentMethodsEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            addressBook: new AddressBookView({
                el: $addressBookEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            storeCredit: new StoreCreditView({
                el: $storeCreditEl,
                model: accountModel,
                messagesEl: $messagesEl
            })
        };


        if (HyprLiveContext.locals.siteContext.generalSettings.isWishlistCreationEnabled) accountViews.wishList = new WishListView({
            el: $wishListEl,
            model: accountModel.get('wishlist'),
            messagesEl: $messagesEl
        });
        $(".account_content").hide();
        if (window.location.hash !== "") {
            var hash = window.location.hash;
            hash = hash.indexOf('?') !== -1 ? hash.substring(0, hash.indexOf('?')) : hash;
            $(hash).show();
            $('a[href="' + hash + '"]').parent('li').addClass('active');
            $("#account-panels").css('visibility', 'visible');
            $('html, body').animate({ scrollTop: $("h3.mz-l-stack-sectiontitle").offset().top - 10 }, 700);
        } else {
            $(".account_content:first").show();
            $(".mz-scrollnav-list li:first-child").addClass('active');
            $("#account-panels").css('visibility', 'visible');
        }
        $(document).on("click", ".my-account-details", function (e) {
             $("#account-messages").html("");
             var activeTab = $(this).children('a').attr("href").replace("/myaccount#", "");
             $(".account_content").fadeOut(500);
             $("#" + activeTab).delay(400).fadeIn(1000);
             $('html, body').animate({
                 scrollTop: $("h3.mz-l-stack-sectiontitle").offset().top - 10
             }, 700);
             $("ul.mz-scrollnav-list li").removeClass("active");
             setTimeout(function () {
                 var hash1 = window.location.hash;
                 $('a[href="' + hash1 + '"]').parent('li').addClass('active');
             }, 300);
            
        });
        $("ul.mz-scrollnav-list li").click(function (e) {
            $("#account-messages").html("");
            var activeTab = $(this).children('a').attr("href").replace("#", "");
            $(".account_content").fadeOut(500);
            $("#" + activeTab).delay(400).fadeIn(1000);
            $('html, body').animate({ scrollTop: $("h3.mz-l-stack-sectiontitle").offset().top - 10 }, 700);
            $("ul.mz-scrollnav-list li").removeClass("active");
            $(this).addClass("active");
        });
        $("body").on("click", ".myaccountpop .my-account-details", function (e) {
            var activeTab = $(this).children('a').attr("href").replace("/myaccount#", "");
            $(".account_content").fadeOut(500);
            $("#" + activeTab).delay(400).fadeIn(1000);
            $('a[href="' + activeTab + '"]').parent('li').addClass('active');
            $('html, body').animate({ scrollTop: $("h3.mz-l-stack-sectiontitle").offset().top - 10 }, 1000);
            $('[data-toggle="popover"]').popover('hide');
        });
        // TODO: upgrade server-side models enough that there's no delta between server output and this render,
        // thus making an up-front render unnecessary.
        _.invoke(window.accountViews, 'render');
        $("#orderhistory img").on("error", function () {
            onImageLoadError.checkImage(this);
        });

        createMstLi();
    });
});