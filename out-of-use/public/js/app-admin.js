/** vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 2.1.15 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
//Not using strict: uneven strict support in browsers, #392, and causes
//problems with requirejs.exec()/transpiler plugins that may not be strict.
/*jslint regexp: true, nomen: true, sloppy: true */
/*global window, navigator, document, importScripts, setTimeout, opera */

var requirejs, require, define;
(function (global) {
    var req, s, head, baseElement, dataMain, src,
        interactiveScript, currentlyAddingScript, mainScript, subPath,
        version = '2.1.15',
        commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        jsSuffixRegExp = /\.js$/,
        currDirRegExp = /^\.\//,
        op = Object.prototype,
        ostring = op.toString,
        hasOwn = op.hasOwnProperty,
        ap = Array.prototype,
        apsp = ap.splice,
        isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document),
        isWebWorker = !isBrowser && typeof importScripts !== 'undefined',
        //PS3 indicates loaded and complete, but need to wait for complete
        //specifically. Sequence is 'loading', 'loaded', execution,
        // then 'complete'. The UA check is unfortunate, but not sure how
        //to feature test w/o causing perf issues.
        readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
                      /^complete$/ : /^(complete|loaded)$/,
        defContextName = '_',
        //Oh the tragedy, detecting opera. See the usage of isOpera for reason.
        isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
        contexts = {},
        cfg = {},
        globalDefQueue = [],
        useInteractive = false;

    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }

    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }

    /**
     * Helper function for iterating over an array. If the func returns
     * a true value, it will break out of the loop.
     */
    function each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length; i += 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    /**
     * Helper function for iterating over an array backwards. If the func
     * returns a true value, it will break out of the loop.
     */
    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1; i -= 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }

    /**
     * Cycles over properties in an object and calls a function for each
     * property value. If the function returns a truthy value, then the
     * iteration is stopped.
     */
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }

    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     */
    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value === 'object' && value &&
                        !isArray(value) && !isFunction(value) &&
                        !(value instanceof RegExp)) {

                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }

    //Similar to Function.prototype.bind, but the 'this' object is specified
    //first, since it is easier to read/figure out what 'this' will be.
    function bind(obj, fn) {
        return function () {
            return fn.apply(obj, arguments);
        };
    }

    function scripts() {
        return document.getElementsByTagName('script');
    }

    function defaultOnError(err) {
        throw err;
    }

    //Allow getting a global that is expressed in
    //dot notation, like 'a.b.c'.
    function getGlobal(value) {
        if (!value) {
            return value;
        }
        var g = global;
        each(value.split('.'), function (part) {
            g = g[part];
        });
        return g;
    }

    /**
     * Constructs an error with a pointer to an URL with more information.
     * @param {String} id the error ID that maps to an ID on a web page.
     * @param {String} message human readable error.
     * @param {Error} [err] the original error, if there is one.
     *
     * @returns {Error}
     */
    function makeError(id, msg, err, requireModules) {
        var e = new Error(msg + '\nhttp://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.originalError = err;
        }
        return e;
    }

    if (typeof define !== 'undefined') {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    if (typeof requirejs !== 'undefined') {
        if (isFunction(requirejs)) {
            //Do not overwrite an existing requirejs instance.
            return;
        }
        cfg = requirejs;
        requirejs = undefined;
    }

    //Allow for a require config object
    if (typeof require !== 'undefined' && !isFunction(require)) {
        //assume it is a config object.
        cfg = require;
        require = undefined;
    }

    function newContext(contextName) {
        var inCheckLoaded, Module, context, handlers,
            checkLoadedTimeoutId,
            config = {
                //Defaults. Do not set a default for map
                //config to speed up normalize(), which
                //will run faster if there is no default.
                waitSeconds: 7,
                baseUrl: './',
                paths: {},
                bundles: {},
                pkgs: {},
                shim: {},
                config: {}
            },
            registry = {},
            //registry of just enabled modules, to speed
            //cycle breaking code when lots of modules
            //are registered, but not activated.
            enabledRegistry = {},
            undefEvents = {},
            defQueue = [],
            defined = {},
            urlFetched = {},
            bundlesMap = {},
            requireCounter = 1,
            unnormalizedCounter = 1;

        /**
         * Trims the . and .. from an array of path segments.
         * It will keep a leading path segment if a .. will become
         * the first path segment, to help with module name lookups,
         * which act like paths, but can be remapped. But the end result,
         * all paths that use this function should look normalized.
         * NOTE: this method MODIFIES the input array.
         * @param {Array} ary the array of path segments.
         */
        function trimDots(ary) {
            var i, part;
            for (i = 0; i < ary.length; i++) {
                part = ary[i];
                if (part === '.') {
                    ary.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i == 1 && ary[2] === '..') || ary[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        ary.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
        }

        /**
         * Given a relative module name, like ./something, normalize it to
         * a real name that can be mapped to a path.
         * @param {String} name the relative name
         * @param {String} baseName a real name that the name arg is relative
         * to.
         * @param {Boolean} applyMap apply the map config to the value. Should
         * only be done if this normalization is for a dependency ID.
         * @returns {String} normalized name
         */
        function normalize(name, baseName, applyMap) {
            var pkgMain, mapValue, nameParts, i, j, nameSegment, lastIndex,
                foundMap, foundI, foundStarMap, starI, normalizedBaseParts,
                baseParts = (baseName && baseName.split('/')),
                map = config.map,
                starMap = map && map['*'];

            //Adjust any relative paths.
            if (name) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // If wanting node ID compatibility, strip .js from end
                // of IDs. Have to do this here, and not in nameToUrl
                // because node allows either .js or non .js to map
                // to same file.
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                // Starts with a '.' so need the baseName
                if (name[0].charAt(0) === '.' && baseParts) {
                    //Convert baseName to array, and lop off the last part,
                    //so that . matches that 'directory' and not name of the baseName's
                    //module. For instance, baseName of 'one/two/three', maps to
                    //'one/two/three.js', but we want the directory, 'one/two' for
                    //this normalization.
                    normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                    name = normalizedBaseParts.concat(name);
                }

                trimDots(name);
                name = name.join('/');
            }

            //Apply map config if available.
            if (applyMap && map && (baseParts || starMap)) {
                nameParts = name.split('/');

                outerLoop: for (i = nameParts.length; i > 0; i -= 1) {
                    nameSegment = nameParts.slice(0, i).join('/');

                    if (baseParts) {
                        //Find the longest baseName segment match in the config.
                        //So, do joins on the biggest to smallest lengths of baseParts.
                        for (j = baseParts.length; j > 0; j -= 1) {
                            mapValue = getOwn(map, baseParts.slice(0, j).join('/'));

                            //baseName segment has config, find if it has one for
                            //this name.
                            if (mapValue) {
                                mapValue = getOwn(mapValue, nameSegment);
                                if (mapValue) {
                                    //Match, update name to the new value.
                                    foundMap = mapValue;
                                    foundI = i;
                                    break outerLoop;
                                }
                            }
                        }
                    }

                    //Check for a star map match, but just hold on to it,
                    //if there is a shorter segment match later in a matching
                    //config, then favor over this star map.
                    if (!foundStarMap && starMap && getOwn(starMap, nameSegment)) {
                        foundStarMap = getOwn(starMap, nameSegment);
                        starI = i;
                    }
                }

                if (!foundMap && foundStarMap) {
                    foundMap = foundStarMap;
                    foundI = starI;
                }

                if (foundMap) {
                    nameParts.splice(0, foundI, foundMap);
                    name = nameParts.join('/');
                }
            }

            // If the name points to a package's name, use
            // the package main instead.
            pkgMain = getOwn(config.pkgs, name);

            return pkgMain ? pkgMain : name;
        }

        function removeScript(name) {
            if (isBrowser) {
                each(scripts(), function (scriptNode) {
                    if (scriptNode.getAttribute('data-requiremodule') === name &&
                            scriptNode.getAttribute('data-requirecontext') === context.contextName) {
                        scriptNode.parentNode.removeChild(scriptNode);
                        return true;
                    }
                });
            }
        }

        function hasPathFallback(id) {
            var pathConfig = getOwn(config.paths, id);
            if (pathConfig && isArray(pathConfig) && pathConfig.length > 1) {
                //Pop off the first array value, since it failed, and
                //retry
                pathConfig.shift();
                context.require.undef(id);

                //Custom require that does not do map translation, since
                //ID is "absolute", already mapped/resolved.
                context.makeRequire(null, {
                    skipMap: true
                })([id]);

                return true;
            }
        }

        //Turns a plugin!resource to [plugin, resource]
        //with the plugin being undefined if the name
        //did not have a plugin prefix.
        function splitPrefix(name) {
            var prefix,
                index = name ? name.indexOf('!') : -1;
            if (index > -1) {
                prefix = name.substring(0, index);
                name = name.substring(index + 1, name.length);
            }
            return [prefix, name];
        }

        /**
         * Creates a module mapping that includes plugin prefix, module
         * name, and path. If parentModuleMap is provided it will
         * also normalize the name via require.normalize()
         *
         * @param {String} name the module name
         * @param {String} [parentModuleMap] parent module map
         * for the module name, used to resolve relative names.
         * @param {Boolean} isNormalized: is the ID already normalized.
         * This is true if this call is done for a define() module ID.
         * @param {Boolean} applyMap: apply the map config to the ID.
         * Should only be true if this map is for a dependency.
         *
         * @returns {Object}
         */
        function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
            var url, pluginModule, suffix, nameParts,
                prefix = null,
                parentName = parentModuleMap ? parentModuleMap.name : null,
                originalName = name,
                isDefine = true,
                normalizedName = '';

            //If no name, then it means it is a require call, generate an
            //internal name.
            if (!name) {
                isDefine = false;
                name = '_@r' + (requireCounter += 1);
            }

            nameParts = splitPrefix(name);
            prefix = nameParts[0];
            name = nameParts[1];

            if (prefix) {
                prefix = normalize(prefix, parentName, applyMap);
                pluginModule = getOwn(defined, prefix);
            }

            //Account for relative paths if there is a base name.
            if (name) {
                if (prefix) {
                    if (pluginModule && pluginModule.normalize) {
                        //Plugin is loaded, use its normalize method.
                        normalizedName = pluginModule.normalize(name, function (name) {
                            return normalize(name, parentName, applyMap);
                        });
                    } else {
                        // If nested plugin references, then do not try to
                        // normalize, as it will not normalize correctly. This
                        // places a restriction on resourceIds, and the longer
                        // term solution is not to normalize until plugins are
                        // loaded and all normalizations to allow for async
                        // loading of a loader plugin. But for now, fixes the
                        // common uses. Details in #1131
                        normalizedName = name.indexOf('!') === -1 ?
                                         normalize(name, parentName, applyMap) :
                                         name;
                    }
                } else {
                    //A regular module.
                    normalizedName = normalize(name, parentName, applyMap);

                    //Normalized name may be a plugin ID due to map config
                    //application in normalize. The map config values must
                    //already be normalized, so do not need to redo that part.
                    nameParts = splitPrefix(normalizedName);
                    prefix = nameParts[0];
                    normalizedName = nameParts[1];
                    isNormalized = true;

                    url = context.nameToUrl(normalizedName);
                }
            }

            //If the id is a plugin id that cannot be determined if it needs
            //normalization, stamp it with a unique ID so two matching relative
            //ids that may conflict can be separate.
            suffix = prefix && !pluginModule && !isNormalized ?
                     '_unnormalized' + (unnormalizedCounter += 1) :
                     '';

            return {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                unnormalized: !!suffix,
                url: url,
                originalName: originalName,
                isDefine: isDefine,
                id: (prefix ?
                        prefix + '!' + normalizedName :
                        normalizedName) + suffix
            };
        }

        function getModule(depMap) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (!mod) {
                mod = registry[id] = new context.Module(depMap);
            }

            return mod;
        }

        function on(depMap, name, fn) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (hasProp(defined, id) &&
                    (!mod || mod.defineEmitComplete)) {
                if (name === 'defined') {
                    fn(defined[id]);
                }
            } else {
                mod = getModule(depMap);
                if (mod.error && name === 'error') {
                    fn(mod.error);
                } else {
                    mod.on(name, fn);
                }
            }
        }

        function onError(err, errback) {
            var ids = err.requireModules,
                notified = false;

            if (errback) {
                errback(err);
            } else {
                each(ids, function (id) {
                    var mod = getOwn(registry, id);
                    if (mod) {
                        //Set error on module, so it skips timeout checks.
                        mod.error = err;
                        if (mod.events.error) {
                            notified = true;
                            mod.emit('error', err);
                        }
                    }
                });

                if (!notified) {
                    req.onError(err);
                }
            }
        }

        /**
         * Internal method to transfer globalQueue items to this context's
         * defQueue.
         */
        function takeGlobalQueue() {
            //Push all the globalDefQueue items into the context's defQueue
            if (globalDefQueue.length) {
                //Array splice in the values since the context code has a
                //local var ref to defQueue, so cannot just reassign the one
                //on context.
                apsp.apply(defQueue,
                           [defQueue.length, 0].concat(globalDefQueue));
                globalDefQueue = [];
            }
        }

        handlers = {
            'require': function (mod) {
                if (mod.require) {
                    return mod.require;
                } else {
                    return (mod.require = context.makeRequire(mod.map));
                }
            },
            'exports': function (mod) {
                mod.usingExports = true;
                if (mod.map.isDefine) {
                    if (mod.exports) {
                        return (defined[mod.map.id] = mod.exports);
                    } else {
                        return (mod.exports = defined[mod.map.id] = {});
                    }
                }
            },
            'module': function (mod) {
                if (mod.module) {
                    return mod.module;
                } else {
                    return (mod.module = {
                        id: mod.map.id,
                        uri: mod.map.url,
                        config: function () {
                            return  getOwn(config.config, mod.map.id) || {};
                        },
                        exports: mod.exports || (mod.exports = {})
                    });
                }
            }
        };

        function cleanRegistry(id) {
            //Clean up machinery used for waiting modules.
            delete registry[id];
            delete enabledRegistry[id];
        }

        function breakCycle(mod, traced, processed) {
            var id = mod.map.id;

            if (mod.error) {
                mod.emit('error', mod.error);
            } else {
                traced[id] = true;
                each(mod.depMaps, function (depMap, i) {
                    var depId = depMap.id,
                        dep = getOwn(registry, depId);

                    //Only force things that have not completed
                    //being defined, so still in the registry,
                    //and only if it has not been matched up
                    //in the module already.
                    if (dep && !mod.depMatched[i] && !processed[depId]) {
                        if (getOwn(traced, depId)) {
                            mod.defineDep(i, defined[depId]);
                            mod.check(); //pass false?
                        } else {
                            breakCycle(dep, traced, processed);
                        }
                    }
                });
                processed[id] = true;
            }
        }

        function checkLoaded() {
            var err, usingPathFallback,
                waitInterval = config.waitSeconds * 1000,
                //It is possible to disable the wait interval by using waitSeconds of 0.
                expired = waitInterval && (context.startTime + waitInterval) < new Date().getTime(),
                noLoads = [],
                reqCalls = [],
                stillLoading = false,
                needCycleCheck = true;

            //Do not bother if this call was a result of a cycle break.
            if (inCheckLoaded) {
                return;
            }

            inCheckLoaded = true;

            //Figure out the state of all the modules.
            eachProp(enabledRegistry, function (mod) {
                var map = mod.map,
                    modId = map.id;

                //Skip things that are not enabled or in error state.
                if (!mod.enabled) {
                    return;
                }

                if (!map.isDefine) {
                    reqCalls.push(mod);
                }

                if (!mod.error) {
                    //If the module should be executed, and it has not
                    //been inited and time is up, remember it.
                    if (!mod.inited && expired) {
                        if (hasPathFallback(modId)) {
                            usingPathFallback = true;
                            stillLoading = true;
                        } else {
                            noLoads.push(modId);
                            removeScript(modId);
                        }
                    } else if (!mod.inited && mod.fetched && map.isDefine) {
                        stillLoading = true;
                        if (!map.prefix) {
                            //No reason to keep looking for unfinished
                            //loading. If the only stillLoading is a
                            //plugin resource though, keep going,
                            //because it may be that a plugin resource
                            //is waiting on a non-plugin cycle.
                            return (needCycleCheck = false);
                        }
                    }
                }
            });

            if (expired && noLoads.length) {
                //If wait time expired, throw error of unloaded modules.
                err = makeError('timeout', 'Load timeout for modules: ' + noLoads, null, noLoads);
                err.contextName = context.contextName;
                return onError(err);
            }

            //Not expired, check for a cycle.
            if (needCycleCheck) {
                each(reqCalls, function (mod) {
                    breakCycle(mod, {}, {});
                });
            }

            //If still waiting on loads, and the waiting load is something
            //other than a plugin resource, or there are still outstanding
            //scripts, then just try back later.
            if ((!expired || usingPathFallback) && stillLoading) {
                //Something is still waiting to load. Wait for it, but only
                //if a timeout is not already in effect.
                if ((isBrowser || isWebWorker) && !checkLoadedTimeoutId) {
                    checkLoadedTimeoutId = setTimeout(function () {
                        checkLoadedTimeoutId = 0;
                        checkLoaded();
                    }, 50);
                }
            }

            inCheckLoaded = false;
        }

        Module = function (map) {
            this.events = getOwn(undefEvents, map.id) || {};
            this.map = map;
            this.shim = getOwn(config.shim, map.id);
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];
            this.pluginMaps = {};
            this.depCount = 0;

            /* this.exports this.factory
               this.depMaps = [],
               this.enabled, this.fetched
            */
        };

        Module.prototype = {
            init: function (depMaps, factory, errback, options) {
                options = options || {};

                //Do not do more inits if already done. Can happen if there
                //are multiple define calls for the same module. That is not
                //a normal, common case, but it is also not unexpected.
                if (this.inited) {
                    return;
                }

                this.factory = factory;

                if (errback) {
                    //Register for errors on this module.
                    this.on('error', errback);
                } else if (this.events.error) {
                    //If no errback already, but there are error listeners
                    //on this module, set up an errback to pass to the deps.
                    errback = bind(this, function (err) {
                        this.emit('error', err);
                    });
                }

                //Do a copy of the dependency array, so that
                //source inputs are not modified. For example
                //"shim" deps are passed in here directly, and
                //doing a direct modification of the depMaps array
                //would affect that config.
                this.depMaps = depMaps && depMaps.slice(0);

                this.errback = errback;

                //Indicate this module has be initialized
                this.inited = true;

                this.ignore = options.ignore;

                //Could have option to init this module in enabled mode,
                //or could have been previously marked as enabled. However,
                //the dependencies are not known until init is called. So
                //if enabled previously, now trigger dependencies as enabled.
                if (options.enabled || this.enabled) {
                    //Enable this module and dependencies.
                    //Will call this.check()
                    this.enable();
                } else {
                    this.check();
                }
            },

            defineDep: function (i, depExports) {
                //Because of cycles, defined callback for a given
                //export can be called more than once.
                if (!this.depMatched[i]) {
                    this.depMatched[i] = true;
                    this.depCount -= 1;
                    this.depExports[i] = depExports;
                }
            },

            fetch: function () {
                if (this.fetched) {
                    return;
                }
                this.fetched = true;

                context.startTime = (new Date()).getTime();

                var map = this.map;

                //If the manager is for a plugin managed resource,
                //ask the plugin to load it now.
                if (this.shim) {
                    context.makeRequire(this.map, {
                        enableBuildCallback: true
                    })(this.shim.deps || [], bind(this, function () {
                        return map.prefix ? this.callPlugin() : this.load();
                    }));
                } else {
                    //Regular dependency.
                    return map.prefix ? this.callPlugin() : this.load();
                }
            },

            load: function () {
                var url = this.map.url;

                //Regular dependency.
                if (!urlFetched[url]) {
                    urlFetched[url] = true;
                    context.load(this.map.id, url);
                }
            },

            /**
             * Checks if the module is ready to define itself, and if so,
             * define it.
             */
            check: function () {
                if (!this.enabled || this.enabling) {
                    return;
                }

                var err, cjsModule,
                    id = this.map.id,
                    depExports = this.depExports,
                    exports = this.exports,
                    factory = this.factory;

                if (!this.inited) {
                    this.fetch();
                } else if (this.error) {
                    this.emit('error', this.error);
                } else if (!this.defining) {
                    //The factory could trigger another require call
                    //that would result in checking this module to
                    //define itself again. If already in the process
                    //of doing that, skip this work.
                    this.defining = true;

                    if (this.depCount < 1 && !this.defined) {
                        if (isFunction(factory)) {
                            //If there is an error listener, favor passing
                            //to that instead of throwing an error. However,
                            //only do it for define()'d  modules. require
                            //errbacks should not be called for failures in
                            //their callbacks (#699). However if a global
                            //onError is set, use that.
                            if ((this.events.error && this.map.isDefine) ||
                                req.onError !== defaultOnError) {
                                try {
                                    exports = context.execCb(id, factory, depExports, exports);
                                } catch (e) {
                                    err = e;
                                }
                            } else {
                                exports = context.execCb(id, factory, depExports, exports);
                            }

                            // Favor return value over exports. If node/cjs in play,
                            // then will not have a return value anyway. Favor
                            // module.exports assignment over exports object.
                            if (this.map.isDefine && exports === undefined) {
                                cjsModule = this.module;
                                if (cjsModule) {
                                    exports = cjsModule.exports;
                                } else if (this.usingExports) {
                                    //exports already set the defined value.
                                    exports = this.exports;
                                }
                            }

                            if (err) {
                                err.requireMap = this.map;
                                err.requireModules = this.map.isDefine ? [this.map.id] : null;
                                err.requireType = this.map.isDefine ? 'define' : 'require';
                                return onError((this.error = err));
                            }

                        } else {
                            //Just a literal value
                            exports = factory;
                        }

                        this.exports = exports;

                        if (this.map.isDefine && !this.ignore) {
                            defined[id] = exports;

                            if (req.onResourceLoad) {
                                req.onResourceLoad(context, this.map, this.depMaps);
                            }
                        }

                        //Clean up
                        cleanRegistry(id);

                        this.defined = true;
                    }

                    //Finished the define stage. Allow calling check again
                    //to allow define notifications below in the case of a
                    //cycle.
                    this.defining = false;

                    if (this.defined && !this.defineEmitted) {
                        this.defineEmitted = true;
                        this.emit('defined', this.exports);
                        this.defineEmitComplete = true;
                    }

                }
            },

            callPlugin: function () {
                var map = this.map,
                    id = map.id,
                    //Map already normalized the prefix.
                    pluginMap = makeModuleMap(map.prefix);

                //Mark this as a dependency for this plugin, so it
                //can be traced for cycles.
                this.depMaps.push(pluginMap);

                on(pluginMap, 'defined', bind(this, function (plugin) {
                    var load, normalizedMap, normalizedMod,
                        bundleId = getOwn(bundlesMap, this.map.id),
                        name = this.map.name,
                        parentName = this.map.parentMap ? this.map.parentMap.name : null,
                        localRequire = context.makeRequire(map.parentMap, {
                            enableBuildCallback: true
                        });

                    //If current map is not normalized, wait for that
                    //normalized name to load instead of continuing.
                    if (this.map.unnormalized) {
                        //Normalize the ID if the plugin allows it.
                        if (plugin.normalize) {
                            name = plugin.normalize(name, function (name) {
                                return normalize(name, parentName, true);
                            }) || '';
                        }

                        //prefix and name should already be normalized, no need
                        //for applying map config again either.
                        normalizedMap = makeModuleMap(map.prefix + '!' + name,
                                                      this.map.parentMap);
                        on(normalizedMap,
                            'defined', bind(this, function (value) {
                                this.init([], function () { return value; }, null, {
                                    enabled: true,
                                    ignore: true
                                });
                            }));

                        normalizedMod = getOwn(registry, normalizedMap.id);
                        if (normalizedMod) {
                            //Mark this as a dependency for this plugin, so it
                            //can be traced for cycles.
                            this.depMaps.push(normalizedMap);

                            if (this.events.error) {
                                normalizedMod.on('error', bind(this, function (err) {
                                    this.emit('error', err);
                                }));
                            }
                            normalizedMod.enable();
                        }

                        return;
                    }

                    //If a paths config, then just load that file instead to
                    //resolve the plugin, as it is built into that paths layer.
                    if (bundleId) {
                        this.map.url = context.nameToUrl(bundleId);
                        this.load();
                        return;
                    }

                    load = bind(this, function (value) {
                        this.init([], function () { return value; }, null, {
                            enabled: true
                        });
                    });

                    load.error = bind(this, function (err) {
                        this.inited = true;
                        this.error = err;
                        err.requireModules = [id];

                        //Remove temp unnormalized modules for this module,
                        //since they will never be resolved otherwise now.
                        eachProp(registry, function (mod) {
                            if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
                                cleanRegistry(mod.map.id);
                            }
                        });

                        onError(err);
                    });

                    //Allow plugins to load other code without having to know the
                    //context or how to 'complete' the load.
                    load.fromText = bind(this, function (text, textAlt) {
                        /*jslint evil: true */
                        var moduleName = map.name,
                            moduleMap = makeModuleMap(moduleName),
                            hasInteractive = useInteractive;

                        //As of 2.1.0, support just passing the text, to reinforce
                        //fromText only being called once per resource. Still
                        //support old style of passing moduleName but discard
                        //that moduleName in favor of the internal ref.
                        if (textAlt) {
                            text = textAlt;
                        }

                        //Turn off interactive script matching for IE for any define
                        //calls in the text, then turn it back on at the end.
                        if (hasInteractive) {
                            useInteractive = false;
                        }

                        //Prime the system by creating a module instance for
                        //it.
                        getModule(moduleMap);

                        //Transfer any config to this other module.
                        if (hasProp(config.config, id)) {
                            config.config[moduleName] = config.config[id];
                        }

                        try {
                            req.exec(text);
                        } catch (e) {
                            return onError(makeError('fromtexteval',
                                             'fromText eval for ' + id +
                                            ' failed: ' + e,
                                             e,
                                             [id]));
                        }

                        if (hasInteractive) {
                            useInteractive = true;
                        }

                        //Mark this as a dependency for the plugin
                        //resource
                        this.depMaps.push(moduleMap);

                        //Support anonymous modules.
                        context.completeLoad(moduleName);

                        //Bind the value of that module to the value for this
                        //resource ID.
                        localRequire([moduleName], load);
                    });

                    //Use parentName here since the plugin's name is not reliable,
                    //could be some weird string with no path that actually wants to
                    //reference the parentName's path.
                    plugin.load(map.name, localRequire, load, config);
                }));

                context.enable(pluginMap, this);
                this.pluginMaps[pluginMap.id] = pluginMap;
            },

            enable: function () {
                enabledRegistry[this.map.id] = this;
                this.enabled = true;

                //Set flag mentioning that the module is enabling,
                //so that immediate calls to the defined callbacks
                //for dependencies do not trigger inadvertent load
                //with the depCount still being zero.
                this.enabling = true;

                //Enable each dependency
                each(this.depMaps, bind(this, function (depMap, i) {
                    var id, mod, handler;

                    if (typeof depMap === 'string') {
                        //Dependency needs to be converted to a depMap
                        //and wired up to this module.
                        depMap = makeModuleMap(depMap,
                                               (this.map.isDefine ? this.map : this.map.parentMap),
                                               false,
                                               !this.skipMap);
                        this.depMaps[i] = depMap;

                        handler = getOwn(handlers, depMap.id);

                        if (handler) {
                            this.depExports[i] = handler(this);
                            return;
                        }

                        this.depCount += 1;

                        on(depMap, 'defined', bind(this, function (depExports) {
                            this.defineDep(i, depExports);
                            this.check();
                        }));

                        if (this.errback) {
                            on(depMap, 'error', bind(this, this.errback));
                        }
                    }

                    id = depMap.id;
                    mod = registry[id];

                    //Skip special modules like 'require', 'exports', 'module'
                    //Also, don't call enable if it is already enabled,
                    //important in circular dependency cases.
                    if (!hasProp(handlers, id) && mod && !mod.enabled) {
                        context.enable(depMap, this);
                    }
                }));

                //Enable each plugin that is used in
                //a dependency
                eachProp(this.pluginMaps, bind(this, function (pluginMap) {
                    var mod = getOwn(registry, pluginMap.id);
                    if (mod && !mod.enabled) {
                        context.enable(pluginMap, this);
                    }
                }));

                this.enabling = false;

                this.check();
            },

            on: function (name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },

            emit: function (name, evt) {
                each(this.events[name], function (cb) {
                    cb(evt);
                });
                if (name === 'error') {
                    //Now that the error handler was triggered, remove
                    //the listeners, since this broken Module instance
                    //can stay around for a while in the registry.
                    delete this.events[name];
                }
            }
        };

        function callGetModule(args) {
            //Skip modules already defined.
            if (!hasProp(defined, args[0])) {
                getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
            }
        }

        function removeListener(node, func, name, ieName) {
            //Favor detachEvent because of IE9
            //issue, see attachEvent/addEventListener comment elsewhere
            //in this file.
            if (node.detachEvent && !isOpera) {
                //Probably IE. If not it will throw an error, which will be
                //useful to know.
                if (ieName) {
                    node.detachEvent(ieName, func);
                }
            } else {
                node.removeEventListener(name, func, false);
            }
        }

        /**
         * Given an event from a script node, get the requirejs info from it,
         * and then removes the event listeners on the node.
         * @param {Event} evt
         * @returns {Object}
         */
        function getScriptData(evt) {
            //Using currentTarget instead of target for Firefox 2.0's sake. Not
            //all old browsers will be supported, but this one was easy enough
            //to support and still makes sense.
            var node = evt.currentTarget || evt.srcElement;

            //Remove the listeners once here.
            removeListener(node, context.onScriptLoad, 'load', 'onreadystatechange');
            removeListener(node, context.onScriptError, 'error');

            return {
                node: node,
                id: node && node.getAttribute('data-requiremodule')
            };
        }

        function intakeDefines() {
            var args;

            //Any defined modules in the global queue, intake them now.
            takeGlobalQueue();

            //Make sure any remaining defQueue items get properly processed.
            while (defQueue.length) {
                args = defQueue.shift();
                if (args[0] === null) {
                    return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' + args[args.length - 1]));
                } else {
                    //args are id, deps, factory. Should be normalized by the
                    //define() function.
                    callGetModule(args);
                }
            }
        }

        context = {
            config: config,
            contextName: contextName,
            registry: registry,
            defined: defined,
            urlFetched: urlFetched,
            defQueue: defQueue,
            Module: Module,
            makeModuleMap: makeModuleMap,
            nextTick: req.nextTick,
            onError: onError,

            /**
             * Set a configuration for the context.
             * @param {Object} cfg config object to integrate.
             */
            configure: function (cfg) {
                //Make sure the baseUrl ends in a slash.
                if (cfg.baseUrl) {
                    if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
                        cfg.baseUrl += '/';
                    }
                }

                //Save off the paths since they require special processing,
                //they are additive.
                var shim = config.shim,
                    objs = {
                        paths: true,
                        bundles: true,
                        config: true,
                        map: true
                    };

                eachProp(cfg, function (value, prop) {
                    if (objs[prop]) {
                        if (!config[prop]) {
                            config[prop] = {};
                        }
                        mixin(config[prop], value, true, true);
                    } else {
                        config[prop] = value;
                    }
                });

                //Reverse map the bundles
                if (cfg.bundles) {
                    eachProp(cfg.bundles, function (value, prop) {
                        each(value, function (v) {
                            if (v !== prop) {
                                bundlesMap[v] = prop;
                            }
                        });
                    });
                }

                //Merge shim
                if (cfg.shim) {
                    eachProp(cfg.shim, function (value, id) {
                        //Normalize the structure
                        if (isArray(value)) {
                            value = {
                                deps: value
                            };
                        }
                        if ((value.exports || value.init) && !value.exportsFn) {
                            value.exportsFn = context.makeShimExports(value);
                        }
                        shim[id] = value;
                    });
                    config.shim = shim;
                }

                //Adjust packages if necessary.
                if (cfg.packages) {
                    each(cfg.packages, function (pkgObj) {
                        var location, name;

                        pkgObj = typeof pkgObj === 'string' ? { name: pkgObj } : pkgObj;

                        name = pkgObj.name;
                        location = pkgObj.location;
                        if (location) {
                            config.paths[name] = pkgObj.location;
                        }

                        //Save pointer to main module ID for pkg name.
                        //Remove leading dot in main, so main paths are normalized,
                        //and remove any trailing .js, since different package
                        //envs have different conventions: some use a module name,
                        //some use a file name.
                        config.pkgs[name] = pkgObj.name + '/' + (pkgObj.main || 'main')
                                     .replace(currDirRegExp, '')
                                     .replace(jsSuffixRegExp, '');
                    });
                }

                //If there are any "waiting to execute" modules in the registry,
                //update the maps for them, since their info, like URLs to load,
                //may have changed.
                eachProp(registry, function (mod, id) {
                    //If module already has init called, since it is too
                    //late to modify them, and ignore unnormalized ones
                    //since they are transient.
                    if (!mod.inited && !mod.map.unnormalized) {
                        mod.map = makeModuleMap(id);
                    }
                });

                //If a deps array or a config callback is specified, then call
                //require with those args. This is useful when require is defined as a
                //config object before require.js is loaded.
                if (cfg.deps || cfg.callback) {
                    context.require(cfg.deps || [], cfg.callback);
                }
            },

            makeShimExports: function (value) {
                function fn() {
                    var ret;
                    if (value.init) {
                        ret = value.init.apply(global, arguments);
                    }
                    return ret || (value.exports && getGlobal(value.exports));
                }
                return fn;
            },

            makeRequire: function (relMap, options) {
                options = options || {};

                function localRequire(deps, callback, errback) {
                    var id, map, requireMod;

                    if (options.enableBuildCallback && callback && isFunction(callback)) {
                        callback.__requireJsBuild = true;
                    }

                    if (typeof deps === 'string') {
                        if (isFunction(callback)) {
                            //Invalid call
                            return onError(makeError('requireargs', 'Invalid require call'), errback);
                        }

                        //If require|exports|module are requested, get the
                        //value for them from the special handlers. Caveat:
                        //this only works while module is being defined.
                        if (relMap && hasProp(handlers, deps)) {
                            return handlers[deps](registry[relMap.id]);
                        }

                        //Synchronous access to one module. If require.get is
                        //available (as in the Node adapter), prefer that.
                        if (req.get) {
                            return req.get(context, deps, relMap, localRequire);
                        }

                        //Normalize module name, if it contains . or ..
                        map = makeModuleMap(deps, relMap, false, true);
                        id = map.id;

                        if (!hasProp(defined, id)) {
                            return onError(makeError('notloaded', 'Module name "' +
                                        id +
                                        '" has not been loaded yet for context: ' +
                                        contextName +
                                        (relMap ? '' : '. Use require([])')));
                        }
                        return defined[id];
                    }

                    //Grab defines waiting in the global queue.
                    intakeDefines();

                    //Mark all the dependencies as needing to be loaded.
                    context.nextTick(function () {
                        //Some defines could have been added since the
                        //require call, collect them.
                        intakeDefines();

                        requireMod = getModule(makeModuleMap(null, relMap));

                        //Store if map config should be applied to this require
                        //call for dependencies.
                        requireMod.skipMap = options.skipMap;

                        requireMod.init(deps, callback, errback, {
                            enabled: true
                        });

                        checkLoaded();
                    });

                    return localRequire;
                }

                mixin(localRequire, {
                    isBrowser: isBrowser,

                    /**
                     * Converts a module name + .extension into an URL path.
                     * *Requires* the use of a module name. It does not support using
                     * plain URLs like nameToUrl.
                     */
                    toUrl: function (moduleNamePlusExt) {
                        var ext,
                            index = moduleNamePlusExt.lastIndexOf('.'),
                            segment = moduleNamePlusExt.split('/')[0],
                            isRelative = segment === '.' || segment === '..';

                        //Have a file extension alias, and it is not the
                        //dots from a relative path.
                        if (index !== -1 && (!isRelative || index > 1)) {
                            ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                            moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
                        }

                        return context.nameToUrl(normalize(moduleNamePlusExt,
                                                relMap && relMap.id, true), ext,  true);
                    },

                    defined: function (id) {
                        return hasProp(defined, makeModuleMap(id, relMap, false, true).id);
                    },

                    specified: function (id) {
                        id = makeModuleMap(id, relMap, false, true).id;
                        return hasProp(defined, id) || hasProp(registry, id);
                    }
                });

                //Only allow undef on top level require calls
                if (!relMap) {
                    localRequire.undef = function (id) {
                        //Bind any waiting define() calls to this context,
                        //fix for #408
                        takeGlobalQueue();

                        var map = makeModuleMap(id, relMap, true),
                            mod = getOwn(registry, id);

                        removeScript(id);

                        delete defined[id];
                        delete urlFetched[map.url];
                        delete undefEvents[id];

                        //Clean queued defines too. Go backwards
                        //in array so that the splices do not
                        //mess up the iteration.
                        eachReverse(defQueue, function(args, i) {
                            if(args[0] === id) {
                                defQueue.splice(i, 1);
                            }
                        });

                        if (mod) {
                            //Hold on to listeners in case the
                            //module will be attempted to be reloaded
                            //using a different config.
                            if (mod.events.defined) {
                                undefEvents[id] = mod.events;
                            }

                            cleanRegistry(id);
                        }
                    };
                }

                return localRequire;
            },

            /**
             * Called to enable a module if it is still in the registry
             * awaiting enablement. A second arg, parent, the parent module,
             * is passed in for context, when this method is overridden by
             * the optimizer. Not shown here to keep code compact.
             */
            enable: function (depMap) {
                var mod = getOwn(registry, depMap.id);
                if (mod) {
                    getModule(depMap).enable();
                }
            },

            /**
             * Internal method used by environment adapters to complete a load event.
             * A load event could be a script load or just a load pass from a synchronous
             * load call.
             * @param {String} moduleName the name of the module to potentially complete.
             */
            completeLoad: function (moduleName) {
                var found, args, mod,
                    shim = getOwn(config.shim, moduleName) || {},
                    shExports = shim.exports;

                takeGlobalQueue();

                while (defQueue.length) {
                    args = defQueue.shift();
                    if (args[0] === null) {
                        args[0] = moduleName;
                        //If already found an anonymous module and bound it
                        //to this name, then this is some other anon module
                        //waiting for its completeLoad to fire.
                        if (found) {
                            break;
                        }
                        found = true;
                    } else if (args[0] === moduleName) {
                        //Found matching define call for this script!
                        found = true;
                    }

                    callGetModule(args);
                }

                //Do this after the cycle of callGetModule in case the result
                //of those calls/init calls changes the registry.
                mod = getOwn(registry, moduleName);

                if (!found && !hasProp(defined, moduleName) && mod && !mod.inited) {
                    if (config.enforceDefine && (!shExports || !getGlobal(shExports))) {
                        if (hasPathFallback(moduleName)) {
                            return;
                        } else {
                            return onError(makeError('nodefine',
                                             'No define call for ' + moduleName,
                                             null,
                                             [moduleName]));
                        }
                    } else {
                        //A script that does not call define(), so just simulate
                        //the call for it.
                        callGetModule([moduleName, (shim.deps || []), shim.exportsFn]);
                    }
                }

                checkLoaded();
            },

            /**
             * Converts a module name to a file path. Supports cases where
             * moduleName may actually be just an URL.
             * Note that it **does not** call normalize on the moduleName,
             * it is assumed to have already been normalized. This is an
             * internal API, not a public one. Use toUrl for the public API.
             */
            nameToUrl: function (moduleName, ext, skipExt) {
                var paths, syms, i, parentModule, url,
                    parentPath, bundleId,
                    pkgMain = getOwn(config.pkgs, moduleName);

                if (pkgMain) {
                    moduleName = pkgMain;
                }

                bundleId = getOwn(bundlesMap, moduleName);

                if (bundleId) {
                    return context.nameToUrl(bundleId, ext, skipExt);
                }

                //If a colon is in the URL, it indicates a protocol is used and it is just
                //an URL to a file, or if it starts with a slash, contains a query arg (i.e. ?)
                //or ends with .js, then assume the user meant to use an url and not a module id.
                //The slash is important for protocol-less URLs as well as full paths.
                if (req.jsExtRegExp.test(moduleName)) {
                    //Just a plain path, not module name lookup, so just return it.
                    //Add extension if it is included. This is a bit wonky, only non-.js things pass
                    //an extension, this method probably needs to be reworked.
                    url = moduleName + (ext || '');
                } else {
                    //A module that needs to be converted to a path.
                    paths = config.paths;

                    syms = moduleName.split('/');
                    //For each module name segment, see if there is a path
                    //registered for it. Start with most specific name
                    //and work up from it.
                    for (i = syms.length; i > 0; i -= 1) {
                        parentModule = syms.slice(0, i).join('/');

                        parentPath = getOwn(paths, parentModule);
                        if (parentPath) {
                            //If an array, it means there are a few choices,
                            //Choose the one that is desired
                            if (isArray(parentPath)) {
                                parentPath = parentPath[0];
                            }
                            syms.splice(0, i, parentPath);
                            break;
                        }
                    }

                    //Join the path parts together, then figure out if baseUrl is needed.
                    url = syms.join('/');
                    url += (ext || (/^data\:|\?/.test(url) || skipExt ? '' : '.js'));
                    url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : config.baseUrl) + url;
                }

                return config.urlArgs ? url +
                                        ((url.indexOf('?') === -1 ? '?' : '&') +
                                         config.urlArgs) : url;
            },

            //Delegates to req.load. Broken out as a separate function to
            //allow overriding in the optimizer.
            load: function (id, url) {
                req.load(context, id, url);
            },

            /**
             * Executes a module callback function. Broken out as a separate function
             * solely to allow the build system to sequence the files in the built
             * layer in the right sequence.
             *
             * @private
             */
            execCb: function (name, callback, args, exports) {
                return callback.apply(exports, args);
            },

            /**
             * callback for script loads, used to check status of loading.
             *
             * @param {Event} evt the event from the browser for the script
             * that was loaded.
             */
            onScriptLoad: function (evt) {
                //Using currentTarget instead of target for Firefox 2.0's sake. Not
                //all old browsers will be supported, but this one was easy enough
                //to support and still makes sense.
                if (evt.type === 'load' ||
                        (readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {
                    //Reset interactive script so a script node is not held onto for
                    //to long.
                    interactiveScript = null;

                    //Pull out the name of the module and the context.
                    var data = getScriptData(evt);
                    context.completeLoad(data.id);
                }
            },

            /**
             * Callback for script errors.
             */
            onScriptError: function (evt) {
                var data = getScriptData(evt);
                if (!hasPathFallback(data.id)) {
                    return onError(makeError('scripterror', 'Script error for: ' + data.id, evt, [data.id]));
                }
            }
        };

        context.require = context.makeRequire();
        return context;
    }

    /**
     * Main entry point.
     *
     * If the only argument to require is a string, then the module that
     * is represented by that string is fetched for the appropriate context.
     *
     * If the first argument is an array, then it will be treated as an array
     * of dependency string names to fetch. An optional function callback can
     * be specified to execute when all of those dependencies are available.
     *
     * Make a local req variable to help Caja compliance (it assumes things
     * on a require that are not standardized), and to give a short
     * name for minification/local scope use.
     */
    req = requirejs = function (deps, callback, errback, optional) {

        //Find the right context, use default
        var context, config,
            contextName = defContextName;

        // Determine if have config object in the call.
        if (!isArray(deps) && typeof deps !== 'string') {
            // deps is a config object
            config = deps;
            if (isArray(callback)) {
                // Adjust args if there are dependencies
                deps = callback;
                callback = errback;
                errback = optional;
            } else {
                deps = [];
            }
        }

        if (config && config.context) {
            contextName = config.context;
        }

        context = getOwn(contexts, contextName);
        if (!context) {
            context = contexts[contextName] = req.s.newContext(contextName);
        }

        if (config) {
            context.configure(config);
        }

        return context.require(deps, callback, errback);
    };

    /**
     * Support require.config() to make it easier to cooperate with other
     * AMD loaders on globally agreed names.
     */
    req.config = function (config) {
        return req(config);
    };

    /**
     * Execute something after the current tick
     * of the event loop. Override for other envs
     * that have a better solution than setTimeout.
     * @param  {Function} fn function to execute later.
     */
    req.nextTick = typeof setTimeout !== 'undefined' ? function (fn) {
        setTimeout(fn, 4);
    } : function (fn) { fn(); };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    req.version = version;

    //Used to filter out dependencies that are already paths.
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    req.isBrowser = isBrowser;
    s = req.s = {
        contexts: contexts,
        newContext: newContext
    };

    //Create default context.
    req({});

    //Exports some context-sensitive methods on global require.
    each([
        'toUrl',
        'undef',
        'defined',
        'specified'
    ], function (prop) {
        //Reference from contexts instead of early binding to default context,
        //so that during builds, the latest instance of the default context
        //with its config gets used.
        req[prop] = function () {
            var ctx = contexts[defContextName];
            return ctx.require[prop].apply(ctx, arguments);
        };
    });

    if (isBrowser) {
        head = s.head = document.getElementsByTagName('head')[0];
        //If BASE tag is in play, using appendChild is a problem for IE6.
        //When that browser dies, this can be removed. Details in this jQuery bug:
        //http://dev.jquery.com/ticket/2709
        baseElement = document.getElementsByTagName('base')[0];
        if (baseElement) {
            head = s.head = baseElement.parentNode;
        }
    }

    /**
     * Any errors that require explicitly generates will be passed to this
     * function. Intercept/override it if you want custom error handling.
     * @param {Error} err the error object.
     */
    req.onError = defaultOnError;

    /**
     * Creates the node for the load command. Only used in browser envs.
     */
    req.createNode = function (config, moduleName, url) {
        var node = config.xhtml ?
                document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
                document.createElement('script');
        node.type = config.scriptType || 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        return node;
    };

    /**
     * Does the request to load a module for the browser case.
     * Make this a separate function to allow other environments
     * to override it.
     *
     * @param {Object} context the require context to find state.
     * @param {String} moduleName the name of the module.
     * @param {Object} url the URL to the module.
     */
    req.load = function (context, moduleName, url) {
        var config = (context && context.config) || {},
            node;
        if (isBrowser) {
            //In the browser so use a script tag
            node = req.createNode(config, moduleName, url);

            node.setAttribute('data-requirecontext', context.contextName);
            node.setAttribute('data-requiremodule', moduleName);

            //Set up load listener. Test attachEvent first because IE9 has
            //a subtle issue in its addEventListener and script onload firings
            //that do not match the behavior of all other browsers with
            //addEventListener support, which fire the onload event for a
            //script right after the script execution. See:
            //https://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution
            //UNFORTUNATELY Opera implements attachEvent but does not follow the script
            //script execution mode.
            if (node.attachEvent &&
                    //Check if node.attachEvent is artificially added by custom script or
                    //natively supported by browser
                    //read https://github.com/jrburke/requirejs/issues/187
                    //if we can NOT find [native code] then it must NOT natively supported.
                    //in IE8, node.attachEvent does not have toString()
                    //Note the test for "[native code" with no closing brace, see:
                    //https://github.com/jrburke/requirejs/issues/273
                    !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
                    !isOpera) {
                //Probably IE. IE (at least 6-8) do not fire
                //script onload right after executing the script, so
                //we cannot tie the anonymous define call to a name.
                //However, IE reports the script as being in 'interactive'
                //readyState at the time of the define call.
                useInteractive = true;

                node.attachEvent('onreadystatechange', context.onScriptLoad);
                //It would be great to add an error handler here to catch
                //404s in IE9+. However, onreadystatechange will fire before
                //the error handler, so that does not help. If addEventListener
                //is used, then IE will fire error before load, but we cannot
                //use that pathway given the connect.microsoft.com issue
                //mentioned above about not doing the 'script execute,
                //then fire the script load event listener before execute
                //next script' that other browsers do.
                //Best hope: IE10 fixes the issues,
                //and then destroys all installs of IE 6-9.
                //node.attachEvent('onerror', context.onScriptError);
            } else {
                node.addEventListener('load', context.onScriptLoad, false);
                node.addEventListener('error', context.onScriptError, false);
            }
            node.src = url;

            //For some cache cases in IE 6-8, the script executes before the end
            //of the appendChild execution, so to tie an anonymous define
            //call to the module name (which is stored on the node), hold on
            //to a reference to this node, but clear after the DOM insertion.
            currentlyAddingScript = node;
            if (baseElement) {
                head.insertBefore(node, baseElement);
            } else {
                head.appendChild(node);
            }
            currentlyAddingScript = null;

            return node;
        } else if (isWebWorker) {
            try {
                //In a web worker, use importScripts. This is not a very
                //efficient use of importScripts, importScripts will block until
                //its script is downloaded and evaluated. However, if web workers
                //are in play, the expectation that a build has been done so that
                //only one script needs to be loaded anyway. This may need to be
                //reevaluated if other use cases become common.
                importScripts(url);

                //Account for anonymous modules
                context.completeLoad(moduleName);
            } catch (e) {
                context.onError(makeError('importscripts',
                                'importScripts failed for ' +
                                    moduleName + ' at ' + url,
                                e,
                                [moduleName]));
            }
        }
    };

    function getInteractiveScript() {
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }

        eachReverse(scripts(), function (script) {
            if (script.readyState === 'interactive') {
                return (interactiveScript = script);
            }
        });
        return interactiveScript;
    }

    //Look for a data-main script attribute, which could also adjust the baseUrl.
    if (isBrowser && !cfg.skipDataMain) {
        //Figure out baseUrl. Get it from the script tag with require.js in it.
        eachReverse(scripts(), function (script) {
            //Set the 'head' where we can append children by
            //using the script's parent.
            if (!head) {
                head = script.parentNode;
            }

            //Look for a data-main attribute to set main script for the page
            //to load. If it is there, the path to data main becomes the
            //baseUrl, if it is not already set.
            dataMain = script.getAttribute('data-main');
            if (dataMain) {
                //Preserve dataMain in case it is a path (i.e. contains '?')
                mainScript = dataMain;

                //Set final baseUrl if there is not already an explicit one.
                if (!cfg.baseUrl) {
                    //Pull off the directory of data-main for use as the
                    //baseUrl.
                    src = mainScript.split('/');
                    mainScript = src.pop();
                    subPath = src.length ? src.join('/')  + '/' : './';

                    cfg.baseUrl = subPath;
                }

                //Strip off any trailing .js since mainScript is now
                //like a module name.
                mainScript = mainScript.replace(jsSuffixRegExp, '');

                 //If mainScript is still a path, fall back to dataMain
                if (req.jsExtRegExp.test(mainScript)) {
                    mainScript = dataMain;
                }

                //Put the data-main script in the files to load.
                cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript];

                return true;
            }
        });
    }

    /**
     * The function that handles definitions of modules. Differs from
     * require() in that a string for the module should be the first argument,
     * and the function to execute after dependencies are loaded should
     * return a value to define the module corresponding to the first argument's
     * name.
     */
    define = function (name, deps, callback) {
        var node, context;

        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }

        //This module may not have dependencies
        if (!isArray(deps)) {
            callback = deps;
            deps = null;
        }

        //If no name, and callback is a function, then figure out if it a
        //CommonJS thing with dependencies.
        if (!deps && isFunction(callback)) {
            deps = [];
            //Remove comments from the callback string,
            //look for require calls, and pull them into the dependencies,
            //but only if there are function args.
            if (callback.length) {
                callback
                    .toString()
                    .replace(commentRegExp, '')
                    .replace(cjsRequireRegExp, function (match, dep) {
                        deps.push(dep);
                    });

                //May be a CommonJS thing even without require calls, but still
                //could use exports, and module. Avoid doing exports and module
                //work though if it just needs require.
                //REQUIRES the function to expect the CommonJS variables in the
                //order listed below.
                deps = (callback.length === 1 ? ['require'] : ['require', 'exports', 'module']).concat(deps);
            }
        }

        //If in IE 6-8 and hit an anonymous define() call, do the interactive
        //work.
        if (useInteractive) {
            node = currentlyAddingScript || getInteractiveScript();
            if (node) {
                if (!name) {
                    name = node.getAttribute('data-requiremodule');
                }
                context = contexts[node.getAttribute('data-requirecontext')];
            }
        }

        //Always save off evaluating the def call until the script onload handler.
        //This allows multiple modules to be in a file without prematurely
        //tracing dependencies, and allows for anonymous module support,
        //where the module name is not known until the script onload event
        //occurs. If no context, use the global queue, and get it processed
        //in the onscript load callback.
        (context ? context.defQueue : globalDefQueue).push([name, deps, callback]);
    };

    define.amd = {
        jQuery: true
    };


    /**
     * Executes the text. Normally just uses eval, but can be modified
     * to use a better, environment-specific call. Only used for transpiling
     * loader plugins, not for plain JS modules.
     * @param {String} text the text to execute/evaluate.
     */
    req.exec = function (text) {
        /*jslint evil: true */
        return eval(text);
    };

    //Set up with config info.
    req(cfg);
}(this));

