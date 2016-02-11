/**!
 * AngularJS file upload/drop directive and service with progress and abort
 * @author  Danial  <danial.farid@gmail.com>
 * @version 6.0.3
 */
var ngFileUpload;

if (window.XMLHttpRequest && !(window.FileAPI && FileAPI.shouldLoad)) {
    window.XMLHttpRequest.prototype.setRequestHeader = (function (orig) {
        'use strict';

        return function (header, value) {
            if (header === '__setXHR_') {
                var val = value(this);
                // fix for angular < 1.2.0
                if (val instanceof Function) {
                    val(this);
                }
            } else {
                orig.apply(this, arguments);
            }
        };
    })(window.XMLHttpRequest.prototype.setRequestHeader);
}

ngFileUpload = angular.module('ngFileUpload', []);

ngFileUpload.version = '6.0.3';
ngFileUpload.defaults = {};

ngFileUpload.service('Upload', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
    'use strict';

    function sendHttp(config) {
        var deferred = $q.defer(),
            promise = deferred.promise;

        config.method = config.method || 'POST';
        config.headers = config.headers || {};

        config.headers.__setXHR_ = function () {
            return function (xhr) {
                if (!xhr) {
                    return;
                }

                config.__XHR = xhr;
                if (config.xhrFn) {
                    config.xhrFn(xhr);
                }

                xhr.upload.addEventListener('progress', function (e) {
                    e.config = config;
                    if (deferred.notify) {
                        deferred.notify(e);
                    } else if (promise.progressFunc) {
                        $timeout(function () {
                            promise.progressFunc(e);
                        });
                    }
                }, false);

                //fix for firefox not firing upload progress end, also IE8-9
                xhr.upload.addEventListener('load', function (e) {
                    if (e.lengthComputable) {
                        e.config = config;
                        if (deferred.notify) {
                            deferred.notify(e);
                        } else if (promise.progressFunc) {
                            $timeout(function () {
                                promise.progressFunc(e);
                            });
                        }
                    }
                }, false);
            };
        };

        $http(config).then(function (r) {
            deferred.resolve(r);
        }, function (e) {
            deferred.reject(e);
        }, function (n) {
            deferred.notify(n);
        });

        promise.success = function (fn) {
            promise.then(function (response) {
                fn(response.data, response.status, response.headers, config);
            });
            return promise;
        };

        promise.error = function (fn) {
            promise.then(null, function (response) {
                fn(response.data, response.status, response.headers, config);
            });
            return promise;
        };

        promise.progress = function (fn) {
            promise.progressFunc = fn;
            promise.then(null, null, function (update) {
                fn(update);
            });
            return promise;
        };

        promise.abort = function () {
            if (config.__XHR) {
                $timeout(function () {
                    config.__XHR.abort();
                });
            }
            return promise;
        };

        promise.xhr = function (fn) {
            config.xhrFn = (function (origXhrFn) {
                return function () {
                    if (origXhrFn) origXhrFn.apply(promise, arguments);
                    fn.apply(promise, arguments);
                };
            })(config.xhrFn);
            return promise;
        };

        return promise;
    }

    this.upload = function (config) {
        function addFieldToFormData(formData, val, key) {
            if (val !== undefined) {
                if (angular.isDate(val)) {
                    val = val.toISOString();
                }
                if (angular.isString(val)) {
                    formData.append(key, val);
                } else if (config.sendFieldsAs === 'form') {
                    if (angular.isObject(val)) {
                        for (var k in val) {
                            if (val.hasOwnProperty(k)) {
                                addFieldToFormData(formData, val[k], key + '[' + k + ']');
                            }
                        }
                    } else {
                        formData.append(key, val);
                    }
                } else {
                    val = angular.isString(val) ? val : JSON.stringify(val);
                    if (config.sendFieldsAs === 'json-blob') {
                        formData.append(key, new Blob([val], {
                            type: 'application/json'
                        }));
                    } else {
                        formData.append(key, val);
                    }
                }
            }
        }

        config.headers = config.headers || {};
        config.headers['Content-Type'] = undefined;
        config.transformRequest = config.transformRequest ?
            (angular.isArray(config.transformRequest) ?
                config.transformRequest :
                [config.transformRequest]) :
            [];
        config.transformRequest.push(function (data) {
            var formData = new FormData(),
                allFields = {},
                key,
                val,
                fileFormName,
                isFileFormNameString,
                i;

            for (key in config.fields) {
                if (config.fields.hasOwnProperty(key)) {
                    allFields[key] = config.fields[key];
                }
            }

            if (data) {
                allFields.data = data;
            }

            for (key in allFields) {
                if (allFields.hasOwnProperty(key)) {
                    val = allFields[key];
                    if (config.formDataAppender) {
                        config.formDataAppender(formData, key, val);
                    } else {
                        addFieldToFormData(formData, val, key);
                    }
                }
            }

            if (config.file != null) {
                fileFormName = config.fileFormDataName || 'file';
                if (angular.isArray(config.file)) {
                    isFileFormNameString = angular.isString(fileFormName);
                    for (i = 0; i < config.file.length; i++) {
                        formData.append(
                            isFileFormNameString ? fileFormName : fileFormName[i],
                            config.file[i],
                            (config.fileName && config.fileName[i]) || config.file[i].name
                        );
                    }
                } else {
                    formData.append(fileFormName, config.file, config.fileName || config.file.name);
                }
            }
            return formData;
        });

        return sendHttp(config);
    };

    this.http = function (config) {
        config.transformRequest = config.transformRequest || function (data) {
                if ((window.ArrayBuffer && data instanceof window.ArrayBuffer) || data instanceof Blob) {
                    return data;
                }
                return $http.defaults.transformRequest[0](arguments);
            };
        return sendHttp(config);
    };

    this.dataUrl = function (file, callback, disallowObjectUrl) {
        if (window.FileReader &&
            file &&
            (!window.FileAPI || navigator.userAgent.indexOf('MSIE 8') === -1 || file.size < 20000) &&
            (!window.FileAPI || navigator.userAgent.indexOf('MSIE 9') === -1 || file.size < 4000000)) {
            $timeout(function () {
                //prefer URL.createObjectURL for handling refrences to files of all sizes
                //since it doesn´t build a large string in memory
                var URL = window.URL || window.webkitURL,
                    fileReader;

                if (URL && URL.createObjectURL && !disallowObjectUrl) {
                    callback(URL.createObjectURL(file));
                } else {
                    fileReader = new FileReader();
                    fileReader.readAsDataURL(file);
                    fileReader.onload = function (e) {
                        $timeout(function () {
                            callback(e.target.result);
                        });
                    };
                }
            });
        } else {
            callback(null);
        }
    };

    this.setDefaults = function (defaults) {
        ngFileUpload.defaults = defaults || {};
    };
}]);

