# Ractive-HelpBubbles

Helpful page-hints using [Ractive.js](http://www.ractivejs.org/).

_By [Coolgarif Tech](http://www.coolgarif.com/brain-food/boris-board), as used in [Boris Board](http://www.borisboard.com/)_.

## So what is it?

[A white-hole](https://www.youtube.com/watch?v=TxWN8AhNER0). The first time your user views the page, attach little explanatory text-labels to page elements that display one after the other, requiring a click to dismiss.

We needed it to guide people through our tongue-in-cheek dashboard: [Boris Board](http://www.borisboard.com/).

## When would I use this?

When you've got a UI that requires a little bit of guidance or explanation.

## How?

Like any Ractive element you need a DOM element in your HTML to act as a container:
```
<div id="helpbubble_holder"></div>
```

..then a little bit of boilerplate in your javascript to instantiate the HelpBubbles:
```
var help_bubbles = new window.HelpBubbles({
    el: 'helpbubble_holder',

    data: {

        bubbles: [
            // ...
        ]

    }
});
```

The <code>bubbles</code> array inside the <code>data</code> object is where you declare each bubble in turn. Each bubble declaration is a literal object with the following keys/values:
```
{
    target:   'id_of_DOM_el',
    content:  'Text to appear in bubble',
    pause:    3,                // Optional - seconds to pause before displaying bubble
    reversed: true,             // Optional - display bubble right-aligned with center of target element
    onTap: function() {         // Optional
        console.log( 'fn to carry out when this bubble clicked/tapped' );
    }
},
```

Here's an example of multiple help bubbles taken directly from our Boris Board implementation:
```
// Help Bubbles
help_bubbles = new window.HelpBubbles({
    el: 'helpbubble_holder',

    data: {

        y_adjustment: 20,

        bubbles: [
            {
                target:  'slider__pointer',
                content: 'Slide this to change year..',
                onTap:   function() { console.log( 'Slider Bubble-tapped' ); }
            },
            {
                target:  'enfield',
                content: 'Click to choose a borough..',
                onTap:   function() { boroughChosen( 'enfield' ); },
            },
            {
                target:   'london-button',
                content:  'Click to return..',
                pause:    0.6,
                reversed: true,
                onTap:    function() { noBoroughChosen(); }
            },
            {
                target:  'treeIcon',
                content: 'Click for other graphs..',
                pause:   0.6,
                onTap:   function() { getGraphTypeClickFn( graph_types, 'tree' )(); }
            }
        ]

    }
});
```

## When is it displayed?

The help bubbles are displayed the first time a user views your page. A cookie is then set to prevent it from being shown again.

If you would like your users to be able to view the help bubbles again you can create a help button that calls the <code>doBubbles()</code> function - this will show the bubbles regardless of the presence of the cookie. Here's a quick example from our code:
```
// Clicking on help-button
id( 'help-button' ).onclick = function() {
    // show help bubbles from beginning again
    help_bubbles.doBubbles();
};
```

## Other parameter you can adjust

You can pass-in a couple of other parameters to the <code>data</code> object:
```
data: {

    bubbles: [
      // ...
    ],

    days_to_remember_cookie: 10,    // num days to remember if user has already viewd help bubbles

    x_adjustment:            0,     // distance in px to adjust bubbles left/right relative to target
    y_adjustment:            0,     // distance in px to adjust bubbles up/down relative to target

}
```

## CSS styling hooks

You can style the help bubbles as you please. An example CSS styling is available in **[/css/helpbubbles.css](https://github.com/coolgarifTech/ractive-helpbubbles/blob/master/css/helpbubbles.css)**. In pseudo-BEM style you have the following hooks for styling the bubbles:
```
.help-bubble, .help-bubble--reversed {
    .help-bubble__content {}
}
```

In the example I have styled the help bubble arrows using the <code>:before</code> psuedo elements.


## Dependencies

#### JS Libs:

- Ractive.js [http://www.ractivejs.org/](http://www.ractivejs.org/) - for DOM manipulation
- Lodash.js [http://lodash.com/](http://lodash.com/) - utility functional lib

## Browser Support

_Should_ work on all 'modern' browsers and IE8+.

## License

Released under the MIT License.

Have at it!

## Us

[@coolgarif](https://twitter.com/coolgarif)
[www.coolgarif.com](http://www.coolgarif.com/)
