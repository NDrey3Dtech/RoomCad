/* class RayysMouseMove {

  constructor(rayysMouse, controls) {
    this.camera = rayysMouse.camera;

    this.mouse = rayysMouse;
    this.controls = controls || this.mouse.controls;
    this.mouse.controls = undefined; // overtake mouse controls, if any defined

    this.objects = [];
    this.cb = {
      onModeChanged: [],
      onObjectEnter: [],
      onObjectLeave: [],
      onBeforeStart: [], //callbacks here may return false to prevent operation
      onPreviewObjectMove: [], //callbacks here may return alternative position
      onObjectMove: [],
      onObjectReleased: [],
      onVoidClick: []
    };
    this.raycaster = new THREE.Raycaster();

    this.translationLimits = new THREE.Vector3();
    this.translationPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    this.translationPlaneHelper = new THREE.PlaneHelper(this.translationPlane, 10, 0xff0000);

    this.toggle("xz");

    var handleMouseDown = function(pos) {
      console.log(`Mouse down at: ${JSON.stringify(pos)}`);

      this.raycaster.setFromCamera(pos, this.camera);
      var intersects = this.raycaster.intersectObjects(this.objects, true);
      if (intersects.length > 0) {

        var canProceed = true;
        // check with subscribers, if this object is movable in current context
        for (let i = 0; i < this.cb.onBeforeStart.length; i++) {
          if (this.cb.onBeforeStart[i](intersects[0].object, this) === false) {
            canProceed = false;
          }
        }
        if (!canProceed) return;

        if (this.controls) {
          this.controls.enablePan = false;
          this.controls.enableRotate = false;
        }

        this.pickPoint = intersects[0].point;
        let pickedObj = intersects[0].object
        if (this.objects.indexOf(pickedObj) !== -1) {
        	this.pickedObj = pickedObj;
        } else {
          let pickedParent = pickedObj.parent;
          while (pickedParent) {
          	if (this.objects.indexOf(pickedParent) !== -1) {
            	this.pickedObj = pickedParent;
              break;
            }
          	pickedParent = pickedParent.parent;
          }
          if (!this.pickedObj) {
          	return;
          }
        }
        this.objStartPos = this.pickedObj.position.clone();
        this.tranlsationMatrix = new THREE.Matrix4();

        // todo, this has to be adjusted
        this.translationPlane.constant = this.getPlaneConst(this.pickPoint);
      } else {
        if (this.controls) {
          this.controls.enablePan = true;
          this.controls.enableRotate = true;
        }

        this.pickPoint = undefined;
        this.pickedObj = undefined;
        this.objStartPos = undefined;
        this.tranlsationMatrix = undefined;

        for (let i = 0; i < this.cb.onVoidClick.length; i++) {
          this.cb.onVoidClick[i](this);
        }
      }
    };

    var handleMouseMove = function(pos) {
      // console.log(`Mouse moved to: ${JSON.stringify(pos)}`);

      this.raycaster.setFromCamera(pos, this.camera);
      if (!this.mouse.mouseDown) {
        // hover testing
        var intersects = this.raycaster.intersectObjects(this.objects);

        if (intersects.length > 0) {
          this.hoveredObj = intersects[0].object;

          // let subscribers know that object was hovered by mouse
          for (let i = 0; i < this.cb.onObjectEnter.length; i++) {
            this.cb.onObjectEnter[i](this.hoveredObj, this);
          }
        } else {
          if (this.hoveredObj) {
            var leftObj = this.hoveredObj;
            this.hoveredObj = undefined;

            // let subscribers know that object was unhovered
            for (let i = 0; i < this.cb.onObjectLeave.length; i++) {
              this.cb.onObjectLeave[i](leftObj, this);
            }
          }
        }
      } else if (this.pickedObj !== undefined) {
        if (this.controls) {
          // this will disable controls completely, including zoom by wheel
          this.controls.enabled = false;
        }

        var line = new THREE.Line3(
          this.raycaster.ray.origin,
          this.raycaster.ray.origin.clone().add(
            this.raycaster.ray.direction.multiplyScalar(this.camera.far)));

        var res = new THREE.Vector3();
        this.translationPlane.intersectLine(line, res);

        var offs = res.sub(this.pickPoint).multiply(this.translationLimits);
        var newObjectPosition = this.objStartPos.clone().add(offs);

        // let subscribers to preview future object position, and correct it as needed 
        // (for example to avoid object collision)
        for (let i = 0; i < this.cb.onPreviewObjectMove.length; i++) {
          var alternativePos = this.cb.onPreviewObjectMove[i](this.pickedObj, newObjectPosition, this);
          if (alternativePos) {
            newObjectPosition.copy(alternativePos);
          }
        }

        // update snap planes for this object
        this.pickedObj.position.copy(newObjectPosition);
        this.pickedObj.updateMatrix ();

        // let subscribers know that object was moved
        for (let i = 0; i < this.cb.onObjectMove.length; i++) {
          this.cb.onObjectMove[i](this.pickedObj, this);
        }
      }
    };

    var handleMouseUp = function(pos) {
      console.log(`Mouse up at: ${JSON.stringify(pos)}`);

      if (this.controls) {
        this.controls.enabled = true;
        this.controls.enablePan = true;
        this.controls.enableRotate = true;
      }

      this.pickPoint = undefined;
      this.pickedObj = undefined;
      this.objStartPos = undefined;
      this.tranlsationMatrix = undefined;

      // let subscribers know that object was released by mouse (i.e. not moving anymore)
      for (let i = 0; i < this.cb.onObjectReleased.length; i++) {
        this.cb.onObjectReleased[i](leftObj, this);
      }
    };

    this.mouse.subscribe(
      handleMouseDown.bind(this),
      handleMouseMove.bind(this),
      handleMouseUp.bind(this));
  }

  toggle(mode) {
    if (mode === this.mode) return;

    this.mode = mode;

    var getPlaneConstXZ = function(p) {
      return p.y;
    }
    var getPlaneConstXY = function(p) {
      return p.z;
    }
    var getPlaneConstYZ = function(p) {
      return p.x;
    }

    if (mode === 'x') {
      this.translationLimits.set(1, 0, 0);
      this.translationPlane.normal.set(0, -1, 0);
      this.translationPlaneHelper.color = 0xff0000;
      this.getPlaneConst = getPlaneConstXZ;
    }
    if (mode === 'y') {
      this.translationLimits.set(0, 1, 0);
      this.translationPlane.normal.set(-1, 0, 0);
      this.translationPlaneHelper.color = 0x00ff00;
      this.getPlaneConst = getPlaneConstYZ;
    }
    if (mode === 'z') {
      this.translationLimits.set(0, 0, 1);
      this.translationPlane.normal.set(0, -1, 0);
      this.translationPlaneHelper.color = 0x0000ff;
      this.getPlaneConst = getPlaneConstXZ;
    }
    if (mode === 'xz') {
      this.translationLimits.set(1, 0, 1);
      this.translationPlane.normal.set(0, -1, 0);
      this.translationPlaneHelper.color = 0xffff00;
      this.getPlaneConst = getPlaneConstXZ;
    }
    if (mode === 'xy') {
      this.translationLimits.set(1, 1, 0);
      this.translationPlane.normal.set(0, 0, -1);
      this.translationPlaneHelper.color = 0xffff00;
      this.getPlaneConst = getPlaneConstXY;
    }
    if (mode === 'yz') {
      this.translationLimits.set(0, 1, 1);
      this.translationPlane.normal.set(-1, 0, 0);
      this.translationPlaneHelper.color = 0xffff00;
      this.getPlaneConst = getPlaneConstYZ;
    }

    // let subscribers know that moving mode was changed
    for (let i = 0; i < this.cb.onModeChanged.length; i++) {
      this.cb.onModeChanged[i](this.mode, this);
    }
  }
}
 */
 var snaps = new RayysSnap(0.5);