/**
 * Created by Gordeev on 21.07.2014.
 */
(function () {
    var devmode = !!window.jb_developmentMode;
    var devPaths = {
            ko: "knockout",
            _: "lodash",
            q: "q",
            jquery: 'jquery',
            moment: 'moment-with-langs',
            path: 'path',
            select2: 'select2'
        },
        prodPaths = {
            ko: "knockout.min",
            _: "lodash.min",
            q: "q.min",
            jquery: 'jquery.min',
            moment: 'moment-with-langs.min',
            path: 'path.min',
            select2: 'select2.min'
        },
        actualPaths = devmode ? devPaths : prodPaths;

    require.config({
        waitSeconds: 45,
        baseUrl: '/js',
        paths: actualPaths,
        shim: {
            // jquery plugin
            'select2': ['jquery']
        }
    });

    require(
        [
            'polyfill',
            'ko',
            'jquery',
            'moment',
            'vm.main-nav',
            'binding.ko-translate',
            'binding.ko-datetext',
            'binding.ko-datevalue',
            'binding.ko-listtext',
            'binding.ko-select2',
            'router'
        ],
        function (polyfill, ko, $, moment, vmMainNav) {
            polyfill.add();

            //init routes

            //init momen
            moment.lang($('html').data('jb-locale') || window.window.navigator.userLanguage || window.navigator.language);

            //init non-rout parts
            ko.applyBindings(vmMainNav, $('#main-nav').get(0));
        });

//    var foo = require(['testModule'], function(tm){
//        console.dir(tm);
//    });

})();
/**
 * Created by Gordeev on 27.07.2014.
 */
