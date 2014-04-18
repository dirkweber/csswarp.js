# csswarp.js: "warp" HTML text around an arbitrary path.
----------

csswarp.js is a small (<8kb minified unzipped) javascript library for warping any HTML text around an arbitrary path.  Text will look as if it were created with Illustrator's attach-to-path tool. Anyway it is pure HTML text that can be styled with CSS, copied and crawled. csswarp works standalone and does not rely on jQuery or another library (a jQuery plugin is in the works though). csswarp.js offers an extensive number of settings to adjust text warping. Right now it will work in every modern browser that supports css3 transforms. Support for IE versions <9 is planned for a future release.

## How does it work?

The script parses the DOM for nodes that should be warped. It then will transform every letter with CSS3 transfoms, giving the illusion of text following an imaginary path.

## How to use csswarp.js:

Put a reference to the script into the head or to the end of your HTML doc.
Create a configuration object. This object will contain a list of the nodes you want to warp and some settings with info about kerning, indent, alignment and more. Make sure that the font has been completely loaded, then call the script with said object as an argument.

## Configuring csswarp.js:

In order to configure a warp, you will need to define a configuration object first. Below is a listing of all properties, some are required, most are optional.

    var myWarp = {  
    				path		: <Object> | <Array>,  
            		targets		: <Array>,		  	
            		rotationMode: "rotate" | "skew" | "none",   
            		indent		: <length>,	  					
            		showPath	: {thickness: <number>, color: <string>}, 
            		fixShadow	: <boolean>,
            		css			: <string>,  				
            		callback	: <function object>  
    }

In a second step you will call the cssWarp() function and pass "myWarp" as an argument:

    cssWarp(myWarp);

It is possible to have as many warp objects as you need.

	cssWarp(myWarp, anotherWarp);

### path (required):

Required. Either a javascript object that defines circle properties (see below "warp around a circle") or an array containing the coordinates of bezier control points (see below "warp around a bezier curve") must be assigned. If this property is missing or wrongly formatted, cswarp will throw an error.

### targets (required):

Required. An array with strings containing the names of one or more dom objects. The name of html tags, classnames or IDs can be provided. 

### rotationMode (optional):

This property defines the way text will be distorted along a path. Default value is "rotate". If you want your text to be skewed vertically choose "skew". For text that stays undistorted and follows the path stepwise, use "none" (in this case setting fixShadow to "false" is a good idea). 

### indent (optional):

Optional. A text-indent, e.g. "2cm". px, em, ex, gd, rem, vw, vh, vm, mm, cm, in, pt, ch, pc are allowed units.

### align (optional): 

Left, centered or right alignment of text, optional value. 

#### aligning text on bezier curves:
"Left" is default. When set to "right", text will be aligned to the end of the curve. "Center" on beziers is not possible and will fall back to "left".

#### aligning text on circles:
"center" is default value.
The "angle" property defines the reference point our text is aligned to. Let's say "angle" was defined as "0deg". "left" will result in a text that starts at 12:00 clockwise around the circle, "right" will result in a text that *ends* at 12:00. "center" means the text will stretch equally to the left and right of 12:00.

### showPath (optional):

Optional (default: "false"). This will display the path. Its main purpose is development and debugging. A javascript object with properties for thickness and color are accepted, e.g.:

    showPath : {  
    				color		: "red",  
            		thickness	: 3  
    }

### fixShadow (optional):

Optional boolean value, default is "true". If set to "false", shadows of rotated elements will be rotated with every letter. The shadow will not be calculated according to a "global" lightsource anymore. Most of the time you will want fixshadow to be true, but when using stepwise alignment it is propably a good idea to set it to "false".

### css (optional):

