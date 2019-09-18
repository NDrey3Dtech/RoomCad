 var renderer
var saphi_mesh
var control
var controls
var pickable = [] 

var scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.x = 1000;
camera.position.y = 1000;
camera.position.z = 1000;
camera.lookAt(0, 0, 1000);
var renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(new THREE.Color(0x505050));
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera);
//control = new TransformControls( camera, renderer.domElement );


var mouse = new RayysMouse(renderer, camera);
mouse.cb.onMouseDown.push(function(pos, sender) {
	// check if noting under the mouse, then deselect all
  
});

var mouseMove = new RayysMouseMove(mouse, controls);
 scene.add(mouseMove.translationPlaneHelper);

// white spotlight shining from the side, casting a shadow
var spotLight = new THREE.SpotLight(0xffffff, 2.5, 10000, Math.PI / 2);
spotLight.position.set(1000, 1000, 1000);
scene.add(spotLight);

var snaps = new RayysSnap(1000);

var colors = new RayysWebColors();

  var bok = new THREE.BoxGeometry(16, 720, 280);
  var vaz = new THREE.BoxGeometry(368, 16, 280);
  
  var geometry0 = new THREE.BoxGeometry(400, 720, 280);
  
  var material = new THREE.MeshPhongMaterial({
    color: colors.pickRandom().hex
  });
  
  var material0 = new THREE.MeshPhongMaterial({
    color: colors.pickRandom().hex,
    transparent: true,
    opacity: 1,
    
  });
  material0.visible=false;
  
/*var cube = new THREE.Mesh( geometry, material );
var cube1 = new THREE.Mesh( geometry, material );
cube1.position.set(192,0,0)
var cube2 = new THREE.Mesh( geometry, material );
cube2.position.set(-192,0,0)
cube0.add( cube1,cube2 );
mouseMove.objects.push(cube0);
mouseMove.objects.push(cube);
*/
var cube0 = new THREE.Mesh( geometry0, material0 );
var targetsObj = snaps.add(cube0);
 scene.add(targetsObj);
 var bokL = new THREE.Mesh( bok, material );
 var bokR = new THREE.Mesh( bok, material );
 var vazN = new THREE.Mesh( vaz, material );
 var vazV = new THREE.Mesh( vaz, material );
bokL .position.set(-192,0,0)
bokR .position.set(192,0,0)
vazN .position.set(0,-352,0)
vazV .position.set(0,352,0)
mouseMove.objects.push(cube0);
cube0.add( bokL,bokR, vazV, vazN );
 scene.add(cube0); 
//scene.add(cube); 
//snaps.add(cube);
var cube1 = new THREE.Mesh( geometry0, material0 );
var targetsObj = snaps.add(cube1);
 scene.add(targetsObj);
 var bokL = new THREE.Mesh( bok, material );
 var bokR = new THREE.Mesh( bok, material );
 var vazN = new THREE.Mesh( vaz, material );
 var vazV = new THREE.Mesh( vaz, material );
bokL .position.set(-192,0,0)
bokR .position.set(192,0,0)
vazN .position.set(0,-352,0)
vazV .position.set(0,352,0)
mouseMove.objects.push(cube1);
cube1.add( bokL,bokR, vazV, vazN );
 scene.add(cube1); 
 
 function init() {
    container = document.createElement("div")
    document.body.appendChild(container)



    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.z = 500
    camera.position.y = 50

    scene = new THREE.Scene()

    var ambientLight = new THREE.AmbientLight(0xbbbbbb);
    scene.add(ambientLight);
    var gridXZ = new THREE.GridHelper(100, 10, 0xff0000, 0xffffff);
    scene.add(gridXZ);

    var geometry0 = new THREE.BoxGeometry(200, 200, 200);

    // clone wont work ... seems to retain the same material
    var cube1 = new THREE.Mesh(geometry0, new THREE.MeshLambertMaterial({
        color: 0xff1234
    }));
	
    cube1.position.y = 50;
    cube1.name = "cube1";

    sphere = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshLambertMaterial());

    scene.add(cube1);
    pickable.push(cube1);

    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
	
    control = new THREE.TransformControls(camera, renderer.domElement);
    pickable.push(control);
    control.addEventListener('change', render);
    container.appendChild(renderer.domElement)
    renderer.domElement.addEventListener("mousedown", onClick, false)
    window.addEventListener("keydown", keydown, false)
}
function keydown(event) {
    if (event.keyCode == 27) {
        scene.remove(control);
    }
}

function onClick(event) {
    x = (event.clientX / window.innerWidth) * 2 - 1;
    y = -(event.clientY / window.innerHeight) * 2 + 1;
    dir = new THREE.Vector3(x, y, -1)
    dir.unproject(camera)

    ray = new THREE.Raycaster(camera.position, dir.sub(camera.position).normalize())

    var intersects = ray.intersectObjects(pickable)
    if (intersects.length > 0) {
        var SELECTED = intersects[0].object;
        scene.add(control);
        control.attach(SELECTED);
    }
}

var bboxFactory = new RayysBBoxGeometry();
var decorator = new RayysObjectDecorator();
decorator.decorators.material = function(object) {
    
     var tmaterial = new THREE.MeshBasicMaterial({color: 0x0});
     tmaterial.visible = false
return tmaterial;

};



decorator.decorators.children = function(object) {
	object.geometry.computeBoundingBox();
	return [
  	bboxFactory.create(object.geometry.boundingBox)
  ]
};

mouseMove.cb.onBeforeStart.push(function(obj) {
	decorator.reset();
	decorator.decorate(obj);
});
mouseMove.cb.onVoidClick.push(function() {
	decorator.reset();
});
mouseMove.cb.onPreviewObjectMove.push(function(obj, pos, sender) {
  let res = snaps.snap(obj, pos);
  return res;
});
mouseMove.cb.onObjectMove.push(function(obj, pos, sender) {
  let oldTargetsNode = snaps.getTargetsNode(obj);
  let newTargetsNode = snaps.update(obj);
  scene.remove(oldTargetsNode);
  //scene.add(newTargetsNode);
});

document.toggle = function(mode) {
  mouseMove.toggle(mode);
  $(".mode").removeClass("active");
  $(`#move-${mode}`).addClass("active");
}

var animate = function() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

animate()
