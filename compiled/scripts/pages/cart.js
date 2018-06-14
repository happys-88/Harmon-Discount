
define('modules/models-location',["modules/jquery-mozu", "modules/backbone-mozu", "hyprlive", "modules/api"], 
    function ($, Backbone, Hypr, api) {

        var Location = Backbone.MozuModel.extend({
            mozuType: 'location',
            idAttribute: 'code'
        });

        var LocationCollection = Backbone.MozuModel.extend({
            mozuType: 'locations',
            relations: {
                items: Backbone.Collection.extend({
                    model: Location
                })
            }
        });

        return {
            Location: Location,
            LocationCollection: LocationCollection
        };
    }
);
define('modules/models-cart',['underscore', 'modules/backbone-mozu', 'hyprlive', "modules/api", "modules/models-product",
    "hyprlivecontext", 'modules/models-location'
  ], function (_, Backbone, Hypr, api, ProductModels,
        HyprLiveContext, LocationModels) {

    var CartItemProduct = ProductModels.Product.extend({
        helpers: ['mainImage','directShipSupported', 'inStorePickupSupported'],
        mainImage: function() {
            var imgs = this.get("productImages"),
                img = imgs && imgs[0],
                imgurl = 'http://placehold.it/160&text=' + Hypr.getLabel('noImages');
            return img || { ImageUrl: imgurl, imageUrl: imgurl }; // to support case insensitivity
        },
        initialize: function() {
            var url = "/product/" + this.get("productCode");
            this.set({ Url: url, url: url });
        },
        directShipSupported: function(){
            return (_.indexOf(this.get('fulfillmentTypesSupported'), "DirectShip") !== -1) ? true : false;
        },
        inStorePickupSupported: function(){
            return (_.indexOf(this.get('fulfillmentTypesSupported'), "InStorePickup") !== -1) ? true : false;
        }
    }),

    CartItem = Backbone.MozuModel.extend({
        relations: {
            product: CartItemProduct
        },
        validation: {
            quantity: {
                min: 1
            }
        },
        dataTypes: {
            quantity: Backbone.MozuModel.DataTypes.Int
        },
        mozuType: 'cartitem',
        handlesMessages: true,
        helpers: ['priceIsModified', 'storeLocation'],
        priceIsModified: function() {
            var price = this.get('unitPrice');
            return price.baseAmount != price.discountedAmount;
        },
        saveQuantity: function() {
            var self = this;
            var oldQuantity = this.previous("quantity");
            if (this.hasChanged("quantity")) {
                this.apiUpdateQuantity(this.get("quantity"))
                    .then(null, function() {
                        // Quantity update failed, e.g. due to limited quantity or min. quantity not met. Roll back.
                        self.set("quantity", oldQuantity);
                        self.trigger("quantityupdatefailed", self, oldQuantity);
                    });
            }
        },
        storeLocation : function(){
            var self = this;
            if(self.get('fulfillmentLocationCode')) {
                return self.collection.parent.get('storeLocationsCache').getLocationByCode(self.get('fulfillmentLocationCode'));
            }
            return;
        }

    }),
    StoreLocationsCache = Backbone.Collection.extend({
        addLocation : function(location){
            this.add(new LocationModels.Location(location), {merge: true});
        },
        getLocations : function(){
            return this.toJSON();
        },
        getLocationByCode : function(code){
            if(this.get(code)){
                return this.get(code).toJSON();
            }
        }
    }),

    Cart = Backbone.MozuModel.extend({
        mozuType: 'cart',
        handlesMessages: true,
        helpers: ['isEmpty','count'],
        relations: {
            items: Backbone.Collection.extend({
                model: CartItem
            }),
            storeLocationsCache : StoreLocationsCache
        },

        initialize: function() {
            var self = this;
            this.get("items").on('sync remove', this.fetch, this)
                             .on('loadingchange', this.isLoading, this);

            this.get("items").each(function(item, el) {
                if(item.get('fulfillmentLocationCode') && item.get('fulfillmentLocationName')) {
                    self.get('storeLocationsCache').addLocation({
                        code: item.get('fulfillmentLocationCode'),
                        name: item.get('fulfillmentLocationName')
                    });
                }
            });
        },
        isEmpty: function() {
            return this.get("items").length < 1;
        },
        count: function() {
            return this.apiModel.count();
            //return this.get("Items").reduce(function(total, item) { return item.get('Quantity') + total; },0);
        },
        toOrder: function() {
            var me = this;
            me.apiCheckout().then(function(order) {
                me.trigger('ordercreated', order);
            });
        },
        toCheckout: function() {
            var me = this;
            me.apiCheckout2().then(function(checkout) {
                me.trigger('checkoutcreated', checkout);
            });
        },
        removeItem: function (id) {
            return this.get('items').get(id).apiModel.del();
        },
        addCoupon: function () {
            var me = this;
            var code = this.get('couponCode');
            var orderDiscounts = me.get('orderDiscounts');
            if (orderDiscounts && _.findWhere(orderDiscounts, { couponCode: code })) {
                // to maintain promise api
                var deferred = api.defer();
                deferred.reject();
                deferred.promise.otherwise(function () {
                    me.trigger('error', {
                        message: Hypr.getLabel('promoCodeAlreadyUsed', code)
                    });
                });
                return deferred.promise;
            }
            this.isLoading(true);
            return this.apiAddCoupon(this.get('couponCode')).then(function () {
                me.set('couponCode', '');
                var productDiscounts = _.flatten(_.pluck(_.pluck(me.get('items').models, 'attributes'), 'productDiscounts'));
                var shippingDiscounts = _.flatten(_.pluck(_.pluck(me.get('items').models, 'attributes'), 'shippingDiscounts'));

                var allDiscounts = me.get('orderDiscounts').concat(productDiscounts).concat(shippingDiscounts);
                var allCodes = me.get('couponCodes') || [];
                var lowerCode = code.toLowerCase();

                var couponExists = _.find(allCodes, function(couponCode) {
                    return couponCode.toLowerCase() === lowerCode;
                });
                if (!couponExists) {
                    me.trigger('error', {
                        message: Hypr.getLabel('promoCodeError', code)
                    });
                }

                var couponIsNotApplied = (!allDiscounts || !_.find(allDiscounts, function(d) {
                    return d.couponCode && d.couponCode.toLowerCase() === lowerCode;
                }));
                me.set('tentativeCoupon', couponExists && couponIsNotApplied ? code : undefined);

                me.isLoading(false);
            });
        },
        toJSON: function(options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            return j;
        }
    });

    return {
        CartItem: CartItem,
        Cart: Cart
    };
});
/**
 * Quick utility to use on Backbone MozuViews. In case some third party
 * absolutely has to bind an event to an individual DOM element, the view will 
 * need to preserve that actual element between renders. Normally, .render()
 * with HyprLive will destroy and recreate the view's entire innerHTML. This
 * function will take a set of CSS selectors and a callback, and will preserve
 * matching elements through multiple renders, by storing a reference to them
 * and then putting them back where they were. Call this function in your
 * .render() method and send the view-destroying function as its
 * `renderCallback`. You'll be glad you did.
 *
 * Example:
 *
 *     define(['preserve-element-through-render', 'backbone'], 
 *       function(preserveElements, Backbone) {
 *         return Backbone.MozuView.extend({
 *           render: function() {
 *             preserveElements(this, ['.v-button'], function() {
 *               Backbone.MozuView.prototype.render.call(this);
 *             });
 *           }    
 *         });
 *     });
 * 
 * 
 * @param {object} view The Backbone.MozuView we're working with.
 * @param {string[]} selectors An array of selectors for elements to preserve.
 * @param {function} renderCallback A callback representing the render action.
 */