define('vm.edit-post',
    [
        'ko',
        'logger',
        'data.post',
        'model-state',
        'messenger'
    ],
    function (ko, logger, provider, ModelState, messenger) {
        var post = ko.observable(null),
            modelState = new ModelState(),
            urlPreview = ko.computed({
                read: function () {
                    var postUnwrapped = post();
                    if (!postUnwrapped) {
                        return null;
                    }
                    if (postUnwrapped.slug()) {
                        return '[host]/post/' + postUnwrapped.slug();
                    } else {
                        return '[host]/post?id=' + postUnwrapped._id;
                    }
                },
                deferEvaluation: true
            }),
            datePreview = ko.computed({
                read: function () {
                    var postUnwrapped = post();
                    if (!postUnwrapped) {
                        return null;
                    }
                    return postUnwrapped.date()
                },
                deferEvaluation: true
            }),
            saving = ko.observable(false),
            loading = ko.observable(false),
            saveButtonTitle = ko.observable('SAVE'),
            reloadButtonTitle = ko.observable('CANCEL_EDIT'),
            reloadDisabled = ko.computed({
                read: function(){
                    return loading() || modelState.pristine();
                },
                deferEvaluation: true
            }),
            saveDisabled = ko.computed({
                read: function () {
                    return saving() || modelState.pristine();
                },
                deferEvaluation: true
            }),
            updateViewData = function (newPostId) {
                if (newPostId) {
                    loading(true);
                    reloadButtonTitle('LOADING');
                    provider.get(newPostId)
                        .done(function (result) {
                            post(result);
                            modelState.setModel(result);
                        })
                        .always(function () {
                            loading(false);
                            reloadButtonTitle('CANCEL_EDIT');
                        });
                } else {
                    post(new provider.PostDetails());
                    modelState.setModel(post());
                }
            },
            activate = function (stateParams) {
                var postId;

                if (stateParams && stateParams.params && stateParams.params.postId) {
                    postId = stateParams.params.postId;
                }
                updateViewData(postId);
            },

            onPostSubmit = function (form) {
                if (form.checkValidity()) {
                    saveButtonTitle('SAVING');
                    saving(true);
                    provider.save(post())
                        .done(function (result) {
                            post(result);
                            modelState.setModel(result);
                            messenger.publish(messenger.messageNames.PostUpdated, result);
                        })
                        .always(function () {
                            saving(false);
                            saveButtonTitle('SAVE');
                        });
                }
            },
            reload = function () {
                var postUnwrapped = ko.unwrap(post),
                    id = postUnwrapped ? postUnwrapped._id : undefined;
                updateViewData(id);
            };

        return {
            activate: activate,
            post: post,
            urlPreview: urlPreview,
            contentPreview: ko.observable(false),
            save: {
                do: onPostSubmit,
                disabled: saveDisabled,
                title: saveButtonTitle
            },
            reload: {
                do: reload,
                disabled: reloadDisabled,
                title: reloadButtonTitle
            }
        };
    });
