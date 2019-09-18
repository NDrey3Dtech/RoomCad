function createLine(shape, color) {
  let points = shape.getPoints(3);
  let geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
  let line = new THREE.Line(geometryPoints, new THREE.LineBasicMaterial({
    color: color
  }));
  return line;
}

function updateClipperPath(lineObj) {
  let matrix = lineObj.matrix;
  let arr = lineObj.geometry.attributes.position.array;

  if (!lineObj.userData.clipperPath) {
    lineObj.userData.clipperPath = [];
  }

  let target = lineObj.userData.clipperPath;

  if (target.length !== arr.length / 3) {
    target.length = arr.length / 3;
  }

  let j = 0;
  for (let i = 0; i < arr.length; i += 3, j ++) {
    let p = new THREE.Vector3(arr[i], arr[i + 1], arr[i + 2]);
    p.applyMatrix4(matrix);

    target[j] = { X: p.x, Y: p.z };
  }
  
  var scale = 100;
	ClipperLib.JS.ScaleUpPath(target, scale);
}

var renderer;
var camera;
var controls;

var cpr = new ClipperLib.Clipper();

var scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 1000);

renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(new THREE.Color(0xffffff));
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

camera.position.x = 1;
camera.position.y = 25;
camera.position.z = 5;
camera.lookAt(0, 0, 0);

controls = new THREE.OrbitControls(camera);

let mouse = new RayysMouse(renderer, camera, controls);
let mouseMove = new RayysMouseMove(mouse, controls);

var size = 10;
var divisions = 10;
var gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

// shapes

var x = 0,
  y = 0;
var s = 0.01;
var heartShape = new THREE.Shape();
heartShape.moveTo(x + s * 25, y + s * 25);
heartShape.bezierCurveTo(x + s * 25, y + s * 25, x + s * 20, y, x, y);
heartShape.bezierCurveTo(x - s * 30, y, x - s * 30, y + s * 35, x - s * 30, y + s * 35);
heartShape.bezierCurveTo(x - s * 30, y + s * 55, x - s * 10, y + s * 77, x + s * 25, y + s * 95);
heartShape.bezierCurveTo(x + s * 60, y + s * 77, x + s * 80, y + s * 55, x + s * 80, y + s * 35);
heartShape.bezierCurveTo(x + s * 80, y + s * 35, x + s * 80, y, x + s * 50, y);
heartShape.bezierCurveTo(x + s * 35, y, x + s * 25, y + s * 25, x + s * 25, y + s * 25);

// Square
var sqLength = s * 80;
var squareShape = new THREE.Shape();
squareShape.moveTo(0, 0);
squareShape.lineTo(sqLength, 0);
squareShape.lineTo(sqLength, sqLength);
squareShape.lineTo(0, sqLength);
squareShape.lineTo(0, 0);

// Rectangle
var rectLength = s * 120,
  rectWidth = s * 40;
var rectShape = new THREE.Shape();
rectShape.moveTo(0, 0);
rectShape.lineTo(0, rectWidth);
rectShape.lineTo(rectLength, rectWidth);
rectShape.lineTo(rectLength, 0);
rectShape.lineTo(0, 0);

// Rounded rectangle
var roundedRectShape = new THREE.Shape();
(function roundedRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
  ctx.lineTo(x + width - radius, y + height);
  ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  ctx.lineTo(x + width, y + radius);
  ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
  ctx.lineTo(x + radius, y);
  ctx.quadraticCurveTo(x, y, x, y + radius);
})(roundedRectShape, 0, 0, s * 50, s * 50, s * 20);

// Track
var trackShape = new THREE.Shape();
trackShape.moveTo(s * 40, s * 40);
trackShape.lineTo(s * 40, s * 160);
trackShape.absarc(s * 60, s * 160, s * 20, Math.PI, 0, true);
trackShape.lineTo(s * 80, s * 40);
trackShape.absarc(s * 60, s * 40, s * 20, 2 * Math.PI, Math.PI, true);

// Circle
var circleRadius = s * 40;
var circleShape = new THREE.Shape();
circleShape.moveTo(0, circleRadius);
circleShape.quadraticCurveTo(circleRadius, circleRadius, circleRadius, 0);
circleShape.quadraticCurveTo(circleRadius, -circleRadius, 0, -circleRadius);
circleShape.quadraticCurveTo(-circleRadius, -circleRadius, -circleRadius, 0);
circleShape.quadraticCurveTo(-circleRadius, circleRadius, 0, circleRadius);

// Fish
var fishShape = new THREE.Shape();
fishShape.moveTo(x, y);
fishShape.quadraticCurveTo(x + s * 50, y - s * 80, x + s * 90, y - s * 10);
fishShape.quadraticCurveTo(x + s * 100, y - s * 10, x + s * 115, y - s * 40);
fishShape.quadraticCurveTo(x + s * 115, y, x + s * 115, y + s * 40);
fishShape.quadraticCurveTo(x + s * 100, y + s * 10, x + s * 90, y + s * 10);
fishShape.quadraticCurveTo(x + s * 50, y + s * 80, x, y);