var renderer;
var camera;
var controls;

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

var snaps = new RayysSnap(0.5);

var colors = new RayysWebColors();
for (let k=0; k<3; k++) {
  var size = 0.35;
  var geometry = new THREE.BoxGeometry(2*size, size, 3*size);
  var material = new THREE.MeshPhongMaterial({
    color: colors.pickRandom().hex,
    transparent: true,
    opacity: 0.75
  });
  var cube = new THREE.Mesh(geometry, material);
  cube.applyMatrix(new THREE.Matrix4().makeTranslation(-2 + 4*Math.random(), 0, -2 + 4*Math.random()));
  scene.add(cube);
  mouseMove.objects.push(cube);
  var targetsObj = snaps.add(cube);
  scene.add(targetsObj);
}



/*  geometry = new THREE.BoxGeometry( 1, 1, 1 );
 material = new THREE.MeshBasicMaterial( {color: 0x009000} );
var cube0 = new THREE.Mesh( geometry, material );
var cube1 = new THREE.Mesh( geometry, material );
cube1.position.set(2,0,0)
var cube2 = new THREE.Mesh( geometry, material );
cube2.position.set(-2,0,0)
cube0.add( cube1,cube2 );
mouseMove.objects.push(cube0);
scene.add(cube0); */



mouseMove.raycaster.linePrecision = 0.25;
mouseMove.cb.onObjectEnter.push(function(obj) {
  obj.material.color.set(0xff0000);
  obj.material.needsUpdate = true;
});
mouseMove.cb.onObjectLeave.push(function(obj) {
  obj.material.color.set(0x009000);
  obj.material.needsUpdate = true;
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