define('modules/preserve-element-through-render',['underscore'], function(_) {
  return function(view, selectors, renderCallback) {
    var thisRound = {};
    view._preserved = view._preserved || {};
    _.each(selectors, function(selector) {
      thisRound[selector] = view.$(selector);
    });
    renderCallback.call(view);
    _.each(thisRound, function($element, selector) {
      var $preserved = view._preserved[selector];
      if ($element.length > 0 && (!$preserved || $preserved.length === 0)) {
        $preserved = view._preserved[selector] = $element;
      }
      if ($preserved && $preserved.length > 0) {
        view.$(selector).replaceWith($preserved);
      }
    });

  };
});
define('shim!vendor/bootstrap/js/modal[jquery=jQuery]',['jquery'], function(jQuery) { 

/* ========================================================================
 * Bootstrap: modal.js v3.3.7
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.7'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (document !== e.target &&
            this.$element[0] !== e.target &&
            !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);
 ; 

return null; 

});


//@ sourceURL=/vendor/bootstrap/js/modal.js

;
//A quick modular way to make a Bootstrap modal.
//Documentation from Bootstrap here:
// https://v4-alpha.getbootstrap.com/components/modal/

define('modules/modal-dialog',['modules/jquery-mozu', 'shim!vendor/bootstrap/js/modal[jquery=jQuery]'],
 function ($) {

   var instance;

   /*For this modal to function, you must pass it  an options object that has
   AT LEAST:
   -elementId: id of element to turn into a modal
   */

   function Modal(opts){
     var me = this;
     this.options = opts;
     var elementId = this.options.elementId || null;
     //**Necessary: id of element to turn into a modal.
     //This element should {% include 'modules/common/modal-dialog' %},
     //or an element that extends the above template,
     //or the creator should be familiar with the components of a bootstrap modal.
     //It should also have the class "modal" for css purposes
     var theElement;
     if(!elementId) {
       //return an error
     } else {
       theElement = $('#'+elementId);
     }

     var buildModal = function(){
       //This function creates the dialog based on the options variable.
       //If the dialog has already been made once (perhaps with different options),
       //We want to clear it out. Some of the building involves appending,
       //so if we don't clear it first, we'll get double buttons
       var header = me.options.header || null;
       //Appends to the end of the .modal-header div.
       var title = me.options.title || null;
       //Prepends a <h4> element in the .modal-header div.
       var body = me.options.body || "";
       //Fills the .modal-body div.
       var footer = me.options.footer || false;
       //If true, Prepends content in the .modal-footer div.

       var hasXButton = me.options.hasXButton || true;
       //Puts an x button in the top right corner that will close the dialog.
       var hasCloseButton = me.options.hasCloseButton || false;
       //Puts a 'Close' butotn in the bottom right corner that will close the dialog.
       var scroll = me.options.scroll || 'default';
       /*
       Bootstrap modals, by default, steal control of the page's scroll bar. This means that if your content
       goes past the height of the page, it'll be scrollable and it'll probably be fine.
       If you want to limit the height of your modal and have a scroll bar on the dialog itself,
       your best bet is probably just to include it manually in the body. If you'd prefer,
       you can use this scroll option - set it to true to use it, but know that for it to
       work you also need to set the bodyHeight option.
       */
       var width = me.options.width || 'default';
       //pretty straightforward - limits the width of the element.
       //if default, the width will be 598px.
       //Regardless, the width will extend to 100% if the viewport is more narrow
       //than 768px.
       var bodyHeight = me.options.bodyHeight || 'default';
       //We don't have a way to set the height of the entire modal element, but you can
       //define the height of the body for scroll purposes here.
       //By default, the body will match to fit the contents.


       var backdrop = me.options.backdrop || 'true';




         ////////////////
         //***HEADER***//
         ////////////////


         if (title){
           //put title in modal-title h4
           theElement.find('.modal-header').html("<h3 class='modal-title'>"+title+"</h3>");
         }

         if (header){
           theElement.find('.modal-header').append("</br>"+header);
           //if header option has been set, append after title
         }

         if (hasXButton){
           //prepend xButton to header
           var $xButton = $("<button>", {"type": "button", "class": "close", "aria-hidden": "true" });
           $xButton.html('&times;');

           $xButton.on('click', function(){
             theElement.modal('hide');
           });

           theElement.find('.modal-header').prepend($xButton);
         }

         if (!title && !header && !hasXButton){
           //if title, header, and hasXButton are all unset, we don't want a header at all.
           theElement.find('.modal-header').hide();
         }

         //////////////
         //***BODY***//
         //////////////

         if (body){
           theElement.find('.modal-body').html(body);
         }


         if (scroll != 'default'){
           theElement.find('.modal-body').css('overflow', 'scroll');
         }

         ////////////////
         //***FOOTER***//
         ////////////////

         if (footer){
           theElement.find('.modal-footer').html(footer);
         } 

         if (hasCloseButton){
           var $closeButton = $("<button>", {"type": "button", "class": "mz-button", "aria-hidden": "true" });
           $closeButton.text("Close");
           $closeButton.on('click', function(){
             theElement.modal('hide');
           });

           theElement.find('.modal-footer').append($closeButton);
         }

         ////////////////
         //***GENERAL***//
         ////////////////

         if (width!=="default"){
           theElement.find('.modal-dialog').width(width);
         }

         if (bodyHeight!=="default"){
           theElement.find('.modal-body').height(bodyHeight);
         }

     };


       //RETURN:

       return {

         show: function(){
           if (me.options.backdrop===null || me.options.backdrop===undefined){
              theElement.modal();
           } else {
             theElement.modal({backdrop: me.options.backdrop});
           }


         },

         hide: function(){
           theElement.modal('hide');
         },

         setBody: function(body) {
           me.options.body = body;
           theElement.find('.modal-body').html(body);

         },

         setOptions: function(opts) {
           me.options = opts;
           buildModal();
         },

         build: function(){
           buildModal();
         }

       };

   }

   return {
		init: function(options) {

			var modal = new Modal(options);
      modal.build();
      return modal;
		}
	};
 });