Optional. A custom css that will appear after warping. This gives you better control over the appearance in case no warping took place, e.g. because the browser did not support transforms or javascript was disabled. It is recommended to configure a width and a height here (if there aren't any width and height attributes within the stylesheet for this block element). Check the examples without the script to see the difference.

### callback (optional):

Optional, a callback function that will be executed after warping.

## Configuring a warp around a circle:

Let's say we want to warp text around a circle. In this case we will define a cirle object and assign it to the "path" property of our configuration-object:

    path: {  
    		radius: <number>,  
            center: <array>,  
            angle : <string>,  
            align: "center" | "left" | "right",  
            textPosition: "outside" | "inside"  
    }

### radius (required for circle):

Required. A number containing the px value for the circle radius must be provided.

### center (optional):

Optional. An array containing numbers for the x and y position of the center, e.g.[120, 230]. If no value is provided here the circle will be centered horizontally and vertically.

### angle (optional):

Optional. A string containing the value for the rotation-angle in degree or radian, e.g. "0.65rad" or "45deg". The rotation is executed clockwise with 0deg at 12:00. Default value is "0rad".

### textPosition (optional):

Optional. Define wether text will be aligned to the inside or the outside of the circle. Default value is "outside".

## Configuring a warp around a bezier curve:

In this case an array representing the path must be assigned to the "path" property. The array will be formatted according the HTML5 canvas  "moveTo" and "bezierCurveTo"- commands: 

- a canvas:

    ctx.moveTo(73, 400);  
    ctx.bezierCurveTo(105, 370, 196, 314, 276, 359),  
    ctx.bezierCurveTo(342, 397, 398, 375, 424, 327)

- must be formatted as

    path : [[73, 400],  
    		[105, 370, 196, 314, 276, 359],  
    		[342, 397, 398, 375, 424, 327]]  

### Creating a bezier curve for csswarp.js with Illustrator:

- If you haven't already done so, download and install the Illustrator Ai2Canvas plugin from here: http://visitmix.com/labs/ai2canvas/

Draw your path in Illustrator and export it as "canvas".
Open the exported html in an editor, look for the canvas-commands and copy the values into an array as described above.

### Creating a bezier curve for csswarp.js with Inkscape:

- Install the Ink3Canvas extension for Inkscape: https://github.com/karlisson/Ink2canvas. Draw the bezier in Inkscape and save as "HTML5 output". Open the saved file in an editor, look for the canvas-commands and copy the values into an array as described above.

### More configuraton options: 

These properties are optional and can be added to the configuration object:

#### bezAccuracy (optional, bezier only): 

Defines the accuracy of text metrics on a bezier curve. If kerning looks bad than decreasing this number can help. Default value is 0.004. Rule of thumb: the smaller the text, the smaller this number should be. If n = estimated number of letters, the value should be equal or below 1/n.

Be cautious: a smaller value means more computations so text needs more time for rendering.

#### revertBezier  (optional, bezier only): 

Well, reverts the direction of a bezier.

## Prefenting FOUT (flash of unstyled text)

Before text will be warped all fonts must be loaded and then all the text metrics must be calculated. In the meantime text will appear unstyled and unwarped on the page. This can be very annoying, especially when warping takes a long time because of heavy font data, or complicated curves and/or long text (check "samsa.html" from the demos to see the effect in action).

To prevent the FOUT, hide the warptext in your css with visibility:hidden.
Add "visibility:visible;" to your warps config object "css" property. Now text will not appear on the page, unless the font is loaded and warping complete. 

To prevent browsers without javascript from hiding your text, put 

	<noscript>
        	<style>
        		.mywarp{visibility: visible;}
        	</style>
        </noscript>

somewhere on the page.

## Setting up right to left text

CSSWarp will look for the "direction" property in the CSS. When set to "rtl", text will warp reverted ("unicode-bidi" is not relevant). Lik all CSS properties, "direction" can be overridden for warped text in the custom css.

## Some notes:

Bezier calculations can be computationally expensive. Avoid long texts. Paths should be as simple as possible, with only as much segments as absolutely needed.

## New in v0.7.0:
- browser detection for IE 11 fixed.

## New in v0.6.0:
- right to left text (rtl) support.
- right text alignment on bezier curves. "align" is now a global property and no longer declared within the circle element.
- bug calculating the angle when re-using a warp fixed (thanks Eric Freese).
- bug in IE10 fixing text shadows fixed.
- improved calculation of kerning gives more precise results.
- speed improvements.
- always add non-prefixed css transforms.
- started to put in better comments.
- added more and better demos and examples.

## New in v0.3.0:

- "width" and "height" are deprecated. Put "width" and "height" attributes into the "css" config instead.
- "kerning" is deprecated. Use "letter-spacing" in your CSS for kerning. If you need to provide a different kerning for warped text than for unwarped text (in case user has switched off javascript) put a different letter-spacing into "css" config.
- per default text-shadows now appear as if a global light source has been applied (via "fixShadow", see above).
- speed improvements (100%-300% depending on browser) for bezier warping.

## Outlook:

Things I have planned for next releases:

- Mediaqueries
- Support for IE versions <9
- jQuery plugin
- Parse curves from SVG

## License

csswarp.js is licensed under the terms of the MIT License.
http://www.eleqtriq.com/wp-content/static/licenses/MIT-LICENSE.txt

More infos and demos on www.eleqtriq.com