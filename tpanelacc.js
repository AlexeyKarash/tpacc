(function (window, factory) {
    'use strict';
    /* globals define: false, module: false, require: false */

    if (typeof define == 'function' && define.amd) {
        // AMD
        define(['jquery'], function (jQuery) {
            factory(window, jQuery);
        });
    } else if (typeof module == 'object' && module.exports) {
        // CommonJS
        module.exports = factory(
			window,
			require('jquery')
		);
    } else {
        // browser global
        window.jQueryBridget = factory(
			window,
			window.jQuery
		);
    }

}(window, function factory(window, jQuery) {
    'use strict';

    // ----- utils ----- //

    var arraySlice = Array.prototype.slice;

    // helper function for logging errors
    // $.error breaks jQuery chaining
    var console = window.console;
    var logError = typeof console == 'undefined' ? function () { } :
	function (message) {
	    console.error(message);
	};

    // ----- jQueryBridget ----- //

    function jQueryBridget(namespace, PluginClass, $) {
        $ = $ || jQuery || window.jQuery;
        if (!$) {
            return;
        }

        // add option method -> $().plugin('option', {...})
        if (!PluginClass.prototype.option) {
            // option setter
            PluginClass.prototype.option = function (opts) {
                // bail out if not an object
                if (!$.isPlainObject(opts)) {
                    return;
                }
                this.options = $.extend(true, this.options, opts);
            };
        }

        // make jQuery plugin
        $.fn[namespace] = function (arg0 /*, arg1 */) {
            if (typeof arg0 == 'string') {
                // method call $().plugin( 'methodName', { options } )
                // shift arguments by 1
                var args = arraySlice.call(arguments, 1);
                return methodCall(this, arg0, args);
            }
            // just $().plugin({ options })
            plainCall(this, arg0);
            return this;
        };

        // $().plugin('methodName')
        function methodCall($elems, methodName, args) {
            var returnValue;
            var pluginMethodStr = '$().' + namespace + '("' + methodName + '")';

            $elems.each(function (i, elem) {
                // get instance
                var instance = $.data(elem, namespace);
                if (!instance) {
                    logError(namespace + ' not initialized. Cannot call methods, i.e. ' +
							 pluginMethodStr);
                    return;
                }

                var method = instance[methodName];
                if (!method || methodName.charAt(0) == '_') {
                    logError(pluginMethodStr + ' is not a valid method');
                    return;
                }

                // apply method, get return value
                var value = method.apply(instance, args);
                // set return value if value is returned, use only first value
                returnValue = returnValue === undefined ? value : returnValue;
            });

            return returnValue !== undefined ? returnValue : $elems;
        }

        function plainCall($elems, options) {
            $elems.each(function (i, elem) {
                var instance = $.data(elem, namespace);
                if (instance) {
                    // set options & init
                    instance.option(options);
                    instance._init();
                } else {
                    // initialize new instance
                    instance = new PluginClass(elem, options);
                    $.data(elem, namespace, instance);
                }
            });
        }

        updateJQuery($);

    }

    // ----- updateJQuery ----- //

    // set $.bridget for v1 backwards compatibility
    function updateJQuery($) {
        if (!$ || ($ && $.bridget)) {
            return;
        }
        $.bridget = jQueryBridget;
    }

    updateJQuery(jQuery || window.jQuery);

    // -----  ----- //

    return jQueryBridget;

}));

