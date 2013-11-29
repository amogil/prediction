// Generated by CoffeeScript 1.6.3
(function() {
  var PredictionAPI, Settings, Tracker,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  jQuery(document).ready(function() {
    return new Tracker();
  });

  PredictionAPI = (function() {
    function PredictionAPI(url, apiKey) {
      this.request = __bind(this.request, this);
      this.registerUserItemAction = __bind(this.registerUserItemAction, this);
      this.registerItem = __bind(this.registerItem, this);
      this.registerUser = __bind(this.registerUser, this);
      this.url = url;
      this.apiKey = apiKey;
    }

    PredictionAPI.prototype.registerUser = function(userId) {
      return this.request('users.json', {
        pio_uid: userId
      });
    };

    PredictionAPI.prototype.registerItem = function(itemId, categoriesIds) {
      if (categoriesIds == null) {
        categoriesIds = [];
      }
      return this.request('items.json', {
        pio_iid: itemId,
        pio_itypes: categoriesIds.join(',')
      });
    };

    PredictionAPI.prototype.registerUserItemAction = function(userId, itemId, action) {
      return this.request('actions/u2i.json', {
        pio_uid: userId,
        pio_iid: itemId,
        pio_action: action
      });
    };

    PredictionAPI.prototype.request = function(path, data) {
      var url;
      url = "" + this.url + "/" + path;
      if (Settings.MODE === 'debug') {
        console.log("Posted " + (JSON.stringify(data)) + " to " + url);
      }
      return jQuery.ajax({
        url: url,
        type: 'POST',
        data: jQuery.extend({
          pio_appkey: this.apiKey
        }, data)
      });
    };

    return PredictionAPI;

  })();

  Settings = (function() {
    function Settings() {}

    Settings.MODE = 'debug';

    Settings.API_KEY = 'KdpSqVJNTquC4wzt0vuW8898gunhCNaoiDZXyCbUbIalFcE1FyBtsOZvZhF4tjeu';

    Settings.API_URL = 'http://193.107.237.171:8000';

    Settings.USER_ID_COOKIE_NAME = 'puid';

    return Settings;

  })();

  Tracker = (function() {
    function Tracker() {
      this.userId = __bind(this.userId, this);
      this.generateUserId = __bind(this.generateUserId, this);
      var _this = this;
      this.api = new PredictionAPI(Settings.API_URL, Settings.API_KEY);
      jQuery('.product-view form').each(function(_, f) {
        var form, item_id;
        form = jQuery(f);
        item_id = form.find("input[name='product']").val();
        _this.api.registerItem(item_id);
        _this.api.registerUserItemAction(_this.userId(), item_id, 'view');
        form.find('.add-to-cart button').click(function() {
          return this.api.registerUserItemAction(this.userId(), item_id, 'conversion');
        });
        return form.find('.link-wishlist').click(function() {
          return this.api.registerUserItemAction(this.userId(), item_id, 'like');
        });
      });
    }

    Tracker.prototype.generateUserId = function() {
      var alphabet, random_user_id, _, _i;
      random_user_id = '';
      alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (_ = _i = 1; _i <= 8; _ = ++_i) {
        random_user_id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      }
      return random_user_id;
    };

    Tracker.prototype.userId = function() {
      var user_id;
      user_id = jQuery.cookie(Settings.USER_ID_COOKIE_NAME);
      if (!user_id) {
        user_id = this.generateUserId();
        this.api.registerUser(user_id);
        jQuery.cookie(Settings.USER_ID_COOKIE_NAME, user_id, {
          expires: 9999,
          domain: "." + location.host
        });
      }
      return user_id;
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