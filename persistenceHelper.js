// requirements: jQuery, jQuery.cookie
window.persistenceHelper = {};

(function($){
    persistenceHelper.config = {
        prefix              : 'et_'
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
        if (window['sessionStorage'] && window['localStorage']) {
            if ($.isPlainObject(data)) {
                data = JSON.stringify(data);
            }
            var storage = (persistent) ? 'localStorage' : 'sessionStorage';
            window[storage].setItem(key, data);
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
        } else {
            throw 'persistenceHelper: unable to retrieve data from storage because there is no storage available';
        }
        return data;
    };

    /**
     * Removes entries with key (prefixed) from all storages and cookies.
     * @param key
     * @param raw
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
        return this;
    }
})();
