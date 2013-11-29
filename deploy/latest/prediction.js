function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString()) + "; path=/";
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) {
        c_value = null;
    } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}

function registerUser(user) {
    jQuery.ajax({
        crossDomain: true,
        url:  'http://193.107.237.171:8000/users.json',
        type: 'POST',
        data:  {pio_appkey: 'lwvY8a9XV9syFyGx4bGIGECatUwVyUr5yrCFWz4964G9cdiQPtZa10rpcyde203t',
                pio_uid: user}
    })
}

function registerItem(item) {
    jQuery.ajax({
        crossDomain: true,
        url:  'http://193.107.237.171:8000/items.json',
        type: 'POST',
        data:  {pio_appkey: 'lwvY8a9XV9syFyGx4bGIGECatUwVyUr5yrCFWz4964G9cdiQPtZa10rpcyde203t',
                pio_iid: item,
                pio_itypes: 'products'}
    })
}

function notifyUserItem(user, item, action) {
    jQuery.ajax({
        crossDomain: true,
        url:  'http://193.107.237.171:8000/actions/u2i.json',
        type: 'POST',
        data:  {pio_appkey: 'lwvY8a9XV9syFyGx4bGIGECatUwVyUr5yrCFWz4964G9cdiQPtZa10rpcyde203t',
                pio_uid: user,
                pio_iid: item,
                pio_action: action}
    })
}

/* https://gist.github.com/982883 */
UUIDv4 = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}

function getUser() {
    var userID = null
    if (!(userID = getCookie('secretUserID'))) {
        registerUser(userID = UUIDv4())
        setCookie('secretUserID', userID, 366)
    }
    return userID
}
 
/* Consider the product page */
jQuery('.product-view').each(function(i) {
    if (form = jQuery(this).find('form')[0]) {
        if (item = /^.*\/(\d+)\//.exec(form.action)[1]) {
            registerItem(item)
            jQuery(form).find('.add-to-cart button').bind('click',
                function(e) { notifyUserItem(getUser(), item, 'conversion'); return true }
            )
            jQuery(form).find('.link-wishlist').bind('click',
                function(e) { notifyUserItem(getUser(), item, 'like'); return true }
            )
            notifyUserItem(getUser(), item, 'view')
        }
    }
})
 
/* Consider the grid */
// ain't working right 'cuz I don't know JS
/*
jQuery('.category-products .item').each(function(i) {
    if (buy = jQuery(this).find('.product-shop button')[0]) {
        if (item = /^setLocation\('.*\/(\d+)\/'\)$/.exec(buy.attributes.onclick.value)[1]) {
            jQuery(buy).bind('click',
                function(e) { notifyUserItem(getUser(), item, 'conversion'); return true }
            )
            jQuery(this).find('.link-wishlist').bind('click',
                function(e) { notifyUserItem(getUser(), item, 'like'); return true }
            )
        }
    }
})
*/