(function () {
    'use strict';

    var getAttr,
        validate,
        updateModel;

    function linkFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile) {
        /** @namespace attr.ngfSelect */
        /** @namespace attr.ngfChange */
        /** @namespace attr.ngModel */
        /** @namespace attr.ngModelRejected */
        /** @namespace attr.ngfModel */
        /** @namespace attr.ngfMultiple */
        /** @namespace attr.ngfCapture */
        /** @namespace attr.ngfAccept */
        /** @namespace attr.ngfMaxSize */
        /** @namespace attr.ngfMinSize */
        /** @namespace attr.ngfResetOnClick */
        /** @namespace attr.ngfResetModelOnClick */
        /** @namespace attr.ngfKeep */
        /** @namespace attr.ngfKeepDistinct */
        var disabled = false,
            isUpdating = false,
            initialTouchStartY = 0;

        function isInputTypeFile() {
            return elem[0].tagName.toLowerCase() === 'input' && attr.type && attr.type.toLowerCase() === 'file';
        }

        function changeFn(evt) {
            if (!isUpdating) {
                isUpdating = true;
                try {
                    var fileList = evt.__files_ || (evt.target && evt.target.files),
                        files = [],
                        rejFiles = [],
                        i,
                        file;

                    for (i = 0; i < fileList.length; i++) {
                        file = fileList.item(i);
                        if (validate(scope, $parse, attr, file, evt)) {
                            files.push(file);
                        } else {
                            rejFiles.push(file);
                        }
                    }

                    updateModel($parse, $timeout, scope, ngModel, attr,
                        getAttr(attr, 'ngfChange') || getAttr(attr, 'ngfSelect'), files, rejFiles, evt);
                    if (files.length === 0) {
                        evt.target.value = files;
                    }
                    //                if (evt.target && evt.target.getAttribute('__ngf_gen__')) {
                    //                    angular.element(evt.target).remove();
                    //                }
                } finally {
                    isUpdating = false;
                }
            }
        }

        function bindAttrToFileInput(fileElem) {
            var i,
                attribute;

            if (getAttr(attr, 'ngfMultiple')) {
                fileElem.attr('multiple', $parse(getAttr(attr, 'ngfMultiple'))(scope));
            }

            if (getAttr(attr, 'ngfCapture')) {
                fileElem.attr('capture', $parse(getAttr(attr, 'ngfCapture'))(scope));
            }

            if (getAttr(attr, 'accept')) {
                fileElem.attr('accept', getAttr(attr, 'accept'));
            }

            for (i = 0; i < elem[0].attributes.length; i++) {
                attribute = elem[0].attributes[i];
                if ((isInputTypeFile() && attribute.name !== 'type') ||
                    (attribute.name !== 'type' && attribute.name !== 'class' &&
                    attribute.name !== 'id' && attribute.name !== 'style')) {
                    if (!attribute.value) {
                        if (attribute.name === 'required') {
                            attribute.value = 'required';
                        }
                        if (attribute.name === 'multiple') {
                            attribute.value = 'multiple';
                        }
                    }
                    fileElem.attr(attribute.name, attribute.value);
                }
            }
        }

        function createFileInput(evt, resetOnClick) {
            var fileElem;

            if (!resetOnClick && (evt || isInputTypeFile())) {
                return elem.$$ngfRefElem || elem;
            }

            if (elem.$$ngfProgramClick) {
                return elem;
            }

            fileElem = angular.element('<input type="file">');
            bindAttrToFileInput(fileElem);

            if (isInputTypeFile()) {
                elem.replaceWith(fileElem);
                elem = fileElem;
                fileElem.attr('__ngf_gen__', true);
                $compile(elem)(scope);
            } else {
                fileElem
                    .css({
                        'visibility': 'hidden',
                        'position': 'absolute',
                        'overflow': 'hidden',
                        'width': '0',
                        'height': '0',
                        'border': 'none',
                        'margin': '0',
                        'padding': '0'
                    })
                    .attr('tabindex', '-1');
                if (elem.$$ngfRefElem) {
                    elem.$$ngfRefElem.remove();
                }
                elem.$$ngfRefElem = fileElem;
                document.body.appendChild(fileElem[0]);
            }

            return fileElem;
        }

        function resetModel(evt) {
            updateModel($parse, $timeout, scope, ngModel, attr,
                getAttr(attr, 'ngfChange') || getAttr(attr, 'ngfSelect'), [], [], evt, true);
        }

        function clickHandler(evt) {
            var touches,
                currentLocation,
                resetOnClick,
                fileElem;

            function clickAndAssign(evt) {
                if (evt && !elem.$$ngfProgramClick) {
                    elem.$$ngfProgramClick = true;
                    fileElem[0].click();
                    $timeout(function () {
                        delete elem.$$ngfProgramClick;
                    }, 500);
                }
                if ((isInputTypeFile() || !evt) && resetOnClick) {
                    elem.bind('click touchstart touchend', clickHandler);
                }
            }

            if (elem.attr('disabled') || disabled) {
                return false;
            }

            if (evt != null) {
                touches = evt.changedTouches || (evt.originalEvent && evt.originalEvent.changedTouches);
                if (evt.type === 'touchstart') {
                    initialTouchStartY = touches ? touches[0].clientY : 0;
                    // don't block event default
                    return true;
                } else {
                    evt.stopPropagation();
                    evt.preventDefault();

                    // prevent scroll from triggering event
                    if (evt.type === 'touchend') {
                        currentLocation = touches ? touches[0].clientY : 0;
                        if (Math.abs(currentLocation - initialTouchStartY) > 20) {
                            return false;
                        }
                    }
                }
            }

            resetOnClick = $parse(getAttr(attr, 'ngfResetOnClick'))(scope) !== false;
            fileElem = createFileInput(evt, resetOnClick);

            if (fileElem) {
                if (!evt || resetOnClick) {
                    fileElem.bind('change', changeFn);
                }

                if (evt && resetOnClick && $parse(getAttr(attr, 'ngfResetModelOnClick'))(scope) !== false) {
                    resetModel(evt);
                }

                // fix for android native browser < 4.4
                if (shouldClickLater(navigator.userAgent)) {
                    setTimeout(function () {
                        clickAndAssign(evt);
                    }, 0);
                } else {
                    clickAndAssign(evt);
                }
            }

            return false;
        }

        if (elem.attr('__ngf_gen__')) {
            return;
        }

        scope.$on('$destroy', function () {
            if (elem.$$ngfRefElem) {
                elem.$$ngfRefElem.remove();
            }
        });

        if (getAttr(attr, 'ngfSelect').search(/\W+$files\W+/) === -1) {
            scope.$watch(getAttr(attr, 'ngfSelect'), function (val) {
                disabled = val === false;
            });
        }

        if (window.FileAPI && window.FileAPI.ngfFixIE) {
            window.FileAPI.ngfFixIE(elem, createFileInput, bindAttrToFileInput, changeFn);
        } else {
            clickHandler();
            //if (!isInputTypeFile()) {
            //  elem.bind('click touchend', clickHandler);
            //}
        }
    }

    function shouldClickLater(ua) {
        // android below 4.4
        var m = ua.match(/Android[^\d]*(\d+)\.(\d+)/),
            v;

        if (m && m.length > 2) {
            v = ngFileUpload.defaults.androidFixMinorVersion || 4;
            return parseInt(m[1], 10) < 4 || (parseInt(m[1], 10) === v && parseInt(m[2], 10) < v);
        }

        // safari on windows
        return ua.indexOf('Chrome') === -1 && /.*Windows.*Safari.*/.test(ua);
    }

    ngFileUpload.getAttrWithDefaults = function (attr, name) {
        return attr[name] !== null ?
            attr[name] :
            (ngFileUpload.defaults[name] === null ?
                ngFileUpload.defaults[name] :
                ngFileUpload.defaults[name].toString()
            );
    };

    ngFileUpload.directive('ngfSelect', ['$parse', '$timeout', '$compile',
        function ($parse, $timeout, $compile) {
            return {
                restrict: 'AEC',
                require: '?ngModel',
                link: function (scope, elem, attr, ngModel) {
                    linkFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile);
                }
            };
        }
    ]);

    ngFileUpload.validate = function (scope, $parse, attr, file, evt) {
        var regexp,
            accept = $parse(getAttr(attr, 'ngfAccept'))(scope, {
                $file: file,
                $event: evt
            }),

            fileSizeMax = $parse(getAttr(attr, 'ngfMaxSize'))(scope, {
                $file: file,
                $event: evt
            }) || 9007199254740991,

            fileSizeMin = $parse(getAttr(attr, 'ngfMinSize'))(scope, {
                $file: file,
                $event: evt
            }) || -1;

        function globStringToRegex(str) {
            var split,
                result,
                i;

            if (str.length > 2 && str[0] === '/' && str[str.length - 1] === '/') {
                return str.substring(1, str.length - 1);
            }

            split = str.split(',');
            result = '';
            if (split.length > 1) {
                for (i = 0; i < split.length; i++) {
                    result += '(' + globStringToRegex(split[i]) + ')';
                    if (i < split.length - 1) {
                        result += '|';
                    }
                }
            } else {
                if (str.indexOf('.') === 0) {
                    str = '*' + str;
                }
                result = '^' + str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '\\$&') + '$';
                result = result.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
            }
            return result;
        }

        if (file === null) {
            return false;
        }

        if (accept !== null && angular.isString(accept)) {
            regexp = new RegExp(globStringToRegex(accept), 'gi');
            accept = (file.type != null && regexp.test(file.type.toLowerCase())) ||
                (file.name != null && regexp.test(file.name.toLowerCase()));
            if (!accept) {
                file.$error = 'accept';
                return false;
            }
        } else {
            if (accept === false) {
                file.$error = 'accept';
                return false;
            }
        }

        if (file.size === null) {
            return true;
        }

        if (file.size > fileSizeMax) {
            file.$error = 'maxSize';
            return false;
        }

        if (file.size < fileSizeMin) {
            file.$error = 'minSize';
            return false;
        }

        return true;
    };

    ngFileUpload.updateModel = function ($parse, $timeout, scope, ngModel, attr, fileChange,
                                        files, rejFiles, evt, noDelay) {
        function update() {
            var keep = $parse(getAttr(attr, 'ngfKeep'))(scope),
                prevFiles,
                len,
                i,
                j,
                file,
                singleModel,
                ngfModel;

            if (keep === true) {
                prevFiles = (ngModel.$modelValue || []).slice(0);
                if (!files || !files.length) {
                    files = prevFiles;
                } else if ($parse(getAttr(attr, 'ngfKeepDistinct'))(scope)) {
                    len = prevFiles.length;
                    for (i = 0; i < files.length; i++) {
                        for (j = 0; j < len; j++) {
                            if (files[i].name === prevFiles[j].name) {
                                break;
                            }
                        }
                        if (j === len) {
                            prevFiles.push(files[i]);
                        }
                    }
                    files = prevFiles;
                } else {
                    files = prevFiles.concat(files);
                }
            }

            file = files && files.length ? files[0] : null;
            if (ngModel) {
                singleModel = !$parse(getAttr(attr, 'ngfMultiple'))(scope) && !getAttr(attr, 'multiple') && !keep;
                $parse(getAttr(attr, 'ngModel')).assign(scope, singleModel ? file : files);
                $timeout(function () {
                    if (ngModel) {
                        ngModel.$setViewValue(singleModel ?
                            file :
                            (files !== null && files.length === 0 ? null : files));
                    }
                });
            }

            ngfModel = getAttr(attr, 'ngfModel');
            if (ngfModel) {
                $parse(ngfModel).assign(scope, files);
            }

            if (getAttr(attr, 'ngModelRejected')) {
                $parse(getAttr(attr, 'ngModelRejected')).assign(scope, rejFiles);
            }

            if (fileChange) {
                $parse(fileChange)(scope, {
                    $files: files,
                    $file: file,
                    $rejectedFiles: rejFiles,
                    $event: evt
                });
            }
        }

        if (noDelay) {
            update();
        } else {
            $timeout(function () {
                update();
            });
        }
    };

    getAttr = ngFileUpload.getAttrWithDefaults;
    validate = ngFileUpload.validate;
    updateModel = ngFileUpload.updateModel;
})();

