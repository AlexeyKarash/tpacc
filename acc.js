// 
// keyCodes() is an object to contain keycodes needed for the application 
// 
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

// 
// tabpanel() is a class constructor to create a ARIA-enabled tab panel widget. 
// 
// @param (id string) id is the id of the div containing the tab panel. 
// 
// @param (accordian boolean) accordian is true if the tab panel should operate 
//         as an accordian; false if a tab panel 
// 
// @return N/A 
// 
// Usage: Requires a div container and children as follows: 
// 
//         1. tabs/accordian headers have class 'tab' 
// 
//         2. panels are divs with class 'panel' 
// 
var defaults = {
    accordian: false,
    multiselectable: true,
    tabClass: 'tab',
    panelClass: 'panel',
    accordianImgIcon: {
        expanded: "expanded.gif",
        collapsed: "contracted.gif"
    },
    accordianImgAlt: {
        collapsed: "collapsed",
        expanded: "expanded"
    },
    accordianToggleElm: 'h3'
};
var counter = 0;
//settings;
function tabpanel(id, options) {
    this.settings = $.extend({}, defaults, options);
    // define the class properties 
    this.panel_id = id; // store the id of the containing div 
    this.accordianView = this.settings.accordian; // true if this is an accordian control 
    this.$panel = $(id); // store the jQuery object for the panel 
    this.accordian = this.settings.multiselectable; //(this.$panel.attr("multiselectable") === "true"); // true if this is an accordian control 
    this.keys = new keyCodes(); // keycodes needed for event handlers 
    this.$panels = this.$panel.children('.' + this.settings.panelClass); // Array of panel. 
    this.createLayout();
    console.log('bbb');
    this.$tabs = this.$panel.find('.' + this.settings.tabClass); // Array of panel tabs. 
    // Bind event handlers 
    this.bindHandlers();

    // Initialize the tab panel 
    this._init();
    console.log(this.settings );
    counter++;
    

} // end tabpanel() constructor 

// 
// Function init() is a member function to initialize the tab/accordian panel. Hides all panels. If a tab's 
// aria-selected attribute is true, makes that panel visible; otherwise, makes first panel visible. 
// 
// @return N/A 
// 
tabpanel.prototype.createLayout = function () {
    this.accordianView ? this.accordianLayout() : this.tabpanelLayout();
}
tabpanel.prototype.tabpanelLayout = function () {
    var tabsTitles = [];
    this.$panels.each(function (idx, elm) {
        $(elm).attr({
            'role': 'tabpanel',
            'id': 'tp' + counter + '-panel' + idx,
            'aria-labelledby': 'tp' + counter + '-tab' + idx
        });
        tabsTitles[idx] = $(elm).data('tab-toggle');
    });
    this.$panel.prepend('<ul class="tablist" role="tablist"></ul>');
    var tablist = this.$panel.find('.tablist');
    for (i = 0; i < this.$panels.length; i++) {
        tablist.append('<li id="tp' + counter + '-tab' + i + '" class="' + this.settings.tabClass + '" aria-controls="tp' + counter + '-panel' + i + '" aria-selected="' + ((i == 0) ? 'true' : 'false') + '" role="tab" tabindex="' + ((i == 0) ? '0' : '-1') + '">' + tabsTitles[i] + '</li>');
    }
    //this.$tabs = this.$panel.find('.'+settings.tabClass); // Array of panel tabs. 
    //console.log(this.$tabs);
}
tabpanel.prototype.accordianLayout = function () {
    //var tabsTitles = [];
    var set = this.settings;
    this.$panels.each(function (idx, elm) {
        $(elm).attr({
            'role': 'tabpanel',
            'id': 'tp' + counter + '-panel' + idx,
            'aria-labelledby': 'tp' + counter + '-tab' + idx,
            'aria-hidden': ((idx == 0) ? 'false' : 'true')
        }).addClass('accordian');
        //tabsTitles[idx] = $(elm).data('tab-toggle');
        $(elm).before('<' + set.accordianToggleElm + ' id="tp' + counter + '-tab' + idx + '" class="accordian ' + set.tabClass + '" aria-controls="tp' + counter + '-panel' + idx + '" aria-selected="' + ((idx == 0) ? 'true' : 'false') + '" role="tab" tabindex="' + ((idx == 0) ? '0' : '-1') + '"><img src="' + ((idx == 0) ? set.accordianImgIcon.expanded : set.accordianImgIcon.collapsed) + '" alt="' + ((idx == 0) ? set.accordianImgAlt.expanded : set.accordianImgAlt.collapsed) + '" />' + $(elm).data('tab-toggle') + '</' + set.accordianToggleElm + '>');
    });
    this.$panel.addClass("tablist").attr({
        "role": "tablist",
        "multiselectable": this.settings.multiselectable
    });
    //	for(i= 0; i < this.$panels.length;i++){
    //		
    //	}
}
tabpanel.prototype._init =
tabpanel.prototype.init = function () {
    var $tab; // the selected tab - if one is selected 

    // add aria attributes to the panels 
    this.$panels.attr('aria-hidden', 'true');

    // get the selected tab 
    $tab = this.$tabs.filter('[aria-selected="true"]');

    if ($tab == undefined) {
        $tab = this.$tabs.first();
    }

    // show the panel that the selected tab controls and set aria-hidden to false 
    this.$panel.find('#' + $tab.attr('aria-controls')).attr('aria-hidden', 'false');

    console.log(" inst "+counter);
    console.log(this.settings);
} // end init() 