/**
 * Created by mgordeev on 08.08.2014.
 */
define('vm.files',
    [
        'ko',
        '_',
        'data.files'
    ],
    function (ko, _, providerFiles) {
        'use strict';
        var files = ko.observableArray(),
            filter = ko.observable(),
            sort = ko.observable({
                orderBy: 'name',
                asc: true
            }),
            applyFilter = function (observableToFilter, filterValue) {
                var unwrapped = ko.unwrap(observableToFilter),
                    filterInternal = ko.unwrap(filterValue);
                _.each(unwrapped, function (file) {
                    if (filterInternal) {
                        file.visible(file.name.indexOf(filterInternal) !== -1);
                    } else {
                        file.visible(true);
                    }
                });
            },
            applySort = function (observableToSort, sortObject) {
                var sortInternal = ko.unwrap(sortObject);
                switch (sortInternal.orderBy) {
                    case 'name':
                        observableToSort.sort(function (left, right) {
                            if (left.name === right.name) {
                                return 0;
                            }
                            if (left.name > right.name) {
                                return 1;
                            }
                            return -1;
                        });
                        break;
                    case 'date':
                        observableToSort.sort(function (left, right) {
                            var leftUnix = left.date.valueOf(),
                                rightUnix = right.date.valueOf();
                            if (leftUnix === rightUnix) {
                                return 0;
                            }
                            if (leftUnix > rightUnix) {
                                return 1;
                            }
                            return -1;
                        });
                        break;
                    case 'size':
                        observableToSort.sort(function (left, right) {
                            if (left.size === right.size) {
                                return 0;
                            }
                            if (left.size > right.size) {
                                return 1;
                            }
                            return -1;
                        });
                        break;
                }
                if (!sortInternal.asc) {
                    observableToSort.reverse();
                }
            },
            updateView = function () {
                providerFiles.query()
                    .done(function (result) {
                        files.removeAll();
                        ko.utils.arrayPushAll(files, result);
                        applySort(files, sort);
                        applyFilter(files, filter);
                    });
            },
            upload = function (fileInput) {
                var f = fileInput;
                providerFiles.upload(f)
                    .done(function (result) {
                        ko.utils.arrayPushAll(files, result);
                        applySort(files, sort);
                        applyFilter(files, filter);
                    });
            },
            activate = function () {
                updateView();
            },
            remove = function (file) {
                providerFiles.remove(file.url)
                    .done(function (result) {
                        files.remove(function (item) {
                            return item.url === result;
                        });
                    });
            };

        sort.subscribe(function (newSort) {
            applySort(files, newSort);
        });

        filter.subscribe(function (newFilter) {
            applyFilter(files, newFilter);
        });

        return{
            activate: activate,
            filter: filter,
            files: files,
            setSort: function (prop) {
                var currentSort = sort();
                sort({
                    orderBy: prop,
                    asc: prop === currentSort.orderBy ? !currentSort.asc : true
                });
            },
            upload: upload,
            remove: remove
        };
    });