(function () {
    'use strict';

    var validate = ngFileUpload.validate,
        updateModel = ngFileUpload.updateModel,
        getAttr = ngFileUpload.getAttrWithDefaults;

    ngFileUpload.directive('ngfDrop', ['$parse', '$timeout', '$location', function ($parse, $timeout, $location) {
        return {
            restrict: 'AEC',
            require: '?ngModel',
            link: function (scope, elem, attr, ngModel) {
                linkDrop(scope, elem, attr, ngModel, $parse, $timeout, $location);
            }
        };
    }]);

    ngFileUpload.directive('ngfNoFileDrop', function () {
        return function (scope, elem) {
            if (dropAvailable()) {
                elem.css('display', 'none');
            }
        };
    });

    ngFileUpload.directive('ngfDropAvailable', ['$parse', '$timeout', function ($parse, $timeout) {
        return function (scope, elem, attr) {
            var fn;

            if (dropAvailable()) {
                fn = $parse(getAttr(attr, 'ngfDropAvailable'));
                $timeout(function () {
                    fn(scope);
                    if (fn.assign) {
                        fn.assign(scope, true);
                    }
                });
            }
        };
    }]);

    function linkDrop(scope, elem, attr, ngModel, $parse, $timeout, $location) {
        var available = dropAvailable(),
            disabled = false,
            leaveTimeout = null,
            stopPropagation,
            dragOverDelay = 1,
            actualDragOverClass;

        function calculateDragOverClass(scope, attr, evt) {
            var accepted = true,
                items = evt.dataTransfer.items,
                i,
                clazz;

            if (items !== null) {
                for (i = 0; i < items.length && accepted; i++) {
                    accepted = accepted &&
                        (items[i].kind === 'file' || items[i].kind === '') &&
                        validate(scope, $parse, attr, items[i], evt);
                }
            }

            clazz = $parse(getAttr(attr, 'ngfDragOverClass'))(scope, {$event: evt});
            if (clazz) {
                if (clazz.delay) {
                    dragOverDelay = clazz.delay;
                }

                if (clazz.accept) {
                    clazz = accepted ? clazz.accept : clazz.reject;
                }
            }

            return clazz || getAttr(attr, 'ngfDragOverClass') || 'dragover';
        }

        function extractFiles(evt, callback, allowDir, multiple) {
            var files = [],
                rejFiles = [],
                processing = 0;

            function addFile(file) {
                if (validate(scope, $parse, attr, file, evt)) {
                    files.push(file);
                } else {
                    rejFiles.push(file);
                }
            }

            function traverseFileTree(files, entry, path) {
                var filePath;
                if (entry !== null) {
                    if (entry.isDirectory) {
                        var filePath = (path || '') + entry.name;
                        addFile({
                            name: entry.name,
                            type: 'directory',
                            path: filePath
                        });
                        var dirReader = entry.createReader();
                        var entries = [];
                        processing++;
                        var readEntries = function () {
                            dirReader.readEntries(function (results) {
                                try {
                                    if (!results.length) {
                                        for (var i = 0; i < entries.length; i++) {
                                            traverseFileTree(files, entries[i], (path ? path : '') + entry.name + '/');
                                        }
                                        processing--;
                                    } else {
                                        entries = entries.concat(Array.prototype.slice.call(results || [], 0));
                                        readEntries();
                                    }
                                } catch (e) {
                                    processing--;
                                    console.error(e);
                                }
                            }, function () {
                                processing--;
                            });
                        };
                        readEntries();
                    } else {
                        processing++;
                        entry.file(function (file) {
                            try {
                                processing--;
                                file.path = (path ? path : '') + file.name;
                                addFile(file);
                            } catch (e) {
                                processing--;
                                console.error(e);
                            }
                        }, function () {
                            processing--;
                        });
                    }
                }
            }

            if (evt.type === 'paste') {
                var clipboard = evt.clipboardData || evt.originalEvent.clipboardData;
                if (clipboard && clipboard.items) {
                    for (var k = 0; k < clipboard.items.length; k++) {
                        if (clipboard.items[k].type.indexOf('image') !== -1) {
                            addFile(clipboard.items[k].getAsFile());
                        }
                    }
                    callback(files, rejFiles);
                }
            } else {
                var items = evt.dataTransfer.items;

                if (items && items.length > 0 && $location.protocol() !== 'file') {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].webkitGetAsEntry && items[i].webkitGetAsEntry() && items[i].webkitGetAsEntry().isDirectory) {
                            var entry = items[i].webkitGetAsEntry();
                            if (entry.isDirectory && !allowDir) {
                                continue;
                            }
                            if (entry != null) {
                                traverseFileTree(files, entry);
                            }
                        } else {
                            var f = items[i].getAsFile();
                            if (f != null) addFile(f);
                        }
                        if (!multiple && files.length > 0) break;
                    }
                } else {
                    var fileList = evt.dataTransfer.files;
                    if (fileList != null) {
                        for (var j = 0; j < fileList.length; j++) {
                            addFile(fileList.item(j));
                            if (!multiple && files.length > 0) {
                                break;
                            }
                        }
                    }
                }
                var delays = 0;
                (function waitForProcess(delay) {
                    $timeout(function () {
                        if (!processing) {
                            if (!multiple && files.length > 1) {
                                i = 0;
                                while (files[i].type === 'directory') i++;
                                files = [files[i]];
                            }
                            callback(files, rejFiles);
                        } else {
                            if (delays++ * 10 < 20 * 1000) {
                                waitForProcess(10);
                            }
                        }
                    }, delay || 0);
                })();
            }
        }

        if (getAttr(attr, 'dropAvailable')) {
            $timeout(function () {
                if (scope[getAttr(attr, 'dropAvailable')]) {
                    scope[getAttr(attr, 'dropAvailable')].value = available;
                } else {
                    scope[getAttr(attr, 'dropAvailable')] = available;
                }
            });
        }

        if (!available) {
            if ($parse(getAttr(attr, 'ngfHideOnDropNotAvailable'))(scope) === true) {
                elem.css('display', 'none');
            }

            return;
        }

        if (getAttr(attr, 'ngfDrop').search(/\W+$files\W+/) === -1) {
            scope.$watch(getAttr(attr, 'ngfDrop'), function (val) {
                disabled = val === false;
            });
        }

        stopPropagation = $parse(getAttr(attr, 'ngfStopPropagation'));

        elem[0].addEventListener('dragover', function (evt) {
            var b;

            if (elem.attr('disabled') || disabled) {
                return;
            }

            evt.preventDefault();
            if (stopPropagation(scope)) {
                evt.stopPropagation();
            }

            // handling dragover events from the Chrome download bar
            if (navigator.userAgent.indexOf('Chrome') > -1) {
                b = evt.dataTransfer.effectAllowed;
                evt.dataTransfer.dropEffect = ('move' === b || 'linkMove' === b) ? 'move' : 'copy';
            }

            $timeout.cancel(leaveTimeout);
            if (!scope.actualDragOverClass) {
                actualDragOverClass = calculateDragOverClass(scope, attr, evt);
            }

            elem.addClass(actualDragOverClass);
        }, false);

        elem[0].addEventListener('dragenter', function (evt) {
            if (elem.attr('disabled') || disabled) {
                return;
            }

            evt.preventDefault();
            if (stopPropagation(scope)) {
                evt.stopPropagation();
            }
        }, false);

        elem[0].addEventListener('dragleave', function () {
            if (elem.attr('disabled') || disabled) {
                return;
            }

            leaveTimeout = $timeout(function () {
                elem.removeClass(actualDragOverClass);
                actualDragOverClass = null;
            }, dragOverDelay || 1);
        }, false);

        elem[0].addEventListener('drop', function (evt) {
            if (elem.attr('disabled') || disabled) {
                return;
            }

            evt.preventDefault();
            if (stopPropagation(scope)) {
                evt.stopPropagation();
            }

            elem.removeClass(actualDragOverClass);
            actualDragOverClass = null;
            extractFiles(evt, function (files, rejFiles) {
                    updateModel($parse, $timeout, scope, ngModel, attr,
                        getAttr(attr, 'ngfChange') || getAttr(attr, 'ngfDrop'), files, rejFiles, evt);
                }, $parse(getAttr(attr, 'ngfAllowDir'))(scope) !== false,
                getAttr(attr, 'multiple') || $parse(getAttr(attr, 'ngfMultiple'))(scope));
        }, false);

        elem[0].addEventListener('paste', function (evt) {
            if (elem.attr('disabled') || disabled) {
                return;
            }

            evt.preventDefault();
            if (stopPropagation(scope)) {
                evt.stopPropagation();
            }

            extractFiles(evt, function (files, rejFiles) {
                updateModel($parse, $timeout, scope, ngModel, attr,
                    getAttr(attr, 'ngfChange') || getAttr(attr, 'ngfDrop'), files, rejFiles, evt);
            }, false, getAttr(attr, 'multiple') || $parse(getAttr(attr, 'ngfMultiple'))(scope));
        }, false);
    }

    function dropAvailable() {
        var div = document.createElement('div');
        return ('draggable' in div) && ('ondrop' in div);
    }

})();

