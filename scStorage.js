// requirements: jQuery, jQuery.cookie
window.scStorage = {};

(function($){
    scStorage.config = {
        prefix              : 'et_'
    };

    /**
     * Used for registering global variables from local context (encapsulated functions)
     * @type {{}}
     */
    scStorage.globals = {};

    /**
     * Adds a variable to the global context.
     * @param key string key to save
     * @param value value to save
     * @param namespace string to separate global variables regarding their context
     */
    scStorage.addGlobal = function(key, value, namespace) {
        if (typeof namespace != "string" || typeof  namespace == 'undefined') {
            namespace = 'default';
        }
        if (typeof key != 'string') {
            throw "scStorage::addGlobal parameter key must be a string";
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
    scStorage.getGlobal = function(key, namespace) {
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
    scStorage.set = function(key, data, persistent){
        persistent = persistent || false;
        key = scStorage.config.prefix + key;
        if (window['sessionStorage'] && window['localStorage']) {
            if ($.isPlainObject(data)) {
                data = JSON.stringify(data);
            }
            var storage = (persistent) ? 'localStorage' : 'sessionStorage';
            window[storage].setItem(key, data);
        } else {
            throw 'scStorage: storage is not possible, because there is no storage medium available';
        }
    };

    /**
     * Retreaves a value from storage (storage or cookie and parses the data if possible.
     * @param key string will be prefixed
     * @returns {null|*}
     */
    scStorage.get = function(key) {
        key     = scStorage.config.prefix + key;
        data    = null;
        if (window['sessionStorage'] && window['localStorage'] && !scStorage.config.forceCookie) {
            data = window['sessionStorage'].getItem(key) || window['localStorage'].getItem(key);
            try {
                data = JSON.parse(data);
            } catch (e) {}
        } else {
            throw 'scStorage: unable to retrieve data from storage because there is no storage available';
        }
        return data;
    };

    /**
     * Removes entries with key (prefixed) from all storages and cookies.
     * @param key
     * @param raw
     */
    scStorage.clear = function(key, raw) {
        if (!key) {
            throw "scStorage::clear key is required";
        }
        if (typeof raw != 'boolean' || raw == false) {
            raw = false;
        }
        if (!raw) {
            key     = scStorage.config.prefix + key;
        }
        if (window['sessionStorage'] && window['localStorage']) {
            window.localStorage.removeItem(key);
            window.sessionStorage.removeItem((key));
        }
        return this;
    }
})();