// Spline shape
var splinepts = [];
splinepts.push(new THREE.Vector2(s * 70, s * 20));
splinepts.push(new THREE.Vector2(s * 80, s * 90));
splinepts.push(new THREE.Vector2(-s * 30, s * 70));
splinepts.push(new THREE.Vector2(0, 0));
var splineShape = new THREE.Shape();
splineShape.moveTo(0, 0);
splineShape.splineThru(splinepts);

// California
var californiaPts = [];
californiaPts.push(new THREE.Vector2(s * 610, s * 320));
californiaPts.push(new THREE.Vector2(s * 450, s * 300));
californiaPts.push(new THREE.Vector2(s * 392, s * 392));
californiaPts.push(new THREE.Vector2(s * 266, s * 438));
californiaPts.push(new THREE.Vector2(s * 190, s * 570));
californiaPts.push(new THREE.Vector2(s * 190, s * 600));
californiaPts.push(new THREE.Vector2(s * 160, s * 620));
californiaPts.push(new THREE.Vector2(s * 160, s * 650));
californiaPts.push(new THREE.Vector2(s * 180, s * 640));
californiaPts.push(new THREE.Vector2(s * 165, s * 680));
californiaPts.push(new THREE.Vector2(s * 150, s * 670));
californiaPts.push(new THREE.Vector2(s * 90, s * 737));
californiaPts.push(new THREE.Vector2(s * 80, s * 795));
californiaPts.push(new THREE.Vector2(s * 50, s * 835));
californiaPts.push(new THREE.Vector2(s * 64, s * 870));
californiaPts.push(new THREE.Vector2(s * 60, s * 945));
californiaPts.push(new THREE.Vector2(s * 300, s * 945));
californiaPts.push(new THREE.Vector2(s * 300, s * 743));
californiaPts.push(new THREE.Vector2(s * 600, s * 473));
californiaPts.push(new THREE.Vector2(s * 626, s * 425));
californiaPts.push(new THREE.Vector2(s * 600, s * 370));
californiaPts.push(new THREE.Vector2(s * 610, s * 320));
for (var i = 0; i < californiaPts.length; i++) californiaPts[i].multiplyScalar(0.25);
var californiaShape = new THREE.Shape(californiaPts);

// Triangle
var triangleShape = new THREE.Shape();
triangleShape.moveTo(s * 80, s * 20);
triangleShape.lineTo(s * 40, s * 80);
triangleShape.lineTo(s * 120, s * 80);
triangleShape.lineTo(s * 80, s * 20); // close path

let shapes = [
  heartShape,
  squareShape,
  rectShape,
  roundedRectShape,
  trackShape,
  circleShape,
  fishShape,
  splineShape,
  californiaShape,
  triangleShape
]

for (let i in shapes) {
  let line = createLine(shapes[i], 0x000000);
  line.rotation.x = Math.PI / 2;
  line.position.x = -4 + 2 * (i % 4) + 0.1 * Math.random();
  line.position.z = -4 + 2 * Math.floor(i / 4) + 0.1 * Math.random();
  scene.add(line);
  mouseMove.objects.push(line);
  line.updateMatrix();
  updateClipperPath(line);
}

mouseMove.raycaster.linePrecision = 0.25;
mouseMove.cb.onObjectEnter.push(function(obj) {
  obj.material.color.set(0xff0000);
  obj.material.needsUpdate = true;
});
mouseMove.cb.onObjectLeave.push(function(obj) {
  obj.material.color.set(0x000000);
  obj.material.needsUpdate = true;
});
mouseMove.cb.onPreviewObjectMove.push(function(obj, newPos) {
	let oldPos = obj.position.clone();
  
  obj.position.copy(newPos);
  obj.updateMatrix();
  updateClipperPath(obj);

  cpr.Clear();

  for (let line of mouseMove.objects) {
    if (line === obj) {
      let b = cpr.AddPath(line.userData.clipperPath, ClipperLib.PolyType.ptClip, true);
      // console.log(b);
    } else {
      let b = cpr.AddPath(line.userData.clipperPath, ClipperLib.PolyType.ptSubject, true);
      // console.log(b);
    }
  }

  let solution_paths = new ClipperLib.Paths();
  let succeeded = cpr.Execute(ClipperLib.ClipType.ctIntersection, solution_paths, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

	if (succeeded && solution_paths.length > 0) {

    obj.position.copy(oldPos);
    obj.updateMatrix();

    obj.material.color.set(0x00ff00);
    obj.material.needsUpdate = true;

    return oldPos;
  } else {
    obj.material.color.set(0xff0000);
    obj.material.needsUpdate = true;
    return null;
  }
});

mouse.subscribe(
  function onMouseDown(pos) {
    //console.log(`down: ${JSON.stringify(pos)}`);
  },
  function onMouseMove(pos) {
    //console.log(`move: ${JSON.stringify(pos)}`);
  },
  function onMouseUp(pos) {
    //console.log(`  up: ${JSON.stringify(pos)}`);
  });

var animate = function() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

animate();