/**
 * Created by Gordeev on 30.08.2014.
 */

define('vm.log', [
        'ko',
        '_',
        'data.log'
    ],
    function (ko, _, dataLog) {
        'use strict';
        var logEntries = ko.observableArray();
        var filter = ko.observable();
        var limit = 100;

        var refreshEntries = function () {
            dataLog.query({
                limit: limit
            }).done(function (result) {
                logEntries(result);
            });
        };

        var activate = function () {
            if (!logEntries().length) {
                refreshEntries();
            }
        };

        var toggleExpand = function (data) {
            data.expanded(!data.expanded());
        };

        var loadMore = function () {
            var newQuery = {
                    limit: limit
                },
                logUnwrapped = ko.unwrap(logEntries);

            if (logUnwrapped.length) {
                newQuery.afterId = _.last(logUnwrapped)._id;
            }

            dataLog.query(newQuery)
                .done(function (result) {
                    ko.utils.arrayPushAll(logEntries, result);
                });
        };

        var refresh = function () {
            refreshEntries();
        };

        filter.subscribe(function (newFilter) {
            var entriesUnwrapped = ko.unwrap(logEntries);
            _.each(entriesUnwrapped, function (entry) {
                if (newFilter) {
                    entry.visible(entry.requestUrl.indexOf(newFilter) !== -1);
                } else {
                    entry.visible(true);
                }
            });
        });

        return {
            entries: logEntries,
            activate: activate,
            toggleExpand: toggleExpand,
            filter: filter,
            loadMore: loadMore,
            refresh: refresh
        };
    });
/**
 * Created by Gordeev on 26.07.2014.
 */
define('vm.main-nav',
    [
        'route-definition'
    ],
    function (routes) {

        var navlinks = [
            {
                href: '/',
                target: '_blank',
                titleKey: 'BLOG'
            },
            {
                href: '/auth/logout',
                titleKey: 'LOGOUT'
            },
            {
                href: '#!/posts',
                titleKey: 'POSTS',
                icon: 'glyphicon-th-list'
            },
            {
                href: routes.definitions.misc.route,
                titleKey: 'MISC',
                icon: 'glyphicon-adjust'
            },
            {
                href: routes.definitions.files.route,
                titleKey: 'FILES',
                icon: 'glyphicon-folder-open'
            },
            {
                href: '#!/edit',
                titleKey: 'NEW_POST',
                icon: 'glyphicon-plus'
            },
            {
                href: '#!/log',
                titleKey: 'LOG_ENTRIES'
            }
        ];

        return {
            navlinks: navlinks
        };
    });
/**
 * Created by Gordeev on 03.08.2014.
 */
define('vm.misc',
    [
        'ko',
        'jquery',
        '_',
        'model-state',
        'data.icons',
        'data.navlink',
        'data.settings',
        'binding.ko-select2'
    ],
    function (ko, $, _, ModelState, icons, providerNavlinks, providerSettings, koSelect2) {
        'use strict';
        var mainNavlinks = ko.observableArray(),
            footerNavlinks = ko.observableArray(),
            settings = ko.observable(new providerSettings.Model()),
            mainNavlinksToShow = ko.computed({
                read: function () {
                    return _.filter(mainNavlinks(), function (item) {
                        return !ko.unwrap(item.willRemove);
                    });
                },
                deferEvaluation: true
            }),
            footerNavlinksToShow = ko.computed({
                read: function () {
                    return _.filter(footerNavlinks(), function (item) {
                        return !ko.unwrap(item.willRemove);
                    });
                },
                deferEvaluation: true
            }),
            modelStates = {
                mainNavlinks: new ModelState(mainNavlinks),
                footerNavlinks: new ModelState(footerNavlinks),
                settings: new ModelState()
            },
            getNavlinksByCateg = function (categ) {
                switch (categ) {
                    case 'main':
                        return mainNavlinks;
                    case 'footer':
                        return footerNavlinks;
                    default:
                        return null;
                }
            },
            getNavlinkModelStateByCateg = function (categ) {
                switch (categ) {
                    case 'main':
                        return modelStates.mainNavlinks;
                    case 'footer':
                        return modelStates.footerNavlinks;
                    default:
                        return null;
                }
            },
            mainNavlinksVisible = ko.observable(false),
            footerNavlinkVisible = ko.observable(false),
            settingsVisible = ko.observable(false),
            saving = ko.observable(false),
            addNavlink = function (categ) {
                var arrayToAdd = getNavlinksByCateg(categ),
                    newNavlink = new providerNavlinks.Model({
                        category: categ
                    });
                arrayToAdd.push(newNavlink);
            },
            removeNavlink = function (navlink) {
                navlink.willRemove(true);
            },
            up = function (navlink, categ) {
                var arrayToMove = getNavlinksByCateg(categ),
                    indexToMove = arrayToMove.indexOf(navlink);

                if (indexToMove === 0 || arrayToMove().length < 2) {
                    return;
                }
                arrayToMove.splice(indexToMove, 1);
                arrayToMove.splice(indexToMove - 1, 0, navlink);
            },
            down = function (navlink, categ) {
                var arrayToMove = getNavlinksByCateg(categ),
                    indexToMove = arrayToMove.indexOf(navlink);
                if (arrayToMove().length < 2 || indexToMove === (arrayToMove().length - 1)) {
                    return;
                }
                arrayToMove.splice(indexToMove, 1);
                arrayToMove.splice(indexToMove + 1, 0, navlink);
            },
            updateViewData = function () {
                providerNavlinks.query()
                    .done(function (result) {
                        var main = _.filter(result, function (item) {
                                return item.category === 'main';
                            }),
                            footer = _.filter(result, function (item) {
                                return item.category === 'footer';
                            });

                        mainNavlinks.removeAll();
                        footerNavlinks.removeAll();

                        ko.utils.arrayPushAll(mainNavlinks, main);
                        ko.utils.arrayPushAll(footerNavlinks, footer);

                        modelStates.mainNavlinks.clear();
                        modelStates.footerNavlinks.clear();
                    });
                providerSettings.get()
                    .done(function(result){
                        settings(result);
                        modelStates.settings.setModel(result);
                    });
            },
            navlinksUpdateOrder = function (navlinksArray) {
                var i, iLen;
                for (i = 0, iLen = navlinksArray.length; i < iLen; i++) {
                    navlinksArray[i].order(i);
                }
            },
            saveNavlinks = function (categ) {
                var observableToSave,
                    modelState,
                    promises = [];
                categ = categ || 'main';

                modelState = getNavlinkModelStateByCateg(categ);
                observableToSave = getNavlinksByCateg(categ);
                navlinksUpdateOrder(observableToSave());

                observableToSave.remove(function (item) {
                    return item.willRemove() && !item._id;
                });

                saving(true);

                _.each(observableToSave(), function (nl) {
                    if (nl.willRemove()) {
                        promises.push(providerNavlinks.remove(nl._id)
                            .done(function (result) {
                                observableToSave.remove(function (item) {
                                    return item._id === result._id;
                                });
                            }));
                    } else {
                        promises.push(providerNavlinks.save(nl)
                            .done(function (result) {
                                if (!nl._id) {
                                    nl._id = result._id;
                                }
                            }));
                    }
                });

                $.when.apply(null, promises)
                    .done(function () {
                        modelState.clear();
                    })
                    .always(function () {
                        saving(false);
                    });
            },
            saveSettings = function(){
                saving(true);
                providerSettings.update(settings())
                    .done(function(){
                        modelStates.settings.clear();
                    })
                    .always(function(){
                         saving(false);
                    });
            },
            select2IconOptions = {
                formatResult: koSelect2.formatGlyphicon,
                formatSelection: koSelect2.formatGlyphicon,
                escapeMarkup: function(m) { return m; },
                allowClear: true
            },
            activate = function () {
                updateViewData();
            };

        return{
            activate: activate,
            mainNavlinks: {
                formId: 'mainNavlinksForm',
                toggle: function () {
                    mainNavlinksVisible(!mainNavlinksVisible());
                },
                visible: mainNavlinksVisible,
                navlinks: mainNavlinksToShow,
                add: function () {
                    addNavlink('main');
                },
                save: function () {
                    saveNavlinks('main');
                },
                saveDisabled: ko.computed({
                    read: function () {
                        return modelStates.mainNavlinks.pristine() || saving();
                    }
                }),
                icons: icons.available,
                remove: removeNavlink,
                up: function (navlink) {
                    up(navlink, 'main');
                },
                down: function (navlink) {
                    down(navlink, 'main');
                },
                select2IconOptions: select2IconOptions
            },
            footerNavlinks: {
                formId: 'footerNavlinksForm',
                visible: footerNavlinkVisible,
                toggle: function () {
                    footerNavlinkVisible(!footerNavlinkVisible());
                },
                navlinks: footerNavlinksToShow,
                add: function () {
                    addNavlink('footer');
                },
                saveDisabled: ko.computed({
                    read: function () {
                        return modelStates.footerNavlinks.pristine() || saving();
                    }
                }),
                icons: icons.available,
                remove: removeNavlink,
                up: function (navlink) {
                    up(navlink, 'footer');
                },
                down: function (navlink) {
                    down(navlink, 'footer');
                },
                save: function () {
                    saveNavlinks('footer');
                },
                select2IconOptions: select2IconOptions
            },
            appSettings: {
                formId: 'settingsForm',
                settings: settings,
                visible: settingsVisible,
                toggle: function(){
                    settingsVisible(!settingsVisible());
                },
                save: saveSettings,
                saveDisabled: ko.computed({
                    read: function () {
                        return modelStates.settings.pristine() || saving();
                    }
                })
            }
        };
    });
/**
 * Created by Gordeev on 27.07.2014.
 */
