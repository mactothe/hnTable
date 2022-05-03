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
            "0009": "'serverOption' 설정에서 'url'을 찾을 수 없습니다."
        },
        eng: {
            "0001": "Mismatching 'columns' Object type.(The columns is of type [])",
            "0002": "Columns cannot be created.",
            "0003": "Please enter a name or number for the column",
            "0004": "Mismatching parameter Object type.(The parameter is of type 'string' or 'number')",
            "0005": "The row corresponding to the index you entered cannot be found.",
            "0006": "The column corresponding to the parameter you entered cannot be found.",
            "0007": "Element not found for 'target' in settings.",
            "0008": "The 'target' type of settings is not correct.",
            "0009": "Not found for 'url' in 'serverOption' settings."
        }
    };

    let sortSvg = {
        sort: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sort" class="svg-inline--fa fa-sort fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"></path></svg>',
        sortUp: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sort-up" class="svg-inline--fa fa-sort-up fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"></path></svg>',
        sortDown: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sort-down" class="svg-inline--fa fa-sort-down fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"></path></svg>'
    }

    let pageSvg = {
        prevPage: '<svg xmlns="http://www.w3.org/2000/svg" width="10.283" height="6.566" viewBox="0 0 10.283 6.566"><path id="i-left" d="M496.649-159.536h-8.095L490.6-161.5l-.806-.771-3.428,3.283,3.428,3.283.806-.771-2.045-1.964h8.095Z" transform="translate(-486.366 162.272)" fill="#242a57"/></svg>',
        nextPage: '<svg xmlns="http://www.w3.org/2000/svg" width="10.283" height="6.566" viewBox="0 0 10.283 6.566"><path id="i-right" d="M496.649-159.536h-8.095L490.6-161.5l-.806-.771-3.428,3.283,3.428,3.283.806-.771-2.045-1.964h8.095Z" transform="translate(496.649 -155.706) rotate(180)" fill="#242a57"/></svg>\n'
    }

    let sort = []

    let _instance = [];
    let _instanceNumber = 0;

    let _defaultConfig = {
        target: "",
        numberColumn: false,
        /**
         * example
         * columns: {
         *     test: {
         *         markText: "TEST",        [Optional]
         *         type: "string",          [Optional]
         *         sortAble: true           [Optional]
         *         edit: true               [Optional]
         *         textAlign: "left"        [Optional]
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
        /*data: [],*/
        lang: "ko",
        /*pageOption: {
            type: "client",
            perPage: "10",
            scrolling: false
        },*/
        pageOption: false,
        string: {
            ko: {
                empty: "내용이 존재하지 않습니다.",
                page: "페이지"
            },
            eng: {
                empty: "The content does not exist.",
                page: "page"
            }
        }
    }

    let _config = {};

    let _target = _config.target;

    let _bindEvent = {
        'click': '',
        'dblclick': '',
        'change': ''
    }

    let hnTable = function (config) {
        _config = {};
        _config = _extend(true, _defaultConfig, _config);
        _config = _extend(true, _config, config);

        _target = _config.target;

        if (typeof _target === "string") {
            _config.target = document.querySelector(_target);
        } else if ((window.jQuery && _target instanceof window.jQuery.fn.init) || (window.$ && _target instanceof (window.$.fn || (window.$.fn && window.$.fn.init)))) {
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

        let instance = {
            instance: this,
            instanceNumber: _instanceNumber++,
            instanceName: this.config.name
        }

        _addInstance(instance);
        this.initTable(this.config.columns, this.config.data);

        return this;
    };

    hnTable.getInstance = function (callInstance) {
        return _getInstance(callInstance);
    }

    /**
     * Hntable modal
     * @param option
     * {
     *     title: (String)
     *     content: (String)
     *     contentType (String) - "text"(default),"html"
     *     width: (Number or String) - Number is pixel, String is percent,
     *     height: (Number or String) - Number is pixel, String is percent
     *     buttons: {
     *         confirm: {
     *             event: (Function)
     *         },
     *         cancel: {
     *             event: (Function)
     *         }
     *     },
     *     verticalAlign: boolean,
     *     showEvent: (Function) - modal show after Activation event
     * }
     */
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

                    },
                    name: "확인"
                }
            },
            verticalAlign: "middle"
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
            if (typeof _option.width == "string" && _option.width.indexOf("%")) {
                hnTableModal.style.width = _option.width;
                hnTableModal.style.left = (100 - Number(_option.width.replace("%", ""))) / 2 + "%";
            } else {
                hnTableModal.style.width = _option.width + "px";
                hnTableModal.style.left = "calc(50% - " + (_option.width / 2) + "px)";
            }
        }
        if (_option.height) {
            if (typeof _option.height == "string" && _option.height.indexOf("%") >= 0) {
                hnTableModal.style.height = _option.height;
                hnTableModal.style.top = (100 - Number(_option.height.replace("%", ""))) / 2 + "%";
            } else if (typeof _option.height == "string" && _option.height == "fit-content") {
                hnTableModal.style.height = "initial";
                hnTableModal.style.top = "20px";
            } else {
                hnTableModal.style.height = _option.height + "px";
                hnTableModal.style.top = "calc(50% - " + (_option.height / 2) + "px)";
            }
        }
        if (_option.maxHeight) {
            if (typeof _option.maxHeight == "string" && _option.maxHeight.indexOf("%") >= 0) {
                hnTableModal.style.maxHeight = "calc(" + _option.maxHeight + " - 20px )";
            }
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
                } else {
                    cancelButton.addEventListener("click", function () {
                        hnTableModalOverlay.remove();
                    });
                }
                hnTableModalButtons.insertAdjacentElement("beforeend", cancelButton);
            }
        }
        document.querySelector("body").insertAdjacentElement("beforeend", hnTableModalOverlay);
        if (_option.showEvent && typeof _option.showEvent == "function") {
            _option.showEvent({
                title: hnTableModalTitleText,
                content: hnTableModalContent
            });
        }
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

    let _initTable = function (options) {
        let _this = this;
        let _config = _this.config;
        if (options) {
            Object.keys(options).forEach(function (key) {
                if (_config[key]) {
                    _config[key] = options[key];
                }
            });
        }
        let _target = _this.config.target;
        let columns = _this.config.columns;
        let data = _this.config.data;

        if (_this.config && _this.config.pageOption && _this.config.pageOption.type == "server") {
            data = [];
        }

        if (_target.getAttribute("hn-table-paginations")) {
            _target.removeAttribute("hn-table-paginations");
        }

        if(_this.config && _this.config.pageOption && _this.config.pageOption.pageInit) {
            if (_target.getAttribute("hn-table-page")) {
                _target.removeAttribute("hn-table-page");
            }
        }

        if (_target.querySelector(".hn-table-cover")) {
            _target.querySelector(".hn-table-cover").remove();
        }

        if (_target.querySelector(".hn-table-paginations")) {
            _target.querySelector(".hn-table-paginations").remove();
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
        _target.tabIndex = 0;

        let hnTableCover = document.createElement("div");
        hnTableCover.classList.add("hn-table-cover");

        let hnTableCg = document.createElement("colgroup");
        hnTableCg.classList.add("hn-table-cg");

        let hnTableHeader = document.createElement("thead");
        hnTableHeader.classList.add("hn-table-header");

        let hnTableHeaderRow = document.createElement("tr");
        hnTableHeaderRow.classList.add("hn-table-row");
        hnTableHeader.insertAdjacentElement("beforeend", hnTableHeaderRow);


        let childColumnsUsed = false;
        if (Object.keys(columns).length > 0) {
            Object.keys(columns).forEach(function (key) {
                if (columns[key].childColumns) {
                    childColumnsUsed = true;
                }
            });
        } else {
            if (data && data[0]) {
                Object.keys(data[0]).forEach(function (key) {
                    if (data[0][key] && _getObjType(data[0][key]) == "map") {
                        childColumnsUsed = true;
                    }
                });
            }
        }

        let hnTableHeaderChildRow;

        if (childColumnsUsed) {
            hnTableHeaderChildRow = document.createElement("tr");
            hnTableHeaderChildRow.classList.add("hn-table-child-row");
            hnTableHeader.insertAdjacentElement("beforeend", hnTableHeaderChildRow);
        }

        /**
         * columns에 대한 정의가 없을 경우 data를 기준으로 columns를 정의한다.
         */
        if (Object.keys(columns).length == 0) {
            columns = {};
            if (data.length > 0) {
                Object.keys(data[0]).forEach(function (key) {
                    columns[key] = {};
                    /**
                     * 데이터의 컬럼에 dict형의 데이터가 존재할 경우 자식컬럼으로 인지하고 자식컬럼을 생성한다.
                     */
                    if (data[0][key] && _getObjType(data[0][key]) == "map") {
                        columns[key].childColumns = {}
                        Object.keys(data[0][key]).forEach(function (childKey) {
                            columns[key].childColumns[childKey] = {};
                        });
                    }
                });
            } else {
                throw new Error(_getErrorMsg("0002"));
            }
            _config.columns = columns;
        }

        Object.keys(columns).forEach(function (key) {
            let markText = key;
            if (columns[key].markText) {
                markText = columns[key].markText;
            }

            let hnTableHead = document.createElement("th");
            hnTableHead.classList.add("hn-table-head");
            hnTableHead.setAttribute("scope", "col");
            hnTableHead.setAttribute("hn-table-column-key", key);
            if (typeof markText == 'function') {
                if (markText() instanceof Element) {
                    hnTableHead.innerHTML = "";
                    hnTableHead.insertAdjacentElement("beforeend", markText());
                } else {
                    hnTableHead.innerHTML = markText();
                }
            } else {
                hnTableHead.innerText = markText;
            }
            hnTableHeaderRow.insertAdjacentElement("beforeend", hnTableHead);

            if (_config.sortUse && columns[key].sortAble && !columns[key].childColumns) {
                hnTableHead.innerHTML += '<div class="hn-table-head-sort"><sapn class="hn-tbale-head-sort-svg">' + sortSvg.sort + '</sapn><span class="hn-table-sort-seq"></span></div>';
            }

            if (!columns[key].childColumns && childColumnsUsed) {
                hnTableHead.rowSpan = 2;
            }
            if (columns[key].childColumns) {
                let childColumns = columns[key].childColumns;
                let pKey = key;
                hnTableHead.colSpan = Object.keys(childColumns).length;
                Object.keys(childColumns).forEach(function (key) {
                    let childColumnMarkText = key;
                    if (childColumns[key].markText) {
                        childColumnMarkText = childColumns[key].markText;
                    }
                    let hnTableHeadChild = document.createElement("th");
                    hnTableHeadChild.classList.add("hn-table-child-head");
                    hnTableHeadChild.setAttribute("scope", "col");
                    hnTableHeadChild.setAttribute("hn-table-parent-column-key", pKey);
                    hnTableHeadChild.setAttribute("hn-table-child-column-key", key);
                    hnTableHeadChild.innerText = childColumnMarkText;
                    hnTableHeaderChildRow.insertAdjacentElement("beforeend", hnTableHeadChild);
                    if (_config.sortUse && childColumns[key].sortAble) {
                        hnTableHeadChild.innerHTML += '<div class="hn-table-head-sort"><sapn class="hn-tbale-head-sort-svg">' + sortSvg.sort + '</sapn><span class="hn-table-sort-seq"></span></div>';
                    }

                    let hnTableCgCol = document.createElement("col");
                    hnTableCgCol.classList.add("hn-table-child-head-col");
                    hnTableCgCol.setAttribute("hn-table-parent-column-key", pKey);
                    hnTableCgCol.setAttribute("hn-table-child-column-key", key);
                    hnTableCg.insertAdjacentElement("beforeend", hnTableCgCol);
                });
            } else {
                let hnTableCgCol = document.createElement("col");
                hnTableCgCol.classList.add("hn-table-head-col");
                hnTableCgCol.setAttribute("hn-table-column-key", key);
                hnTableCg.insertAdjacentElement("beforeend", hnTableCgCol);
            }
        });


        let hnTableTbBd = document.createElement("table");
        hnTableTbBd.classList.add("hn-table-bd");

        hnTableTbBd.insertAdjacentElement("beforeend", hnTableCg.cloneNode(true));
        hnTableTbBd.insertAdjacentElement("beforeend", hnTableHeader);

        hnTableCover.insertAdjacentElement("beforeend", hnTableTbBd);

        _target.insertAdjacentElement("beforeend", hnTableCover);

        if (typeof _config.pageOption != "boolean") {
            if (_config.pageOption) {
                let hnTablePaginations = document.createElement("div");
                hnTablePaginations.classList.add("hn-table-paginations");
                if (!_target.getAttribute("hn-table-page")) {
                    _target.setAttribute("hn-table-page", "1");
                }
                _target.setAttribute("hn-table-paginations", true);
                _target.insertAdjacentElement("beforeend", hnTablePaginations);
            }
        }

        let dataEmpty = false;
        let tBodySet = function (empty) {
            dataEmpty = empty
            if (empty) {
                let hnTableEmpty =  document.createElement("tbody");
                hnTableEmpty.classList.add("hn-table-empty");
                let hnTableEmptyCol = document.createElement("tr");
                let hnTableEmptyRow = document.createElement("td");

                let columnCnt = 0;
                Object.keys(_config.columns).forEach(function (key) {
                    let column = _config.columns[key]
                    if (!column.childColumns) {
                        ++columnCnt;
                    } else {
                        columnCnt += Object.keys(column.childColumns).length;
                    }
                });


                hnTableEmptyRow.setAttribute("colspan", columnCnt);
                hnTableEmptyRow.innerText = _config.string[_config.lang].empty;

                hnTableEmptyCol.insertAdjacentElement("beforeend", hnTableEmptyRow);
                hnTableEmpty.insertAdjacentElement("beforeend", hnTableEmptyCol);
                hnTableTbBd.insertAdjacentElement("beforeend", hnTableEmpty);
            } else {
                let hnTableBody = document.createElement("tbody");
                hnTableBody.classList.add("hn-table-body");
                let hnTableRows = _setPage(_this.config);
                hnTableRows.forEach(function (hnTableRow) {
                    hnTableBody.insertAdjacentElement("beforeend", hnTableRow);
                });
                hnTableTbBd.insertAdjacentElement("beforeend", hnTableBody);
            }

            _setColumnWidth(_this.config);

            _target.querySelectorAll(".hn-table-page-link").forEach(function (pageLinkEl, idx) {
                pageLinkEl.tabIndex = 0;
            });

            if (_config.colHeadFixed) {
                let hnTableTbHd = _target.querySelector(".hn-table-header");
                hnTableTbHd.classList.add("col-head-fixed");
            }
            if (_config.resizeable) {
                _resizeable(_target);
            }
        }

        if (data && data.length > 0) {
            tBodySet(false);
        } else if (data.length == 0 && (_config.pageOption && _config.pageOption.serverOption)) {
            if (_config.pageOption && ((_config.pageOption.type == "server" && _config.pageOption.serverOption) || _config.pageOption.serverOption)) {
                let _serverOption = _config.pageOption.serverOption;
                let _perIdx = _config.pageOption.perIdx ? _config.pageOption.perIdx : 10;
                if (data.length == 0) {
                    let url = _serverOption.url;
                    let method = _serverOption.method ? _serverOption.method : "get";
                    if (!url) {
                        throw new Error(_getErrorMsg("0009"));
                    } else {
                        let dataParam = {};
                        if (_serverOption.mapping) {
                            let page = _target.getAttribute("hn-table-page");
                            let startRowNum = _serverOption.mapping.startRow ? _serverOption.mapping.startRow : "startRow";
                            let endRowNum = _serverOption.mapping.endRow ? _serverOption.mapping.endRow : "endRow";
                            dataParam[startRowNum] = page == 1 ? 0 : _perIdx * page - _perIdx;
                            dataParam[endRowNum] = _perIdx;
                        }
                        if (_serverOption.data) {
                            let optionParam = _serverOption.data();
                            Object.keys(optionParam).forEach(function (key) {
                                dataParam[key] = optionParam[key]
                            });
                        }
                        _rest({
                            url: url,
                            method: method,
                            data: dataParam,
                            type: "json"
                        }).then(function (result) {
                            _config.data = result;
                            tBodySet(result.length == 0);
                        });
                    }
                } else {
                    tBodySet(false);
                }
            }
        } else {
            tBodySet(true);
        }

        if (dataEmpty) {
            if (_target.querySelector(".hn-table-paginations")) {
                _target.querySelector(".hn-table-paginations").remove();
            }
        }

        if (_config.caption && (_config.caption.text || _config.caption.html)) {
            let hnTableCaption = document.createElement("caption");
            if (!_config.caption.position) {
                _config.caption.position = "top";
            }
            switch (_config.caption.position) {
                case "top":
                    hnTableCaption.style.captionSide = "top";
                    break;
                case "bottom":
                    hnTableCaption.style.captionSide = "bottom";
                    break;
                case "initial":
                    hnTableCaption.style.captionSide = "initial";
                    break;
                case "inherit":
                    hnTableCaption.style.captionSide = "inherit";
                    break;
            }
            if (!_config.caption.visible) {
                hnTableCaption.style.width = "0";
                hnTableCaption.style.height = "0";
                hnTableCaption.style.fontSize = "0";
                hnTableCaption.style.lineHeight = "0";
                hnTableCaption.style.overflow = "hidden";
                hnTableCaption.style.border = "0";
                hnTableCaption.style.textIndent = "-999em";
            }
            if (_config.caption.text) {
            hnTableCaption.innerText = _config.caption.text;
            }
            if (_config.caption.html) {
                hnTableCaption.innerHTML = _config.caption.html;
            }
            hnTableTbBd.insertAdjacentElement("afterbegin", hnTableCaption);
        }

        if (_config.summary) {
            hnTableTbBd.setAttribute("summary", _config.summary);
        }

        if (_config.sortUse) {
            _sortData(_config);
        }
    }

    /**
     * 컬럼 넓이를 지정해주는 함수
     * @private
     */
    let _setColumnWidth = function (config) {
        let _target = config.target;

        let targetWidth = _target.offsetWidth;
        let columns = config.columns;

        let columnsWidth = {};

        /**
         * 컬럼 넓이에 대한 정의
         * 컬럼의 자식컬럼이 있을 경우 부모 컬럼에 대한 정의는 하지 않는다.
         */
        Object.keys(columns).forEach(function (key) {
            if (columns[key].childColumns) {
                Object.keys(columns[key].childColumns).forEach(function (cKey) {
                    columnsWidth[key + "." + cKey] = {};
                    let column = columns[key].childColumns[cKey];
                    columnsWidth[key + "." + cKey].width = column.width ? column.width : null;
                });
            } else {
                columnsWidth[key] = {};
                columnsWidth[key].width = columns[key].width ? columns[key].width : null;
            }
        });

        /**
         * 1. 컬럼 넓이가 숫자로 되어있는지 확인
         * : 숫자일 경우 그대로 반영
         * 2. 컬럼 넓이가 퍼센트로 되어있는지 확인
         * : 컬럼 넓이가 퍼센트 단위일 경우 테이블의 넓이와 비교하여 해당 컬럼의 넓이를 픽셀로 변경해준다.
         * 3. 컬럼 넓이에 px이 붙어있는지 확인
         * : px이 붙어 있을경우 px를 지우고 숫자로 변경
         *
         * 컬럼의 넓이가 지정되어있지 않은 컬럼에 대한 예외처리를 위해서.
         * 컬럼 넓이가 지정되어있을 경우 테이블의 총 넓이에서 해당 넓이 만큼을 제외한다.
         */
        Object.keys(columnsWidth).forEach(function (key) {
            if (columnsWidth[key].width) {
                if (!isNaN(columnsWidth[key].width)) {
                    columnsWidth[key].width = columnsWidth[key].width;
                    targetWidth -= columnsWidth[key].width;
                } else if (columnsWidth[key].width.indexOf("%")) {
                    columnsWidth[key].width = _target.offsetWidth * Number(columnsWidth[key].width.replace("%", "").trim()) / 100;
                    targetWidth -= columnsWidth[key].width;
                } else if (columnsWidth[key].indexOf("px")) {
                    columnsWidth[key].width = Number(columnsWidth[key].width.replace("px", "").trim()) / 100;
                    targetWidth -= columnsWidth[key].width;
                }
            }
        });

        /**
         * 총 컬럼의 갯수에 컬럼의 넓이가 지정되어있는 컬럼의 갯수를 제외하여 컬럼의 넓이가 지정되어있지 않은 컬럼에 넓이를 정의
         */
        let defaultColumnsWidth = Math.floor(targetWidth / Object.keys(columnsWidth).filter(function (key) {
            return !(columnsWidth[key] && columnsWidth[key].width)
        }).length) - 1;

        Object.keys(columnsWidth).forEach(function (key) {
            if (key.split(".").length > 1) {
                let parentKey = key.split(".")[0]
                let childKey = key.split(".")[1]
                _target.querySelectorAll("col[hn-table-parent-column-key='" + parentKey + "'][hn-table-child-column-key='" + childKey + "']").forEach(function (colEl) {
                    colEl.width = columnsWidth[key].width ? columnsWidth[key].width : defaultColumnsWidth;
                })
            } else {
                _target.querySelectorAll("col[hn-table-column-key='" + key + "']").forEach(function (colEl) {
                    colEl.width = columnsWidth[key].width ? columnsWidth[key].width : defaultColumnsWidth;
                })
            }
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
        let _self = this;
        let method = (option.method ? option.method : "GET").toUpperCase();
        let url = option.url;
        let type = (option.type ? (option.type.toLowerCase() == "json" ? "text" : option.type) : "text").toLowerCase();
        let contentType = option.contentType ? option.contentType : "application/x-www-form-urlencoded; charset=UTF-8";
        let progress = typeof option.progress == "boolean" ? option.progress : false;
        let async = option.async && option.async == false ? option.async : true;
        let xcsrf = option.xcsrf;
        if (progress) {
            hnTable.showLoading();
        }
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url, async);
            xhr.setRequestHeader("Content-Type", contentType);
            if (xcsrf) {
                xhr.setRequestHeader("Content-Encoding", "gzip");
                xhr.setRequestHeader(xcsrf.key, xcsrf.value);
                xhr.setRequestHeader("AJAX", true);
            }
            if (option.requestHeader) {
                Object.keys(option.requestHeader).forEach(function (key) {
                    xhr.setRequestHeader(key, option.requestHeader[key])
                });
            }
            xhr.onload = function () {
                if (xhr.status == 200) {
                    let response = xhr.response;
                    if (option.type && option.type.toLowerCase() == "json") {
                        if (typeof response == "string") {
                            resolve(JSON.parse(response));
                        } else {
                            resolve(response);
                        }
                    } else if (option.type && option.type.toLowerCase() == "blob") {
                        let reader = new FileReader();
                        reader.onloadend = function () {
                            resolve(reader.result);
                        }
                    } else {
                        resolve(response);
                    }
                }
                if (progress) {
                    hnTable.hideLoading();
                }
            };

            xhr.onerror = function () {
                reject("Network Error");
                if (progress) {
                    hnTable.hideLoading();
                }
            }

            if (method == "POST" && option.data) {
                if (contentType == "")
                    xhr.responseType = type;
                if (contentType.toLowerCase().includes("application/x-www-form-urlencoded")) {
                    if (option.data instanceof FormData) {
                        let params = "";
                        let obj = {};
                        for (let key of option.data.keys()) {
                            obj[key] = option.data.get(key);
                        }
                        Object.keys(obj).forEach(function (key, idx) {
                            if (idx != Object.keys(obj).length - 1) {
                                params += (key + "=" + obj[key] + "&");
                            } else {
                                params += (key + "=" + obj[key]);
                            }
                        });
                        xhr.send(params);
                    } else if (option.data instanceof Element && option.data.tagName == "FORM") {
                        let params = "";
                        let obj = {};
                        option.data = new FormData(option.data);
                        for (let key of option.data.keys()) {
                            obj[key] = option.data.get(key);
                        }
                        Object.keys(obj).forEach(function (key, idx) {
                            if (idx != Object.keys(obj).length - 1) {
                                params += (key + "=" + obj[key] + "&");
                            } else {
                                params += (key + "=" + obj[key]);
                            }
                        });
                        xhr.send(params);
                    } else {
                        let params = "";
                        Object.keys(option.data).forEach(function (key, idx) {
                            if (idx != Object.keys(option.data).length - 1) {
                                params += (key + "=" + option.data[key] + "&");
                            } else {
                                params += (key + "=" + option.data[key]);
                            }
                        });
                        xhr.send(params);
                    }
                } else if (contentType.toLowerCase().includes("application/json")) {
                    xhr.send(JSON.stringify(option.data));
                } else {
                    xhr.send(option.data);
                }
            } else {
                xhr.send();
            }
        })
    }

    let _sortData = function (config) {
        let _config = config;

        _config.originData = _extend(_config.data, true);

        let _target = _config.target;
        if (_target.querySelector(".hn-table-head-sort") != null) {
            _target.querySelectorAll(".hn-table-head-sort").forEach(function (el) {
                el.addEventListener("click", function (e) {
                    let head = el.parentElement;
                    let key = "";
                    if (head.getAttribute("hn-table-parent-column-key")) {
                        key += head.getAttribute("hn-table-parent-column-key") + "." + head.getAttribute("hn-table-child-column-key");
                    } else {
                        key += head.getAttribute("hn-table-column-key");
                    }
                    let sortObj = sort.find(function (obj) {
                        return obj.key == key;
                    });
                    if (sortObj != null) {
                        if (sortObj.order == "desc") {
                            let sortObjIdx = sort.indexOf(sortObj);
                            sort.splice(sortObjIdx, 1);
                        } else {
                            sortObj.order = "desc";
                        }
                    } else {
                        sort.push({
                            key: key,
                            order: "asc"
                        });
                    }

                    _target.querySelectorAll(".hn-table-head-sort").forEach(function (fel) {
                        let head = fel.parentElement;
                        if (head) {
                            let key = "";
                            if (head.getAttribute("hn-table-parent-column-key")) {
                                key += head.getAttribute("hn-table-parent-column-key") + "." + head.getAttribute("hn-table-child-column-key");
                            } else {
                                key += head.getAttribute("hn-table-column-key");
                            }
                            let sortObj = sort.find(function (obj) {
                                return obj.key == key;
                            });
                            if (sortObj == null) {
                                fel.querySelector(".hn-tbale-head-sort-svg").innerHTML = sortSvg.sort;
                                fel.querySelector(".hn-table-sort-seq").innerText = "";
                            } else {
                                if (sortObj != null && sortObj.order == "asc") {
                                    fel.querySelector(".hn-tbale-head-sort-svg").innerHTML = sortSvg.sortUp;
                                } else {
                                    fel.querySelector(".hn-tbale-head-sort-svg").innerHTML = sortSvg.sortDown;
                                }
                                let sortIdx = sort.indexOf(sortObj) + 1;
                                fel.querySelector(".hn-table-sort-seq").innerText = sortIdx;
                            }
                        }
                    });
                    if (sort.length > 0) {

                        let readySort;
                        sort.forEach(function (sortObj, idx) {
                            if (idx == 0) {
                                readySort = firstBy(function (objA, objB) {
                                    let sortKey = sortObj.key.split(".");

                                    let valueA = "";
                                    let valueB = "";

                                    if (sortKey.length > 1) {
                                        if (objA[sortKey[0]] && !objA[sortKey[0]][sortKey[1]] && typeof _config.columns[sortKey[0]].childColumns[sortKey[1]].format == "function") {
                                            valueA = _config.columns[sortKey[0]].childColumns[sortKey[1]].format(null, objA);
                                        } else if (objA[sortKey[0]] && objA[sortKey[0]][sortKey[1]]){
                                            valueA = objA[sortKey[0]][sortKey[1]];
                                        }

                                        if (objB[sortKey[0]] && !objB[sortKey[0]][sortKey[1]] && typeof _config.columns[sortKey[0]].childColumns[sortKey[1]].format == "function") {
                                            valueB = _config.columns[sortKey[0]].childColumns[sortKey[1]].format(null, objB);
                                        } else if (objB[sortKey[0]] && objB[sortKey[0]][sortKey[1]]){
                                            valueB = objB[sortKey[0]][sortKey[1]];
                                        }
                                    } else {
                                        if (!objA[sortKey[0]] && typeof _config.columns[sortKey[0]].format == "function") {
                                            valueA = _config.columns[sortKey[0]].format(null, objA);
                                        } else if (objA[sortKey[0]]) {
                                            valueA = objA[sortKey[0]];
                                        }

                                        if (!objB[sortKey[0]] && typeof _config.columns[sortKey[0]].format == "function") {
                                            valueB = _config.columns[sortKey[0]].format(null, objB);
                                        } else if (objB[sortKey[0]]) {
                                            valueB = objB[sortKey[0]];
                                        }
                                    }

                                    if (sortObj.order == "asc") {
                                        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                                    } else {
                                        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
                                    }
                                });
                            } else {
                                readySort = readySort.thenBy(function (objA, objB) {
                                    let sortKey = sortObj.key.split(".");

                                    let valueA = "";
                                    let valueB = "";

                                    if (sortKey.length > 1) {
                                        if (objA[sortKey[0]] && !objA[sortKey[0]][sortKey[1]] && typeof _config.columns[sortKey[0]].childColumns[sortKey[1]].format == "function") {
                                            valueA = _config.columns[sortKey[0]].childColumns[sortKey[1]].format(null, objA);
                                        } else if (objA[sortKey[0]] && objA[sortKey[0]][sortKey[1]]){
                                            valueA = objA[sortKey[0]][sortKey[1]];
                                        }

                                        if (objB[sortKey[0]] && !objB[sortKey[0]][sortKey[1]] && typeof _config.columns[sortKey[0]].childColumns[sortKey[1]].format == "function") {
                                            valueB = _config.columns[sortKey[0]].childColumns[sortKey[1]].format(null, objB);
                                        } else if (objB[sortKey[0]] && objB[sortKey[0]][sortKey[1]]){
                                            valueB = objB[sortKey[0]][sortKey[1]];
                                        }
                                    } else {
                                        if (!objA[sortKey[0]] && typeof _config.columns[sortKey[0]].format == "function") {
                                            valueA = _config.columns[sortKey[0]].format(null, objA);
                                        } else if (objA[sortKey[0]]) {
                                            valueA = objA[sortKey[0]];
                                        }

                                        if (!objB[sortKey[0]] && typeof _config.columns[sortKey[0]].format == "function") {
                                            valueB = _config.columns[sortKey[0]].format(null, objB);
                                        } else if (objB[sortKey[0]]) {
                                            valueB = objB[sortKey[0]];
                                        }
                                    }

                                    if (sortObj.order == "asc") {
                                        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                                    } else {
                                        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
                                    }
                                });
                            }
                        });

                        _config.data.sort(readySort);
                    } else {
                        _config.data = _extend(_config.originData, true);
                    }

                    _movePage(_config, Number(_target.getAttribute("hn-table-page")));
                });
            });
        }
    }

    let _setPage = function (config) {
        let _config = config;
        let _target = _config.target;
        let data = [];
        let columns = _config.columns;
        let hnTableRows = [];

        let perPage = Number(_config.pageOption.perPage ? Number(_config.pageOption.perPage) : 0);
        let perIdx = Number(_config.pageOption.perIdx ? _config.pageOption.perIdx : "10");
        let curPage = Number(_target.getAttribute("hn-table-page"));
        let startPage = Math.ceil(curPage / perPage) > 1 ? Math.ceil(curPage / perPage) * perPage - perPage + 1 : 1;
        let endPage = startPage + perPage - 1;

        let totalPage;

        if (_config.pageOption) {
            if (_config.pageOption.type == "client") {
                let _data = _config.data;
                totalPage = (_data.length % perIdx) == 0 ? _data.length / perIdx : Math.floor(_data.length / perIdx) + 1;
                let endPage = startPage + perPage - 1;
                if (endPage > totalPage) {
                    endPage = totalPage;
                }

                let startIdx = (curPage - 1) * perIdx
                let endIdx = startIdx + perIdx - 1;
                if (endIdx > _data.length - 1) {
                    endIdx = _data.length - 1;
                }

                for (let i = startIdx; i <= endIdx; i++) {
                    _data[i].idx = i;
                    data.push(_data[i]);
                }
            } else if (_config.pageOption && ((_config.pageOption.type == "server" && _config.pageOption.serverOption) || _config.pageOption.serverOption)) {

                let _serverOption = _config.pageOption.serverOption;
                let _data = _config.data;

                totalPage = 1;
                let totalRow = 1;
                let totalRowText = (_serverOption && _serverOption.mapping && _serverOption.mapping.totalRow) ? (_serverOption && _serverOption.mapping && _serverOption.mapping.totalRow) : "totalRow";
                if (_data && _data[0] && _data[0][totalRowText]) {
                    totalRow = _data[0][totalRowText];
                    totalPage = (totalRow % perIdx) == 0 ? totalRow / perIdx : Math.floor(totalRow / perIdx) + 1;
                }

                if (endPage > totalPage) {
                    endPage = totalPage;
                }

                let startIdx = (curPage - 1) * perIdx

                for (let i = 0; i < _data.length; i++) {
                    _data[i].idx = startIdx;
                    data.push(_data[i]);
                    startIdx++;
                }
            }

            if (perPage) {
                _target.querySelector(".hn-table-paginations").querySelectorAll("ul").forEach(function (el) {
                    el.remove();
                });

                let pageUl = document.createElement("ul");
                pageUl.classList.add("hn-table-pagination");

                for (let i = startPage; i <= endPage; ++i) {
                    if (startPage > 1 && i == startPage) {
                        let prevBtn = document.createElement("li");
                        prevBtn.innerHTML = "<a class='hn-table-page-link' htrf='#'><<</a>";
                        prevBtn.classList.add("hn-table-page-prev", "hn-table-page-item");
                        pageUl.insertAdjacentElement("beforeend", prevBtn);
                        prevBtn.addEventListener("keypress", function (e) {
                            if (e.key === 'Enter') {
                                _movePage(_config, startPage - 1);
                            }
                        });
                        prevBtn.addEventListener("click", function () {
                            _movePage(_config, startPage - 1);
                        });
                    }

                    if (i <= totalPage) {
                        let pageBtn = document.createElement("li");
                        pageBtn.classList.add("hn-table-page-no", "hn-table-page-item");
                        pageBtn.innerHTML = "<a class='hn-table-page-link' htrf='#'>" + i + "</a>";
                        pageUl.insertAdjacentElement("beforeend", pageBtn);
                        if (curPage == i) {
                            pageBtn.classList.add("curPage");
                        }
                        pageBtn.addEventListener("keypress", function (e) {
                            if (e.key === 'Enter') {
                                _movePage(_config, i);
                            }
                        });
                        pageBtn.addEventListener("click", function () {
                            _movePage(_config, i);
                        });
                    }

                    if (endPage < totalPage && i == endPage) {
                        let nextBtn = document.createElement("li");
                        nextBtn.innerHTML = "<a class='hn-table-page-link' htrf='#'>>></a>";
                        nextBtn.classList.add("hn-table-page-next", "hn-table-page-item");
                        pageUl.insertAdjacentElement("beforeend", nextBtn);
                        nextBtn.addEventListener("keypress", function (e) {
                            if (e.key === 'Enter') {
                                _movePage(_config, endPage + 1);
                            }
                        });
                        nextBtn.addEventListener("click", function () {
                            _movePage(_config, endPage + 1);
                        });
                    }
                }
                _target.querySelector(".hn-table-paginations").insertAdjacentElement("beforeend", pageUl);
            } else {
                _target.querySelector(".hn-table-paginations").innerHTML = "";

                let hnTablePageInfo = document.createElement("span");
                hnTablePageInfo.classList.add("hn-table-page-info");
                hnTablePageInfo.innerText = curPage + "/" + totalPage;

                let hnTablePageControl = document.createElement("span");
                hnTablePageControl.classList.add("hn-table-page-control");

                let hnTablePageNumberInput = document.createElement("input");
                hnTablePageNumberInput.classList.add("hn-table-page-number-input");
                hnTablePageNumberInput.type = "number";
                hnTablePageNumberInput.value = curPage.toString();

                let hnTablePagePrev = document.createElement("a");
                hnTablePagePrev.classList.add("hn-table-page-prev");
                hnTablePagePrev.innerHTML = pageSvg.prevPage;

                let hnTablePageNext = document.createElement("a");
                hnTablePageNext.classList.add("hn-table-page-next");
                hnTablePageNext.innerHTML = pageSvg.nextPage;

                hnTablePageControl.insertAdjacentText("beforeend", _config.string[_config.lang].page);
                hnTablePageControl.insertAdjacentElement("beforeend", hnTablePageNumberInput);
                hnTablePageControl.insertAdjacentText("beforeend", "|");
                hnTablePageControl.insertAdjacentElement("beforeend", hnTablePagePrev);
                hnTablePageControl.insertAdjacentElement("beforeend", hnTablePageNext);

                _target.querySelector(".hn-table-paginations").insertAdjacentElement("beforeend", hnTablePageInfo);
                _target.querySelector(".hn-table-paginations").insertAdjacentElement("beforeend", hnTablePageControl);

                let nextPage = (curPage + 1) >= totalPage ? totalPage : (curPage + 1);
                let prevPage = 1 >= (curPage - 1)  ? 1 : (curPage - 1);

                hnTablePageNext.addEventListener("keypress", function (e) {
                    if (e.key === 'Enter') {
                        _movePage(_config, nextPage);
                    }
                });
                hnTablePageNext.addEventListener("click", function () {
                    _movePage(_config, nextPage);
                });

                hnTablePagePrev.addEventListener("keypress", function (e) {
                    if (e.key === 'Enter') {
                        _movePage(_config, prevPage);
                    }
                });
                hnTablePagePrev.addEventListener("click", function () {
                    _movePage(_config, prevPage);
                });
                hnTablePageNumberInput.addEventListener("keypress", function (e) {
                   if (e.key === 'Enter') {
                        let page = hnTablePageNumberInput.value;
                        if (page > totalPage) {
                            page = totalPage;
                        } else if (page < 1) {
                            page = 1;
                        }
                        _movePage(_config, page);
                   }
                });
            }
        } else {
            data = _config.data;
        }

        let createCell = function (_obj, _column, _key, _parentKey) {
            let obj = _obj;
            let column = _column;
            let key = _key;
            let parentKey = _parentKey;

            let hnTableCell = document.createElement("td");
            hnTableCell.classList.add("hn-table-cell");
            hnTableCell.setAttribute("hn-table-column", key);

            if (column && column.textAlign) {
                hnTableCell.style.textAlign = column.textAlign;
            }

            if (parentKey) {
                hnTableCell.setAttribute("hn-table-parent-column", parentKey);
            }

            if (obj != null && obj[parentKey] != null && obj[parentKey][key] != null) {
                if (column && column.format && column.format == "locale") {
                    hnTableCell.innerText = Number(obj[parentKey][key]).toLocaleString();
                } else if (column && column.format && typeof column.format == "function") {
                    let r = column.format(obj[parentKey][key], obj, hnTableCell);
                    if (r != null && typeof r != "function" && typeof r != "object") {
                        hnTableCell.innerText = r;
                    } else if (r != null && r instanceof Element) {
                        hnTableCell.insertAdjacentElement("beforeend", r);
                    } else {
                        hnTableCell.innerText = "";
                    }
                } else {
                    hnTableCell.innerText = obj[parentKey][key];
                }
            } else if (obj != null && obj[key] != null) {
                if (column && column.format && column.format == "locale") {
                    hnTableCell.innerText = Number(obj[key]).toLocaleString();
                } else if (column && column.format && typeof column.format == "function") {
                    let r = column.format(obj[key], obj, hnTableCell);
                    if (r != null && typeof r != "function" && typeof r != "object") {
                        hnTableCell.innerText = r;
                    } else if (r != null && r instanceof Element) {
                        hnTableCell.insertAdjacentElement("beforeend", r);
                    } else {
                        hnTableCell.innerText = "";
                    }
                } else {
                    hnTableCell.innerText = obj[key];
                }
            } else {
                if (column && column.format && typeof column.format == "function") {
                    let r = column.format(null, obj, hnTableCell);
                    if (r != null && typeof r != "function" && typeof r != "object") {
                        hnTableCell.innerText = r;
                    } else if (r != null && r instanceof Element) {
                        hnTableCell.insertAdjacentElement("beforeend", r);
                    } else {
                        hnTableCell.innerText = "";
                    }
                }
            }

            if (column && column.cellEvent && _getObjType(column.cellEvent) == "map") {
                Object.keys(column.cellEvent).forEach(function (eKey) {
                    if (eKey == "click") {
                        hnTableCell.addEventListener('keypress', function (e) {
                            if (e.key === 'Enter') {
                                let r = column["cellEvent"][eKey](e, hnTableCell, obj, parentKey ? (obj[parentKey] && obj[parentKey][key] ? obj[parentKey][key] : "") : (obj && obj[key] ? obj[key] : ""));
                                if (typeof r == "boolean") {
                                    return r;
                                }
                            }
                        });
                    }
                    hnTableCell.addEventListener(eKey, function (e) {
                        let r = column["cellEvent"][eKey](e, hnTableCell, obj, parentKey ? (obj[parentKey] && obj[parentKey][key] ? obj[parentKey][key] : "") : (obj && obj[key] ? obj[key] : ""));
                        if (typeof r == "boolean") {
                            return r;
                        }
                    });
                });
            }
            return hnTableCell;
        }

        data.forEach(function (obj, idx) {
            let hnTableRow = document.createElement("tr");
            hnTableRow.classList.add("hn-table-row");
            if (obj.idx != null) {
                hnTableRow.setAttribute("hn-table-row-num", obj.idx);
            } else {
                hnTableRow.setAttribute("hn-table-row-num", idx);
            }

            Object.keys(_config.columns).forEach(function (key) {
                let column = _config.columns[key];
                if (column.childColumns) {
                    Object.keys(column.childColumns).forEach(function (childKey) {
                        let childColumn = column.childColumns[childKey];
                        hnTableRow.insertAdjacentElement("beforeend", createCell(obj, childColumn, childKey, key));
                    });
                } else {
                    hnTableRow.insertAdjacentElement("beforeend", createCell(obj, column, key));
                }
            });
            if (_config.rowEvent) {
                hnTableRow.tabIndex = 0;
                Object.keys(_config.rowEvent).forEach(function (eKey) {
                    if (eKey == "click") {
                        hnTableRow.addEventListener('keypress', function (e) {
                            if (e.key === 'Enter') {
                                let r = _config.rowEvent[eKey](e, hnTableRow, obj);
                                if (typeof r == "boolean") {
                                    return r;
                                }
                            }
                        });
                    }
                    hnTableRow.addEventListener(eKey, function (e) {
                        let r = _config.rowEvent[eKey](e, hnTableRow, obj);
                        if (typeof r == "boolean") {
                            return r;
                        }
                    });
                });
            }
            hnTableRows.push(hnTableRow);
        });

        return hnTableRows;
    }

    let _movePage = function (config, page) {
        let _config = config;
        let _target = _config.target;
        _target.focus();

        let perIdx = Number(_config.pageOption.perIdx ? _config.pageOption.perIdx : "10");

        if (_config.pageOption.type == "server") {
            let _serverOption = _config.pageOption.serverOption;
            let url = "";
            let method = _serverOption && _serverOption.method ? _serverOption.method : "get";
            if (_serverOption && _serverOption.url) {
                url = _serverOption.url;
            } else {
                throw new Error(_getErrorMsg("0009"));
            }
            let startRowText = (_serverOption && _serverOption.mapping && _serverOption.mapping.startRow) ? (_serverOption && _serverOption.mapping && _serverOption.mapping.startRow) : "startRow";
            let endRowText = (_serverOption && _serverOption.mapping && _serverOption.mapping.endRow) ? (_serverOption && _serverOption.mapping && _serverOption.mapping.endRow) : "endRow";

            let dataParam = {}
            dataParam[startRowText] = (page - 1) * perIdx;
            dataParam[endRowText] = perIdx;
            if (sort.length > 0) {
                dataParam.sortOption = JSON.stringify(sort);
            }
            _target.setAttribute("hn-table-page", page);

            if (_serverOption.data) {
                let optionParam = _serverOption.data();
                Object.keys(optionParam).forEach(function (key) {
                    dataParam[key] = optionParam[key]
                });
            }


            _rest({
                url: url,
                method: method,
                data: dataParam,
                type: "json"
            }).then(function (result) {
                _config.data = result;
                let hnTableRows = _setPage(_config);
                let hnTableTbBd = _target.querySelector(".hn-table-bd");
                hnTableTbBd.querySelectorAll(".hn-table-body .hn-table-row").forEach(function (el) {
                    el.remove();
                });

                let hnTableBody = hnTableTbBd.querySelector(".hn-table-body");
                hnTableBody.classList.add("hn-table-body");
                hnTableRows.forEach(function (hnTableRow) {
                    hnTableBody.insertAdjacentElement("beforeend", hnTableRow);
                });
                hnTableTbBd.insertAdjacentElement("beforeend", hnTableBody);
            })
        } else {
            _target.setAttribute("hn-table-page", page);
            let hnTableTbBd = _target.querySelector(".hn-table-bd");

            hnTableTbBd.querySelectorAll(".hn-table-body .hn-table-row").forEach(function (el) {
                el.remove();
            });

            let hnTableBody = hnTableTbBd.querySelector(".hn-table-body");
            let hnTableRows = _setPage(_config);
            hnTableRows.forEach(function (hnTableRow) {
                hnTableBody.insertAdjacentElement("beforeend", hnTableRow);
            });
            hnTableTbBd.insertAdjacentElement("beforeend", hnTableBody);

            if (_config.colHeadFixed) {
                let hnTableTbHd = _target.querySelector(".hn-table-header");
                hnTableTbHd.classList.add("col-head-fixed");
            }
        }

        _target.querySelectorAll(".hn-table-page-link").forEach(function (pageLinkEl, idx) {
            pageLinkEl.tabIndex = 0;
        });
    }

    /**
     * 리사이즈 옵션이 있을 경우 해당 함수를 통해 테이블 컬럼의 넓이를 변경할 수 있다.
     * @param target
     * @private
     */
    let _resizeable = function (target) {

        target.querySelectorAll(".hn-table-bd > .hn-table-cg > col").forEach(function (colEl) {
            let columnKey = colEl.getAttribute("hn-table-column-key");
            let parentColumnKey = colEl.getAttribute("hn-table-parent-column-key");
            let childColumnKey = colEl.getAttribute("hn-table-child-column-key");
            let th = columnKey ? target.querySelector(".hn-table-header th[hn-table-column-key='" + columnKey + "']") : target.querySelector(".hn-table-header th[hn-table-parent-column-key='" + parentColumnKey + "'][hn-table-child-column-key='" + childColumnKey + "']");
            if (th) {
                let resizeLine = makeResizeLine(100);
                th.appendChild(resizeLine);
                resizeControl(resizeLine);
            }
        });

        function resizeControl(resizeLine) {
            let prevCol, nextCol, resizeLinePosX, pcSize, ncSize;
            resizeLine.addEventListener("mousedown", function (e) {
                resizeLinePosX = e.pageX;
                let prevColumn = e.target.parentElement;
                let columnKey = prevColumn.getAttribute("hn-table-column-key");
                let parentColumnKey = prevColumn.getAttribute("hn-table-parent-column-key");
                let childColumnKey = prevColumn.getAttribute("hn-table-child-column-key");
                prevCol = columnKey ? target.querySelector(".hn-table-bd col[hn-table-column-key='" + columnKey + "']") : target.querySelector(".hn-table-bd col[hn-table-parent-column-key='" + parentColumnKey + "'][hn-table-child-column-key='" + childColumnKey + "']");
                nextCol = prevCol.nextElementSibling;
                pcSize = prevCol ? Number(prevCol.width) : null;
                ncSize = nextCol ? Number(nextCol.width) : null;
            });
            resizeLine.addEventListener("mouseover", function (e) {
                e.target.style.borderRight = "2px solid #0000ff";
            });
            resizeLine.addEventListener("mouseout", function (e) {
                e.target.style.borderRight = "";
            });
            document.addEventListener("mousemove", function (e) {
                if (prevCol) {
                    let d = (e.pageX - resizeLinePosX)/2;
                    if (pcSize + d > 10) {
                        prevCol.width = pcSize + d;
                        if (nextCol) {
                            if (ncSize - d > 10) {
                                nextCol.width = ncSize - d;
                            }
                        }
                    }
                }
            });
            document.addEventListener("mouseup", function () {
                resizeLinePosX = void 0, prevCol = void 0, nextCol = void 0, pcSize = void 0, ncSize = void 0
            });
        }

        function makeResizeLine(e) {
            let resizeLine = document.createElement("div");
            resizeLine.style.top = 0;
            resizeLine.style.right = 0;
            resizeLine.style.width = "3px";
            resizeLine.style.position = 'absolute';
            resizeLine.style.cursor = "col-resize";
            resizeLine.style.userSelect = "none";
            resizeLine.style.height = e + "%";
            return resizeLine;
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
            if (Array.isArray(obj)) {
                extended = [];
            }

            for (let prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = _extend(extended[prop], obj[prop]);
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

    /***
     Copyright 2013 Teun Duynstee
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
     */
    let firstBy = (function () {

        function identity(v) {
            return v;
        }

        function ignoreCase(v) {
            return typeof (v) === "string" ? v.toLowerCase() : v;
        }

        function makeCompareFunction(f, opt) {
            opt = typeof (opt) === "object" ? opt : {direction: opt};

            if (typeof (f) != "function") {
                var prop = f;
                // make unary function
                f = function (v1) {
                    return !!v1[prop] ? v1[prop] : "";
                }
            }
            if (f.length === 1) {
                // f is a unary function mapping a single item to its sort score
                var uf = f;
                var preprocess = opt.ignoreCase ? ignoreCase : identity;
                var cmp = opt.cmp || function (v1, v2) {
                    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
                }
                f = function (v1, v2) {
                    return cmp(preprocess(uf(v1)), preprocess(uf(v2)));
                }
            }
            const descTokens = {"-1": '', desc: ''};
            if (opt.direction in descTokens) return function (v1, v2) {
                return -f(v1, v2)
            };
            return f;
        }

        /* adds a secondary compare function to the target function (`this` context)
           which is applied in case the first one returns 0 (equal)
           returns a new compare function, which has a `thenBy` method as well */
        function tb(func, opt) {
            /* should get value false for the first call. This can be done by calling the
            exported function, or the firstBy property on it (for es6 module compatibility)
            */
            var x = (typeof (this) == "function" && !this.firstBy) ? this : false;
            var y = makeCompareFunction(func, opt);
            var f = x ? function (a, b) {
                    return x(a, b) || y(a, b);
                }
                : y;
            f.thenBy = tb;
            return f;
        }

        tb.firstBy = tb;
        return tb;
    })();


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
