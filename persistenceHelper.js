// requirements: jQuery, jQuery.cookie
window.persistenceHelper = {};
jQuery = jQuery || null;

(function($){
    if (typeof $.cookie == 'function') {
        $.cookie.defaults.path = '/';
        $.cookie.json = true;
    }
    persistenceHelper.config = {
        prefix              : 'et_',
        persistentCookie    : 365,
        forceCookie         : false
    };

    /**
     * Used for registering global variables from local context (encapsulated functions)
     * @type {{}}
     */
    persistenceHelper.globals = {};

    /**
     * Adds a variable to the global context.
     * @param key string key to save
     * @param value value to save
     * @param namespace string to separate global variables regarding their context
     */
    persistenceHelper.addGlobal = function(key, value, namespace) {
        if (typeof namespace != "string" || typeof  namespace == 'undefined') {
            namespace = 'default';
        }
        if (typeof key != 'string') {
            throw "persistenceHelper::addGlobal parameter key must be a string";
        }
        if (typeof this.globals[namespace] != "object") {
            this.globals[namespace] = {};
        }
        this.globals[namespace][key] = value;
    };

    /**
     * Get a variable from global context. If the given namespace is not instantiated it will throw an error.
     * @param key string identifier
     * @param namespace string defaults do "default"
     * @returns {*|null}
     */
    persistenceHelper.getGlobal = function(key, namespace) {
        if (typeof namespace != "string" || typeof  namespace == 'undefined') {
            namespace = 'default';
        }
        if (!this.globals[namespace]) {
            return null;
        }
        return (this.globals[namespace][key]) ? this.globals[namespace][key] : null;
    }

    /**
     * Sets data under key in the browser storage or in a cookie.
     * @param key string The key of the storage entry, it will be prefixed with config.prefix
     * @param data string|PlainObject The data to stored (if a plain object it will be parsed into an json-string)
     * @param persistent boolean If true it will be stored in LocalStorage instead of SessionStorage (or a longer cookie expiry)
     */
    persistenceHelper.set = function(key, data, persistent){
        persistent = persistent || false;
        key = persistenceHelper.config.prefix + key;
        if (window['sessionStorage'] && window['localStorage'] && !persistenceHelper.config.forceCookie) {
            if ($.isPlainObject(data)) {
                data = JSON.stringify(data);
            }
            var storage = (persistent) ? 'localStorage' : 'sessionStorage';
            window[storage].setItem(key, data);
        } else if ($.isFunction($.cookie)) {
            var options = {};
            if (persistent) {
                options.expires = persistenceHelper.config.persistentCookie;
            }
            $.cookie(key, data);
        } else {
            throw 'persistenceHelper: storage is not possible, because there is no storage medium available';
        }
    };

    /**
     * Retreaves a value from storage (storage or cookie and parses the data if possible.
     * @param key string will be prefixed
     * @returns {null|*}
     */
    persistenceHelper.get = function(key) {
        key     = persistenceHelper.config.prefix + key;
        data    = null;
        if (window['sessionStorage'] && window['localStorage'] && !persistenceHelper.config.forceCookie) {
            data = window['sessionStorage'].getItem(key) || window['localStorage'].getItem(key);
            try {
                data = JSON.parse(data);
            } catch (e) {}
        } else if ($.isFunction($.cookie)) {
            data = $.cookie(key);
        } else {
            throw 'persistenceHelper: unable to retrieve data from storage because there is no storage available';
        }
        return data;
    };

    /**
     * Removes entries with key (prefixed) from all storages and cookies.
     * @param key
     */
    persistenceHelper.clear = function(key, raw) {
        if (!key) {
            throw "persistenceHelper::clear key is required";
        }
        if (typeof raw != 'boolean' || raw == false) {
            raw = false;
        }
        if (!raw) {
            key     = persistenceHelper.config.prefix + key;
        }
        if (window['sessionStorage'] && window['localStorage']) {
            window.localStorage.removeItem(key);
            window.sessionStorage.removeItem((key));
        }
        if ($.isFunction($.removeCookie)) {
            $.removeCookie(key, {path : '/'});
        }
        return this;
    }

    /**
     * returns the the session data or null it not available
     * @returns Plainobject|null the session object itself without the Session-wrapper
     */
    persistenceHelper.getSession = function() {
        var session = null;
        try {
            session = this.get('session')['Session'];
        } catch(e) {}
        return session;
    }

    /**
     * Shortcut method for accessing the session token, null if session is not set.
     * @returns string|null
     */
    persistenceHelper.getSessionToken = function() {
        var session = this.getSession();
        return (session) ? session.csrfToken : null;
    }

    /**
     * Shortcut method.
     * @returns {boolean}
     */
    persistenceHelper.isLoggedIn = function() {
        return this.get('session') ? true : false;
    }
})(jQuery);
