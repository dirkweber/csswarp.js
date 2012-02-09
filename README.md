# csswarp.js: "warp" HTML text around an arbitrary path.
----------

csswarp.js is a small (<8kb minified unzipped) javascript library for warping any HTML text around an arbitrary path.  Text will look as if it were created with Illustrator's attach to Path tool. Anyway it is pure HTML text that can be copied and crawled and styled with CSS. csswarp works standalone and does not rely on jQuery or another library (a jQuery plugin is in the works though). csswarp.js offers an extensive set of settings to adjust text warping. Right now it will work in every modern browser that supports css3 transforms. Support for IE versions <9 is planned for a future release.

## How does it work?

The script parses the DOM for nodes that should be warped. It then will transform every letter with CSS3 transfoms, so that the text follows an imaginary path.

## How to use csswarp.js:

Put a reference to the script into the head or to the end of your HTML doc.
Create a confguration object. This object will contain a list of the nodes you want to warp, info about kerning, indent, alignment and more. Make sure that the font has been completely loaded, then call the script with said object as an argument.

## Configuring csswarp.js:

In order to configure a warp it is necessary to define a configuration object first. Below is a listing of all properties, some required and some optional.

    var object = {  
    				path		: <Object> | <Array>,  
            		targets		: <Array>,		  	
            		rotationMode: "rotate" | "skew" | "none",   
            		kerning		: <length>,	  					
            		showPath	: <boolean>,  						
            		indent		: <length>,  						
            		width		: <length>,  	
            		height		: <length>,  	
            		css			: <string>,  				
            		callback	: <function object>  
    }

### path:

Required. Either a circle object that defines circle properties (see below "warp around a circle") or an array containing coordinates of a bezier path (see below "warp around a bezier curve") must be assigned. If this property is missing or wrong formatted cswarp will throw an error.

### targets:

Required. An array with strings containing one or more dom objects. The name of html tags, classnames or IDs can be provided. 

### rotationMode:

This property defines the way text will be distorted along a path. Default value is "rotate". If you want your text to be skewed vertically choose "skew". For text that stays undistorted and follows the path stepwise, use "none";

### kerning:

Optional. A string defining distance between letters, i.e "0.2em". Units can be px, em, ex, gd, rem, vw, vh, vm, mm, cm, in, pt, ch, pc. Default value is "0px"

### indent:

Optional. A text-indent, i.e "2cm". px, em, ex, gd, rem, vw, vh, vm, mm, cm, in, pt, ch, pc are allowed units.

### showPath:

Optional. This will display the path as a 1px black stroke. Its main purpose is development and debugging.

### width:

Optional. A number that defines the width of the container after warping. Of course the width can be defined in a stylesheet as well, but sometimes it's useful to have this value only in place when the browser has transformed the text, so that the appearance in browsers that do not support CSS3 transforms or with javascript disabled display the container differently. If there's no value provided here, the offset-width of the container will be used. Attention: the width will only be determined on first execution of csswarp, dynamic containers will not be updated on resize.

### height:

Optional. Same as height, a number that defines the width of the container after warping. If no value is provided here, the offset-height of the node will be used. Attention: the height will only be determined on first execution of csswarp, dynamic containers will not be updated on resize.

### css:

Optional. A custom css that will appear after warping. This way you have better control over the appearance in case no warping took place, i.e. because the browser did not support transforms or javascript was disabled. Check the examples without the script to see the difference.

### callback:

A callback function that will be executed after warping.

## Configuring a warp around a circle:

Let's say we want to warp text around a circle. In this case we will define a cirle object and assign it to the "path" property of our configuration-object:

    path: {  
    		radius: <number>,  
            center: <array>,  
            angle : <string>,  
            align: "center" | "left" | "right" string,  
            textPosition: "outside" | "inside"  
    }

### radius:

Required. A number containing the px value for the circle radius must be provided.

### center:

Optional. An array containing numbers for the x and y position of the center, i.e [120, 230]. If no value is provided here the circle will be centered horizontally and vertically.

### angle:

Optional. A string containing the value for the rotation-angle in degree or radian, i. e. "0.65rad" or "45deg". The rotation is executed clockwise with 0deg at 12:00. Default value is "0rad".

### align: 

Optional. The "angle" property defines the reference point our text is aligned to. Let's say "angle" was defined as "0deg". "left" will result in a text that starts at 12:00 clockwise around the circle, "right" will result in a text that *ends* at 12:00. "center" means the text will stretch equally to the left and right of 12:00.

### textPosition:

Optional. Define wether text will be aligned to the inside or the outside of the circle. Default value is "outside".

## Configuring a warp around a bezier curve:

In this case an array representing the path must be assigned to the "path" property. The array will be formatted according the HTML5 canvas  "moveTo" and "bezieCurveTo"- commands: 

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

### Further properties: 

- "bezAccuracy" (optional) defines the accuracy of text metrics on a bezier curve. Default value is 0.002. Usually values between 0.002 - 0.006 are o.k. most of the time, but for small text it can be necessary to use smaller values.

Be cautious: a smaller value means more computations so text needs longer time for rendering.

- "revertBezier", well, reverts the direction of a bezier.

## Some notes:

Bezier calculations can be computationally expensive. Use not too long texts, keep paths short and simple, with only as much segments as are needed.

## Outlook:

Things I have planned for next releases:

- Mediaqueries
- Support for IE versions <9
- rtl text direction
- jQuery plugin
- Parse curves from SVG

## License

flattensvg.js is licensed under the terms of the MIT License, see the included MIT-LICENSE file.

More infos and demos on www.eleqtriq.com