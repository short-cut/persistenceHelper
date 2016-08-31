// requirements: jQuery, jQuery.cookie
window.scStorage = {};

(function($){

    /**
     * configuration
     * @type {{prefix: string, ttl: null, version: null, defaultUsePersistent: boolean, defaultGlobalNameSpace: string}}
     */
    scStorage.config = {
        prefix: 'scs_', // namespace
        ttl: null, // should be an integer (seconds) for the ttl (time to live)
        version: null, // a version number, makes it possible to refactor structure or meaning of data
        defaultUsePersistent : true, // uses session per default
        defaultGlobalNameSpace : 'scdefault'
    };

    /**
     * remember if the device is able to store.
     * IMPORTANT: DO NOT USE DIRECTLY, USE THE METHOD scStorage.isStorageAvailable INSTEAD!
     * @type {null}
     */
    scStorage.isAvailable = null;

    /**
     * Sets configuration data for scStorage. Tests if a property exists, currently there are no validation.
     * @param config object
     */
    scStorage.setConfig = function (config) {
        for (var c in config) {
            if (c in scStorage.config) {
                scStorage.config[c] = config[c];
            }
        }
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
    scStorage.setGlobal = function(key, value, namespace) {
        // setting namespace, if not set as parameter
        if (typeof namespace != "string" || typeof  namespace == 'undefined') {
            namespace = scStorage.config.defaultGlobalNameSpace;
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
            namespace = scStorage.config.defaultGlobalNameSpace;
        }
        if (!this.globals[namespace]) {
            return null;
        }
        return (key in this.globals[namespace]) ? this.globals[namespace][key] : null;
    };

    /**
     * return all global registered vars
     * @returns {{}}
     */
    scStorage.getAllGlobals = function () {
        return scStorage.globals;
    };

    /**
     * Removes a global
     * @param key
     * @param namespace
     * @returns {boolean}
     */
    scStorage.removeGlobal = function (key, namespace) {
        if (typeof namespace != "string" || typeof  namespace == 'undefined') {
            namespace = scStorage.config.defaultGlobalNameSpace;
        }

        if (!this.globals[namespace]) {
            return false;
        }

        if (key in scStorage.globals[namespace]) {
            delete scStorage.globals[namespace][key];
            return true;
        }
        return false;
    };

    /**
     * test for feature availability
     * @returns {boolean}
     */
    scStorage.isStorageAvailable = function () {

        if (typeof scStorage.isAvailable == "boolean") {
            return scStorage.isAvailable;
        }

        if (window['sessionStorage'] || window['localStorage']) {
            var testString = 'yes';
            try {
                window.localStorage.setItem('lsAvailable', testString);
                if (localStorage.getItem('lsAvailable') != 'yes') {
                    scStorage.isAvailable = true;
                }
                localStorage.removeItem('lsAvailable');
                scStorage.isAvailable = true;
            } catch(e) {
                scStorage.isAvailable = false;
            }
        } else {
            scStorage.isAvailable = false;
        }
        return scStorage.isAvailable;

    };

    /**
     * Sets data under key in the browser storage or in a cookie.
     * @param key string The key of the storage entry, it will be prefixed with config.prefix
     * @param data string|PlainObject The data to stored (if a plain object it will be parsed into an json-string)
     * @param persistent boolean If true it will be stored in LocalStorage instead of SessionStorage (or a longer cookie expiry)
     */
    scStorage.set = function(key, data, persistent){
        persistent = persistent || scStorage.config.defaultUsePersistent;
        key = scStorage.config.prefix + key;

        if (scStorage.isStorageAvailable()) {
            if (typeof data == "object") {
                data = JSON.stringify(data);
            }
            var storage = (persistent) ? 'localStorage' : 'sessionStorage';
            window[storage].setItem(key, data);
        } else {
            throw 'scStorage: storage is not possible, because there is no storage medium available';
        }
        return scStorage;
    };

    /**
     * Retreaves a value from storage (storage or cookie and parses the data if possible.
     * @param key string will be prefixed
     * @returns {null|*}
     */
    scStorage.get = function(key) {
        key     = scStorage.config.prefix + key;
        data    = null;
        if (scStorage.isStorageAvailable()) {
            data = window['localStorage'].getItem(key) || window['sessionStorage'].getItem(key);
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
     * @param raw bool makes it possible to clear a key without the configured prefix
     */
    scStorage.remove = function(key, raw) {
        if (!key) {
            throw "scStorage::clear key is required";
        }

        if (typeof raw != 'boolean' || raw == false) {
            raw = false;
        }

        if (!raw) {
            key     = scStorage.config.prefix + key;
        }

        if (scStorage.isStorageAvailable()) {
            window.localStorage.removeItem(key);
            window.sessionStorage.removeItem((key));
        }
        return scStorage;
    }
})();