function keyCodes() {
    // Define values for keycodes
    this.tab = 9;
    this.enter = 13;
    this.esc = 27;

    this.space = 32;
    this.pageup = 33;
    this.pagedown = 34;
    this.end = 35;
    this.home = 36;

    this.left = 37;
    this.up = 38;
    this.right = 39;
    this.down = 40;

} // end keyCodes
var defaults = {
    accordian: false,
    multiselectable: true,
    tabClass: 'tab',
    panelClass: 'panel',
    accordianIcon: true,
    accordianImgIcon: {
        expanded: "expanded.gif",
        collapsed: "contracted.gif"
    },
    accordianImgAlt: {
        collapsed: "collapsed",
        expanded: "expanded"
    },
    accordianToggleElm: 'h3',
    accordianFirstOpen: true,
    accordianIconToEnd: false,
    accordianToggleble: false
};
var counter = 0;
function tpanelacc(id, options) {
    this.settings = $.extend({}, defaults, options);
    // define the class properties
    this.panel_id = id; // store the id of the containing div
    this.accordianView = this.settings.accordian; // true if this is an accordian control
    this.$panel = $(id); // store the jQuery object for the panel
    this.accordian = this.settings.multiselectable; //(this.$panel.attr("multiselectable") === "true"); // true if this is an accordian control
    this.keys = new keyCodes(); // keycodes needed for event handlers
    this.$panels = this.$panel.find('.' + this.settings.panelClass); // Array of panel.
    this.accordianFirstOpen = ((this.accordianView) ? this.settings.accordianFirstOpen : true);
    //this.accordianIcon = this.settings.accordianIcon;
    this.createLayout();
    //console.log('bbb');
    this.$tabs = this.$panel.find('.' + this.settings.tabClass); // Array of panel tabs.
    // Bind event handlers
    this.bindHandlers();
    this.accordianToggleble = this.settings.accordianToggleble;
    // Initialize the tab panel
    this._init();
    //console.log(this.settings);
    counter++;


} // end tpanelacc() constructor
tpanelacc.prototype.createLayout = function () {
    this.accordianView ? this.accordianLayout() : this.tpanelaccLayout();
}
tpanelacc.prototype.tpanelaccLayout = function () {
    var tabsTitles = [],
        set = this.settings,
		accFirstOpen = this.accordianFirstOpen;
    this.$panels.each(function (idx, elm) {
        $(elm).attr({
            'role': 'tabpanel',
            'id': 'tp' + counter + '-panel' + idx,
            'aria-labelledby': 'tp' + counter + '-tab' + idx
        }).css('display', ((accFirstOpen && idx == 0) ? 'block' : 'none'));
        tabsTitles[idx] = $(elm).data('tab-toggle');
    });
    var tablist;
    if (this.$panel.find(".tablist").length == 0) {
        tablist = this.$panel.find('.tablist');
        this.$panel.prepend('<ul class="tablist" role="tablist"></ul>');
        for (i = 0; i < this.$panels.length; i++) {
            tablist.append('<li id="tp' + counter + '-tab' + i + '" class="' + set.tabClass + '" aria-controls="tp' + counter + '-panel' + i + '" aria-selected="' + ((i == 0) ? 'true' : 'false') + '" role="tab" tabindex="' + ((i == 0) ? '0' : '-1') + '">' + tabsTitles[i] + '</li>');
        }
    } else {
        tablist = this.$panel.find('.tablist');
        tablist.attr('role', 'tablist');
        tablist.find('li').each(function (idx, elm) {
            $(elm).attr({
                'role': 'tab',
                'id': 'tp' + counter + '-tab' + idx,
                //'aria-labelledby': 'tp' + counter + '-tab' + idx,
                'aria-controls': 'tp' + counter + '-panel' + idx,
                'aria-selected': ((idx == 0) ? 'true' : 'false'),
                'tabindex': ((idx == 0) ? '0' : '-1')
            }).addClass(set.tabClass);
        });
    }
    
    
    //this.$tabs = this.$panel.find('.'+settings.tabClass); // Array of panel tabs.
    //console.log(this.$tabs);
}
tpanelacc.prototype.accordianLayout = function () {
    //var tabsTitles = [];
    //debugger;
    var set = this.settings,
		createTabElm = true,
		accFirstOpen = this.accordianFirstOpen;
    if (this.$panel.has("." + this.settings.tabClass).length) {
        createTabElm = false;
    }
    this.$panels.each(function (idx, elm) {
        $(elm).attr({
            'role': 'tabpanel',
            'id': 'tp' + counter + '-panel' + idx,
            'aria-labelledby': 'tp' + counter + '-tab' + idx,
            'aria-hidden': ((accFirstOpen && idx == 0) ? 'false' : 'true')
        }).css('display', ((accFirstOpen && idx == 0) ? 'block' : 'none')).addClass('accordian');
        var toggleImg = '<i class="acc-toggle"></i>';
        if (set.accordianIcon) {
            toggleImg = '<i class="acc-toggle"><img class="toggle-img" src="' + ((accFirstOpen && idx == 0) ? set.accordianImgIcon.expanded : set.accordianImgIcon.collapsed) + '" alt="' + ((accFirstOpen && idx == 0) ? set.accordianImgAlt.expanded : set.accordianImgAlt.collapsed) + '" /></i>';
        }
        if (createTabElm) {
            //$(elm).wrap('<div class="panel-container"></div>');
            $(elm).before('<' + set.accordianToggleElm + ' id="tp' + counter + '-tab' + idx + '" class="accordian ' + set.tabClass + '" aria-controls="tp' + counter + '-panel' + idx + '" aria-selected="' + ((accFirstOpen && idx == 0) ? 'true' : 'false') + '" aria-expanded="' + ((accFirstOpen && idx == 0) ? 'true' : 'false') + '" role="tab" tabindex="' + ((idx == 0) ? '0' : '-1') + '">' + $(elm).data('tab-toggle') + '</' + set.accordianToggleElm + '>');
            if (set.accordianIconToEnd) {
                $(elm).prev(".accordian").append(toggleImg);
            } else {
                $(elm).prev(".accordian").prepend(toggleImg);
            }
        } else {
            $(elm).prev("." + set.tabClass).addClass("accordian")
				.attr({
				    'id': "tp" + counter + "-tab" + idx,
				    "aria-controls": "tp" + counter + "-panel" + idx,
				    "aria-selected": ((accFirstOpen && idx == 0) ? 'true' : 'false'),
                    "aria-expanded": ((accFirstOpen && idx == 0) ? 'true' : 'false'),
				    "role": "tab",
				    "tabindex": ((idx == 0) ? '0' : '-1')
				});//.prepend(toggleImg);
            if (set.accordianIconToEnd) {
                $("#tp" + counter + "-tab" + idx).append(toggleImg);
            } else {
                $("#tp" + counter + "-tab" + idx).prepend(toggleImg);
            }
            $('#tp' + counter + '-panel' + idx + ", #tp" + counter + "-tab" + idx);//.wrapAll('<div class="panel-container"></div>');
        }


    });
    this.$panel.addClass("tablist").attr({
        "role": "tablist",
        "multiselectable": this.settings.multiselectable
    });
}
tpanelacc.prototype._init =
tpanelacc.prototype.init = function () {
    var $tab; // the selected tab - if one is selected

    // add aria attributes to the panels
    this.$panels.attr('aria-hidden', 'true');

    // get the selected tab
    $tab = this.$tabs.filter('[aria-selected="true"]');

    if ($tab == undefined) {
        $tab = this.$tabs.first();
    }

    // show the panel that the selected tab controls and set aria-hidden to false
    this.$panel.find('#' + $tab.attr('aria-controls')).attr({'aria-hidden':'false','tabindex':"0"});

    //console.log(" inst " + counter);
    //console.log(this.settings);
} // end init()
tpanelacc.prototype.switchTabs = function ($curTab, $newTab) {
    console.log("switchTabs");
    // Remove the highlighting from the current tab
    $curTab.removeClass('focus');

    // remove tab from the tab order and update its aria-selected attribute
    $curTab.attr('tabindex', '-1').attr('aria-selected', 'false');


    // Highlight the new tab and update its aria-selected attribute
    $newTab.attr('aria-selected', 'true');

    // If activating new tab/panel, swap the displayed panels
    if (!this.accordianView || this.accordian == false) {
        // hide the current tab panel and set aria-hidden to true
        this.$panel.find('#' + $curTab.attr('aria-controls')).attr({'aria-hidden':'true','tabindex':'-1'}).trigger('data-attribute-changed');
        this.accordianView ? this.$panel.find('#' + $curTab.attr('aria-controls')).slideUp() : this.$panel.find('#' + $curTab.attr('aria-controls')).attr({'aria-hidden':'true','tabindex':'-1'}).hide();

        // update the aria-expanded attribute for the old tab
        $curTab.attr('aria-expanded', 'false');

        // show the new tab panel and set aria-hidden to false
        this.$panel.find('#' + $newTab.attr('aria-controls')).attr({'aria-hidden':'false','tabindex':'0'}).triggerAll('data-attribute-changed data-visible-true');
        this.accordianView ? this.$panel.find('#' + $newTab.attr('aria-controls')).slideDown() : this.$panel.find('#' + $newTab.attr('aria-controls')).attr({'aria-hidden':'false','tabindex':'0'}).show();

        // update the aria-expanded attribute for the new tab
        $newTab.attr('aria-expanded', 'true');
        if (this.accordianView == true) {

            this.$tabs.find('img').attr('src', this.settings.accordianImgIcon.collapsed)
				.attr('alt', this.settings.accordianImgAlt.collapsed);//'collapsed' - 'http://www.oaa-accessibility.org/media/examples/images/contracted.gif'

            // Update the selected tab's aria-selected attribute
            $newTab.find('img').attr('src', this.settings.accordianImgIcon.expanded)
				.attr('alt', this.settings.accordianImgAlt.expanded);//'expanded' - 'http://www.oaa-accessibility.org/media/examples/images/expanded.gif'
        }
    }

    // Make new tab navigable
    $newTab.attr('tabindex', '0');

    // give the new tab focus
    $newTab.focus();

} // end switchTabs()
tpanelacc.prototype.togglePanel = function ($tab) {
    console.log("togglePanel");
    $panel = this.$panel.find('#' + $tab.attr('aria-controls'));
    if (this.accordian == true && this.accordianView == true) {
        if ($panel.attr('aria-hidden') == 'true') {
            //console.log('aa' + $tab);
            $panel.attr({'aria-hidden':'false','tabindex':'0'}).slideDown().triggerAll('data-attribute-changed data-visible-true');
            $tab.find('.toggle-img').attr('src', this.settings.accordianImgIcon.expanded).attr('alt', this.settings.accordianImgAlt.expanded);

            // update the aria-expanded attribute
            $tab.attr('aria-expanded', 'true');
        } else {
            $panel.attr({'aria-hidden':'true','tabindex':'-1'}).slideUp().trigger('data-attribute-changed');
            $panel.slideUp(100);
            $tab.find('.toggle-img').attr('src', this.settings.accordianImgIcon.collapsed).attr('alt', this.settings.accordianImgAlt.collapsed);

            // update the aria-expanded attribute
            $tab.attr('aria-expanded', 'false');
        }
    } else {
        if(this.accordianToggleble == true && $tab.attr('aria-expanded') == 'true'){
            this.$panels.attr({'aria-hidden':'true','tabindex':'-1'}).trigger('data-attribute-changed');//.slideUp();
            this.accordianView ? this.$panels.slideUp() : this.$panels.hide();
            this.$tabs.attr('tabindex', '-1').attr({
                'aria-selected': 'false',
                "aria-expanded": 'false'
            });
            this.$tabs.find('.toggle-img').attr('src', this.settings.accordianImgIcon.collapsed)
                .attr('alt', this.settings.accordianImgAlt.collapsed); //'collapsed' - 'http://www.oaa-accessibility.org/media/examples/images/contracted.gif'
            $tab.attr('tabindex', '0');
            $tab.attr({
                'aria-selected': 'true'
            });
        }else {
            this.$panels.attr({'aria-hidden':'true','tabindex':'-1'}).trigger('data-attribute-changed');//.slideUp();
            this.accordianView ? this.$panels.not($panel).slideUp() : this.$panels.not($panel).hide();
            // remove all tabs from the tab order and reset their aria-selected attribute
            this.$tabs.attr('tabindex', '-1').attr({
                'aria-selected': 'false',
                "aria-expanded": 'false'
            });
            // Update the selected tab's aria-selected attribute
            $tab.attr({
                'aria-selected': 'true',
                "aria-expanded": 'true'
            });

            if (this.accordianView == true) {
                this.$tabs.find('.toggle-img').attr('src', this.settings.accordianImgIcon.collapsed)
                    .attr('alt', this.settings.accordianImgAlt.collapsed); //'collapsed' - 'http://www.oaa-accessibility.org/media/examples/images/contracted.gif'

                // Update the selected tab's aria-selected attribute
                $tab.find('.toggle-img').attr('src', this.settings.accordianImgIcon.expanded)
                    .attr('alt', this.settings.accordianImgAlt.expanded); //'expanded' - 'http://www.oaa-accessibility.org/media/examples/images/expanded.gif'
            }
            // show the clicked tab panel
            $panel.attr({'aria-hidden': 'false', 'tabindex':'0'}).triggerAll('data-attribute-changed data-visible-true');
            this.accordianView ? $panel.slideDown() : $panel.show();

            // make clicked tab navigable
            $tab.attr('tabindex', '0');

            // give the tab focus
            $tab.focus();
        }
    }

} // end togglePanel()
tpanelacc.prototype.bindHandlers = function () {
    //console.log('aaa');
    var thisObj = this; // Store the this pointer for reference

    //////////////////////////////
    // Bind handlers for the tabs / accordian headers

    // bind a tab keydown handler
    this.$tabs.keydown(function (e) {
        return thisObj.handleTabKeyDown($(this), e);
    });

    // bind a tab keypress handler
    this.$tabs.keypress(function (e) {
        return thisObj.handleTabKeyPress($(this), e);
    });

    // bind a tab click handler
    this.$tabs.click(function (e) {
        return thisObj.handleTabClick($(this), e);
    });

    // bind a tab focus handler
    this.$tabs.focus(function (e) {
        return thisObj.handleTabFocus($(this), e);
    });

    // bind a tab blur handler
    this.$tabs.blur(function (e) {
        return thisObj.handleTabBlur($(this), e);
    });

    /////////////////////////////
    // Bind handlers for the panels

    // bind a keydown handlers for the panel focusable elements
    this.$panels.keydown(function (e) {
        return thisObj.handlePanelKeyDown($(this), e);
    });

    // bind a keypress handler for the panel
    this.$panels.keypress(function (e) {
        return thisObj.handlePanelKeyPress($(this), e);
    });

    // bind a panel click handler
    this.$panels.click(function (e) {
        return thisObj.handlePanelClick($(this), e);
    });

} // end bindHandlers()
tpanelacc.prototype.handleTabKeyDown = function ($tab, e) {

    if (e.altKey) {
        // do nothing
        return true;
    }

    switch (e.keyCode) {
        case this.keys.enter:
        case this.keys.space:
            {
                // Only process if this is an accordian widget
                if (this.accordian == true || (this.accordianView && this.accordianToggleble)) {
                    // display or collapse the panel
                    this.togglePanel($tab);

                    e.stopPropagation();
                    return false;
                }

                return true;
            }
        case this.keys.left:
        case this.keys.up:
            {

                var thisObj = this;
                var $prevTab; // holds jQuery object of tab from previous pass
                var $newTab; // the new tab to switch to

                if (e.ctrlKey) {
                    // Ctrl+arrow moves focus from panel content to the open
                    // tab/accordian header.
                } else {
                    var curNdx = this.$tabs.index($tab);

                    if (curNdx == 0) {
                        // tab is the first one:
                        // set newTab to last tab
                        $newTab = this.$tabs.last();
                    } else {
                        // set newTab to previous
                        $newTab = this.$tabs.eq(curNdx - 1);
                    }

                    // switch to the new tab
                    this.switchTabs($tab, $newTab);
                }

                e.stopPropagation();
                return false;
            }
        case this.keys.right:
        case this.keys.down:
            {

                var thisObj = this;
                var foundTab = false; // set to true when current tab found in array
                var $newTab; // the new tab to switch to

                var curNdx = this.$tabs.index($tab);

                if (curNdx == this.$tabs.length - 1) {
                    // tab is the last one:
                    // set newTab to first tab
                    $newTab = this.$tabs.first();
                } else {
                    // set newTab to next tab
                    $newTab = this.$tabs.eq(curNdx + 1);
                }

                // switch to the new tab
                this.switchTabs($tab, $newTab);

                e.stopPropagation();
                return false;
            }
        case this.keys.home:
            {

                // switch to the first tab
                this.switchTabs($tab, this.$tabs.first());

                e.stopPropagation();
                return false;
            }
        case this.keys.end:
            {

                // switch to the last tab
                this.switchTabs($tab, this.$tabs.last());

                e.stopPropagation();
                return false;
            }
    }
} // end handleTabKeyDown()
tpanelacc.prototype.handleTabKeyPress = function ($tab, e) {

    if (e.altKey) {
        // do nothing
        return true;
    }

    switch (e.keyCode) {
        case this.keys.enter:
        case this.keys.space:
        case this.keys.left:
        case this.keys.up:
        case this.keys.right:
        case this.keys.down:
        case this.keys.home:
        case this.keys.end:
            {
                e.stopPropagation();
                return false;
            }
        case this.keys.pageup:
        case this.keys.pagedown:
            {

                // The tab keypress handler must consume pageup and pagedown
                // keypresses to prevent Firefox from switching tabs
                // on ctrl+pageup and ctrl+pagedown

                if (!e.ctrlKey) {
                    return true;
                }

                e.stopPropagation();
                return false;
            }
    }

    return true;

} // end handleTabKeyPress()
tpanelacc.prototype.handleTabClick = function ($tab, e) {

    // make clicked tab navigable
    $tab.attr('tabindex', '0').attr('aria-selected', 'true');

    // remove all tabs from the tab order and update their aria-selected attribute
    this.$tabs.not($tab).attr('tabindex', '-1').attr('aria-selected', 'false');

    // Expand the new panel
    this.togglePanel($tab);

    e.stopPropagation();
    return false;

} // end handleTabClick()
tpanelacc.prototype.handleTabFocus = function ($tab, e) {

    // Add the focus class to the tab
    $tab.addClass('focus');

    return true;

} // end handleTabFocus()
tpanelacc.prototype.handleTabBlur = function ($tab, e) {

    // Remove the focus class to the tab
    $tab.removeClass('focus');

    return true;

} // end handleTabBlur()
tpanelacc.prototype.handlePanelKeyDown = function ($panel, e) {

    if (e.altKey) {
        // do nothing
        return true;
    }

    switch (e.keyCode) {
        case this.keys.tab:
            {
                var $focusable = $panel.find(':focusable');
                var curNdx = $focusable.index($(e.target));
                var panelNdx = this.$panels.index($panel);
                var numPanels = this.$panels.length
                console.log('$focusable',$focusable);
                if (e.shiftKey) {
                    // if this is the first focusable item in the panel
                    // find the preceding expanded panel (if any) that has
                    // focusable items and set focus to the last one in that
                    // panel. If there is no preceding panel or no focusable items
                    // do not process.
                    if (curNdx == 0 && panelNdx > 0) {

                        // Iterate through previous panels until we find one that
                        // is expanded and has focusable elements
                        //
                        for (var ndx = panelNdx - 1; ndx >= 0; ndx--) {

                            var $prevPanel = this.$panels.eq(ndx);
                            var $prevTab = $('#' + $prevPanel.attr('aria-labelledby'));

                            // get the focusable items in the panel
                            $focusable.length = 0;
                            $focusable = $prevPanel.find(':focusable');

                            if ($focusable.length > 0) {
                                // there are focusable items in the panel.
                                // Set focus to the last item.
                                $focusable.last().focus();

                                // Reset the aria-selected state of the tabs
                                this.$tabs.attr('aria-selected', 'false');

                                // Set that associated tab's aria-selected state to true
                                $prevTab.attr('aria-selected', 'true');

                                e.stopPropagation;
                                return false;
                            }
                        }
                    }
                } else if (panelNdx < numPanels) {

                    // if this is the last focusable item in the panel
                    // find the nearest following expanded panel (if any) that has
                    // focusable items and set focus to the first one in that
                    // panel. If there is no preceding panel or no focusable items
                    // do not process.
                    if (curNdx == $focusable.length - 1) {

                        // Iterate through following panels until we find one that
                        // is expanded and has focusable elements
                        //
                        for (var ndx = panelNdx + 1; ndx < numPanels; ndx++) {

                            var $nextPanel = this.$panels.eq(ndx);
                            var $nextTab = $('#' + $nextPanel.attr('aria-labelledby'));

                            // get the focusable items in the panel
                            $focusable.length = 0;
                            $focusable = $nextPanel.find(':focusable');

                            if ($focusable.length > 0) {
                                // there are focusable items in the panel.
                                // Set focus to the first item.
                                $focusable.first().focus();

                                // Reset the aria-selected state of the tabs
                                this.$tabs.attr('aria-selected', 'false');

                                // Set that associated tab's aria-selected state to true
                                $nextTab.attr('aria-selected', 'true');

                                e.stopPropagation;
                                return false;
                            }
                        }
                    }
                }

                break;
            }
        case this.keys.left:
        case this.keys.up:
            {

                if (!e.ctrlKey) {
                    // do not process
                    return true;
                }

                // get the jQuery object of the tab
                var $tab = $('#' + $panel.attr('aria-labelledby'));

                // Move focus to the tab
                $tab.focus();

                e.stopPropagation();
                return false;
            }
        case this.keys.pageup:
            {

                var $newTab;

                if (!e.ctrlKey) {
                    // do not process
                    return true;
                }

                // get the jQuery object of the tab
                var $tab = this.$tabs.filter('[aria-selected="true"]');

                // get the index of the tab in the tab list
                var curNdx = this.$tabs.index($tab);

                if (curNdx == 0) {
                    // this is the first tab, set focus on the last one
                    $newTab = this.$tabs.last();
                } else {
                    // set focus on the previous tab
                    $newTab = this.$tabs.eq(curNdx - 1);
                }

                // switch to the new tab
                this.switchTabs($tab, $newTab);

                e.stopPropagation();
                e.preventDefault();
                return false;
            }
        case this.keys.pagedown:
            {

                var $newTab;

                if (!e.ctrlKey) {
                    // do not process
                    return true;
                }

                // get the jQuery object of the tab
                var $tab = $('#' + $panel.attr('aria-labelledby'));

                // get the index of the tab in the tab list
                var curNdx = this.$tabs.index($tab);

                if (curNdx == this.$tabs.length - 1) {
                    // this is the last tab, set focus on the first one
                    $newTab = this.$tabs.first();
                } else {
                    // set focus on the next tab
                    $newTab = this.$tabs.eq(curNdx + 1);
                }

                // switch to the new tab
                this.switchTabs($tab, $newTab);

                e.stopPropagation();
                e.preventDefault();
                return false;
            }
    }

    return true;

} // end handlePanelKeyDown()
tpanelacc.prototype.handlePanelKeyPress = function ($panel, e) {

    if (e.altKey) {
        // do nothing
        return true;
    }

    if (e.ctrlKey && (e.keyCode == this.keys.pageup || e.keyCode == this.keys.pagedown)) {
        e.stopPropagation();
        e.preventDefault();
        return false;
    }

    switch (e.keyCode) {
        case this.keys.esc:
            {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
    }

    return true;

} // end handlePanelKeyPress()
tpanelacc.prototype.handlePanelClick = function ($panel, e) {
    var $tab = $('#' + $panel.attr('aria-labelledby'));

    // make clicked panel's tab navigable
    $tab.attr('tabindex', '0').attr('aria-selected', 'true');

    // remove all tabs from the tab order and update their aria-selected attribute
    this.$tabs.not($tab).attr('tabindex', '-1').attr('aria-selected', 'false');

    return true;

} // end handlePanelClick()
//$.extend($.expr[':'], {
//    focusable: function (element) {
//        debugger;
//        var nodeName = element.nodeName.toLowerCase();
//        var tabIndex = $(element).attr('tabindex');
//
//        // the element and all of its ancestors must be visible
//        if (($(element)[(nodeName == 'area' ? 'parents' : 'closest')](':hidden').length) == true) {
//            return false;
//        }
//
//        // If tabindex is defined, its value must be greater than 0
//        if (!isNaN(tabIndex) && tabIndex > -1) {
//            return true;
//        }
//
//        // if the element is a standard form control, it must not be disabled
//        if (/input|select|textarea|button|object/.test(nodeName) == true) {
//
//            return !element.disabled;
//        }
//
//        // if the element is a link, href must be defined
//        if ((nodeName == 'a' || nodeName == 'area') == true) {
//
//            return (element.href.length > 0);
//        }
//
//        // this is some other page element that is not normally focusable.
//        return false;
//    }
//});

$.fn.extend({
    triggerAll: function (events, params) {
        var el = this, i, evts = events.split(' ');
        for (i = 0; i < evts.length; i += 1) {
            el.trigger(evts[i], params);
        }
        return el;
    }
});
if (jQuery && jQuery.bridget) {
    jQuery.bridget('tpanelacc', tpanelacc);
}


/*! jQuery UI - v1.12.1 - 2017-04-26
* http://jqueryui.com
* Includes: focusable.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

(function( factory ) {
    if ( typeof define === "function" && define.amd ) {

        // AMD. Register as an anonymous module.
        define([ "jquery" ], factory );
    } else {

        // Browser globals
        factory( jQuery );
    }
}(function( $ ) {

    $.ui = $.ui || {};

    var version = $.ui.version = "1.12.1";


    /*!
 * jQuery UI Focusable 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

    //>>label: :focusable Selector
    //>>group: Core
    //>>description: Selects elements which can be focused.
    //>>docs: http://api.jqueryui.com/focusable-selector/



    // Selectors
    $.ui.focusable = function( element, hasTabindex ) {
        var map, mapName, img, focusableIfVisible, fieldset,
            nodeName = element.nodeName.toLowerCase();

        if ( "area" === nodeName ) {
            map = element.parentNode;
            mapName = map.name;
            if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
                return false;
            }
            img = $( "img[usemap='#" + mapName + "']" );
            return img.length > 0 && img.is( ":visible" );
        }

        if ( /^(input|select|textarea|button|object)$/.test( nodeName ) ) {
            focusableIfVisible = !element.disabled;

            if ( focusableIfVisible ) {

                // Form controls within a disabled fieldset are disabled.
                // However, controls within the fieldset's legend do not get disabled.
                // Since controls generally aren't placed inside legends, we skip
                // this portion of the check.
                fieldset = $( element ).closest( "fieldset" )[ 0 ];
                if ( fieldset ) {
                    focusableIfVisible = !fieldset.disabled;
                }
            }
        } else if ( "a" === nodeName ) {
            focusableIfVisible = element.href || hasTabindex;
        } else {
            focusableIfVisible = hasTabindex;
        }

        return focusableIfVisible && $( element ).is( ":visible" ) && visible( $( element ) );
    };

    // Support: IE 8 only
    // IE 8 doesn't resolve inherit to visible/hidden for computed values
    function visible( element ) {
        var visibility = element.css( "visibility" );
        while ( visibility === "inherit" ) {
            element = element.parent();
            visibility = element.css( "visibility" );
        }
        return visibility !== "hidden";
    }

    $.extend( $.expr[ ":" ], {
        focusable: function( element ) {
            return $.ui.focusable( element, $.attr( element, "tabindex" ) != null );
        }
    } );

    var focusable = $.ui.focusable;




}));
