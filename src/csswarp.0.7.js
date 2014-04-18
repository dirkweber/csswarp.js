/*
 * 	csswarp.js 0.7
 *	written by Dirk Weber	
 *	http://www.eleqtriq.com
 *	Copyright (c) 2013 Dirk Weber (http://www.eleqtriq.com)
 *	licensed under the MIT (http://www.eleqtriq.com/wp-content/uploads/2010/11/mit-license.txt)
 */
 
 (function(){
 
	var warpedTexts = [],
		userAgent	= navigator.userAgent.toLowerCase(),
	    prefix 		= cssPref = "",
	    PI			= Math.PI,
	    hasTransform, WarpMachine;
	 
	if(/webkit/gi.test(userAgent)){
	    prefix = "-webkit-";
	    cssPref = "Webkit";
	}else if(/msie | trident/gi.test(userAgent)){
	    prefix = "-ms-";
	    cssPref = "ms";
	}else if(/mozilla/gi.test(userAgent)){
	    prefix = "-moz-";
	    cssPref = "Moz";
	}else if(/opera/gi.test(userAgent)){
	    prefix = "-o-";
	    cssPref = "O";
	}else{
	    prefix = cssPref = "";
	}

	hasTransform = (function(){
		var elem = document.createElement("div"),
			html = document.getElementsByTagName("html")[0],
			hasTrans;
		
		elem.setAttribute("style", "visibility: hidden; position: absolute;");
		html.appendChild(elem);
		 
		if(elem.style[cssPref+"Transform"] === "" || elem.style["Transform"] === ""){
			hasTrans = true;
		}else {
			hasTrans = false;
		};
		html.removeChild(elem);
		return hasTrans;
	})();
	
	function setStyle(target, attr, prop){
		target.style[attr] = prop;
	}
	
	function getStyle(target, prop){
	    var style = document.defaultView.getComputedStyle(target, "");
	    return style.getPropertyValue(prop);
	}
	
	cssWarp = function(){
		if(!hasTransform){return;};
		
		for(var i=0, l=arguments.length; i<l; i++){
			if(typeof arguments[i] !== "undefined"){
				warpedTexts[i] = new WarpMachine(arguments[i]);
			}
		}
	}
	
	WarpMachine = function(confObj){
		this.config = {};
		this.setUp(confObj);
	}
	
	WarpMachine.prototype.setUp = function(conf){
		var THIS	= this,
			COLREGX	= /(h.*?\))|(r.*?\))|(#[\a-z\d]+)|((^|\s+|,)[a-zA-Z]+(\s+|$|,))/gi,
			shadowVal, direction, type, customCSS;

		THIS.config.indent = "0px";
		THIS.config.kerning = "0px";
		THIS.config.rotationMode = "rotate";
		THIS.config.fixshadow = true;
			
		for(var prop in conf){
			if(conf.hasOwnProperty(prop)){
		    	THIS.config[prop] = conf[prop];
			}
		}
 			
		THIS.config.targets = (function(){
				var targets = conf.targets.replace(/\s*/g, "").split(","),
					nodes	= [],
					obj, id, className, name;
					
				for(var i=0, l=targets.length; i<l; i++){
					name = targets[i];
					
					if(/^#/.test(name)){ // is ID?
						obj = document.getElementById(name.substring(1));
						if(obj !== null){nodes.push(obj);};
					}else if(/^\./.test(name)){ // is class
						obj = document.getElementsByClassName(name.substring(1));
						if(obj.length > 0){nodes = nodes.concat(pushNodes(obj));};
					}else{ //is tag
						obj = document.getElementsByTagName(name);
						if(obj.length > 0){nodes = nodes.concat(pushNodes(obj));};
					}
				}
				
				function pushNodes(list){
					var nodeArray =[];
					for( var i=0, l=list.length; i<l; i++){
						nodeArray.push(list[i]);
					}
					return nodeArray;
				}
				return nodes;
		})();
					
		if(typeof THIS.config.path === "object" && THIS.config.path instanceof Array){
			type = "bezier";
		}else if(typeof THIS.config.path === "object"){
			type = "circle";
		}else{
			throw new Error('ERROR: no valid path found in config Object');
			return;
		}
			
		for(var i=0, l=THIS.config.targets.length; i<l; i++){
			if(THIS.config.css){
				customCSS = THIS.config.targets[i].style.cssText+";"+THIS.config.css;
				THIS.config.targets[i].style.cssText = customCSS;
			}
				
			if(!(THIS.config.fixshadow === false)){
					THIS.config.shadows = [];
					shadowVal = getStyle(THIS.config.targets[i], "text-shadow");
					
 					if(shadowVal !== "" && shadowVal !== "none"){
						//IE10 doesn't convert colours in computedstyle to rgba.
						//So a lot of text processing coming.
						//Test for hex, hsl, rgb or literal color values:
						var cols = shadowVal.match(COLREGX);
						
 						cols.forEach(function(value, index){
							cols[index] = value.replace(/^,/g,"").replace(/,$/g,"");
 							shadowVal = shadowVal.replace(cols[index], "");
 						});
						
						shadowVal = shadowVal.split(",");
						
 						//grab all attributes of all text-shadows that are applied to the element:
						shadowVal.forEach(function(value, index, shadowVal){
								var x, y, blur, radius;
 								
								shadowVal[index] = value.replace(/^\s*/, "").split(/\s+/g);
								x 		= parseFloat(shadowVal[index][0]);								
								y 		= parseFloat(shadowVal[index][1]);
								blur 	= parseFloat(shadowVal[index][2]);
 								radius	= Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
 								angle	= Math.atan2(y, x);
 								
								THIS.config.shadows[index] = {
													col		: cols[index],
													blur	: blur,
													x 		: x,
													y 		: y,
													radius	: radius,
													angle	: angle
													};
								});
 					};
		}
				
		switch(type){
			case "bezier":
				THIS.attach2Bezier(THIS.config.targets[i]);
				break;
			case "circle":
				THIS.attach2Circle(THIS.config.targets[i]);
				break;
			default:
				break;
			}
				
 			if(THIS.config.callback && (typeof THIS.config.callback === 'function')){THIS.config.callback();}
			if(THIS.config.showPath){THIS.drawPath(THIS.config.targets[i], type, i);}
		}
	}
	
	WarpMachine.prototype.attach2Circle = function(node) {
	 				var THIS			= this,
	 					circle			= THIS.config.path,
	 					letters			= THIS.getTextMetrics(node),
	 					arcLength		= 0,
	 					angleIncr		= 0,
	 					arcDir			= 1,
	 					coords, angle;
	 				if(direction === "rtl"){letters.reverse();}
	 				
	 				
	 				if(!THIS.config.align){
	 					THIS.config.align = "center";
	 				}
	  					
	 				if(!circle.center){
	 					circle.center = [];
	 					circle.center[0] = Math.floor(node.offsetWidth/2) - parseFloat(getStyle(node, "border-left-width"));
	 					circle.center[1] = Math.floor(node.offsetHeight/2) - parseFloat(getStyle(node, "border-top-width"));
	 				}
	 				
	 				if(!circle.convertedAngle){
	  					if(circle.angle){
	 						if(!/rad/gi.test(THIS.config.path.angle)){
	 							//if deg, convert to radians
	 							circle.convertedAngle = parseFloat(circle.angle) * PI/180;
	 						}else{
	 							circle.convertedAngle = parseFloat(circle.angle);
	 						}
	 					}else{
	 						circle.convertedAngle = 0;
	 					}
	 					//setting angle relative to 0 o'clock:
	 					circle.convertedAngle-= PI/2;
	 				}
	 				
	 				switch(circle.textPosition){
	 					case "inside":
	 						angleIncr+= PI;
	 						arcDir = -1;
	 						break;
	 					default:
	 						angleIncr = 0;
	 						arcDir = 1;
	 						break;
	  				}
	  					
	 				switch(THIS.config.align){
	 					case "left":
	 						arcLength = letters.indent * arcDir;
	 						break;
	 					case "right":
	 						arcLength = -(letters.lngt + letters.indent) * arcDir;
	 						break;
	 					default:
	 						arcLength = (letters.indent - letters.lngt/2) * arcDir;
	 				}
	 
	  				function polarCoords(arc){
	  					var angle = arc/circle.radius + circle.convertedAngle,
	  						cos = Math.cos(angle),
	  						sin = Math.sin(angle),
	  						x	= circle.radius*cos + circle.center[0],
	  						y	= circle.radius*sin + circle.center[1];
	  						
	  					return [x,y, angle];
	  				}
	
	  				for(var i=0, lg=letters.length; i<lg; i++){
	  					arcLength+= letters[i].width/2 * arcDir;
	  					coords = polarCoords(arcLength);
	  					angle = coords[2] + PI/2 + angleIncr;
	  					THIS.applyTransforms(letters, i, coords, angle);
	  					arcLength+= (letters[i].width/2+letters.kerning) * arcDir;
	  				}
	}
	 
	
 	WarpMachine.prototype.attach2Bezier = function(node) {
	 				var THIS			= this,
	 					bez				= [].concat(THIS.config.path),
						letters			= THIS.getTextMetrics(node),    		//arry containing the metrics of each letter in the text
						letterCount		= 0,									//the current index of "letters". 
																				//Helps us to find the current letter when we move to the next bezier segment.
						firstLetterPos	= letters.indent-letters[0].width/2,	//Arclength where the first  letter is positioned on the bezier
						letterPos		= firstLetterPos,						//Arclength of the current letter that will be transformed
						curveStepCount	= 0,									//Here is stored how many steps we moved forward 																					//on the bezier (in increments of bezRes) for 																						//calculating the position of the current letter
																				//When we have found the coordinates of the letter,
																				//we use this as a starting point to move on with the next one
						arcStart		= 0,									//
						bezRes			= THIS.config.bezAccuracy || 0.004;		//We must loop over the bezier in small increments to determine the position of the 												//letters. This is the size of the increment
					
					//Add 4 dummy elements to the first position in array. It makes processing the bezier array easier for us when every Element has the same length:
					bez[0] = [0,0,0,0].concat(bez[0]);
					
					if(THIS.config.revertBezier){
						revertBez();
					}
					
					if(direction === "rtl"){
						letters.reverse();
					}				
					
					if(THIS.config.align === "right"){
						letters.reverse();
						revertBez();
					}	
					//Loop through all the segments of bezier.
					//In every loop, loop through letters that are lying on the current beziersegment
					//and and calculate transformations for each of them: 
					
					for (var i=0, l=bez.length-1; i<l; i++){
						segment = [bez[i][4],bez[i][5],bez[i+1][4],bez[i+1][5],
								  bez[i+1][0],bez[i+1][1],bez[i+1][2],bez[i+1][3]];
								  
						for(var j=letterCount, lg=letters.length; j<lg; j++){
							breakPoint = transform(j);
							//If a new segment starts, break the loop:
							if(breakPoint === true){break;}
						}
					}
					
					return;
					
					//Change order of points of bezier. This will not change the appearance, but now the first point ist the former last one. Tex will now start there.
					function revertBez(){
						var newBez	= [[0,0,0,0]],
							length 	= bez.length;
							
						for (var l=length-1, i=0; l>i; l--){
							newBez[length-l] = [];
							newBez[length-l-1][4] = bez[l][4];
							newBez[length-l-1][5] = bez[l][5];
							newBez[length-l][0] = bez[l][2];
							newBez[length-l][1] = bez[l][3];
							newBez[length-l][2] = bez[l][0];
							newBez[length-l][3] = bez[l][1];
						}
						
						newBez[length-l-1][4] = bez[l][4];
						newBez[length-l-1][5] = bez[l][5];
						
						bez = [].concat(newBez);
					}
					
					//Calculate transfomation of current letter on bezier curve
					
					function transform(index){
						letterPos+= letters[index].width/2;  	//length of bezier piece from start up to where the current letter must be placed
																//This arclength helps us find its x- and y- coordinates
																					
						var arcVals	= calcLetterTransform(segment),
							coords, angle;
							
	 					if(arcVals[2]){ //does a new bezier segment start? Leave and continue.
							letterPos-= arcVals[3]+letters[index].width/2; 
							return true;
						}
						
						coords	= arcVals[0];
						angle	= arcVals[1];
						
						THIS.applyTransforms(letters, index, coords, angle);					
						letterPos+= letters.kerning + letters[index].width/2;
						letterCount	++;
	
						return arcVals[2];
					}
					
					//This is where the fun begins. 
					//The function takes the current segment of our bezier as an argument and calculates how the current letter must be transformed
					
					function calcLetterTransform(segment){
						var length	= arcStart,
							arcLgt	= letterPos,
							sp		= findPointOnCurve(segment,curveStepCount),
							increase= false,
							ep;
						
						/*Now for some heavy CPU stressing. We must calculate the coordinates of the current letter on the bezier curve. We know the distance from the starting point of our text to the current letter on our curve (var arcLgt). Now we must calculate the coordinates of the point on the bezier at this position and the angle of the tangent through the curve at this point.
						
	 					  As lengths on bezier curves can only be approximated, this means that we must split our bezier into short straight lines and then sum up the lengths. The shorter the lines, the more accurate the approximation (and the more cumputations).
						  We do this by determining a starting point on the curve (sp) and an endpoint (ep) then calculating
						  their distance. After that "ep" becomes the new "sp" and we move on.
						  
						Coordinates on the curve must be determined from a relative value "t" with t=0 as starting lenght of the bezier and t=1 as the end. We increase t by bezRes, calculate the coordinates, use some trigoneometry to evaluate the length of the line segment, and stop as soon as our calculated value is as long as the position of the letter. The coordinates at this value will be the coordinates of the letter, the angle of the tangetnt at this position will be used to calculate the transformation of the letter (rotation, skew) at this position.
						*/
						
						for(var i = curveStepCount+bezRes; i<1; i+= bezRes){  
							ep 		= findPointOnCurve(segment,i);
							length+= Math.sqrt(Math.pow((sp[0]-ep[0]),2) + Math.pow((sp[1]-ep[1]),2));
							sp		= ep;
							
							//length (current calculated length of bezier) >= position of current letter on a line? If this is the case let's leave the loop
							if(length >= arcLgt){curveStepCount = i; arcStart = arcLgt; break;}
						}
						
						//i>=1 means we reached the end of our segment and the current letter is not on it, 
						//so break the loop and move on to the next segment of our bezier.
						//If there isn't any segment left, the text will be stripped here.
						
						if(i >= 1){
							curveStepCount = arcStart = 0; 
							increase = true;
						}
						
	 					angle = calcAngle(segment, i);
						return [ep, angle, increase, length];
					}
					
					//Some math. We pass the current segment and a relative arc length (0 is the starting point on bezier, 1 the last point on this bezier segment. I.e. u=0.5 would be in the middel), the function returns the x- and y- coordinates at  this length on the curve
					function findPointOnCurve(segment, t){
						var x 		= Math.pow(t,3)*(segment[2]+3*(segment[4]-segment[6])-segment[0])
									  +3*Math.pow(t,2)*(segment[0]-2*segment[4]+segment[6])
									  +3*t*(segment[4]-segment[0])+segment[0],
															 
							y 		= Math.pow(t,3)*(segment[3]+3*(segment[5]-segment[7])-segment[1])
									  +3*Math.pow(t,2)*(segment[1]-2*segment[5]+segment[7])
									  +3*t*(segment[5]-segment[1])+segment[1];
									
						return [x.toFixed(4), y.toFixed(4)];
					}
						
					function calcAngle(curve, t) {
							//decasteljau-algorithm for finding the tangents at t:
							var cp_1	= [curve[4], curve[5]],
								cp_2	= [curve[6], curve[7]],
								p_1		= [curve[0], curve[1]],
								p_2		= [curve[2], curve[3]],
								m_1 	= interPolatePoint(cp_1,p_1,t),
								m_2 	= interPolatePoint(cp_2,cp_1,t),
								m_3 	= interPolatePoint(p_2,cp_2,t),
								h_3 	= interPolatePoint(m_2,m_1,t),
								h_4 	= interPolatePoint(m_3,m_2,t),
								angle	= Math.atan((h_3[1]-h_4[1])/(h_3[0]-h_4[0]))-(2*PI);
								if(h_4[0]<h_3[0]){angle-= PI;}
								if(THIS.config.align === "right"){angle+= PI};
								
							return ((angle).toFixed(4));
						}
					
					//Small helper to find the coordinates of a point on a line between point p1 and p2 at a given distance d:
					function interPolatePoint(p1, p2, d){
						var dx	= (p2[0]-p1[0])*(1-d)+p1[0],
							dy	= (p2[1]-p1[1])*(1-d)+p1[1];
							
						return [dx, dy];
					}
	}
	
		
	WarpMachine.prototype.applyTransforms = function(letters, index, coords, angle){
		var THIS		 = this,
			width 		 = letters[index].width,
			top 		 = coords[1]-letters.base,
			left 		 = coords[0]-width/2,
			warpCSS	= function(letters, transform){
							var transVal = "transform: "+transform+";",
								transOr	 = "transform-origin: 50% "+letters.base+"px; ";
								
								return	"display: block;"+
									"visibility: inherit;"+
									"width:"+letters.width+"px;"+
									prefix+transOr+
									prefix+transVal+
									transOr+
									transVal;
						},
			cssTransform = "translate("+left+"px, "+top+"px)";
		
		switch(THIS.config.rotationMode){
				case "rotate":
					cssTransform+= " rotate("+angle+"rad)";
					break;
				case "skew":
					var skewX	= "skewX("+ angle+"rad)",
						scale	= "scaleY("+Math.cos(angle).toFixed(4)+")";
					cssTransform+=  " rotate("+angle+"rad) "+skewX+" "+scale;
					break;
				default:
					break;
		}
		
		letters[index].elem.style.cssText+= warpCSS(letters, cssTransform);
		
		if(THIS.config.hasOwnProperty("shadows") && THIS.config.shadows.length>0 ){
			letters[index].elem.style.cssText+= "text-shadow: " + THIS.fixShadow(angle);
		}	
	}
				
	WarpMachine.prototype.fixShadow = function(angle){
		//calculate new x- and y- values for each shadow of each letter of our warped text:
		var THIS	= this,
			shadows = THIS.config.shadows,
			val 	= "",
			x, y, alpha;
			
		for(var i=0, l=shadows.length; i<l; i++){
			alpha = shadows[i].angle-angle;
				x = Math.cos(alpha)*shadows[i].radius;
			y = Math.sin(alpha)*shadows[i].radius;
			val+= x+"px "+y+"px "+shadows[i].blur+"px "+shadows[i].col;
			if(i<l-1){val+= ", "};
		}
		return val;
	}
	
	WarpMachine.prototype.getTextMetrics = function(node){
		var THIS		= this,
			text 		= node.textContent,
			letters 	= [],
			letterCSS	= "overflow: visible; white-space:pre; letter-spacing: 0;",
			baseCSS 	= "position: absolute; display: block;"+
						  "left: 0; top: 0; visibility: hidden;"+
					 	  "margin: 0; border: none; padding: 0;",
			kerning		= getStyle(node, "letter-spacing"),
			allLetters	= "", //Here wee keep track if we already calculated the metrics of this glyph to avoid unnecessary calculations.
			metrics		= {},
			curChar, letter;
		
		direction 	= getStyle(node, "direction");
		
		letters.lngt = 0;
				
		node.innerHTML = "";
		
		for(var i=0, l=text.length; i<l; i++){
			curChar = text.charAt(i);
			letters[i] = {};
			letter = document.createTextNode(curChar);
			letters[i].elem = document.createElement("span");
			letters[i].elem.setAttribute("style", baseCSS+letterCSS);
			letters[i].elem.appendChild(letter);
			node.appendChild(letters[i].elem);
			
			if(allLetters.indexOf(curChar) < 0){
				allLetters+=curChar;
				metrics[curChar] = letters[i].elem.offsetWidth;
			}
			
			letters[i].width = metrics[curChar];
			setStyle(letters[i].elem, "display", "none");
			letters.lngt+= metrics[curChar];
		}
		
		letters.kerning = kerning!=="normal" ? parseInt(kerning) : 0;
		letters.indent = calcWidth("indent");
		letters.base = calcBaseline();
		letters.lngt+= (i-1)*letters.kerning;
		
		return letters;
			
		function calcBaseline(){
				var testDiv = document.createElement("div"),
					img = document.createElement("img"),
					lineHeight = getStyle(node, "lineHeight"),
					base;
					
				img.width = 1;
				img.height = 1;
				img.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
				img.style.verticalAlign = "baseline";
				img.style.display = "inline";	
				testDiv.style.cssText = baseCSS+'height:'+letters[0].height+';line-height:'+lineHeight+'px;';
				testDiv.innerHTML="M";
				testDiv.appendChild(img);
				node.appendChild(testDiv);
				base = img.offsetTop;
				node.removeChild(testDiv);
				return base;
		}
			
		function calcWidth(attr){
				var val = THIS.config[attr].replace(/\s*/gi, ""),
					testDiv, w, 
					unit = /em|ex|gd|rem|vw|vh|vm|mm|cm|in|pt|ch|pc|%/gi;
				
					if(unit.test(val)){
					testDiv = document.createElement("div");
					node.appendChild(testDiv);
					testDiv.setAttribute("style", baseCSS);
					setStyle(testDiv, "width", val);
					w = testDiv.offsetWidth;
					node.removeChild(testDiv);
					
					return w;
				}else if(/px/gi.test(val)){
					return parseInt(val);
				}else{
					return 0;
				}
		}
	}
	
	WarpMachine.prototype.drawPath = function(target, type, id){
				var canvas, ctx, currentBG, w, h, btmCache,
					THIS		= this,
					strokeWidth = this.config.showPath.thickness || 1,
					strokeColor = this.config.showPath.color || "black",
					style 		= target.style.cssText;
				
				currentBG = getStyle(target, "background-image");
				
				if(/width/gi.test(style) && /height/gi.test(style)){
					w = target.offsetWidth;
					h = target.offsetHeight;
					setStyle(target, "backgroundImage", "url("+createBitmap(w, h)+"), "+currentBG);
				}else{
					if(btmCache === undefined){
						THIS.config.btmCache = createBitmap(target.offsetWidth, target.offsetHeight);
					}
					setStyle(target, "backgroundImage", "url("+THIS.config.btmCache+"), "+currentBG);
					return;
				}
				
				function createBitmap(width, height){
	
					canvas = document.createElement("canvas");			
					canvas.width = width;
					canvas.height = height;
						
					if (canvas.getContext){
						ctx = canvas.getContext('2d');
						ctx.strokeStyle = strokeColor;
						ctx.lineWidth = strokeWidth;
						switch(type){
						 	case "bezier":
							 	drawBezier(ctx, THIS.config.path);
							 	break;
							default:
							 	drawCircle(ctx, THIS.config.path);
						}					
						return canvas.toDataURL();
					}				
					function drawBezier(ctx, path){
					
						ctx.beginPath();
						ctx.moveTo(path[0][0],path[0][1]);
						for(var i=1, l=path.length; i<l; i++){
							ctx.bezierCurveTo(path[i][0],path[i][1],path[i][2],path[i][3],path[i][4],path[i][5]);
						}
						ctx.stroke();
					}
					
					function drawCircle(ctx, path){
									
						ctx.beginPath();
						ctx.arc(path.center[0], path.center[1], path.radius, 0, PI*2, true); 
						ctx.stroke();
					}
				}
			}
			
		window.cssWarp = cssWarp;
})();