define('vm.posts',
    [
        'ko',
        '_',
        'data.posts',
        'data.post',
        'data.files',
        'messenger',
        'logger'
    ],
    function (ko, _, dataPosts, dataPost, dataFiles, messenger, logger) {
        'use strict';

        /**
         * one page default limit
         * @type {number}
         */
        var limit = 16,
            postsList = ko.observableArray(),
//            saving = ko.observable(false),

        // pagination
            /**
             * current page params
             */
            queryUrl = ko.observable(undefined),
            nextPageUrl = ko.computed({
                read: function () {
                    var currentQuery = queryUrl(),
                        nextQuery,
                        result;
                    if (!currentQuery) {
                        return null;
                    }
                    if (postsList().length < currentQuery.limit) {
                        return null;
                    }
                    nextQuery = _.cloneDeep(currentQuery);
                    nextQuery.skip = nextQuery.skip + nextQuery.limit;
                    result = '#!/posts/' + encodeURIComponent(JSON.stringify(nextQuery));
                    return result;
                }
            }),
            prevPageUrl = ko.computed({
                read: function () {
                    var currentQuery = queryUrl(),
                        prevQuery,
                        result;
                    if (!currentQuery) {
                        return null;
                    }
                    if (currentQuery.skip === 0) {
                        return null;
                    }
                    prevQuery = _.cloneDeep(currentQuery);
                    prevQuery.skip = prevQuery.skip - prevQuery.limit;
                    prevQuery.skip = prevQuery.skip >= 0 ? prevQuery.skip : 0;
                    result = '#!/posts/' + encodeURIComponent(JSON.stringify(prevQuery));
                    return result;
                }
            }),
            startPageUrl = ko.computed({
                read: function () {
                    var currentQuery = queryUrl();
                    if (!currentQuery) {
                        return null;
                    }
                    if (currentQuery.skip === 0) {
                        return null;
                    }
                    return '#!/posts';
                }
            }),
            checkDefaultOptions = function (query) {
                query = query || {};
                if (!query.hasOwnProperty('includeDraft')) {
                    query.includeDraft = true;
                }
                query.skip = query.skip || 0;
                query.limit = query.limit || limit;
                return query;
            },

            /**
             * update when url params changed
             */
            updateData = function () {
                dataPosts.query(queryUrl())
                    .done(function (result) {
                        postsList.removeAll();
                        ko.utils.arrayPushAll(postsList, result);
                    });
            },
            /**
             * when url changed...
             * @param stateParams
             */
            activate = function (stateParams) {
                var newQuery;
                // get and parse query params
                if (stateParams && stateParams.params && stateParams.params.query) {
                    try {
                        newQuery = JSON.parse(decodeURIComponent(stateParams.params.query));
                    }
                    catch (err) {
                        logger.log(err);
                    }
                }
                newQuery = checkDefaultOptions(newQuery);
                if (!_.isEqual(newQuery, queryUrl())) {
                    // update queryUrl if params really changed
                    queryUrl(newQuery);
                }
            },

            remove = function (post, event) {
                if (window.confirm('Delete post "' + post.title + '" permanently? Really?')) {
                    event.currentTarget.disabled = true;
                    dataPost.remove(post._id).done(updateData)
                        .always(afterUpdateAlways(event.currentTarget));
                }
            },

            removeAll = function(data, event){
                if(window.confirm('Delete all posts?') && window.confirm('Last chance to cancel removing of all posts. Really delete all posts?')){
                    event.currentTarget.disabled = true;
                    dataPost.remove('all').done(updateData)
                        .always(afterUpdateAlways(event.currentTarget));
                }
            },

            afterUpdateDone = function (update) {
                var itemToUpdate,
                    propToUpdate,
                    postsUnwrapped = ko.unwrap(postsList);

                console.dir(update);

                itemToUpdate = _.find(postsUnwrapped, function (item) {
                    return item._id === update._id;
                });

                if (!itemToUpdate) {
                    return;
                }

                propToUpdate = _.omit(update, ['_id']);
                _.each(propToUpdate, function (propValue, propName) {
                    if (ko.isObservable(itemToUpdate[propName])) {
                        itemToUpdate[propName](ko.unwrap(propValue));
                    } else {
                        itemToUpdate[propName] = ko.unwrap(propValue);
                    }
                });
            },

            afterUpdateAlways = function (targetButton) {
                return function () {
                    _.delay(function () {
                        targetButton.disabled = false;
                    }, 500);
                };
            },

            toggleDraft = function (post, event) {
                var draftValue = !post.draft();
                event.currentTarget.disabled = true;
                dataPost.savePlain({
                    _id: post._id,
                    draft: draftValue
                }).done(afterUpdateDone).always(afterUpdateAlways(event.currentTarget));
            },

            toggleFeatured = function (post, event) {
                var featuredValue = !post.featured();
                event.currentTarget.disabled = true;
                dataPost.savePlain({
                    _id: post._id,
                    featured: featuredValue
                }).done(afterUpdateDone).always(afterUpdateAlways(event.currentTarget));
            },

            uploadPosts = function(file, event){
                var f = file;
                event.currentTarget.disabled = true;
                dataFiles.uploadJsonPosts(f)
                    .done(updateData)
                    .always(afterUpdateAlways(event.currentTarget));
            };

        // update data when url params changed
        queryUrl.subscribe(updateData);
        messenger.subscribe(messenger.messageNames.PostUpdated, updateData);

        return{
            activate: activate,
            posts: postsList,
            toggleDraft: toggleDraft,
            toggleFeatured: toggleFeatured,
            remove: remove,
            removeAll: removeAll,
            uploadPosts: uploadPosts,
            pagination: {
                nextPageUrl: nextPageUrl,
                prevPageUrl: prevPageUrl,
                startPageUrl: startPageUrl
            }
        };
    });
/**
 * Created by Gordeev on 22.07.2014.
 */
define('route-definition',
    [
        '_',
        'jquery',
        'ko',
        'vm.posts',
        'vm.edit-post',
        'vm.misc',
        'vm.files',
        'vm.log'
    ], function (_, $, ko, vmPosts, vmEditPost, vmMisc, vmFiles, vmLog) {
        'use strict';
        var RouteDefinition = function (row) {
                var self = this;

                this.view = row.view || '';                // селектор на участок разметки
                this.viewModel = row.viewModel || null;    // объект - вьюмодель
                this.enter = row.enter || null;            // колбек - перед изменением роута
                this.on = row.on || null;                  // колбек - после изменения роута
                this.exit = row.exit || null;              // колбек - перед выходом из роута
                this.state = row.state || null;            // объект, который будет передаваться в колбеки
                this.route = row.route || '';              // шаблон пути типа '#!/user/(:userId)'

                this.applyBindingOnce = _.once(function () {
                    if (self.viewModel && _.isString(self.view) && self.view.length) {
                        ko.applyBindings(self.viewModel, $(self.view).get(0));
                    }
                });
            },
            definitions = Object.freeze({
                posts: new RouteDefinition({
                    view: '#admin-posts',
                    viewModel: vmPosts,
                    route: '#!/posts(/:query)',
                    on: vmPosts.activate
                }),
                misc: new RouteDefinition({
                    view: '#admin-misc',
                    viewModel: vmMisc,
                    route: '#!/misc',
                    on: vmMisc.activate
                }),
                files: new RouteDefinition({
                    route: '#!/files',
                    viewModel: vmFiles,
                    view: '#admin-files',
                    on: vmFiles.activate
                }),
                edit: new RouteDefinition({
                    view: '#admin-edit-post',
                    viewModel: vmEditPost,
                    route: '#!/edit(/:postId)',
                    on: vmEditPost.activate
                }),
                log: new RouteDefinition({
                    view: '#admin-view-log',
                    viewModel: vmLog,
                    route: '#!/log',
                    on: vmLog.activate
                })
            });

        return {
            definitions: definitions,
            RouteDefinition: RouteDefinition
        };
    });
/**
 * Created by Gordeev on 21.07.2014.
 */
define('router',
    [
        'jquery',
        'path',
        'ko',
        '_',
        'route-definition'
    ],
    function ($, path, ko, _, routeDefinition) {
        (function () {
            var routeDefinitions = routeDefinition.definitions,
                show = function (definition) {
                    if (_.isString(definition.view) && definition.view.length) {
                        $(definition.view).show();
                    }
                },
                hide = function (definition) {
                    if (_.isString(definition.view) && definition.view.length) {
                        $(definition.view).hide();
                    }
                },
                applyKoBindingOnce = function (definition) {
                    definition.applyBindingOnce();
                },
                createEnterCallback = function (definition) {
                    return function () {
                        show(definition);
                        applyKoBindingOnce(definition);
                        if (_.isFunction(definition.enter)) {
                            definition.enter({
                                state: definition.state || null,
                                params: this.params || null
                            });
                        }
                    };
                },
                createOnCallback = function (definition) {
                    return function () {
                        if (_.isFunction(definition.on)) {
                            definition.on({
                                state: definition.state || null,
                                params: this.params || null
                            });
                        }
                    };
                },
                createExitCallback = function (definition) {
                    return function () {
                        if (_.isFunction(definition.exit)) {
                            definition.exit({
                                state: definition.state || null,
                                params: this.params || null
                            });
                        }
                        hide(definition);
                    };
                };

            _.each(routeDefinitions, function (definition) {
                if (_.isString(definition.route)) {
                    path.map(definition.route)
                        .enter(createEnterCallback(definition))
                        .to(createOnCallback(definition))
                        .exit(createExitCallback(definition));
                }
            });
            path.root("#!/posts");
            path.rescue(function () {
                alert("404: Route Not Found");
            });
            path.listen();
        })();
    });
/**
 * Created by Gordeev on 27.07.2014.
 */
define('binding.ko-datetext',
    [
        'ko',
        'moment',
        '_'
    ],
    function (ko, moment, _) {
        var formatDate = function(date, format){
            var dateNormilized,
                result;

            format = format || 'LL';
            //sanitize date:
            if(_.isDate(date)){
                dateNormilized = date;
            }else if(_.isString(date) || _.isNumber(date)){
                dateNormilized = new Date(date);
            }else{
                return date;
            }

            result = moment(dateNormilized).format(format);
            return result;
        };

        (function(){
            ko.bindingHandlers.dateText = {
                update: function(element, valueAccessor, allBindings){
                    var $element=$(element),
                        rowDate = ko.utils.unwrapObservable(valueAccessor()),
                        format = allBindings.get('date-format');

                    $element.text(formatDate(rowDate, format));
                }
            };
        })();
    });
/**
 * binding for input type date
 * value in viemodel will be Date
 */
define('binding.ko-datevalue',
    [
        'ko'
    ],
    function (ko) {

        (function () {
            /**
             * return string like '2014-02-15' that need for input date
             * @param date
             * @returns {string}
             */
            var formatForDateInput = function (date) {
                    var year, month, dateInMonth,
                        result, i, iLen;

                    if (!date) {
                        return '';
                    }

                    year = date.getFullYear().toFixed(0);
                    month = (date.getMonth() + 1).toFixed(0);
                    dateInMonth = date.getDate().toFixed(0);

                    if (year.length < 4) {
                        for (i = 0, iLen = 4 - year.length; i < iLen; i++) {
                            year = '0' + year;
                        }
                    }
                    if (month.length < 2) {
                        month = '0' + month;
                    }
                    if (dateInMonth.length < 2) {
                        dateInMonth = '0' + dateInMonth;
                    }
                    result = year + '-' + month + '-' + dateInMonth;

                    return result;
                },
                dateFromDateInput = function (inputValue) {
                    if (inputValue) {
                        return new Date(inputValue);
                    } else {
                        return null;
                    }
                },
                inputEventName = 'input';


            ko.bindingHandlers.dateValue = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var value = valueAccessor(),
                        onInput = function (e) {
                            var valueDate = dateFromDateInput(element.value);
                            if (ko.isObservable(value)) {
                                value(valueDate);
                            } else {
                                value = valueDate;
                            }
                        };
                    element.addEventListener(inputEventName, onInput);
                    ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                        // This will be called when the element is removed by Knockout or
                        // if some other part of your code calls ko.removeNode(element)
                        element.removeEventListener(inputEventName, onInput);
                    });
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var newDateForInput = formatForDateInput(new Date(ko.unwrap(valueAccessor())));
                    element.value = newDateForInput;
                }
            };
        })();
    });

/**
 * https://github.com/zweifisch/knockout-select2
 */
define('binding.ko-select2',
    [
        'ko',
        'jquery',
        'select2'
    ],
    function (ko, $) {
        var formatIcon = function (state, container) {
            var $originalOptionElement = $(state.element),
                valueAttr = $originalOptionElement.attr('value'),
                resultClass,
                resultText,
                resultDom;

            if (valueAttr) {
                resultClass = 'glyphicon ' + valueAttr;
                resultText = valueAttr.substring(10);
            } else {
                resultText = 'Select one';
            }

            resultDom = $('<span>')
                .append($('<span>').addClass(resultClass))
                .append($('<span>').text(resultText));
            return resultDom;
        };

        (function () {
            ko.bindingHandlers.select2 = {
                init: function (element, valueAccessor, allBindingsAccessor) {
                    var allBindings, _base;
                    $(element).select2(valueAccessor());
                    allBindings = allBindingsAccessor();
                    if (typeof (_base = allBindings.value).subscribe === "function") {
                        _base.subscribe(function (val) {
                            return $(element).select2('val', val);
                        });
                    }
                    return ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                        return $(element).select2('destroy');
                    });
                },
                update: function (element, valueAccessor, allBindingsAccessor) {
                    return $(element).trigger('change');
                }
            };

        })();

        return {
            formatGlyphicon: formatIcon
        };
    });
/**
 * bind array of tags to input
 */
define('binding.ko-listtext',
    [
        'ko'
    ],
    function (ko) {
        (function () {
            ko.bindingHandlers.listText = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var eventsToCatch = ['change'];
                    var requestedEventsToCatch = allBindings.get('valueUpdate');
                    var listDelimiter = allBindings.get('listSeparator') || ' ';
                    var propWriters;

                    var valueUpdateHandler = function () {
                        var modelValue = valueAccessor();
                        var elementValue = ko.selectExtensions.readValue(element);
                        var elementValueArray = elementValue.split(listDelimiter);

                        // expressionRewriting.writeValueToProperty не экспортируется
                        if(!modelValue || !ko.isObservable(modelValue)){
                            propWriters = allBindings.get('_ko_property_writers');
                            if(propWriters && propWriters['value']){
                                propWriters['value'](elementValueArray);
                            }
                        }else if(ko.isWriteableObservable(modelValue)){
                            modelValue(elementValueArray);
                        }
                    };

                    if (requestedEventsToCatch) {
                        if (typeof requestedEventsToCatch == "string") // Allow both individual event names, and arrays of event names
                            requestedEventsToCatch = [requestedEventsToCatch];
                        ko.utils.arrayPushAll(eventsToCatch, requestedEventsToCatch);
                        eventsToCatch = ko.utils.arrayGetDistinctValues(eventsToCatch);
                    }

                    ko.utils.arrayForEach(eventsToCatch, function (eventName) {
                        // The syntax "after<eventname>" means "run the handler asynchronously after the event"
                        // This is useful, for example, to catch "keydown" events after the browser has updated the control
                        // (otherwise, ko.selectExtensions.readValue(this) will receive the control's value *before* the key event)
                        var handler = valueUpdateHandler;
                        // -> stringStartsWith
                        if (eventName.startsWith("after")) {
                            handler = function () {
                                setTimeout(valueUpdateHandler, 0)
                            };
                            eventName = eventName.substring("after".length);
                        }
                        ko.utils.registerEventHandler(element, eventName, handler);
                    });
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var newValue = ko.utils.unwrapObservable(valueAccessor());
                    var elementValue = ko.selectExtensions.readValue(element);
                    var listDelimiter = allBindings.get('listSeparator') || ' ';
                    var newValueStr = newValue.join(listDelimiter);
                    var valueHasChanged = (newValueStr !== elementValue);

                    if (valueHasChanged) {
                        ko.selectExtensions.writeValue(element, newValueStr);
                    }
                }
            }
        })();
    });
/**
 * Created by Gordeev on 23.07.2014.
 */