(function () {

    function fileToSrc(Upload, scope, $parse, attr, name, defaultName, callback) {
        if (defaultName) {
            callback($parse(defaultName)(scope));
        }
        scope.$watch(name, function (file) {
            if (!angular.isString(file)) {
                if (window.FileReader && ngFileUpload.validate(scope, $parse, attr, file, null)) {
                    Upload.dataUrl(file, function (url) {
                        if (callback) {
                            callback(url);
                        } else {
                            file.dataUrl = url || $parse(defaultName)(scope);
                        }
                    }, $parse(attr.ngfNoObjectUrl)(scope));
                }
            } else {
                callback(file);
            }
        });
    }

    /** @namespace attr.ngfSrc */
    /** @namespace attr.ngfDefaultSrc */
    /** @namespace attr.ngfNoObjectUrl */
    ngFileUpload.directive('ngfSrc', ['$parse', 'Upload', function ($parse, Upload) {
        return {
            restrict: 'AE',
            link: function (scope, elem, attr) {
                fileToSrc(Upload, scope, $parse, attr, attr.ngfSrc, attr.ngfDefaultSrc, function (url) {
                    elem.attr('src', url);
                });
            }
        };
    }]);

    /** @namespace attr.ngfBackground */
    /** @namespace attr.ngfDefaultBackground */
    /** @namespace attr.ngfNoObjectUrl */
    ngFileUpload.directive('ngfBackground', ['$parse', 'Upload', function ($parse, Upload) {
        return {
            restrict: 'AE',
            link: function (scope, elem, attr) {
                fileToSrc(Upload, scope, $parse, attr, attr.ngfBackground, attr.ngfDefaultBackground, function (url) {
                    elem.css('background-image', 'url(' + url + ')');
                });
            }
        };
    }]);

    /** @namespace attr.ngfDataUrl */
    /** @namespace attr.ngfDefaultDataUrl */
    /** @namespace attr.ngfNoObjectUrl */
    ngFileUpload.directive('ngfDataUrl', ['$parse', 'Upload', function ($parse, Upload) {
        return {
            restrict: 'AE',
            link: function (scope, elem, attr) {

                fileToSrc(Upload, scope, $parse, attr, attr.ngfDataUrl, attr.ngfDefaultDataUrl);
            }
        };
    }]);
})();