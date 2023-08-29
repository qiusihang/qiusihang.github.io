function trace(msg) { console.log(msg); }

function Cubemap(pre_url, post_url, container_id, options)
{
	options = options || {};

	this.pitch = 180;
	this.yaw = 0;
	//this.fov = 70;
	this.perspective = options.perspective || 300;
	this.speed = 0.25;
	this.faces = {};
	this.box_size = 512;
	this.border_margin = 0.4;

	this.pre_url = pre_url;
	this.post_url = post_url;

	var root = document.createElement("div");
	root.className = "cubemap";
	var parent = document.getElementById(container_id);
	if(!parent) throw("parent node not found");
	parent.appendChild(root);
	this.root = root;
	var that = this;

	var rect = this.root.getClientRects()[0];
	if(options.width) root.style.width = options.width + "px";
	else root.style.width = rect.width + "px";
	if(options.height) root.style.height = options.height + "px";
	else root.style.height = rect.height + "px";
	root.style.backgroundColor = options.backgroundColor || "black";
	root.style.position = "relative";
	root.style.overflow = "hidden";

	root.addEventListener("mousedown",ondown);
	root.addEventListener("touchstart",ondown);
	var last_pos = [0,0];

	function ondown(e)
	{
		var rect = that.root.getClientRects()[0];
		if(e.type == "touchstart")
		{
			document.addEventListener("touchmove",onmove);
			document.addEventListener("touchend",onup);
			last_pos = [ e.changedTouches[0].pageX - rect.left, e.changedTouches[0].pageY - rect.top ];
		}
		else
		{
			document.body.addEventListener("mousemove",onmove);
			document.body.addEventListener("mouseup",onup);
			last_pos = [ e.pageX - rect.left, e.pageY - rect.top ];
		}

		e.stopPropagation();
		e.preventDefault();
		return false;

	}

	function onmove(e)
	{
		var rect = that.root.getClientRects()[0], x, y;
		if(e.type == "touchmove") {
			x = e.changedTouches[0].pageX - rect.left;
			y = e.changedTouches[0].pageY - rect.top;
		} else {
			x = e.pageX - rect.left;
			y = e.pageY - rect.top;
		}
		var deltax = x - last_pos[0];
		var deltay = y - last_pos[1];

		that.yaw += deltax * that.speed;
		that.pitch += deltay * that.speed;
		that.update();

		/*
		that.fov += deltay * that.speed;
		if(this.fov < 45) this.fov = 45;
		else if(this.fov > 100) this.fov = 100;
		*/

		last_pos = [x,y];
		e.stopPropagation();
		e.preventDefault();
		return false;
	}

	function onup(e)
	{
		document.body.removeEventListener("mousemove",onmove);
		document.body.removeEventListener("mouseup",onup);
		document.body.removeEventListener("touchmove",onmove);
		document.body.removeEventListener("touchend",onup);

		e.stopPropagation();
		e.preventDefault();
		return false;
	}


	var center = document.createElement("div");
	center.className = "cubemapcenter";
	root.appendChild(center);
	this.center = center;
	this.center.style.transformStyle = "preserve-3d";
	this.center.style.mozTransformStyle = "preserve-3d";
	this.center.style.webkitTransformStyle = "preserve-3d";
	this.center.style.width = "100%";
	this.center.style.height = "100%";
	//this.center.innerHTML = "foo";

	//this.center.style.width = this.box_size + "px";
	//this.center.style.height = this.box_size + "px";

	if(pre_url && options.low_post_url)
		this.load( pre_url, options.low_post_url);
	if(pre_url && post_url)
		this.load( pre_url, post_url);

	this.update();
}

Cubemap.RIGHT = "r";
Cubemap.LEFT = "l";
Cubemap.TOP = "d";
Cubemap.BOTTOM = "u";
Cubemap.FRONT = "f";
Cubemap.BACK = "b";

Cubemap.prototype.load = function(pre_url, post_url)
{
	this.buildFace("front",pre_url + Cubemap.FRONT + post_url);
	this.buildFace("left",pre_url + Cubemap.LEFT + post_url);
	this.buildFace("right",pre_url + Cubemap.RIGHT + post_url);
	this.buildFace("top",pre_url + Cubemap.TOP + post_url);
	this.buildFace("bottom",pre_url + Cubemap.BOTTOM + post_url);
	this.buildFace("back",pre_url + Cubemap.BACK + post_url);
}

Cubemap.prototype.buildFace = function(face, url)
{
	var element = document.createElement("div");
	element.className = "cubemapface " + face + "face";
	this.center.appendChild(element);

	var halfsize = this.box_size * 0.5 - this.border_margin;
	var transform = "";
	switch(face)
	{
		case 'front': transform = "scaleX(-1) translateZ(-"+halfsize.toFixed(1)+"px) rotateY(0deg) rotateX(180deg)"; break;
		case 'left': transform = "scaleX(-1) translateX(-"+halfsize.toFixed(1)+"px) rotateY(90deg) rotateX(180deg)"; break;
		case 'right': transform = "scaleX(-1) translateX("+halfsize.toFixed(1)+"px) rotateY(-90deg) rotateX(180deg)";break;
		case 'top': transform = "scaleX(-1) translateY(-"+halfsize.toFixed(1)+"px) rotateX(90deg)";break;
		case 'bottom': transform = "scaleX(-1) translateY("+halfsize.toFixed(1)+"px) rotateX(-90deg)";break;
		case 'back': transform = "scaleX(-1) translateZ("+halfsize.toFixed(1)+"px) rotateX(180deg) rotateY(180deg)";break;
		default: throw "wrong face";
	}

	element.style.position = "absolute";
	element.style.left = "0";
	element.style.top = "0";
	element.style.width = this.box_size + "px";
	element.style.height = this.box_size + "px";
	element.style.transform = transform;
	element.style.mozTransform = transform;
	element.style.webkitTransform = transform;

	//create image
	var that = this;
	var img = new Image();
	img.src = url;
	img.onload = function() {
		this.width = that.box_size;
		this.height = that.box_size;
	};

	element.appendChild(img);

	//store
	if(this.faces[face])
		this.faces[face].parentNode.removeChild(this.faces[face]);
	this.faces[face] = element;
}

Cubemap.prototype.update = function()
{

	var perspective = this.perspective;
	//perspective = 100 / Math.atan(0.0174532925 * this.fov);
	var distance = perspective;

	this.root.style.perspective = perspective.toFixed(0) + "px";
	this.root.style.webkitPerspective = perspective + "px";
	this.root.style.mozPerspective = perspective + "px";

	var rect = this.root.getClientRects()[0];
	var offsetX = (rect.width - this.box_size) * 0.5;
	var offsetY = (rect.height - this.box_size) * 0.5;
	var transform = "translateZ("+distance+"px) rotateX("+this.pitch.toFixed(1)+"deg) rotateY("+this.yaw.toFixed(1)+"deg) translateX("+offsetX+"px) translateY("+offsetY+"px)";
	this.center.style.transform = transform;
	this.center.style.webkitTransform = transform;
	this.center.style.mozTransform = transform;
}