define('binding.ko-translate',
    [
        'ko',
        'jquery',
        'translate-service',
        'messenger'
    ],
    function (ko, $, translateService, messenger) {
        var insertTextTo = function (key, to) {
            translateService.getTextPromise(key)
                .done(function (translated) {
                    $(to).text(translated);
                })
                .fail(function () {
                    $(to).text(key);
                });
        };

        (function () {
            ko.bindingHandlers.translate = {
                init: function (element, valueAccessor) {
                    messenger.subscribe({
                        messageName: messenger.messageNames.TranslateLangChanged,
                        callback: function () {
                            insertTextTo(ko.unwrap(valueAccessor()), element);
                        },
                        async: true
                    });
                },
                update: function (element, valueAccessor) {
                    var key = ko.unwrap(valueAccessor());
                    insertTextTo(key, element);
                }
            };
        })();
    });
/**
 * Created by Gordeev on 23.07.2014.
 */
define('translate-service',
    [
        'jquery',
        '_',
        'messenger'
    ],
    function ($, _, messenger) {
        'use strict';
        var dictionaries = {},
            conf = {
                lang: $('html').data('jb-locale') || window.navigator.userLanguage || window.navigator.language,
                fallback: 'en',
                url: '/api/locale'
            },
            loadState = {},
            onConfChanged = _.debounce(function () {
                messenger.publish(messenger.messageNames.TranslateLangChanged);
            }, 500, {
                leading: false,
                trailing: true
            }),
            config = function (opts) {
                var changed = false;
                if (opts) {
                    if (conf.lang !== opts.lang || conf.fallback !== opts.fallback || conf.url !== opts.url) {
                        conf = opts;
                        onConfChanged();
                    }
                }
                return conf;
            },
            getDictionaryPromise = function (lang) {
                var dfr = $.Deferred(),
                    promise;

                if (dictionaries.hasOwnProperty(lang)) {
                    dfr.resolve(dictionaries[lang]);
                    promise = dfr.promise();
                } else if (loadState.hasOwnProperty(lang)) {
                    loadState[lang]
                        .done(dfr.resolve)
                        .fail(dfr.resolve);
                    promise = dfr.promise();
                }
                else {
                    $.get(conf.url, {lang: lang})
                        .done(function (data, textStatus, jqXHR) {
                            dictionaries[lang] = data || [];
                            dfr.resolve(data);
                        })
                        .fail(function (jqXHR, textStatus, errorThrown) {
                            dictionaries[lang] = [];
                            dfr.resolve(dictionaries[lang]);
                        })
                        .always(function () {
                            delete loadState[lang];
                        });
                    promise = dfr.promise();
                    loadState[lang] = promise;
                }

                return promise;
            },
            getTextPromise = function (key) {
                var dfr = $.Deferred();

                getDictionaryPromise(conf.lang)
                    .done(function (dictLang) {
                        if (dictLang.hasOwnProperty(key)) {
                            dfr.resolve(dictLang[key]);
                        } else {
                            getDictionaryPromise(conf.fallback)
                                .done(function (dictFallback) {
                                    if (dictFallback.hasOwnProperty(key)) {
                                        dfr.resolve(dictFallback[key]);
                                    } else {
                                        dfr.resolve(key);
                                    }
                                });
                        }
                    });

                return dfr.promise();
            };

        return {
            config: config,
            getTextPromise: getTextPromise
        };
    });
/**
 * Created by Gordeev on 26.07.2014.
 */
define('data.mapper',
    [
        'ko',
        '_',
        'logger'
    ],
    function (ko, _, logger) {
        var mapInternal = function (Model, data) {
                var plain,
                    mappedData,
                    koData;

                try {
                    plain = JSON.parse(data);
                } catch (err) {
                    logger.log(err);
                }

                if (!plain) {
                    return null;
                }

                if (_.isArray(plain)) {
                    mappedData = _.map(plain, function (item) {
                        return new Model(item);
                    });
                } else {
                    mappedData = new Model(plain);
                }

                return mappedData;
            }

            create = function (Model) {
                return function (data) {
                    return mapInternal(Model, data);
                };
            };

        return {
            create: create
        }
    });
/**
 * Created by Gordeev on 03.08.2014.
 */
define('data.utils',
    [
        '_',
        'ko',
        'logger'
    ],
    function (_, ko, logger) {
        var clearEmptyStrings = function (model) {
                var thisContext = model || this,
                    prop;
                _.forOwn(thisContext, function (val, prop) {
                    if (_.isString(val) && val.length === 0) {
                        val = undefined;
                    }
                });
                return thisContext;
            },
            toPlain = function (model) {
                var thisContext = model || this,
                    result = {};
                _.forOwn(thisContext, function (val, key) {
                    if (ko.isObservable(val)) {
                        result[key] = val();
                    } else if (!_.isFunction(val)) {
                        result[key] = val;
                    }
                });
                return result;
            },
            onDataFail = function (jqXHR, textStatus, errorThrown) {
                logger.log({
                    status: textStatus,
                    error: errorThrown
                });
            };

        return {
            clearEmptyStrings: clearEmptyStrings,
            toPlain: toPlain,
            onFail: onDataFail
        };
    });
/**
 * Created by mgordeev on 08.08.2014.
 */
define('data.files',
    [
        'ko',
        'jquery',
        'data.mapper',
        'data.utils'
    ],
    function (ko, $, mapper, dataUtils) {
        var FileInfo = function (row) {
                row = row || {};

                this.name = row.name;
                this.date = new Date(row.ctime);
                this.size = row.size;
                this.url = row.url;
                this.visible = ko.observable(true);
            },
            readUploadDir = function () {
                return $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: '/api/upload',
                    converters: {
                        'text json': mapper.create(FileInfo)
                    }
                })
                    .fail(dataUtils.onFail);
            },
            uploadFile = function (fileToUpload) {
                var formData = new FormData();
                formData.append('file_0', fileToUpload);

                return $.ajax({
                    type: 'POST',
                    url: '/api/upload',
                    data: formData,
                    processData: false,
                    contentType: false,
                    //contentType: 'multipart/form-data',
                    //headers: {'Content-Type': undefined},
                    converters: {
                        'text json': mapper.create(FileInfo)
                    }
                })
                    .fail(dataUtils.onFail);
            },
            removeFile = function (pathToRemove) {
                return $.ajax({
                    type: 'DELETE',
                    url: '/api/upload',
                    data: {
                        path: pathToRemove
                    }
                })
                    .fail(dataUtils.onFail);
            },
            uploadJsonPosts = function(fileObject){
                var formData = new FormData();
                formData.append('file_json_posts', fileObject);

                return $.ajax({
                    type: 'POST',
                    url: '/api/upload',
                    data: formData,
                    processData: false,
                    contentType: false
                })
                    .fail(dataUtils.onFail);
            };

        return {
            Model: FileInfo,
            query: readUploadDir,
            upload: uploadFile,
            remove: removeFile,
            uploadJsonPosts: uploadJsonPosts
        };
    });
/**
 * Created by Gordeev on 03.08.2014.
 */
define('data.icons',
    [

    ],
    function () {
        var icons = [
            'glyphicon-asterisk',
            'glyphicon-plus',
            'glyphicon-euro',
            'glyphicon-minus',
            'glyphicon-cloud',
            'glyphicon-envelope',
            'glyphicon-pencil',
            'glyphicon-glass',
            'glyphicon-music',
            'glyphicon-search',
            'glyphicon-heart',
            'glyphicon-star',
            'glyphicon-star-empty',
            'glyphicon-user',
            'glyphicon-film',
            'glyphicon-th-large',
            'glyphicon-th',
            'glyphicon-th-list',
            'glyphicon-ok',
            'glyphicon-remove',
            'glyphicon-zoom-in',
            'glyphicon-zoom-out',
            'glyphicon-off',
            'glyphicon-signal',
            'glyphicon-cog',
            'glyphicon-trash',
            'glyphicon-home',
            'glyphicon-file',
            'glyphicon-time',
            'glyphicon-road',
            'glyphicon-download-alt',
            'glyphicon-download',
            'glyphicon-upload',
            'glyphicon-inbox',
            'glyphicon-play-circle',
            'glyphicon-repeat',
            'glyphicon-refresh',
            'glyphicon-list-alt',
            'glyphicon-lock',
            'glyphicon-flag',
            'glyphicon-headphones',
            'glyphicon-volume-off',
            'glyphicon-volume-down',
            'glyphicon-volume-up',
            'glyphicon-qrcode',
            'glyphicon-barcode',
            'glyphicon-tag',
            'glyphicon-tags',
            'glyphicon-book',
            'glyphicon-bookmark',
            'glyphicon-print',
            'glyphicon-camera',
            'glyphicon-font',
            'glyphicon-bold',
            'glyphicon-italic',
            'glyphicon-text-height',
            'glyphicon-text-width',
            'glyphicon-align-left',
            'glyphicon-align-center',
            'glyphicon-align-right',
            'glyphicon-align-justify',
            'glyphicon-list',
            'glyphicon-indent-left',
            'glyphicon-indent-right',
            'glyphicon-facetime-video',
            'glyphicon-picture',
            'glyphicon-map-marker',
            'glyphicon-adjust',
            'glyphicon-tint',
            'glyphicon-edit',
            'glyphicon-share',
            'glyphicon-check',
            'glyphicon-move',
            'glyphicon-step-backward',
            'glyphicon-fast-backward',
            'glyphicon-backward',
            'glyphicon-play',
            'glyphicon-pause',
            'glyphicon-stop',
            'glyphicon-forward',
            'glyphicon-fast-forward',
            'glyphicon-step-forward',
            'glyphicon-eject',
            'glyphicon-chevron-left',
            'glyphicon-chevron-right',
            'glyphicon-plus-sign',
            'glyphicon-minus-sign',
            'glyphicon-remove-sign',
            'glyphicon-ok-sign',
            'glyphicon-question-sign',
            'glyphicon-info-sign',
            'glyphicon-screenshot',
            'glyphicon-remove-circle',
            'glyphicon-ok-circle',
            'glyphicon-ban-circle',
            'glyphicon-arrow-left',
            'glyphicon-arrow-right',
            'glyphicon-arrow-up',
            'glyphicon-arrow-down',
            'glyphicon-share-alt',
            'glyphicon-resize-full',
            'glyphicon-resize-small',
            'glyphicon-exclamation-sign',
            'glyphicon-gift',
            'glyphicon-leaf',
            'glyphicon-fire',
            'glyphicon-eye-open',
            'glyphicon-eye-close',
            'glyphicon-warning-sign',
            'glyphicon-plane',
            'glyphicon-calendar',
            'glyphicon-random',
            'glyphicon-comment',
            'glyphicon-magnet',
            'glyphicon-chevron-up',
            'glyphicon-chevron-down',
            'glyphicon-retweet',
            'glyphicon-shopping-cart',
            'glyphicon-folder-close',
            'glyphicon-folder-open',
            'glyphicon-resize-vertical',
            'glyphicon-resize-horizontal',
            'glyphicon-hdd',
            'glyphicon-bullhorn',
            'glyphicon-bell',
            'glyphicon-certificate',
            'glyphicon-thumbs-up',
            'glyphicon-thumbs-down',
            'glyphicon-hand-right',
            'glyphicon-hand-left',
            'glyphicon-hand-up',
            'glyphicon-hand-down',
            'glyphicon-circle-arrow-right',
            'glyphicon-circle-arrow-left',
            'glyphicon-circle-arrow-up',
            'glyphicon-circle-arrow-down',
            'glyphicon-globe',
            'glyphicon-wrench',
            'glyphicon-tasks',
            'glyphicon-filter',
            'glyphicon-briefcase',
            'glyphicon-fullscreen',
            'glyphicon-dashboard',
            'glyphicon-paperclip',
            'glyphicon-heart-empty',
            'glyphicon-link',
            'glyphicon-phone',
            'glyphicon-pushpin',
            'glyphicon-usd',
            'glyphicon-gbp',
            'glyphicon-sort',
            'glyphicon-sort-by-alphabet',
            'glyphicon-sort-by-alphabet-alt',
            'glyphicon-sort-by-order',
            'glyphicon-sort-by-order-alt',
            'glyphicon-sort-by-attributes',
            'glyphicon-sort-by-attributes-alt',
            'glyphicon-unchecked',
            'glyphicon-expand',
            'glyphicon-collapse-down',
            'glyphicon-collapse-up',
            'glyphicon-log-in',
            'glyphicon-flash',
            'glyphicon-log-out',
            'glyphicon-new-window',
            'glyphicon-record',
            'glyphicon-save',
            'glyphicon-open',
            'glyphicon-saved',
            'glyphicon-import',
            'glyphicon-export',
            'glyphicon-send',
            'glyphicon-floppy-disk',
            'glyphicon-floppy-saved',
            'glyphicon-floppy-remove',
            'glyphicon-floppy-save',
            'glyphicon-floppy-open',
            'glyphicon-credit-card',
            'glyphicon-transfer',
            'glyphicon-cutlery',
            'glyphicon-header',
            'glyphicon-compressed',
            'glyphicon-earphone',
            'glyphicon-phone-alt',
            'glyphicon-tower',
            'glyphicon-stats',
            'glyphicon-sd-video',
            'glyphicon-hd-video',
            'glyphicon-subtitles',
            'glyphicon-sound-stereo',
            'glyphicon-sound-dolby',
            'glyphicon-sound-5-1',
            'glyphicon-sound-6-1',
            'glyphicon-sound-7-1',
            'glyphicon-copyright-mark',
            'glyphicon-registration-mark',
            'glyphicon-cloud-download',
            'glyphicon-cloud-upload',
            'glyphicon-tree-conifer',
            'glyphicon-tree-deciduous'
        ];

        return{
            available: icons
        };
    });
/**
 * Created by Gordeev on 30.08.2014.
 */

define('data.log',
    [
        'jquery',
        'ko',
        'data.mapper',
        'data.utils'
    ],
    function ($, ko, mapper, dataUtils) {
        var LogEntry = function (row) {
            var self = this, prop;
            for (prop in row) {
                this[prop] = row[prop];
            }

            this.asArray = [];
            for (prop in this) {
                if (prop !== 'asArray' && prop !== '_id' && prop !== '__v') {
                    this.asArray.push({
                        name: prop,
                        value: this[prop]
                    });
                }
            }

            this.visible = ko.observable(true);
            this.expanded = ko.observable(false);
        };

        var onFail = dataUtils.onFail;
        var query = function (opts) {
            return $.ajax({
                dataType: 'json',
                type: 'GET',
                url: '/api/log',
                data: opts,
                converters: {
                    'text json': mapper.create(LogEntry)
                }
            })
                .fail(onFail);
        };

        return {
            Model: LogEntry,
            query: query
        };
    });
