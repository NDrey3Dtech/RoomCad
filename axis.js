 var renderer
var saphi_mesh
var control
var controls
var pickable = [] 

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

function animate() {
    requestAnimationFrame(animate)
    render()
}

function render() {
    renderer.render(scene, camera)
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

init()
animate()