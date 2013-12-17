// Generated by CoffeeScript 1.6.3
(function() {
  var CookiesActionStore, PredictionAPI, Registerer, Settings, Tracker,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CookiesActionStore = (function() {
    function CookiesActionStore() {
      this.generate = __bind(this.generate, this);
      this.deleteAction = __bind(this.deleteAction, this);
      this.getActions = __bind(this.getActions, this);
      this.getAction = __bind(this.getAction, this);
      this.addAction = __bind(this.addAction, this);
      this.newId = __bind(this.newId, this);
      this.save = __bind(this.save, this);
      this.current = __bind(this.current, this);
      this.load = __bind(this.load, this);
    }

    CookiesActionStore.prototype.ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    CookiesActionStore.prototype.load = function() {
      var cookie, data, e;
      this.data = [];
      try {
        cookie = jQuery.cookie(Settings.INFO_COOKIE_NAME);
        if (cookie) {
          data = JSON.parse(cookie);
          if (data instanceof Array) {
            this.data = data;
          }
        }
      } catch (_error) {
        e = _error;
        if (Settings.is_debug()) {
          console.log("Error while loading actions data from cookies: " + e);
        }
      }
      return this.data;
    };

    CookiesActionStore.prototype.current = function() {
      return this.data || this.load();
    };

    CookiesActionStore.prototype.save = function() {
      if (this.data.length === 0) {
        if (Settings.is_debug()) {
          console.log('Cleaning up tracking data');
        }
        return jQuery.removeCookie(Settings.INFO_COOKIE_NAME, {
          path: '/',
          domain: "." + location.host
        });
      } else {
        if (Settings.is_debug()) {
          console.log("Saving tracking data: " + this.data);
        }
        return jQuery.cookie(Settings.INFO_COOKIE_NAME, JSON.stringify(this.data), {
          expires: 365 * 10,
          path: '/',
          domain: "." + location.host
        });
      }
    };

    CookiesActionStore.prototype.newId = function() {
      return this.generate(2) + this.current().length;
    };

    CookiesActionStore.prototype.addAction = function(type, params) {
      var id;
      id = this.newId();
      this.current().push([id, type, params]);
      this.save();
      return id;
    };

    CookiesActionStore.prototype.getAction = function(id) {
      return this.getActions().filter(function(e) {
        return e[0] === id;
      })[0];
    };

    CookiesActionStore.prototype.getActions = function() {
      return this.current();
    };

    CookiesActionStore.prototype.deleteAction = function(id) {
      this.data = this.current().filter(function(e) {
        return e[0] !== id;
      });
      return this.save();
    };

    CookiesActionStore.prototype.generate = function(count) {
      var _i, _results,
        _this = this;
      return (function() {
        _results = [];
        for (var _i = 1; 1 <= count ? _i <= count : _i >= count; 1 <= count ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).map(function() {
        return _this.ALPHABET.charAt(Math.floor(Math.random() * _this.ALPHABET.length));
      }).reduce(function(a, b) {
        return a + b;
      });
    };

    return CookiesActionStore;

  })();

  jQuery(document).ready(function() {
    return new Tracker();
  });

  PredictionAPI = (function() {
    function PredictionAPI() {
      this.request = __bind(this.request, this);
      this.getRecommendations = __bind(this.getRecommendations, this);
      this.registerUserItemAction = __bind(this.registerUserItemAction, this);
      this.registerItem = __bind(this.registerItem, this);
      this.registerUser = __bind(this.registerUser, this);
      jQuery.support.cors = true;
    }

    PredictionAPI.prototype.registerUser = function(userId, successCallback) {
      return this.request('users.json', successCallback, {
        pio_uid: userId
      });
    };

    PredictionAPI.prototype.registerItem = function(itemId, categoriesIds, successCallback) {
      return this.request('items.json', successCallback, {
        pio_iid: itemId,
        pio_itypes: categoriesIds.join(',')
      });
    };

    PredictionAPI.prototype.registerUserItemAction = function(userId, itemId, action, successCallback) {
      return this.request('actions/u2i.json', successCallback, {
        pio_uid: userId,
        pio_iid: itemId,
        pio_action: action
      });
    };

    PredictionAPI.prototype.getRecommendations = function(userId, categoryId, successCallback, max_count) {
      var params, url;
      if (max_count == null) {
        max_count = 3;
      }
      params = jQuery.param({
        pio_uid: userId,
        pio_n: max_count,
        pio_appkey: Settings.API_KEY
      });
      url = "engines/itemrec/r" + categoryId + "/topn.json?" + params;
      return this.request(url, successCallback);
    };

    PredictionAPI.prototype.request = function(path_and_qs, successCallback, data) {
      var base_options, options, url,
        _this = this;
      if (data == null) {
        data = null;
      }
      url = "" + Settings.API_URL + "/" + path_and_qs;
      options = data ? {
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(jQuery.extend({
          pio_appkey: Settings.API_KEY
        }, data))
      } : {
        type: 'GET'
      };
      base_options = {
        url: url,
        crossDomain: true,
        success: function(data) {
          if (Settings.is_debug()) {
            console.log('Success!');
          }
          if (successCallback) {
            return successCallback(data);
          }
        },
        error: function(_xhr, _textStatus, error) {
          if (Settings.is_debug()) {
            return console.log("Error: " + error + "!");
          }
        }
      };
      if (Settings.is_debug()) {
        console.log("Sending " + (JSON.stringify(data || '')) + " to " + url);
      }
      return jQuery.ajax(jQuery.extend(base_options, options));
    };

    return PredictionAPI;

  })();

  Registerer = (function() {
    Registerer.prototype.ACTION_REGISTER_ITEM = 1;

    Registerer.prototype.ACTION_VIEW = 2;

    Registerer.prototype.ACTION_REGISTER_USER = 3;

    Registerer.prototype.ACTION_REGISTER_CONVERSION = 4;

    Registerer.prototype.ACTION_REGISTER_LIKE = 5;

    function Registerer() {
      this.userId = __bind(this.userId, this);
      this.do_action_job = __bind(this.do_action_job, this);
      this.process_action = __bind(this.process_action, this);
      this.registerItemAddToCompareAction = __bind(this.registerItemAddToCompareAction, this);
      this.registerItemAddToWishlistAction = __bind(this.registerItemAddToWishlistAction, this);
      this.registerItemViewAction = __bind(this.registerItemViewAction, this);
      this.registerItem = __bind(this.registerItem, this);
      this.registerItemAddToCart = __bind(this.registerItemAddToCart, this);
      this.registerUser = __bind(this.registerUser, this);
      var _this = this;
      this.store = new CookiesActionStore();
      this.api = new PredictionAPI();
      this.store.getActions().each(function(action) {
        if (action) {
          return _this.do_action_job(action[0], action[1], action[2]);
        }
      });
    }

    Registerer.prototype.registerUser = function(user_id) {
      return this.process_action(this.ACTION_REGISTER_USER, user_id);
    };

    Registerer.prototype.registerItemAddToCart = function(item_id) {
      return this.process_action(this.ACTION_REGISTER_CONVERSION, item_id);
    };

    Registerer.prototype.registerItem = function(item_id, categories) {
      return this.process_action(this.ACTION_REGISTER_ITEM, [item_id, categories]);
    };

    Registerer.prototype.registerItemViewAction = function(item_id) {
      return this.process_action(this.ACTION_VIEW, item_id);
    };

    Registerer.prototype.registerItemAddToWishlistAction = function(item_id) {
      return this.process_action(this.ACTION_REGISTER_LIKE, item_id);
    };

    Registerer.prototype.registerItemAddToCompareAction = function(item_id) {
      return this.process_action(this.ACTION_VIEW, item_id);
    };

    Registerer.prototype.process_action = function(type, params) {
      var id;
      id = this.store.addAction(type, params);
      return this.do_action_job(id, type, params);
    };

    Registerer.prototype.do_action_job = function(id, type, params) {
      var e, on_success,
        _this = this;
      try {
        if (!id || !type || !params) {
          if (Settings.is_debug()) {
            console.log("Warning while processing action. Bad params: " + id + ", " + type + ", " + params);
          }
          return;
        }
        on_success = function() {
          return _this.store.deleteAction(id);
        };
        if (type === this.ACTION_REGISTER_USER) {
          return this.api.registerUser(params, on_success);
        } else if (type === this.ACTION_VIEW) {
          return this.api.registerUserItemAction(this.userId(), params, 'view', on_success);
        } else if (type === this.ACTION_REGISTER_ITEM) {
          return this.api.registerItem(params[0], params[1], on_success);
        } else if (type === this.ACTION_REGISTER_CONVERSION) {
          return this.api.registerUserItemAction(this.userId(), params, 'conversion', on_success);
        } else if (type === this.ACTION_REGISTER_LIKE) {
          return this.api.registerUserItemAction(this.userId(), params, 'like', on_success);
        }
      } catch (_error) {
        e = _error;
        if (Settings.is_debug()) {
          console.log("Error while processing action: " + e);
        }
        return this.store.deleteAction(id);
      }
    };

    Registerer.prototype.userId = function() {
      var user_id;
      user_id = jQuery.cookie(Settings.USER_ID_COOKIE_NAME);
      if (!user_id) {
        user_id = this.store.generate(8);
        this.registerUser(user_id);
        jQuery.cookie(Settings.USER_ID_COOKIE_NAME, user_id, {
          expires: 365 * 10,
          path: '/',
          domain: "." + location.host
        });
      }
      return user_id;
    };

    return Registerer;

  })();

  Settings = (function() {
    function Settings() {}

    Settings.MODE = 'debug';

    Settings.API_KEY = 'loBG9uPwcMJ5sh6CGGos0Zgb4qEWILxlXfpmP6IUdnWh0dyxdHkGtKR1CRWrUjIE';

    Settings.API_URL = 'http://95.85.33.104:81';

    Settings.USER_ID_COOKIE_NAME = '__puid';

    Settings.INFO_COOKIE_NAME = '__pdt';

    Settings.is_debug = function() {
      return this.MODE === 'debug';
    };

    return Settings;

  })();

  Tracker = (function() {
    function Tracker() {
      this.currentCategory = __bind(this.currentCategory, this);
      this.trackProductView = __bind(this.trackProductView, this);
      this.subscribeCompareLinks = __bind(this.subscribeCompareLinks, this);
      this.subscribeAddToCartAtProductView = __bind(this.subscribeAddToCartAtProductView, this);
      this.subscribeAddToCartAtWishList = __bind(this.subscribeAddToCartAtWishList, this);
      this.subscribeAddToCartAtCategoryView = __bind(this.subscribeAddToCartAtCategoryView, this);
      this.subscribeAddToCartAtCompareView = __bind(this.subscribeAddToCartAtCompareView, this);
      this.subscribeAddToWishlistAtProductView = __bind(this.subscribeAddToWishlistAtProductView, this);
      this.subscribeAddToWishlistAtCategoryView = __bind(this.subscribeAddToWishlistAtCategoryView, this);
      this.subscribeAddToWishlistAtCompareView = __bind(this.subscribeAddToWishlistAtCompareView, this);
      this.injectRecommendations = __bind(this.injectRecommendations, this);
      this.reg = new Registerer();
      this.api = new PredictionAPI();
      this.trackProductView();
      this.subscribeCompareLinks();
      this.subscribeAddToCartAtWishList();
      this.subscribeAddToCartAtProductView();
      this.subscribeAddToCartAtCategoryView();
      this.subscribeAddToCartAtCompareView();
      this.subscribeAddToWishlistAtProductView();
      this.subscribeAddToWishlistAtCategoryView();
      this.subscribeAddToWishlistAtCompareView();
      this.injectRecommendations();
    }

    Tracker.prototype.injectRecommendations = function() {
      var category_id, on_sucdess;
      on_sucdess = function(data) {
        return console.log(data);
      };
      if (jQuery('.category-products').length > 0 && (category_id = this.currentCategory())) {
        this.api.getRecommendations(this.reg.userId(), category_id, on_sucdess);
        return console.log("Product list for category " + category_id);
      }
    };

    Tracker.prototype.subscribeAddToWishlistAtCompareView = function() {
      var _this = this;
      return jQuery('.compare-table .link-wishlist').click(function(e) {
        var item, item_id, match;
        item = jQuery(e.target);
        if ((match = /\/wishlist.+\/product\/(\d+)\//.exec(item.attr('href')))) {
          item_id = match[match.length - 1];
          return _this.reg.registerItemAddToWishlistAction(item_id);
        }
      });
    };

    Tracker.prototype.subscribeAddToWishlistAtCategoryView = function() {
      var _this = this;
      return jQuery('.category-products .link-wishlist').click(function(e) {
        var item, item_id, match;
        item = jQuery(e.target);
        if ((match = /\/wishlist\/index\/add\/product\/(\d+)\//.exec(item.attr('onclick')))) {
          item_id = match[match.length - 1];
          return _this.reg.registerItemAddToWishlistAction(item_id);
        }
      });
    };

    Tracker.prototype.subscribeAddToWishlistAtProductView = function() {
      var _this = this;
      return jQuery('.product-view .link-wishlist').click(function(e) {
        var item, item_id, match;
        item = jQuery(e.target);
        if ((match = /\/wishlist\/index\/add\/product\/(\d+)\//.exec(item.attr('onclick')))) {
          item_id = match[match.length - 1];
          return _this.reg.registerItemAddToWishlistAction(item_id);
        }
      });
    };

    Tracker.prototype.subscribeAddToCartAtCompareView = function() {
      var _this = this;
      return jQuery('.compare-table .btn-cart').click(function(e) {
        var item, item_id, match;
        item = jQuery(e.target);
        item = item.parent().parent();
        if ((match = /\/checkout\/.+\/product\/(\d+)\//.exec(item.attr('onclick')))) {
          item_id = match[match.length - 1];
          return _this.reg.registerItemAddToCart(item_id);
        }
      });
    };

    Tracker.prototype.subscribeAddToCartAtCategoryView = function() {
      var _this = this;
      return jQuery('.category-products .btn-cart').click(function(e) {
        var item, item_id, match;
        item = jQuery(e.target);
        item = item.parent().parent();
        if ((match = /\/checkout\/.+\/product\/(\d+)\//.exec(item.attr('onclick')))) {
          item_id = match[match.length - 1];
          return _this.reg.registerItemAddToCart(item_id);
        }
      });
    };

    Tracker.prototype.subscribeAddToCartAtWishList = function() {
      var _this = this;
      jQuery('.my-wishlist .btn-add').click(function() {
        var get_item_id;
        get_item_id = function(_, e) {
          return jQuery(e).attr('id').gsub(/^product-price-/, '');
        };
        return jQuery('.my-wishlist [id^="product-price-"]').map(get_item_id).each(function(_, item_id) {
          return _this.reg.registerItemAddToCart(item_id);
        });
      });
      return jQuery('.my-wishlist .cart-cell').each(function(_, e) {
        var cell, item_id;
        cell = jQuery(e);
        item_id = jQuery('[id^="product-price-"]', cell).attr('id').gsub(/^product-price-/, '');
        return jQuery('.btn-cart', cell).click(function() {
          return _this.reg.registerItemAddToCart(item_id);
        });
      });
    };

    Tracker.prototype.subscribeAddToCartAtProductView = function() {
      var _this = this;
      return jQuery('.product-view form').each(function(_, f) {
        var form, item_id;
        form = jQuery(f);
        item_id = form.find("input[name='product']").val();
        return jQuery('.btn-cart', form).click(function() {
          return _this.reg.registerItemAddToCart(item_id);
        });
      });
    };

    Tracker.prototype.subscribeCompareLinks = function() {
      var _this = this;
      return jQuery('.link-compare').click(function(e) {
        var item, item_id, match;
        item = jQuery(e.target);
        if ((match = /\/product_compare\/add\/product\/(\d+)\//.exec(item.attr('onclick')))) {
          item_id = match[match.length - 1];
          return _this.reg.registerItemAddToCompareAction(item_id);
        }
      });
    };

    Tracker.prototype.trackProductView = function() {
      var _this = this;
      return jQuery('.product-view form').each(function(_, f) {
        var cat, form, item_id;
        form = jQuery(f);
        item_id = form.find("input[name='product']").val();
        cat = _this.currentCategory();
        if (cat && cat.length > 0) {
          _this.reg.registerItem(item_id, [cat]);
        }
        return _this.reg.registerItemViewAction(item_id);
      });
    };

    Tracker.prototype.currentCategory = function() {
      var categories, item_cat;
      item_cat = function(item) {
        var cat, match, starts_with_category, to_cats_list, withCats;
        starts_with_category = function(s) {
          return s.indexOf('category') === 0;
        };
        to_cats_list = function(_, e) {
          return jQuery(e).attr('class').split(' ').filter(starts_with_category);
        };
        withCats = jQuery(item).map(to_cats_list);
        cat = withCats[0];
        if (cat && (match = /category(\d+)/.exec(cat))) {
          return match[match.length - 1];
        } else {
          return null;
        }
      };
      categories = jQuery('.breadcrumbs li').map(function(_, item) {
        return item_cat(item);
      }).filter(function(_, c) {
        return c;
      });
      return categories[0];
    };

    return Tracker;

  })();

}).call(this);
/*!
 * jQuery Cookie Plugin v1.4.0
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals.
        factory(jQuery);
    }
}(function ($) {

    var pluses = /\+/g;

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape...
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }

        try {
            // Replace server-side written pluses with spaces.
            // If we can't decode the cookie, ignore it, it's unusable.
            s = decodeURIComponent(s.replace(pluses, ' '));
        } catch(e) {
            return;
        }

        try {
            // If we can't parse the cookie, ignore it, it's unusable.
            return config.json ? JSON.parse(s) : s;
        } catch(e) {}
    }

    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }

    var config = $.cookie = function (key, value, options) {

        // Write
        if (value !== undefined && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            return (document.cookie = [
                encode(key), '=', stringifyCookieValue(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path    ? '; path=' + options.path : '',
                options.domain  ? '; domain=' + options.domain : '',
                options.secure  ? '; secure' : ''
            ].join(''));
        }

        // Read

        var result = key ? undefined : {};

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all. Also prevents odd result when
        // calling $.cookie().
        var cookies = document.cookie ? document.cookie.split('; ') : [];

        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = parts.join('=');

            if (key && key === name) {
                // If second argument (value) is a function it's a converter...
                result = read(cookie, value);
                break;
            }

            // Prevent storing a cookie that we couldn't decode.
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }

        return result;
    };

    config.defaults = {};

    $.removeCookie = function (key, options) {
        if ($.cookie(key) !== undefined) {
            // Must not alter options, thus extending a fresh object...
            $.cookie(key, '', $.extend({}, options, { expires: -1 }));
            return true;
        }
        return false;
    };

}));