// 
// Function switchTabs() is a member function to give focus to a new tab or accordian header. 
// If it's a tab panel, the currently displayed panel is hidden and the panel associated with the new tab 
// is displayed. 
// 
// @param ($curTab obj) $curTab is the jQuery object of the currently selected tab 
// 
// @param ($newTab obj) $newTab is the jQuery object of new tab to switch to 
// 
// @return N/A 
// 
tabpanel.prototype.switchTabs = function ($curTab, $newTab) {
        console.log('aaa');
        // Remove the highlighting from the current tab 
        $curTab.removeClass('focus');

        // remove tab from the tab order and update its aria-selected attribute 
        $curTab.attr('tabindex', '-1').attr('aria-selected', 'false');


        // Highlight the new tab and update its aria-selected attribute 
        $newTab.attr('aria-selected', 'true');

        // If activating new tab/panel, swap the displayed panels 
        if (this.accordian == false) {
            // hide the current tab panel and set aria-hidden to true 
            this.$panel.find('#' + $curTab.attr('aria-controls')).attr('aria-hidden', 'true');

            // update the aria-expanded attribute for the old tab 
            $curTab.attr('aria-expanded', 'false');

            // show the new tab panel and set aria-hidden to false 
            this.$panel.find('#' + $newTab.attr('aria-controls')).attr('aria-hidden', 'false');

            // update the aria-expanded attribute for the new tab 
            $newTab.attr('aria-expanded', 'true');
            if(this.accordianView == true){

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

// 
// Function togglePanel() is a member function to display or hide the panel 
// associated with an accordian header. Function also binds a keydown handler to the focusable items 
// in the panel when expanding and unbinds the handlers when collapsing. 
// 
// @param ($tab obj) $tab is the jQuery object of the currently selected tab 
// 
// @return N/A 
// 
tabpanel.prototype.togglePanel = function ($tab) {
        $panel = this.$panel.find('#' + $tab.attr('aria-controls'));
        if (this.accordian == true && this.accordianView == true) {
            if ($panel.attr('aria-hidden') == 'true') {
                console.log('aa' + $tab);
                $panel.attr('aria-hidden', 'false');
                $tab.find('img').attr('src', this.settings.accordianImgIcon.expanded).attr('alt', this.settings.accordianImgAlt.expanded);

                // update the aria-expanded attribute 
                $tab.attr('aria-expanded', 'true');
            } else {
                $panel.attr('aria-hidden', 'true');
                $panel.slideUp(100);
                $tab.find('img').attr('src', this.settings.accordianImgIcon.collapsed).attr('alt', this.settings.accordianImgAlt.collapsed);

                // update the aria-expanded attribute 
                $tab.attr('aria-expanded', 'false');
            }
        } else {
            //            if(this.accordianView == true){
            //                if ($panel.attr('aria-hidden') == 'true') {
            //                    $tab.find('img').attr('src', this.settings.accordianImgIcon.expanded).attr('alt', this.settings.accordianImgAlt.expanded);//'expanded' - 'http://www.oaa-accessibility.org/media/examples/images/expanded.gif'
            //                } else {
            //                    $tab.find('img').attr('src', this.settings.accordianImgIcon.collapsed).attr('alt', this.settings.accordianImgAlt.collapsed);//'collapsed' - 'http://www.oaa-accessibility.org/media/examples/images/contracted.gif'
            //                }
            //            }

            this.$panels.attr('aria-hidden', 'true');

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
                this.$tabs.find('img').attr('src', this.settings.accordianImgIcon.collapsed)
                    .attr('alt', this.settings.accordianImgAlt.collapsed); //'collapsed' - 'http://www.oaa-accessibility.org/media/examples/images/contracted.gif'

                // Update the selected tab's aria-selected attribute 
                $tab.find('img').attr('src', this.settings.accordianImgIcon.expanded)
                    .attr('alt', this.settings.accordianImgAlt.expanded); //'expanded' - 'http://www.oaa-accessibility.org/media/examples/images/expanded.gif' 
            }
            // show the clicked tab panel 
            this.$panel.find('#' + $tab.attr('aria-controls')).attr('aria-hidden', 'false');

            // make clicked tab navigable 
            $tab.attr('tabindex', '0');

            // give the tab focus 
            $tab.focus();

        }

    } // end togglePanel() 

// 
// Function bindHandlers() is a member function to bind event handlers for the tabs 
// 
// @return N/A 
// 
tabpanel.prototype.bindHandlers = function () {
        console.log('aaa');
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

// 
// Function handleTabKeyDown() is a member function to process keydown events for a tab 
// 
// @param ($tab obj) $tab is the jquery object of the tab being processed 
// 
// @paran (e obj) e is the associated event object 
// 
// @return (boolean) Returns true if propagating; false if consuming event 
// 
tabpanel.prototype.handleTabKeyDown = function ($tab, e) {

        if (e.altKey) {
            // do nothing 
            return true;
        }

        switch (e.keyCode) {
        case this.keys.enter:
        case this.keys.space:
            {

                // Only process if this is an accordian widget 
                if (this.accordian == true) {
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

// 
// Function handleTabKeyPress() is a member function to process keypress events for a tab. 
// 
// 
// @param ($tab obj) $tab is the jquery object of the tab being processed 
// 
// @paran (e obj) e is the associated event object 
// 
// @return (boolean) Returns true if propagating; false if consuming event 
// 
tabpanel.prototype.handleTabKeyPress = function ($tab, e) {

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

// 
// Function handleTabClick() is a member function to process click events for tabs 
// 
// @param ($tab object) $tab is the jQuery object of the tab being processed 
// 
// @paran (e object) e is the associated event object 
// 
// @return (boolean) returns false 
// 
tabpanel.prototype.handleTabClick = function ($tab, e) {

        // make clicked tab navigable 
        $tab.attr('tabindex', '0').attr('aria-selected', 'true');

        // remove all tabs from the tab order and update their aria-selected attribute 
        this.$tabs.not($tab).attr('tabindex', '-1').attr('aria-selected', 'false');

        // Expand the new panel 
        this.togglePanel($tab);

        e.stopPropagation();
        return false;

    } // end handleTabClick() 

// 
// Function handleTabFocus() is a member function to process focus events for tabs 
// 
// @param ($tab object) $tab is the jQuery object of the tab being processed 
// 
// @paran (e object) e is the associated event object 
// 
// @return (boolean) returns true 
// 
tabpanel.prototype.handleTabFocus = function ($tab, e) {

        // Add the focus class to the tab 
        $tab.addClass('focus');

        return true;

    } // end handleTabFocus() 

// 
// Function handleTabBlur() is a member function to process blur events for tabs 
// 
// @param ($tab object) $tab is the jQuery object of the tab being processed 
// 
// @paran (e object) e is the associated event object 
// 
// @return (boolean) returns true 
// 
tabpanel.prototype.handleTabBlur = function ($tab, e) {

        // Remove the focus class to the tab 
        $tab.removeClass('focus');

        return true;

    } // end handleTabBlur() 


///////////////////////////////////////////////////////// 
// Panel Event handlers 
// 

// 
// Function handlePanelKeyDown() is a member function to process keydown events for a panel 
// 
// @param ($panel obj) $panel is the jquery object of the panel being processed 
// 
// @paran (e obj) e is the associated event object 
// 
// @return (boolean) Returns true if propagating; false if consuming event 
// 
tabpanel.prototype.handlePanelKeyDown = function ($panel, e) {

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

// 
// Function handlePanelKeyPress() is a member function to process keypress events for a panel 
// 
// @param ($panel obj) $panel is the jquery object of the panel being processed 
// 
// @paran (e obj) e is the associated event object 
// 
// @return (boolean) Returns true if propagating; false if consuming event 
// 
tabpanel.prototype.handlePanelKeyPress = function ($panel, e) {

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

// 
// Function handlePanelClick() is a member function to process click events for panels 
// 
// @param ($panel object) $panel is the jQuery object of the panel being processed 
// 
// @param (e object) e is the associated event object 
// 
// @return (boolean) returns true 
// 
tabpanel.prototype.handlePanelClick = function ($panel, e) {
        var $tab = $('#' + $panel.attr('aria-labelledby'));

        // make clicked panel's tab navigable 
        $tab.attr('tabindex', '0').attr('aria-selected', 'true');

        // remove all tabs from the tab order and update their aria-selected attribute 
        this.$tabs.not($tab).attr('tabindex', '-1').attr('aria-selected', 'false');

        return true;

    } // end handlePanelClick() 

// focusable is a small jQuery extension to add a :focusable selector. It is used to 
// get a list of all focusable elements in a panel. Credit to ajpiano on the jQuery forums. 
// 
$.extend($.expr[':'], {
    focusable: function (element) {
        var nodeName = element.nodeName.toLowerCase();
        var tabIndex = $(element).attr('tabindex');

        // the element and all of its ancestors must be visible 
        if (($(element)[(nodeName == 'area' ? 'parents' : 'closest')](':hidden').length) == true) {
            return false;
        }

        // If tabindex is defined, its value must be greater than 0 
        if (!isNaN(tabIndex) && tabIndex < 0) {
            return false;
        }

        // if the element is a standard form control, it must not be disabled 
        if (/input|select|textarea|button|object/.test(nodeName) == true) {

            return !element.disabled;
        }

        // if the element is a link, href must be defined 
        if ((nodeName == 'a' || nodeName == 'area') == true) {

            return (element.href.length > 0);
        }

        // this is some other page element that is not normally focusable. 
        return false;
    }
});
if (jQuery && jQuery.bridget) {
    jQuery.bridget('tabpanel', tabpanel);
}