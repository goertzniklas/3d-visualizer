img = new Image();
img.crossOrigin = "Anonymous";
let loading = document.getElementById("loading");
let urlHolder = document.getElementById("urlHolder");
let refresh = document.getElementById("refresh");

//ONCKLICK SUBMIT BUTTON:
document.getElementById("imgSubmit").addEventListener("click", function(){
	const intensityInput = document.getElementById("intensityInput").value;
	if(intensityInput > 100 || intensityInput < 0){
		alert("ERROR: Please check the intensity input field. Is the value between 0-100?")
	}else{
		loading.style.display = "block";
		urlHolder.style.display = "none";
		img.src = document.getElementById("imgInput").value;
	}
});

img.onload = function(){
	//GETTING WIDTH & HEIGHT OF IMAGE:
	const maxWidth = 225;
	const maxHeight = maxWidth;
	let width = this.width;
	let height = this.height;

	//CALCULATE ASPECT RATIO:
	if(width > maxWidth){
		ratio = maxWidth / width;
		width = maxWidth;
		height = height * ratio;
	}if(height > maxHeight){
		ratio = maxHeight / height;
		height = maxHeight;
		width = width * ratio;
	}else{
		width = width;
		height = height;
	}

	//DRAWING IMAGE FROM SOURCE TO CANVAS:
	cv = document.querySelector("#cv");
	cv.width  = width;
	cv.height = height;
	c = cv.getContext("2d");	
	c.drawImage(img,0,0,width,height);
		
	//GETTING RGBA VALUES FROM CANVAS:
	let rgbaArray = [];
	let idata = c.getImageData(0, 0, width, height);
    for (var fi = 0; fi < idata.data.length; fi += 4){
        rgbaArray.push(idata.data[fi]);
        rgbaArray.push(idata.data[fi+1]);
        rgbaArray.push(idata.data[fi+2]);
        rgbaArray.push(idata.data[fi+3]); 
	} 

	//DELETING ALPHA CHANNEL:
	let i = rgbaArray.length;
	while (i--){
		(i + 1) % 4 === 0 && rgbaArray.splice(i, 1);
	}
	
	//CHUNKING ARRAY TO RGB VALUES:
	function chunkArray(rgbaArray, chunk_size) {
		let results = [];
		while (rgbaArray.length) {
			results.push(rgbaArray.splice(0, chunk_size));
		}
		return results;
	}
	rgbArray = chunkArray(rgbaArray, 3);	

	//CALCULATING Z-POSITION OF CUBES:
	let calculatedZ = [];
	calculatedZ = rgbArray .map(arr => arr.reduce((sum, item) => sum += item, 0));

	//CREATING SCENE && CAMERA:
	let size = 700;
	let scene = new THREE.Scene();
	let camera = new THREE.PerspectiveCamera(75, size/size, 0.1, 1000);
	scene.background = new THREE.Color(0x000000, 0.0);
	let renderer = new THREE.WebGLRenderer();
	renderer.setSize(size, size);
	document.body.appendChild(renderer.domElement);

	//DRAW CUBES:
	let intensity = 765/intensityInput.value;
	let a = 0;
	for (i=0; i < calculatedZ.length/width; i++){
		for (j=0; j < calculatedZ.length/height; j++, a++){
			let color = (rgbArray[a][0] + "," + rgbArray[a][1] + "," + rgbArray[a][2]);
			let geometry = new THREE.BoxGeometry(1, 1, 1); //for beams use: 1,1,calculatedZ[a]/intensity - standart is: (1,1,1)
			let material = new THREE.MeshBasicMaterial({color:(`rgb(${color})`)});
			let cube = new THREE.Mesh(geometry, material);
			scene.add(cube);
			cube.position.x = j-width/2; cube.position.y = -i;
			if(document.getElementById("invertCheckbox").checked){
				cube.position.z = -Math.abs(calculatedZ[a]/intensity); //negative value brings the darker pixels to the front
			}else{
				cube.position.z = calculatedZ[a]/intensity;
			} 
		}
	}	 
	loading.style.display = "none";
	refresh.style.display = "block"
	
	//INITIAL CAMERAPOSITIONS FOR 225 X 225 PICTURES:
	camera.position.y = -height/2;
	camera.position.z = width;
	scene.rotation.y = .55;

	//ANIMATE SCENE:
	let animate = function(){
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	};
	animate();
};
