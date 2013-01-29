/*
 * 	csswarp.js 0.3.1
 *	written by Dirk Weber	
 *	http://www.eleqtriq.com
 *	Copyright (c) 2012 Dirk Weber (http://www.eleqtriq.com)
 *	licensed under the MIT (http://www.eleqtriq.com/wp-content/uploads/2010/11/mit-license.txt)
 */
 
 (function(){
 
	var warpedTexts = [],
		userAgent	= navigator.userAgent.toLowerCase(),
	    prefix 		= cssPref = "",
	    hasTransform, WarpMachine;
	 
	if(/webkit/gi.test(userAgent)){
	    prefix = "-webkit-";
	    cssPref = "Webkit";
	}else if(/msie/gi.test(userAgent)){
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
			hasTrans;
		
		elem.setAttribute("style", "visibility: hidden; position: absolute;");
		document.getElementsByTagName("html")[0].appendChild(elem);
		 
		if(elem.style[cssPref+"Transform"] === ""){
			hasTrans = true;
		}else {
			hasTrans = false;
		};
		document.getElementsByTagName("html")[0].removeChild(elem);
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
		if(!hasTransform){return};
		
		for(var i=0, l=arguments.length; i<l; i++){
			warpedTexts[i] = new WarpMachine(arguments[i]);
		}
	}
	
	WarpMachine = function(confObj){
		this.config = {};
		this.setUp(confObj);
	}
	
	WarpMachine.prototype.setUp = function(conf){
		var THIS	= this,
			shadowVal,
			warpCSS	= function(letters, transform){
							return	"display: block;"+
									"visibility: visible;"+
									"width:"+letters.width+"px;"+
									"height: "+letters.height+"px;"+
									prefix+"transform-origin: 50% "+letters.base+"px; "+
									prefix+"transform: "+transform+";"
						},
			type, customCSS;
			
		(function init(){
			THIS.config.indent = "0px";
			THIS.config.kerning = "0px";
			THIS.config.rotationMode = "rotate";
			THIS.config.fixshadow = true;
			
			for(var prop in conf){
		    	THIS.config[prop] = conf[prop];
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
				

				if(!(THIS.config.fixshadow === false)){					THIS.config.shadows = [];
					shadowVal = getStyle(THIS.config.targets[i], "text-shadow");

					if(shadowVal !== "" && shadowVal !== "none"){
						var cols = shadowVal.match(/r.*?\)/gi);
					
						shadowVal = shadowVal.replace(/r.*?\)/gi, "").split(",");
						
						shadowVal.forEach(function(value, index){
								var x, y, blur, radius;
								
								shadowVal[index] = value.replace(/^\s*/, "").split(/px\s+/g);
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
						attach2Bezier(THIS.config.targets[i]);
						break;
					case "circle":
						attach2Circle(THIS.config.targets[i]);
						break;
					default:
						break;
				}
				
				if(THIS.config.callback){THIS.config.callback();}
				if(THIS.config.showPath){drawPath(THIS.config.targets[i], i);}
			}
		})();
		
		function attach2Bezier(node) {
 				var bez				= [].concat(THIS.config.path),
					letters			= getTextMetrics(node),
					letterCount		= 0,
					firstLetterPos	= letters.indent-letters[0].width/2,
					letterPos		= firstLetterPos,
					curveStepCount	= 0,
					arcStart		= 0,
					bezRes			= THIS.config.bezAccuracy || 0.004;
				
				bez[0] = [0,0,0,0].concat(bez[0]);
				
				if(THIS.config.revertBezier){revertBez();};
								
				for (var i=0, l=bez.length-1; i<l; i++){
					segment = [bez[i][4],bez[i][5],bez[i+1][4],bez[i+1][5],
							  bez[i+1][0],bez[i+1][1],bez[i+1][2],bez[i+1][3]];
							  
					for(var j=letterCount, lg=letters.length; j<lg; j++){
						breakPoint = transform(j);
						if(breakPoint === true){break;}
					}
				}
				
				return;
				
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
				
				function transform(index){
					letterPos+= letters[index].width/2;
					
					var arcVals	= calcLetterTransform(segment),
						coords, angle;
						
 					if(arcVals[2]){
						letterPos-= arcVals[3]+letters[index].width/2; 
						return true;
					}
					
					coords	= arcVals[0];
					angle	= arcVals[1];
					
					applyTransforms(letters, index, coords, angle);					
					letterPos+= letters.kerning + letters[index].width/2;
					letterCount	++;

					return arcVals[2];
				}
				
				function calcLetterTransform(segment){
					
					var length	= arcStart,
						arcLgt	= letterPos,
						sp		= findPointOnCurve(segment,curveStepCount),
						increase= false,
						ep;
					
					for(var i=curveStepCount+bezRes; i<1; i+= bezRes){
						ep 		= findPointOnCurve(segment,i);
						length+= Math.sqrt(Math.pow((sp[0]-ep[0]),2) + Math.pow((sp[1]-ep[1]),2));
						sp		= ep;
						if(length >= arcLgt){curveStepCount = i; arcStart = arcLgt; break;}
					}
					
					if(i>=1){
						curveStepCount = arcStart = 0; 
						increase = true;
					}
					
					angle = calcAngle(segment, i);
					return [ep, angle, increase, length];
				}
				
				function findPointOnCurve(segment, u){
					var x 		= Math.pow(u,3)*(segment[2]+3*(segment[4]-segment[6])-segment[0])
								  +3*Math.pow(u,2)*(segment[0]-2*segment[4]+segment[6])
								  +3*u*(segment[4]-segment[0])+segment[0],
														 
						y 		= Math.pow(u,3)*(segment[3]+3*(segment[5]-segment[7])-segment[1])
								  +3*Math.pow(u,2)*(segment[1]-2*segment[5]+segment[7])
								  +3*u*(segment[5]-segment[1])+segment[1];
								
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
							angle	= Math.atan((h_3[1]-h_4[1])/(h_3[0]-h_4[0]))-(2*Math.PI);
							if(h_4[0]<h_3[0]){angle-= Math.PI;}
							
						return (angle.toFixed(4));
					}
					
				function interPolatePoint(p1, p2, d){
					var dx	= (p2[0]-p1[0])*(1-d)+p1[0],
						dy	= (p2[1]-p1[1])*(1-d)+p1[1];
						
					return [dx, dy];
				}
			}
 		
 		function attach2Circle(node) {
 				var circle			= THIS.config.path,
 					letters			= getTextMetrics(node),
 					arcLength		= 0,
 					angleIncr		= 0,
 					arcDir			= 1,
 					coords, angle;
 					 			
 				if(!circle.align){
 					circle.align = "center";
 				}
 					
 				if(!circle.center){
 					circle.center = [];
 					circle.center[0] = Math.floor(node.offsetWidth/2);
 					circle.center[1] = Math.floor(node.offsetHeight/2);
 				}
 					
 				if(circle.angle){
 					if(!/rad/gi.test(THIS.config.path.angle)){
 						circle.calculatedAngle = parseFloat(circle.angle) * Math.PI/180;
 					}else{
 						circle.calculatedAngle = parseFloat(circle.angle);
 					}
 				}else{
 					circle.calculatedAngle = 0;
 				}
 					
 				circle.calculatedAngle-= Math.PI/2;
 				
 				switch(circle.textPosition){
 					case "inside":
 						angleIncr+= Math.PI;
 						arcDir = -1;
 						break;
 					default:
 						angleIncr = 0;
 						arcDir = 1;
 						break;
  				}
 				 				
 				switch(circle.align){
 					case "left":
 						arcLength = (letters.indent-letters[0].width/2) * arcDir;
 						break;
 					case "right":
 						arcLength = (letters[letters.length-1].width/2-letters.lngt) * arcDir;
 						break;
 					default:
 						arcLength = (letters.indent-letters.lngt/2) * arcDir;
 				}
 
  				function polarCoords(arc){
  					var angle = arc/circle.radius+circle.calculatedAngle,
  						cos = Math.cos(angle),
  						sin = Math.sin(angle),
  						x	= circle.radius*cos+circle.center[0],
  						y	= circle.radius*sin+circle.center[1];
  						
  					return [x,y, angle];
  				}

  				for(var i=0, lg=letters.length; i<lg; i++){
  					arcLength+= letters[i].width/2 * arcDir;
  					coords = polarCoords(arcLength);
  					angle = coords[2] + Math.PI/2 + angleIncr;
  					applyTransforms(letters, i, coords, angle);
  					arcLength+=(letters[i].width/2+letters.kerning) * arcDir;
  				}
 		}
 		
 		function applyTransforms(letters, index, coords, angle){
 			var width 		 = letters[index].width,
 				height 		 = letters[index].height,
 				top 		 = coords[1]-letters.base,
 				left 		 = coords[0]-width/2,
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
 				letters[index].elem.style.cssText+= "text-shadow: "+fixShadow(angle);
 			}	
 		}
 		
 		function fixShadow(angle){
 			var shadows = THIS.config.shadows,
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
 			 					
 		function getTextMetrics(node){
			var text 		= node.textContent,
				letters 	= [],
				letterCSS	= "overflow: visible; white-space:pre;",
				baseCSS 	= "position: absolute; display: block; visibility: hidden;"+
						 	  "margin: 0px; border: 0px; padding: 0px;",
				kerning		= getStyle(node, "letter-spacing"),
				letter;
				
			letters.lngt = 0;
					
			node.innerHTML = "";
				
			for(var i=0, l=text.length; i<l; i++){
				letters[i] = {};
				letter = document.createTextNode(text.charAt(i));
				letters[i].elem = document.createElement("span");
				letters[i].elem.setAttribute("style", baseCSS+letterCSS);
				letters[i].elem.appendChild(letter);
				node.appendChild(letters[i].elem);
				letters[i].width = letters[i].elem.offsetWidth;
				letters[i].height = letters[i].elem.offsetHeight;
				setStyle(letters[i].elem, "display", "none");
				letters.lngt+= letters[i].width;
			}
				
			letters.kerning = kerning!=="normal" ? parseInt(kerning) : 0;
			letters.indent = calcWidth("indent");
			letters.base = calcBaseline();
			letters.lngt+= i*letters.kerning;
			
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
				
		function drawPath(target, id){
			var canvas, ctx, currentBG, w, h, btmCache,
				strokeWidth = THIS.config.showPath.thickness || 1,
				strokeColor = THIS.config.showPath.color || "black",
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
					ctx.arc(path.center[0], path.center[1], path.radius, 0, Math.PI*2, true); 
					ctx.stroke();
				}
			}
		}
	}
	
	window.cssWarp = cssWarp;
})();

