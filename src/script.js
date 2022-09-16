// https://matheowis.github.io/HDRI-to-CubeMap/

/////////////////////////////////////////////////////////////////////////
///// IMPORT
import './main.css'
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const mixers = []

/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER
const dracoLoader = new DRACOLoader()
const loader = new GLTFLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
dracoLoader.setDecoderConfig({ type: 'js' })
loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.createElement('div')
document.body.appendChild(container)
/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new THREE.Scene()
scene.background = new THREE.Color('#c8f0f9')

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: true}) // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen
renderer.outputEncoding = THREE.sRGBEncoding // set color encoding
container.appendChild(renderer.domElement) // add the renderer to html div

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100)
camera.position.set(34,16,-20)
scene.add(camera)

/////////////////////////////////////////////////////////////////////////
///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener('resize', () => {
    const width = window.innerWidth
    const height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    renderer.setPixelRatio(2)
})

/////////////////////////////////////////////////////////////////////////
///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)

/////////////////////////////////////////////////////////////////////////
///// SCENE LIGHTS
const ambient = new THREE.AmbientLight(0xa0a0fc, 0.82)
scene.add(ambient)

const sunLight = new THREE.DirectionalLight(0xe8c37b, 1.96)
sunLight.position.set(-69,44,14)
scene.add(sunLight)

/////////////////////////////////////////////////////////////////////////
///// CUBE TEXTURE LOADER

const envMaterial = new THREE.MeshStandardMaterial()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const envTexture = cubeTextureLoader.load([
    '/skyCubeMap/px.png',
    '/skyCubeMap/nx.png',
    '/skyCubeMap/py.png',
    '/skyCubeMap/ny.png',
    '/skyCubeMap/pz.png',
    '/skyCubeMap/nz.png',
])

scene.background = envTexture


/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL FROM BLENDER
loader.load('/models/gltf/basic_plane.glb', (gltf) => {
    const plane = gltf.scene
    scene.add(plane)

    plane.traverse(function(model) {
        model.castShadow = true;
        model.receiveShadow = true;
    })

    let target1 = new THREE.Vector3(1,0,0);
    let target2 = new THREE.Vector3(-1,0,0);

    let t1 = new TWEEN.Tween(plane.position)
        .to(target1, 4000)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
    
    /* t1.onUpdate(function() {
        plane.rotation.z = 90*Math.PI/.5
    }) */

    let t2 = new TWEEN.Tween(plane.position)
        .to(target2, 4000)
        .easing(TWEEN.Easing.Sinusoidal.InOut)

    t1.chain(t2)
    t2.chain(t1)
    t1.start();

    const planeMixer = new THREE.AnimationMixer(plane)
    planeMixer.clipAction(gltf.animations[0]).play()
    planeMixer.timeScale = 3

    console.log(gltf.animations)
    mixers.push(planeMixer)
    animate()
})

/////////////////////////////////////////////////////////////////////////
//// INTRO CAMERA ANIMATION USING TWEEN
function introAnimation() {
    controls.enabled = false //disable orbit controls to animate the camera
    
    new TWEEN.Tween(camera.position.set(0,3,12 )).to({ // from camera position
        x: 15, //desired x position to go
        y: 13, //desired y position to go
        z: 15 //desired z position to go
    }, 6500) // time take to animate
    .delay(1000).easing(TWEEN.Easing.Quartic.InOut).start() // define delay, easing
    .onComplete(function () { //on finish animation
        controls.enabled = true //enable orbit controls
        setOrbitControlsLimits() //enable controls limits
        TWEEN.remove(this) // remove the animation from memory
    })
}

introAnimation() // call intro animation on start

/////////////////////////////////////////////////////////////////////////
//// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits(){
    controls.enableDamping = true
    controls.dampingFactor = 1
    controls.minDistance = 10
    controls.maxDistance = 60
    controls.enableRotate = true
    controls.enableZoom = true
    // controls.maxPolarAngle = Math.PI /2.5
}

/////////////////////////////////////////////////////////////////////////
//// GLTF Animation Loop

const clock = new THREE.Clock()

function animate() {
	requestAnimationFrame( animate );
	// Get the time elapsed since the last frame
	var mixerUpdateDelta = clock.getDelta();
	// Update all the animation frames
	for ( var i = 0; i < mixers.length; ++ i ) {
		mixers[ i ].update( mixerUpdateDelta );
	}		
	renderer.render( scene, camera );
}



/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION
function rendeLoop() {

    TWEEN.update() // update animations

    controls.update() // update orbit controls

    renderer.render(scene, camera) // render the scene using the camera

    requestAnimationFrame(rendeLoop) //loop the render function
    
}

rendeLoop() //start rendering