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

    PredictionAPI.prototype.request = function(path, successCallback, data) {
      var url,
        _this = this;
      url = "" + Settings.API_URL + "/" + path;
      if (Settings.is_debug()) {
        console.log("Posting " + (JSON.stringify(data)) + " to " + url);
      }
      return jQuery.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        crossDomain: true,
        data: JSON.stringify(jQuery.extend({
          pio_appkey: Settings.API_KEY
        }, data)),
        success: function() {
          if (Settings.is_debug()) {
            console.log('Success!');
          }
          if (successCallback) {
            return successCallback();
          }
        },
        error: function(_xhr, _textStatus, error) {
          if (Settings.is_debug()) {
            return console.log("Error: " + error + "!");
          }
        }
      });
    };

    return PredictionAPI;

  })();

  Registerer = (function() {
    Registerer.prototype.ACTION_REGISTER_ITEM = 1;

    Registerer.prototype.ACTION_VIEW = 2;

    Registerer.prototype.ACTION_REGISTER_USER = 3;

    Registerer.prototype.ACTION_REGISTER_CONVERSION = 4;

    function Registerer() {
      this.userId = __bind(this.userId, this);
      this.do_action_job = __bind(this.do_action_job, this);
      this.process_action = __bind(this.process_action, this);
      this.registerItemAddToCompareAction = __bind(this.registerItemAddToCompareAction, this);
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

    Settings.API_KEY = 'KdpSqVJNTquC4wzt0vuW8898gunhCNaoiDZXyCbUbIalFcE1FyBtsOZvZhF4tjeu';

    Settings.API_URL = 'http://193.107.237.171:81';

    Settings.USER_ID_COOKIE_NAME = 'puid';

    Settings.INFO_COOKIE_NAME = 'pdt';

    Settings.is_debug = function() {
      return this.MODE === 'debug';
    };

    return Settings;

  })();

  Tracker = (function() {
    function Tracker() {
      this.currentCategory = __bind(this.currentCategory, this);
      this.trackProductView = __bind(this.trackProductView, this);
      this.subscribeCompare = __bind(this.subscribeCompare, this);
      this.subscribeAddToCard = __bind(this.subscribeAddToCard, this);
      this.reg = new Registerer();
      this.trackProductView();
      this.subscribeCompare();
      this.subscribeAddToCard();
    }

    Tracker.prototype.subscribeAddToCard = function() {
      var _this = this;
      jQuery('.my-wishlist .btn-add').click(function() {
        var get_item_id;
        get_item_id = function(e) {
          return jQuery(e).attr('id').gsub(/^product-price-/, '');
        };
        return jQuery('.my-wishlist [id^="product-price-"]').map(get_item_id).each(function(item_id) {
          return _this.reg.registerItemAddToCart(item_id);
        });
      });
      jQuery('.my-wishlist .cart-cell').each(function(_, e) {
        var cell, item_id;
        cell = jQuery(e);
        item_id = jQuery('[id^="product-price-"]', cell).attr('id').gsub(/^product-price-/, '');
        return jQuery('.btn-cart', cell).click(function() {
          return _this.reg.registerItemAddToCart(item_id);
        });
      });
      jQuery('.product-view form').each(function(_, f) {
        var form, item_id;
        form = jQuery(f);
        item_id = form.find("input[name='product']").val();
        return jQuery('.btn-cart', form).click(function() {
          return _this.reg.registerItemAddToCart(item_id);
        });
      });
      return jQuery('.category-products .btn-cart').click(function(e) {
        var item, item_id, match;
        item = jQuery(e.target);
        item = item.parent();
        if ((match = /\/checkout\/.+\/product\/\d+\//.exec(item.attr('onclick')))) {
          item_id = match[match.length - 1];
          return _this.reg.registerItemAddToCart(item_id);
        }
      });
    };

    Tracker.prototype.subscribeCompare = function() {
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