/**
 * incapsulates dirty-pristine state logic
 */
define('model-state',
    [
        'ko',
        '_'
    ],
    function (ko, _) {
        'use strict';
        var ModelState = function (modelToWatch) {
            // 'private' members
            var self = this,
                selfHandler,
                handlers = [],
                onChange = function () {
                    self.setDirty();
                },
                beginWatchOnInnerProperties = function (obj) {
                    _.forOwn(obj, function (value) {
                        if (ko.isObservable(value)) {
                            handlers.push(value.subscribe(onChange));
                        }
                        beginWatchOnInnerProperties(ko.unwrap(value));
                    });
                },
                endWatch = function (withSelf) {
                    _.each(handlers, function (subscription) {
                        subscription.dispose();
                    });
                    if (withSelf && selfHandler) {
                        selfHandler.dispose();
                        selfHandler = undefined;
                    }
                    handlers.length = 0;
                },
                onChangeSelf = function (newValue) {
                    self.setDirty();
                    endWatch(false);
                    beginWatchOnInnerProperties(newValue);
                },
                beginWatch = function (model) {
                    if (ko.isObservable(model)) {
                        selfHandler = model.subscribe(onChangeSelf);
                    }
                    beginWatchOnInnerProperties(ko.unwrap(model));
                };

            // public interface
            this.pristine = ko.observable(true);
            this.dirty = ko.observable(false);
            this.clear = function () {
                self.pristine(true);
                self.dirty(false);
                return self;
            };
            this.setDirty = function () {
                self.pristine(false);
                self.dirty(true);
                return self;
            };
            this.setModel = function (model) {
                endWatch(true);
                self.clear();
                beginWatch(model);
                return self;
            };
            this.dispose = function(){
                endWatch(true);
            };

            // constructor
            if(modelToWatch){
                self.setModel(modelToWatch);
            }
        };

        return ModelState;
    })
;

/**
 * Created by Gordeev on 03.08.2014.
 */
define('data.navlink',
    [
        'jquery',
        'ko',
        'data.mapper',
        'data.utils'
    ],
    function ($, ko, mapper, dataUtils) {
        var Navlink = function (row) {
                var self = this;

                row = row || {};

                this._id = row._id || undefined;
                this.text = ko.observable(row.text);
                this.url = ko.observable(row.url);
                this.category = row.category || 'main';
                this.disabled = ko.observable(row.disabled || false);
                this.visible = ko.observable(row.visible || true);
                this.icon = ko.observable(row.icon);
                this.order = ko.observable(row.order || 0);
                this.willRemove = ko.observable(false);
                this.newWindow = ko.observable(row.newWindow || false);
                this.useClientRouter = ko.observable(row.useClientRouter || false);

                this.newWindow.subscribe(function (newWindowValue) {
                     if(newWindowValue){
                         self.useClientRouter(false);
                     }
                });

                this.useClientRouter.subscribe(function(useROuterValue){
                    if(useROuterValue){
                        self.newWindow(false);
                    }
                });
            },
            onFail = dataUtils.onFail,
            navlinkQuery = function (category) {
                return $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: '/api/navlinks',
                    data: {
                        category: category
                    },
                    converters: {
                        'text json': mapper.create(Navlink)
                    }
                })
                    .fail(onFail);
            },
            navlinkSave = function (navlink) {
                var plain = dataUtils.toPlain(navlink);
                dataUtils.clearEmptyStrings(plain);

                return $.ajax({
                    dataType: 'json',
                    type: 'POST',
                    url: '/api/navlink',
                    data: plain,
                    converters: {
                        'text json': mapper.create(Navlink)
                    }
                })
                    .fail(onFail);
            },
            navlinkRemove = function (id) {
                return $.ajax({
                    dataType: 'json',
                    type: 'DELETE',
                    url: '/api/navlink',
                    data: {
                        id: id
                    },
                    converters: {
                        'text json': mapper.create(Navlink)
                    }
                })
                    .fail(onFail);
            };

        return {
            Model: Navlink,
            query: navlinkQuery,
            save: navlinkSave,
            remove: navlinkRemove
        };
    });
/**
 * one post client model
 * Created by Gordeev on 02.08.2014.
 */
define('data.post',
    [
        'jquery',
        'ko',
        '_',
        'data.mapper',
        'data.utils'
    ],
    function ($, ko, _, mapper, dataUtils) {
        var PostDetails = function (row) {
                row = row || {};
                this._id = row._id || undefined;
                this.title = ko.observable(row.title);
                this.date = ko.observable(row.date ? new Date(row.date) : new Date());
                this.slug = ko.observable(row.slug);
                this.featured = ko.observable(!!row.featured);
                this.draft = ko.observable(!!row.draft);
                this.content = ko.observable(row.content);
                this.image = ko.observable(row.image);
                this.metaTitle = ko.observable(row.metaTitle);
                this.metaDescription = ko.observable(row.metaDescription);
                this.tags = ko.observableArray(row.tags);
            },
            onFail = dataUtils.onFail,
            get = function (id) {
                var promise = $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: '/api/post',
                    data: {
                        id: id
                    },
                    converters: {
                        'text json': mapper.create(PostDetails)
                    }
                })
                    .fail(onFail);
                return promise;
            },
            save = function (postDeatils) {
                var promise, plain;

                plain = dataUtils.toPlain(postDeatils);
                dataUtils.clearEmptyStrings(plain);

                promise = $.ajax({
                    dataType: 'json',
                    type: 'POST',
                    url: '/api/post',
                    data: plain,
                    converters: {
                        'text json': mapper.create(PostDetails)
                    }
                })
                    .fail(onFail);
                return promise;
            },
            savePlain = function (postData) {
                var promise,

                    promise = $.ajax({
                        dataType: 'json',
                        type: 'POST',
                        url: '/api/post',
                        data: postData
                    }).fail(onFail);
                return promise;
            },
            remove = function (id) {
                var promise = $.ajax({
                    dataType: 'json',
                    type: 'DELETE',
                    url: '/api/post',
                    data: {
                        id: id
                    },
                    converters: {
                        'text json': mapper.create(PostDetails)
                    }
                })
                    .fail(onFail);
                return promise;
            };

        return {
            PostDetails: PostDetails,
            get: get,
            save: save,
            savePlain: savePlain,
            remove: remove
        };
    });

/**
 * Created by Gordeev on 26.07.2014.
 */
define('data.posts',
    [
        'jquery',
        'ko',
        'data.mapper',
        'data.utils'
    ],
    function ($, ko, mapper, dataUtils) {
        var PostBrief = function (row) {
                row = row || {};
                this._id = row._id || undefined;
                this.title = row.title || "";
                this.date = row.date ? new Date(row.date) : new Date();
                this.slug = row.slug || "";
                this.featured = ko.observable(!!row.featured);
                this.draft = ko.observable(!!row.draft);
            },
            /**
             * Query list of posts
             * @param queryParams
             *      limit,
             *      skip,
             *      sort,
             *      fromDate,
             *      toDate,
             *      tag,
             *      search,
             *      featured,
             *      includeDraft;
             * @returns {jQuery promise of [PostBrief]}
             */
            postsQuery = function (queryParams) {
                var promise = $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: '/api/posts',
                    data: queryParams,
                    converters: {
                        'text json': mapper.create(PostBrief)
                    }
                })
                    .fail(dataUtils.onFail);
                return promise;
            };

        return {
            PostBrief: PostBrief,
            query: postsQuery
        }
    });
/**
 * Created by mgordeev on 08.08.2014.
 */
define('data.settings',
    [
        'jquery',
        'ko',
        'data.mapper',
        'data.utils'
    ],
    function ($, ko, mapper, dataUtils) {
        'use strict';

        var Settings = function (row) {
                row = row || {};

                this._id = row._id || undefined;
                this.authorDisplayName = ko.observable(row.authorDisplayName || 'Admin');
                this.authorDisplayBio = ko.observable(row.authorDisplayBio || undefined);
                this.authorTwitterScreenName = ko.observable(row.authorTwitterScreenName || undefined);
                this.authorAvatarUrl = ko.observable(row.authorAvatarUrl || null);
                this.footerAnnotation = ko.observable(row.footerAnnotation || undefined);
                this.postsPerPage = ko.observable(row.postsPerPage || 5);
                this.siteTitle = ko.observable(row.siteTitle || null);
                this.metaTitle = ko.observable(row.metaTitle || null);
                this.metaDescription = ko.observable(row.metaDescription || null);
                this.titleImageUrl = ko.observable(row.titleImageUrl || null);
            },
            getObservable = function () {
                return $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: '/api/settings',
                    converters: {
                        'text json': mapper.create(Settings)
                    }
                })
                    .fail(dataUtils.onFail);
            },
            update = function (settings) {
                var plain = dataUtils.toPlain(settings);
                return $.ajax({
                    dataType: 'json',
                    type: 'POST',
                    url: '/api/settings',
                    data: plain,
                    converters: {
                        'text json': mapper.create(Settings)
                    }
                })
                    .fail(dataUtils.onFail);
            };

        return {
            Model: Settings,
            get: getObservable,
            update: update
        };
    });
/**
 * Created by mgordeev on 20.08.2014.
 */
define('helpers-ui',
    [
        'jquery'
    ],
    function ($) {
        'use strict';

        var isDocumentHidden = function () {
                var doc = window.document,
                    standardHidden = doc.hidden,        //Firefox, EI>=10
                    webkitHidden = doc.webkitHidden;    //Chrome
                return standardHidden || webkitHidden;
            },

            isElementInViewport = function ($element, fullVisible) {
                var $window = $(window),
                    viewport = {
                        top: $window.scrollTop(),
                        left: $window.scrollLeft()
                    },
                    bounds;
                viewport.right = viewport.left + $window.width();
                viewport.bottom = viewport.top + $window.height();

                bounds = $element.offset();
                bounds.right = bounds.left + $element.outerWidth();
                bounds.bottom = bounds.top + $element.outerHeight();

                if (fullVisible) {
                    return viewport.top <= bounds.top
                        && viewport.right >= bounds.right
                        && viewport.left <= bounds.left
                        && viewport.bottom >= bounds.bottom;
                }
                return (!(viewport.right < bounds.left
                    || viewport.left > bounds.right
                    || viewport.bottom < bounds.top
                    || viewport.top > bounds.bottom));
            },
            scrollToTop = function () {
                $(window).scrollTop(0);
            };

        return {
            isDocumentHidden: isDocumentHidden,
            isElementInViewport: isElementInViewport,
            scrollToTop: scrollToTop
        };
    });
/**
 * Created by Gordeev on 27.07.2014.
 */
define('logger',
    [
        '_'
    ],
    function (_) {
        var log = function (data) {
            if (_.isString(data)) {
                console.log(data);
            } else {
                console.dir(data);
            }
        };

        return {
            log: log
        };
    });
/**
 * Created by Gordeev on 26.07.2014.
 */
define('messenger',
    [
        '_'
    ],
    function (_) {
        'use strict';
        var subscribes = {},

            addSubscribe = function (messageName, callback, once, context, state, async) {
                var options = {},
                    newSubscribe;

                if (_.isString(messageName)) {
                    options.messageName = messageName;
                    options.callback = callback;
                    options.once = once;
                    options.context = context;
                    options.state = state;
                    options.async = async;
                } else if (messageName) {
                    options = messageName;
                }

                newSubscribe = {
                    hash: _.uniqueId('m'),
                    callback: options.callback,
                    context: options.context,
                    once: !!options.once,
                    state: options.state,
                    async: !!options.async
                };

                if (!subscribes.hasOwnProperty(options.messageName)) {
                    subscribes[options.messageName] = [];
                }
                subscribes[options.messageName].push(newSubscribe);

                return newSubscribe.hash;
            },

            removeSubscribe = function (handler) {
                var messageToRemove,
                    indexToRemove = -1;

                messageToRemove = _.find(subscribes, function (subscribeMessage) {
                    indexToRemove = _.findIndex(subscribeMessage, function (subsc) {
                        return subsc.hash === handler;
                    });
                    return indexToRemove > -1;
                });
                if (indexToRemove > -1 && _.isArray(messageToRemove)) {
                    messageToRemove.splice(indexToRemove, 1);
                }
            },

            doPublish = function (messageName, args) {
                var onceSubscribes = [],
                    i,
                    iLen,
                    contextToUse,
                    subscribe,
                    subscribesForMessage,
                    callSubscribe = function(){
                        subscribe.callback.call(contextToUse, args, subscribe.state);
                    };

                if (!subscribes.hasOwnProperty(messageName) || subscribes[messageName].length === 0) {
                    return;
                }

                subscribesForMessage = subscribes[messageName];

                for (i = 0, iLen = subscribesForMessage.length; i < iLen; i++) {
                    subscribe = subscribesForMessage[i];
                    contextToUse = subscribe.context || this;
                    if (subscribe.once) {
                        onceSubscribes.push(subscribe.hash);
                    }
                    if (subscribe.async) {
                        _.defer(callSubscribe);
                    } else {
                        callSubscribe();
                    }
                }

                _.remove(subscribesForMessage, function (subscr) {
                    return _.some(onceSubscribes, function (h) {
                        return h === subscr.hash;
                    });
                });
            },
            messageNames = Object.freeze({
                TranslateLangChanged: 'jb_translate_lang_changed',
                PostUpdated: 'jb_post_updated',
                ContentUpdated: 'jb_content_updated'
            });

        return {
            publish: doPublish,
            subscribe: addSubscribe,
            unSubscribe: removeSubscribe,
            messageNames: messageNames
        };
    });
/**
 * currently we use server detection
 */

define('mobile-detection',
    [

    ], function () {
        return {
            deviceMobile: !!window.jb_deviceMobile
        };
    });
/**
 * Created by mgordeev on 02.09.2014.
 */
define('polyfill',
    [

    ], function(){
    var add = function(){

        /**
         * string.startsWith:
         */
        if (!String.prototype.startsWith) {
            Object.defineProperty(String.prototype, 'startsWith', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: function (searchString, position) {
                    position = position || 0;
                    return this.lastIndexOf(searchString, position) === position;
                }
            });
        }
    };

    return {
        add: add
    };
});
/**
 * Created by Gordeev on 26.07.2014.
 */
define('vm.base.translate',
    [
        'ko'
    ], function (ko) {
        var getText =ko.computed({
            
        })
    });
//# sourceMappingURL=app-admin.js.map