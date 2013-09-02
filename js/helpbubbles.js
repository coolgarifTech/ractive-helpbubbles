/** Ractive-HelpBubbles - v0.1 - 2013-09-02
* Helpful page-hints using Ractive.js

* https://github.com/coolgarifTech/ractive-helpbubbles
* Author: James Billot, Coolgarif Tech Ltd.
* Copyright (c) 2013 Coolgarif Tech Ltd;
* @license Licensed MIT */

(function ( global ) {

    "use strict";

    var HelpBubbles,
        template,

        VERSION = '0.1';

    // cross-browser top/left offset position of DOM element
    function offset( element ){
        var body = document.body,
            win = document.defaultView,
            docElem = document.documentElement,
            box = document.createElement( 'div' );
        box.style.paddingLeft = box.style.width = "1px";
        body.appendChild( box );
        var isBoxModel = box.offsetWidth == 2;
        body.removeChild( box );
        box = element.getBoundingClientRect();
        var clientTop  = docElem.clientTop  || body.clientTop  || 0,
            clientLeft = docElem.clientLeft || body.clientLeft || 0,
            scrollTop  = win.pageYOffset || isBoxModel && docElem.scrollTop  || body.scrollTop,
            scrollLeft = win.pageXOffset || isBoxModel && docElem.scrollLeft || body.scrollLeft;
        return {
            top : box.top  + scrollTop  - clientTop,
            left: box.left + scrollLeft - clientLeft
        };
    }

    function centrePointElement( element ) {
        var o = offset( element );
        o.centre_x = o.left + ( element.offsetWidth / 2 );
        o.centre_y = o.top + ( element.offsetHeight / 2 );
        return o;
    }

    function centrePointSVGElement( element ) {
        var o = offset( element );
        var d = element.getBBox();
        o.centre_x = o.left + ( d.width / 2 );
        o.centre_y = o.top + ( d.height / 2 );
        return o;
    }

    function centrePoint( element ) {
        return element instanceof SVGElement ? centrePointSVGElement( element ) : centrePointElement( element );
    }


    template = "\
        {{#can_show}}\
        {{#current_bubble}}\
        <div class=\"help-bubble{{#reversed}}--reversed{{/reversed}}\" style=\"top:{{ y + y_adjustment }}px;{{#reversed}}right{{/reversed}}{{^reversed}}left{{/reversed}}:{{ x + x_adjustment }}px;\" on-tap=\"bubbletap\"><p class=\"help-bubble__content\">{{ content }}</p></div>\
        {{/current_bubble}}\
        {{/can_show}}\
    ";


    HelpBubbles = Ractive.extend({
        template: template,

        data: {
            // array of data speccing individual 'bubbles' in the order in which they
            // should be displayed
            bubbles: [
              /*{
                    target:   '',    // id of dom element to target this bubble at
                    content:  '',    // text to fill the bubble with
                    pause:    0,     // Optional secs to pause before displaying this help bubble
                    reversed: false, // Optional, display bubble in 'reversed' form.. hook for styling
                    onTap:    function() { console.log('Bubble-tapped'); } // Optional fn to fire when bubble clicked
                }*/
            ],

            days_to_remember_cookie: 10,    // num days to remember if user has already viewd help bubbles

            x_adjustment:            0,     // distance to adjust bubbles left/right
            y_adjustment:            0,     // distance to adjust bubbles up/down

            // for internal use
            can_show:                true,  // flag used to determine display of help bubbles - set in init()
            current_bubble:          false, // holds details for bubble currently being displayed

        },

        nextBubble: null, // container for fn to iterate through bubbles

        // initialise HelpBubbles
        init: function init() {
            var self = this,
                observe_functions = {},
                resizeHandler;

            /* OBSERVE DATA CHANGES */

            observe_functions.bubbles = function observeBubbles( bubbles ) {
                this.doBubbles();
            };
/*
            observe_functions.current_bubble = function observeCurrentBubbles( current_bubble ) {
                //
            };

            observe_functions.width = function observeWidth( width ) {
                //
            };
*/
            // apply data-change functions to the Ractive object
            this.observe( observe_functions, { init: false } );


            /* EVENT HANDLERS */

            this.on( 'bubbletap', function( event ) {
                // fire any events associated with previous bubble
                this.data.current_bubble.onTap();
                // ..move onto next bubble
                this.nextBubble();
            } );


            /* CONTAINER RESIZING */

            // when the window resizes, need to resize graph elements
            window.addEventListener( 'resize', resizeHandler = function () {
              self.resize();
            });

            // clean up after ourselves later
            this.on( 'teardown', function () {
              window.removeEventListener( 'resize', resizeHandler );
            });

            // manually call this.resize() the first time
            this.resize();


            /* OTHER INITIALISATION */

            this.set( 'can_show', !this.cookieExists() );

            // Don't show Help
            if( !this.data.can_show ) {
                return;
            }

            // Do show Help
            // ..set cookie so don't show next time
            this.setCookie( this.data.days_to_remember_cookie );

            // ..initialise 1st bubble
            this.doBubbles();
        },


        // generate data required to display an individual bubble
        bubbleDisplayData: function bubbleDisplayData( bubble ) {
            var positions = centrePoint( document.getElementById( bubble.target ) );

            var data = {
                content:  bubble.content,
                onTap:    ( bubble[ 'onTap' ] === undefined ) ? function noop(){} : bubble.onTap,  // no-op, or passed-in fn
                x:        positions.centre_x,
                y:        positions.centre_y
            };

            if( bubble.reversed ) {
                data.reversed = true;
                data.x = document.body.offsetWidth - data.x;  // recalculating postion relative to right hand side of page
            }

            return data;
        },

        // return a function providing processed bubbles in order every time called
        bubbleIterator: function bubbleIterator( bubbles ) {
            var self       = this,
                my_bubbles = _.cloneDeep( bubbles );

             return function nextBubble() {
                // no more bubbles? Just return false so previous bubble disappears
                if( my_bubbles.length < 1 ) return self.set( 'current_bubble', false );

                // get data required to display next bubble
                var raw_next_bubble = my_bubbles.shift();

                // ..if requires a pause..
                if( raw_next_bubble[ 'pause' ] ) {

                    // ..set next bubble to display after pause
                    var t = window.setTimeout( function() {
                        self.set( 'current_bubble', self.bubbleDisplayData( raw_next_bubble ) );
                        window.clearTimeout( t );
                    }, raw_next_bubble.pause * 1000 );

                    // ..in the meantime return false so previous bubble disappears
                    self.set( 'current_bubble', false );

                    return;
                }

                // ..doesn't require a pause, just show next bubble
                self.set( 'current_bubble', self.bubbleDisplayData( raw_next_bubble ) );
             };
        },

        // true if we find our cookie
        cookieExists: function cookieExists() {
            return ( document.cookie.search(/(^|;)helpbubblesseen=/) > -1 );
        },

        // initialise bubbles and start with 1st one
        doBubbles: function doBubbles() {
            // overwrite can_show flag in case called via user clicking on a help button
            this.set( 'can_show', true );
            this.nextBubble = this.bubbleIterator( this.data.bubbles );
            this.nextBubble();
        },

        // reset graph height/width vars based on resizing of client
        resize: function resize() {
            var width, height;

            width  = this.el.clientWidth;
            height = this.el.clientHeight;

            this.set({
              width:  width,
              height: height
            });
        },

        // set our cookie for `days`
        setCookie: function setCookie( days ) { /*  // DEBUG!
            console.log( 'DEBUG! Not setting cookie.. Turn me off: HelpBubbles.setCookie()' );
            return; /*/                             // LIVE!
            document.cookie = "helpbubblesseen=true;max-age=" + 86400 * days; // days worth of secs * days */
        }

    });

    HelpBubbles.VERSION = VERSION;

    global.HelpBubbles = HelpBubbles;

})( typeof window !== 'undefined' ? window : this );
