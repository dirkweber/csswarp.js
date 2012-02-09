function fontLoadCheck(font, callback){
	var txt, w, h, interval,
		THIS = this,
		elem,  
		fontreadyEv,
		html = document.getElementsByTagName("html")[0];
	
	txt = document.createTextNode("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
	elem = document.createElement("span");
	elem.setAttribute("style", "font: 30px "+font+"; visibility: hidden; position: absolute;");
	elem.appendChild(txt);
	html.appendChild(elem);
	w = elem.offsetWidth;
	h = elem.offsetHeight;
	fontreadyEv = document.createEvent("Event");
		
	document.addEventListener(font, function(){callback();}, false);
	
	interval = setInterval(checkFont, 50);
	setTimeout(function(){clearInterval(interval);}, 6000);
	
	this.kill = function(){
		html.removeChild(elem);
		document.removeEventListener(elem.font,function(){callback();}, false);
		clearInterval(interval);
	}
	
	function checkFont(){
		if(!(h === elem.offsetHeight) || !(w === elem.offsetWidth)){
			fontreadyEv.initEvent(font, true, true);
			document.dispatchEvent(fontreadyEv);
			h = elem.offsetHeight;
			w = elem.offsetWidth;
			THIS.kill();
		}
	}
}