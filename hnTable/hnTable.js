(function (root, constructor) {
    const plugin = 'HnTable';
    root[plugin] = constructor();
})(typeof global !== 'undefined' ? global : this.window || this.global, function () {
    "use strict";

    let errorMsg = {
        ko: {
            "0001": "열에 대한 객체 타입이 올바르지 않습니다.(올바른 열의 타입은 [] 입니다.)",
            "0002": "열을 생성하지 못했습니다.",
            "0003": "열의 이름 또는 번호를 입력해주세요.",
            "0004": "파라미터에 대한 객체 타입이 올바르지 않습니다.(올바른 파라미터의 타입은 'string' 또는 'number' 입니다.)",
            "0005": "입력한 인덱스에 해당하는 행을 찾을 수 없습니다.",
            "0006": "입력한 파라미터에 해당하는 열을 찾을 수 없습니다.",
            "0007": "설정의 'target'에 대한 Element를 찾을 수 없습니다.",
            "0008": "설정의 'target' 타입이 올바르지 않습니다.",
        },
        eng: {
            "0001": "Mismatching 'columns' Object type.(The columns is of type [])",
            "0002": "Columns cannot be created.",
            "0003": "Please enter a name or number for the column",
            "0004": "Mismatching parameter Object type.(The parameter is of type 'string' or 'number')",
            "0005": "The row corresponding to the index you entered cannot be found.",
            "0006": "The column corresponding to the parameter you entered cannot be found.",
            "0007": "Element not found for 'target' in settings.",
            "0008": "The 'target' type of settings is not correct."
        }
    };

    let _instance = [];
    let _instanceNumber = 0;

    let _defaultConfig = {
        target: "",
        numberColumn: false,
        /**
         * example-
         * columns: {
         *     test: {
         *         markText: "TEST",        [Optional]
         *         type: "string",          [Optional]
         *         sortAble: true           [Optional]
         *         edit: true               [Optional]
         *         width: "10%"             [Optional]
         *         cellEvent: ()  {},     [Optional]
         *         headEvent: ()  {},     [Optional]
         *     }
         * }
         */
        columns: {},
        colHeadFixed: true,
        resizeable: true,
        /**
         * data: [{
         *      key: value
         * }]
         */
        data: [],
        lang: "ko",
        /*pageOption: {
            type: "client",
            perPage: "10",
            scrolling: false
        },*/
        pageOption: false,
        string: {
            ko: {
                empty: "내용이 존재하지 않습니다."
            },
            eng: {
                empty: "The content does not exist."
            }
        }
    }

    let _config = {};

    let _target = _config.target;

    let _bindEvent = {
        'click': '',
        'dbclick': '',
        'change': ''
    }

    let hnTable = function (config) {
        _config = {};
        _config = _extend(true, _defaultConfig, _config);
        _config = _extend(true, _config, config);

        _target = _config.target;

        if (typeof _target === "string") {
            _config.target = document.querySelector(_target);
        } else if ((jQuery && _target instanceof jQuery.fn.init) || ($ && _target instanceof ($.fn || $.fn.init))) {
            _config.target = _target[0];
        }

        _target = _config.target;

        if (!_target) {
            throw new Error(_getErrorMsg("0007"));
        } else if (_target instanceof Element) {
            if (_target.nodeName != "DIV") {
                throw new Error(_getErrorMsg("0008"));
            }
        }
        _config.name = _config.name ? _config.name : "hnTable_" + _instanceNumber;

        this.config = _config;
        this.getColumnData = _getColumnData;
        this.getColumnIndex = _getColumnIndex;
        this.getRowData = _getRowData;
        this.getCellData = _getCellData;
        this.initTable = _initTable;
        this.setPage = _setPage;

        let instance = {
            instance: this,
            instanceNumber: _instanceNumber++,
            instanceName: this.config.name
        }

        _addInstance(instance);
        _initTable(this.config.columns, this.config.data);

        return this;
    };

    hnTable.getInstance = function (callInstance) {
        return _getInstance(callInstance);
    }

    hnTable.modal = function (option) {
        let _option = {
            title: "untitle",
            content: "uncontent",
            contentType: "text",
            width: 300,
            height: 150,
            buttons: {
                confirm: {
                    event: function () {
                        console.log("confirm Click");
                    },
                    name: "확인"
                }
            },
            verticalAlign: "center"
        }
        if (option) {
            _option = _extend(true, _option, option);
        }
        if (document.querySelector(".hn-table-modal-overlay")) {
            document.querySelector(".hn-table-modal-overlay").remove();
        }
        let hnTableModalOverlay = document.createElement("div");
        hnTableModalOverlay.classList.add("hn-table-modal-overlay");
        hnTableModalOverlay.setAttribute("oncontextmenu", "return false;");

        let hnTableModal = document.createElement("div");
        hnTableModal.classList.add("hn-table-modal");


        if (_option.width) {
            hnTableModal.style.width = _option.width + "px";
            hnTableModal.style.left = "calc(50% - " + (_option.width / 2) + "px)";
        }
        if (_option.height) {
            hnTableModal.style.height = _option.height + "px";
            hnTableModal.style.top = "calc(50% - " + (_option.height / 2) + "px)";
        }

        hnTableModalOverlay.insertAdjacentElement("beforeend", hnTableModal);

        let hnTableModalTitle = document.createElement("div");
        hnTableModalTitle.classList.add("hn-table-modal-title");

        hnTableModal.insertAdjacentElement("beforeend", hnTableModalTitle);

        let hnTableModalTitleText = document.createElement("div");
        hnTableModalTitleText.classList.add("hn-table-modal-title-text");
        if (_option.title) {
            hnTableModalTitleText.innerText = _option.title;
        }
        hnTableModalTitle.insertAdjacentElement("beforeend", hnTableModalTitleText);

        let hnTableModalTitleClose = document.createElement("div");
        hnTableModalTitleClose.classList.add("hn-table-modal-title-close");
        hnTableModalTitleClose.innerText = "X";
        hnTableModalTitleClose.addEventListener("click", function () {
            hnTableModalOverlay.remove();
        });

        hnTableModalTitle.insertAdjacentElement("beforeend", hnTableModalTitleClose);

        let hnTableModalContentWrap = document.createElement("div");
        hnTableModalContentWrap.classList.add("hn-table-modal-content-wrap");

        hnTableModal.insertAdjacentElement("beforeend", hnTableModalContentWrap);

        let hnTableModalContentTable = document.createElement("div");
        hnTableModalContentTable.classList.add("hn-table-modal-content-table");

        hnTableModalContentWrap.insertAdjacentElement("beforeend", hnTableModalContentTable);

        let hnTableModalContent = document.createElement("div");
        hnTableModalContent.classList.add("hn-table-modal-content");
        hnTableModalContent.style.verticalAlign = _option.verticalAlign;

        hnTableModalContentTable.insertAdjacentElement("beforeend", hnTableModalContent);

        if (_option.content) {
            if (_option.contentType == "text") {
                hnTableModalContent.insertAdjacentText("beforeend", _option.content);
            } else {
                hnTableModalContent.insertAdjacentHTML("beforeend", _option.content);
            }
        }

        let hnTableModalButtons = document.createElement("div");
        hnTableModalButtons.classList.add("hn-table-modal-buttons");

        hnTableModal.insertAdjacentElement("beforeend", hnTableModalButtons);

        if (_option.buttons) {
            if (_option.buttons.confirm) {
                let confirmButton = document.createElement("input");
                confirmButton.type = "button";
                confirmButton.classList.add("hn-table-modal-button", "confirm");
                if (_option.buttons.confirm.name) {
                    confirmButton.value = _option.buttons.confirm.name;
                } else {
                    confirmButton.value = "확인";
                }
                if (_option.buttons.confirm.event) {
                    confirmButton.addEventListener("click", _option.buttons.confirm.event);
                }
                hnTableModalButtons.insertAdjacentElement("beforeend", confirmButton);
            }
            if (_option.buttons.cancel) {
                let cancelButton = document.createElement("input");
                cancelButton.type = "button";
                cancelButton.classList.add("hn-table-modal-button", "cancel");
                if (_option.buttons.cancel.name) {
                    cancelButton.value = _option.buttons.cancel.name;
                } else {
                    cancelButton.value = "취소";
                }
                if (_option.buttons.cancel.event) {
                    cancelButton.addEventListener("click", _option.buttons.cancel.event);
                }
                hnTableModalButtons.insertAdjacentElement("beforeend", cancelButton);
            }
        }
        document.querySelector("body").insertAdjacentElement("beforeend", hnTableModalOverlay);
    }

    hnTable.showLoading = function (el) {
        let overlayEl = document.createElement("div");
        overlayEl.setAttribute("class", "hn-table-loading-overlay");
        overlayEl.style.position = "fixed";
        overlayEl.style.width = "100%";
        overlayEl.style.height = "100%";
        overlayEl.style.top = "0px";
        overlayEl.style.left = "0px";
        overlayEl.style.zIndex = "9999";
        overlayEl.style.background = "rgba(0, 0, 0, 0.5)";

        let loadingHtml =
            "   <div style='position: inherit;width: 174px;height: 80px;line-height: 33px;font-family: Arial, Helvetica, sans-serif;font-size: 12pt;font-weight: 900;color: #000000;top: calc(50% - 80px);left: calc(50% - 87px);pointer-events: none;'>" +
            "      <div style='display: inline-block;position: absolute;left: 8px;width: 16px;animation: jumpText 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;left: 8px;animation-delay: -0.72s;'>L</div>" +
            "      <div style='display: inline-block;position: absolute;left: 8px;width: 16px;animation: jumpText 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;left: 32px;animation-delay: -0.60s;'>O</div>" +
            "      <div style='display: inline-block;position: absolute;left: 8px;width: 16px;animation: jumpText 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;left: 56px;animation-delay: -0.48s;'>A</div>" +
            "      <div style='display: inline-block;position: absolute;left: 8px;width: 16px;animation: jumpText 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;left: 80px;animation-delay: -0.36s;'>D</div>" +
            "      <div style='display: inline-block;position: absolute;left: 8px;width: 16px;animation: jumpText 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;left: 104px;animation-delay: -0.24s;'>I</div>" +
            "      <div style='display: inline-block;position: absolute;left: 8px;width: 16px;animation: jumpText 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;left: 128px;animation-delay: -0.12s;'>N</div>" +
            "      <div style='display: inline-block;position: absolute;left: 8px;width: 16px;animation: jumpText 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;left: 152px;animation-delay: 0s;'>G</div>" +
            "   </div>";

        if (!el) {
            document.querySelectorAll("body > .hn-table-loading-overlay").forEach(function (el) {
                el.remove();
            });
            overlayEl.insertAdjacentHTML("beforeend", loadingHtml);
            document.querySelector("body").insertAdjacentElement("beforeend", overlayEl);
        } else {
            if (typeof el == "string") {
                document.querySelector(el).querySelector(".hn-table-loading-overlay").forEach(function (el) {
                    el.remove();
                });
                document.querySelector(el).insertAdjacentHTML("beforeend", loadingHtml);
            } else {
                el.querySelectorAll("body > .hn-table-loading-overlay").forEach(function (el) {
                    el.remove();
                });
                el.insertAdjacentHTML("beforeend", loadingHtml);
            }
        }
    };

    hnTable.hideLoading = function () {
        document.querySelectorAll("body > .hn-table-loading-overlay").forEach(function (el) {
            el.remove();
        });
    };

    let _getInstance = function () {
        var _arguments = arguments;
        if (typeof (_arguments && _arguments[0]) == "string") {
            if (_instance.filter(function (instance) {
                return instance.instanceName === _arguments[0];
            })[0]) {
                return _instance.filter(function (instance) {
                    return instance.instanceName === _arguments[0];
                })[0].instance;
            }
            return _instance.filter(function (instance) {
                return instance.instanceName === _arguments[0];
            })[0];
        }
        if (typeof (_arguments && _arguments[0]) == "number") {
            if (_instance.filter(function (instance) {
                return instance.instanceNumber === _arguments[0];
            })[0]) {
                return _instance.filter(function (instance) {
                    return instance.instanceNumber === _arguments[0];
                })[0].instance;
            }
            return _instance.filter(function (instance) {
                return instance.instanceNumber === _arguments[0];
            })[0];
        }
        let instanceList = [];
        _instance.forEach(function (instance) {
            instanceList.push(instance.instance)
        });
        return instanceList;
    };

    let _addInstance = function (instance) {
        _instance.push(instance);
    };

    let _initTable = function (columns, data) {
        if (this) {
            _config = this.config;
            _target = this.config.target;
            columns = _config.columns;
            data = _config.data;
            _target.removeAttribute("hn-table-pagination");
            if (_target.querySelector(".hn-table-cover")) {
                _target.querySelector(".hn-table-cover").remove();
            }
            if (_target.querySelector(".hn-table-pagination")) {
                _target.querySelector(".hn-table-pagination").remove();
            }
        }

        if (typeof columns == "object" && columns instanceof Array) {
            throw new Error(_getErrorMsg("0001"));
        }

        if (typeof data == "object" && !(data instanceof Array)) {
            throw new Error(_getErrorMsg("0001"));
        }

        if (!_target.classList.contains(".hn-table-wrap")) {
            _target.classList.add("hn-table-wrap");
        } else {
            _target.childNodes.forEach(function (el) {
                el.remove();
            });
        }
        _target.setAttribute("hn-table-name", _config.name);

        let hnTableCover = document.createElement("div");
        hnTableCover.classList.add("hn-table-cover");

        let hnTableTbHd = document.createElement("table");
        hnTableTbHd.classList.add("hn-table-hd");

        let hnTableHeader = document.createElement("thead");
        hnTableHeader.classList.add("hn-table-header");

        let hnTableHeaderRow = document.createElement("tr");
        hnTableHeaderRow.classList.add("hn-table-row");
        hnTableHeader.insertAdjacentElement("beforeend", hnTableHeaderRow);

        if (Object.keys(columns).length > 0) {
            Object.keys(columns).forEach(function (key) {
                let markText = key;
                if (columns[key].markText) {
                    markText = columns[key].markText;
                }
                let hnTableHead = document.createElement("th");
                hnTableHead.classList.add("hn-table-head");
                hnTableHead.setAttribute("hn-table-column-key", key);
                hnTableHead.innerText = markText;
                hnTableHeaderRow.insertAdjacentElement("beforeend", hnTableHead);
            });
        } else {
            if (data.length > 0) {
                columns = {};
                Object.keys(data[0]).forEach(function (key) {
                    columns[key] = {};
                    let markText = key;
                    let hnTableHead = document.createElement("th");
                    hnTableHead.classList.add("hn-table-head");
                    hnTableHead.setAttribute("hn-table-column-key", key);
                    hnTableHead.innerText = markText;
                    hnTableHeaderRow.insertAdjacentElement("beforeend", hnTableHead);
                });
            } else {
                throw new Error(_getErrorMsg("0002"));
            }
            _config.columns = columns;
        }
        hnTableTbHd.insertAdjacentElement("beforeend", hnTableHeader);


        let hnTableTbBd = document.createElement("table");
        hnTableTbBd.classList.add("hn-table-bd");

        hnTableCover.insertAdjacentElement("beforeend", hnTableTbHd);
        hnTableCover.insertAdjacentElement("beforeend", hnTableTbBd);

        _target.insertAdjacentElement("beforeend", hnTableCover);

        if (typeof _config.pageOption != "boolean") {
            if (_config.pageOption && typeof _config.pageOption.scrolling != "undefined" && _config.pageOption.scrolling == false) {
                let hnTablePagination = document.createElement("div");
                hnTablePagination.classList.add("hn-table-pagination");
                if (!_target.getAttribute("page")) {
                    _target.setAttribute("page", "1");
                }
                _target.setAttribute("hn-table-pagination", true);
                _target.insertAdjacentElement("beforeend", hnTablePagination);
            }
        }

        if (data.length > 0) {
            let hnTableBody = document.createElement("tbody");
            hnTableBody.classList.add("hn-table-body");
            let hnTableRows = _setPage();
            hnTableRows.forEach(function (hnTableRow) {
                hnTableBody.insertAdjacentElement("beforeend", hnTableRow);
            });
            hnTableTbBd.insertAdjacentElement("beforeend", hnTableBody);
        } else {
            let hnTableEmpty = document.createElement("div");
            hnTableEmpty.classList.add("hn-table-empty");
            hnTableEmpty.innerText = _config.string[_config.lang].empty;
            hnTableCover.insertAdjacentElement("beforeend", hnTableEmpty);
        }

        _setColumnWidth(_target);

        if (!_config.colHeadFixed) {
            hnTableTbHd.style.position = "inherit";
        }
        if (_config.resizeable) {
            _resizeable(hnTableTbHd, hnTableTbBd);
        }
    }

    let _setColumnWidth = function (_target) {
        let targetWidth = _target.offsetWidth;
        let columns = _config.columns;
        let existWidthColumns = Object.keys(columns).filter(function (key) {
            return columns[key].width;
        });

        existWidthColumns.forEach(function (key) {
            if (!isNaN(columns[key].width)) {
                targetWidth -= columns[key].width;
            } else if (columns[key].width.indexOf("%")) {
                columns[key].width = Math.floor(_target.offsetWidth * Number(columns[key].width.replace("%", "").trim()) / 100);
                targetWidth -= columns[key].width;
            } else if (columns[key].width.indexOf("px")) {
                columns[key].width = Number(columns[key].width.replace("px", "").trim()) / 100;
                targetWidth -= columns[key].width;
            } else {
                delete columns[key].width;
            }
        });

        existWidthColumns = Object.keys(columns).filter(function (key) {
            return columns[key].width;
        });

        let defaultColumnsWidth = Math.floor(targetWidth / (Object.keys(columns).length - existWidthColumns.length));

        let notExistWidthColumns = Object.keys(columns).filter(function (key) {
            return !columns[key].width;
        });

        existWidthColumns.forEach(function (key) {
            _target.querySelector("th[hn-table-column-key='" + key + "']").style.width = columns[key].width + "px";
            _target.querySelector("td[hn-table-column='" + key + "']").style.width = columns[key].width + "px";
        });

        notExistWidthColumns.forEach(function (key, idx) {
            if (notExistWidthColumns.length - 1 == idx) {
                columns[key].width = targetWidth;
            } else {
                columns[key].width = defaultColumnsWidth;
                targetWidth -= defaultColumnsWidth;
            }
            _target.querySelector("th[hn-table-column-key='" + key + "']").style.width = columns[key].width + "px";
            _target.querySelector("td[hn-table-column='" + key + "']").style.width = columns[key].width + "px";
        });

        let hScroll = _target.offsetHeight < (_target.querySelector(".hn-table-bd").offsetHeight + _target.querySelector(".hn-table-hd").offsetHeight);

        let correctionVal = -17;
        _target.querySelectorAll("tr > th:last-child").forEach(function (el) {
            let correctionSize = _target.querySelector(".hn-table-cover").offsetWidth - _target.querySelector(".hn-table-hd").offsetWidth;
            if (hScroll) {
                correctionSize += correctionVal;
            }
            el.style.width = Number(el.style.width.replace("px", "")) - (_target.offsetWidth - _target.clientWidth) + correctionSize + "px";
        });
        _target.querySelectorAll("tr > td:last-child").forEach(function (el) {
            let correctionSize = _target.querySelector(".hn-table-cover").offsetWidth - _target.querySelector(".hn-table-bd").offsetWidth;
            if (hScroll) {
                correctionSize += correctionVal;
            }
            el.style.width = Number(el.style.width.replace("px", "")) - (_target.offsetWidth - _target.clientWidth) + correctionSize + "px";
        });
    }

    let _getColumnData = function () {
        let _arguments = arguments;
        if (_arguments && _arguments[0] != null) {
            if (typeof _arguments[0] == "string" || typeof _arguments[0] == "number") {
                let column = _arguments[0];
                if (typeof column == "number") {
                    column = Object.keys(this.config.columns)[column];
                } else {
                    column = this.config.columns[column] ? column : null;
                }
                if (column) {
                    let columnData = [];
                    this.config.data.forEach(function (datam) {
                        columnData.push(datam[column]);
                    });
                    return columnData;
                } else {
                    throw new Error(_getErrorMsg("0006"));
                }
            } else {
                throw new Error(_getErrorMsg("0004"));
            }
        } else {
            throw new Error(_getErrorMsg("0003"));
        }
    }

    let _getColumnIndex = function () {
        let _arguments = arguments;
        if (_arguments && _arguments[0] != null) {
            if (typeof _arguments[0] == "string" || typeof _arguments[0] == "number") {
                let columnIndex = _arguments[0];
                columnIndex = Object.keys(this.config.columns).indexOf(columnIndex);
                return columnIndex;
            } else {
                throw new Error(_getErrorMsg("0003"));
            }
        }
    }

    let _getRowData = function (idx) {
        if (idx != null) {
            if (typeof idx == "string" || typeof idx == "number") {
                if (this.config.data[idx]) {
                    return this.config.data[idx];
                } else {
                    throw new Error(_getErrorMsg("0004"));
                }
            } else {
                throw new Error(_getErrorMsg("0004"));
            }
        } else {
            throw new Error(_getErrorMsg("0005"));
        }
    }

    let _getCellData = function () {
        let _arguments = arguments;
        if (_arguments && _arguments[0] == null) {
            throw new Error(_getErrorMsg("0003"));
        }
        if (_arguments && _arguments[1] == null) {
            throw new Error(_getErrorMsg("0005"));
        }
        let columnData = this.getColumnData(arguments[0]);
        if (typeof _arguments[1] == "string" || typeof _arguments[1] == "number") {
            if (columnData[_arguments[1]]) {
                return columnData[_arguments[1]];
            } else {
                throw new Error(_getErrorMsg("0004"));
            }
        } else {
            throw new Error(_getErrorMsg("0004"));
        }
    }

    let _getErrorMsg = function (callErr) {
        return callErr + ": " + errorMsg[_config.lang][callErr];
    }

    let _getObjType = function () {
        let arg = arguments[0];
        if (typeof arg != "object") {
            return typeof arg;
        }
        if (arg instanceof Array) {
            return "array";
        }
        return "map";
    }

    let _rest = function (option) {
        let method = (option.method ? option.method : "GET").toUpperCase();
        let url = option.url;
        let type = (option.type ? (option.type.toLowerCase() == "json" ? "text" : option.type) : "text").toLowerCase();
        let progress = typeof option.progress == "boolean" ? option.progress : true;
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            if (option.requestHeader && _getObjType(option.requestHeader) == "map") {
                Object(option.requestHeader).keys().forEach(function (key) {
                    xhr.setRequestHeader(key, option.requestHeader[key]);
                })
            }
            xhr.open(method, url);
            xhr.onload = function () {
                if (xhr.status == 200) {
                    let response = xhr.response;
                    if (option.type && option.type.toLowerCase() == "json") {
                        resolve(JSON.parse(response));
                    } else {
                        resolve(response);
                    }
                }
            };

            xhr.onerror = function () {
                reject("Network Error");
            }

            if (method == "POST" && option.data) {
                xhr.responseType = type;
                let params = "";
                if (option.data instanceof Object) {
                    Object.keys(option.data).forEach(function (key, idx) {
                        if (idx != Object.keys(option.data).length) {
                            params += (key + "=" + option.data[key] + "&");
                        } else {
                            params += (key + "=" + option.data[key]);
                        }
                    });
                }
                xhr.send(params);
            } else {
                xhr.send();
            }

        }).finally(function () {

        });
    }

    let _setPage = function () {
        if (this) {
            _config = this.config;
            _target = this.config.target;
        }

        let data = _config.data;
        let columns = _config.columns;
        let hnTableRows = [];

        if (_config.pageOption && _config.pageOption.type == "client") {
            data = [];
            let _data = _config.data;

            let perPage = Number(_config.pageOption.perPage ? _config.pageOption.perPage : "5");
            let perIdx = Number(_config.pageOption.perIdx ? _config.pageOption.perIdx : "10");
            let curPage = Number(_target.getAttribute("page"));
            let totalPage = (_data.length % perIdx) == 0 ? _data.length / perIdx : Math.floor(_data.length / perIdx) + 1;

            let startPage = Math.ceil(curPage/perPage)>1?Math.ceil(curPage/perPage)*perPage-perPage+1:1;
            let endPage = startPage + perPage -1;
            if (endPage > totalPage) {
                endPage = totalPage;
            }

            let startIdx = (curPage - 1) * perIdx
            let endIdx = startIdx + perIdx - 1;
            if (endIdx > _data.length-1) {
                endIdx = _data.length-1;
            }

            for (let i = startIdx; i <= endIdx; i++) {
                _data[i].idx = i;
                data.push(_data[i]);
            }

            _target.querySelector(".hn-table-pagination").querySelectorAll("ul").forEach(function (el) {
                el.remove();
            });

            let pageUl = document.createElement("ul");

            for (let i = startPage; i <= endPage; i++) {
                if (startPage > 1 && i == startPage) {
                    let prevBtn = document.createElement("li");
                    prevBtn.innerText = "<<";
                    prevBtn.classList.add("hn-table-page-prev");
                    pageUl.insertAdjacentElement("beforeend", prevBtn);
                    prevBtn.addEventListener("click", function () {
                        movePage(startPage-1);
                    });
                }

                let pageBtn = document.createElement("li");
                pageBtn.classList.add("hn-table-page-no");
                pageBtn.innerText = i;
                pageUl.insertAdjacentElement("beforeend", pageBtn);
                if (curPage == i) {
                    pageBtn.classList.add("curPage");
                }

                pageBtn.addEventListener("click", function () {
                    movePage(i);
                });

                if (endPage < totalPage && i == endPage) {
                    let nextBtn = document.createElement("li");
                    nextBtn.innerText = ">>";
                    nextBtn.classList.add("hn-table-page-next");
                    pageUl.insertAdjacentElement("beforeend", nextBtn);
                    nextBtn.addEventListener("click", function () {
                        movePage(endPage+1);
                    });
                }

                let movePage = function (page) {
                    _target.setAttribute("page", page);
                    let hnTableTbBd = _target.querySelector(".hn-table-bd");

                    hnTableTbBd.querySelectorAll(".hn-table-body").forEach(function (el) {
                        el.remove();
                    });

                    let hnTableBody = document.createElement("tbody");
                    hnTableBody.classList.add("hn-table-body");
                    let hnTableRows = _setPage();
                    hnTableRows.forEach(function (hnTableRow) {
                        hnTableBody.insertAdjacentElement("beforeend", hnTableRow);
                    });
                    hnTableTbBd.insertAdjacentElement("beforeend", hnTableBody);

                    let hnTableTbHd = _target.querySelector(".hn-table-hd");
                    _setColumnWidth(_target);

                    if (!_config.colHeadFixed) {
                        hnTableTbHd.style.position = "inherit";
                    }
                    if (_config.resizeable) {
                        _resizeable(hnTableTbHd, hnTableTbBd);
                    }
                }
            }
            _target.querySelector(".hn-table-pagination").insertAdjacentElement("beforeend", pageUl);
        }

        data.forEach(function (obj, idx) {
            let hnTableRow = document.createElement("tr");
            hnTableRow.classList.add("hn-table-row");
            if (obj.idx) {
                hnTableRow.setAttribute("hn-table-row-num", obj.idx);
            } else {
                hnTableRow.setAttribute("hn-table-row-num", idx);
            }

            Object.keys(columns).forEach(function (key) {
                let hnTableCell = document.createElement("td");
                hnTableCell.classList.add("hn-table-cell");
                hnTableCell.setAttribute("hn-table-column", key);
                if (obj[key]) {
                    if (_config.columns[key] && _config.columns[key]["format"] && _config.columns[key]["format"] == "locale") {
                        hnTableCell.innerText = Number(obj[key]).toLocaleString();
                    } else if (_config.columns[key] && _config.columns[key]["format"] && typeof _config.columns[key]["format"] == "function") {
                        let r = _config.columns[key]["format"](obj[key], obj);
                        if (r && typeof r != "function" && typeof r != "object") {
                            hnTableCell.innerText = r;
                        } else {
                            hnTableCell.innerText = "";
                        }
                    } else {
                        hnTableCell.innerText = obj[key];
                    }
                } else {
                    if (_config.columns[key] && _config.columns[key]["format"] && typeof _config.columns[key]["format"] == "function") {
                        let r = _config.columns[key]["format"](obj[key], obj);
                        if (r && typeof r != "function" && typeof r != "object") {
                            hnTableCell.innerText = r;
                        } else {
                            hnTableCell.innerText = "";
                        }
                    } else {
                        hnTableCell.innerText = obj[key];
                    }
                }
                if (_config.columns[key] && _config.columns[key]["cellEvent"] && _getObjType(_config.columns[key]["cellEvent"]) == "map") {
                    Object.keys(_config.columns[key]["cellEvent"]).forEach(function (eKey) {
                        hnTableCell.addEventListener(eKey, function (e) {
                            let r = _config.columns[key]["cellEvent"][eKey](e, hnTableCell, obj[key], obj);
                            if (typeof r == "boolean") {
                                return r;
                            }
                        });
                    });
                }
                hnTableRow.insertAdjacentElement("beforeend", hnTableCell);
            });
            hnTableRows.push(hnTableRow);
        });
        return hnTableRows;
    }

    let _resizeable = function (thead, tbody) {
        let theadTr = thead.getElementsByTagName("tr")[0];
        let th = theadTr ? theadTr.children : void 0;
        let tbodyTr = tbody.getElementsByTagName("tr")[0];
        if (th) {
            for (let i = 0; i < th.length; i++) {
                let resizeLine = makeResizeLine(100);
                th[i].appendChild(resizeLine);
                th[i].style.position = 'relative';
                resizeControll(resizeLine);
            }
        }

        function resizeControll(resizeLine) {
            //let t, n, i, o, r
            let resizeLinePosX, prevColumn, nextColumn, pcSize, ncSize;
            let prevTd, nextTd;
            resizeLine.addEventListener("mousedown", function (e) {
                prevColumn = e.target.parentElement;
                nextColumn = prevColumn.nextElementSibling;
                resizeLinePosX = e.pageX;

                let columnKey = prevColumn.getAttribute("hn-table-column-key");
                prevTd = tbodyTr.querySelector("[hn-table-column='" + columnKey + "']");
                nextTd = prevTd.nextElementSibling;

                let d = function (e) {
                    if ("border-box" == l(e, "box-sizing")) {
                        return 0;
                    }
                    let t = l(e, "padding-left"),
                        n = l(e, "padding-right");
                    return parseInt(t) + parseInt(n);
                }(prevColumn);
                pcSize = prevColumn.offsetWidth - d, nextColumn && (ncSize = nextColumn.offsetWidth - d);
            });
            resizeLine.addEventListener("mouseover", function (e) {
                e.target.style.borderRight = "2px solid #0000ff";
            });
            resizeLine.addEventListener("mouseout", function (e) {
                e.target.style.borderRight = "";
            });
            document.addEventListener("mousemove", function (e) {
                if (prevColumn) {
                    let d = e.pageX - resizeLinePosX;
                    nextColumn && (nextColumn.style.width = ncSize - d + "px");
                    prevColumn.style.width = pcSize + d + "px";
                    nextTd && (nextTd.style.width = ncSize - d + "px");
                    prevTd.style.width = pcSize + d + "px";
                }
            });
            document.addEventListener("mouseup", function () {
                resizeLinePosX = void 0, prevColumn = void 0, nextColumn = void 0, pcSize = void 0, ncSize = void 0
            });
        }

        function makeResizeLine(e) {
            var resizeLine = document.createElement("div");
            resizeLine.style.top = 0;
            resizeLine.style.right = 0;
            resizeLine.style.width = "5px";
            resizeLine.style.position = 'absolute';
            resizeLine.style.cursor = "col-resize";
            resizeLine.style.userSelect = "none";
            resizeLine.style.height = e + "%";
            return resizeLine;
        }

        function l(e, t) {
            return window.getComputedStyle(e, null).getPropertyValue(t);
        }
    }

    let _extend = function () {
        let extended = {};
        let deep = false;
        let i = 0;
        if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
            deep == arguments[0];
            i++;
        }
        let merge = function (obj) {
            for (let prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = extend(extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        }
        for (; i < arguments.length; i++) {
            merge(arguments[i]);
        }
        return extended;
    }


    /**
     * NodeList.forEach not Exists
     */
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = function (callback, thisArg) {
            thisArg = thisArg || window;
            for (var i = 0; i < this.length; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }

    return hnTable;
});