define('pages/cart',['modules/api', 'modules/backbone-mozu', 'underscore', 'modules/jquery-mozu', 'modules/models-cart', 'modules/cart-monitor', 'hyprlivecontext', 'hyprlive', 'modules/preserve-element-through-render', 'modules/block-ui',
    'modules/modal-dialog',
    'modules/on-image-load-error'
], function(api, Backbone, _, $, CartModels, CartMonitor, HyprLiveContext, Hypr, preserveElement, blockUiLoader, modalDialog, onImageLoadError) {
    var pageContext = require.mozuData('pagecontext');
    var CartView = Backbone.MozuView.extend({
        templateName: "modules/cart/cart-table",
        additionalEvents: {
            "keypress .mz-carttable-qty-field": "updateQuantity",
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
            try {
                preserveElement(this, ['.v-button', '.p-button'], function() {
                    Backbone.MozuView.prototype.render.call(this);
                });
            } catch (e) {}
            Backbone.MozuView.prototype.render.call(this);
            $("#cart img").on("error", function() {
                onImageLoadError.checkImage(this);
            });
        },
        updateQuantity: _.debounce(function(e) {
            if (e.type != 'focusout') {
                var flag = true;
                var $qField = $(e.currentTarget),
                    newQuantity = parseInt($qField.val(), 10),
                    id = $qField.data('mz-cart-item'),
                    item = this.model.get("items").get(id);
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
                                item.set('quantity', newQuantity);
                                item.saveQuantity();
                                this.render();
                            }
                        }
                    } else {
                        if (item) {
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

            }
        }, 600),
        checkNumeric: function(e) {
            e.target.value = e.target.value.replace(/[^\d]/g, '');
        },
        onQuantityUpdateFailed: function(model, oldQuantity) {
            var field = this.$('[data-mz-cart-item=' + model.get('id') + ']');
            if (field) {
                field.val(oldQuantity);
            } else {
                this.render();
            }
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
                        if(cartItems[i].mfgPartNumbers) {
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
                    self.model.isLoading(true);
                }
            }, function() {
                window.console.log("Got some error at cross sell in Global Cart");
            });
            return flag;
        },
        paypalCheckoutGuest: function(e) {
            $.cookie('paypal', 'true');
            this.checkoutGuest(e);
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
                        if(cartItems[i].mfgPartNumbers) {
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
            this.proceedToCheckout(e);
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
            var getCouponCode = this.$el.find('#coupon-detail p').attr('id');
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
        onEnterCouponCode: function(model, code) {
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
            if (this.isEmpty())
                window.location.reload();
            else
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
    });

});