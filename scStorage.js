/**
 * version 1.0
 */

window.scStorage = {};

(function($){

    /**
     * configuration
     * @type {{prefix: string, ttl: null, version: null, defaultUsePersistent: boolean, defaultGlobalNameSpace: string}}
     */
    scStorage.config = {
        prefix: 'scs_', // namespace
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
                var value = config[c];
                if (c == 'version') {
                    value = parseFloat(value);
                }
                scStorage.config[c] = value;
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
     * @param validUntil date object
     */
    scStorage.set = function(key, data, persistent, validUntil){

        persistent = (typeof persistent != 'undefined') ? persistent : scStorage.config.defaultUsePersistent;

        if (persistent && typeof validUntil == 'object') {
            try {
                validUntil = validUntil.toISOString();
            } catch (e) {
                throw "parameter validUntil must be a javascript date object.";
            }
        } else {
            validUntil = false;
        }

        key = scStorage.config.prefix + key;

        if (scStorage.isStorageAvailable()) {

            var storage = (persistent) ? 'localStorage' : 'sessionStorage';
            var storageItem = { 'payload': data };

            if (scStorage.config.version !== null) {
                if(typeof scStorage.config.version != "number") {
                    throw "scStorage::set version must be numeric."
                }
                storageItem.version = scStorage.config.version;
            }

            if (validUntil) {
                storageItem.validUntil = validUntil;
            }

            window[storage].setItem(key, JSON.stringify(storageItem));

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

        key = scStorage.config.prefix + key;
        var payload = null;

        if (scStorage.isStorageAvailable()) {

            var storageItem = window['localStorage'].getItem(key) || window['sessionStorage'].getItem(key);
            try {
                storageItem = JSON.parse(storageItem);
                payload = storageItem.payload;
            } catch (e) {
                return null;
            }

            // purge item if now under version control or if an outdated version
            if (scStorage.config.version !== null &&
                    (!storageItem['version'] || storageItem['version'] < scStorage.config.version)) {
                scStorage.remove(key, true);
                return null;
            }

            if (storageItem.validUntil) {
                var validUntil = new Date(storageItem.validUntil);
                var now = new Date();
                if (validUntil < now) {
                    scStorage.remove(key, true);
                    return null;
                }
            }
        } else {
            throw 'scStorage: unable to retrieve data from storage because there is no storage available';
        }
        return payload;
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
