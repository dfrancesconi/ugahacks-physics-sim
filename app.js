

let container;      	// keeping the canvas here for easy access
let scene;
let camera;
let renderer;

let objectControls;     // instance to regulate controls.
let cameraControls;

let controls = [];      // array of instances from a class (new in javascript)


let numcubes = 1;       // increase the number of cubes.

const clock = new THREE.Clock();
const loader = new THREE.TextureLoader();

var collidableMeshList = [];
var resetMeshList = [];
let walls = [];
let wallNum = 0;


// create some random colors
function getColor()
{   // reduce letter choices for a different palate
    let letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for( let i=0; i<3; i++ )
    {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

function removeWall()
{
    scene.remove(walls.pop());
    wallNum--;
}

function addWall()
{
    // Create Geometry
    const boxWidth  = 3;
    const boxHeight = .5;
    const boxDepth  = 3;


    let geometry  = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );

    walls.push( createWall( geometry, getColor(), walls.length * 3, 2, 'cube') );
    wallNum++;


}

// Creating a single Cube here.
function createWall( geometry, color, xpos, ypos, name )
{
    const material = new THREE.MeshPhongMaterial( {color} );
    //const material = new THREE.MeshNormalMaterial();
    material.transparent = true;

    // create a Mesh containing the geometry and material
    let wall = new THREE.Mesh( geometry, material );
    wall.name = name;

    // add the cube to the scene
    scene.add(wall);
    collidableMeshList.push(wall);
    wall.position.x = xpos;
    wall.position.y = ypos;
    return wall;
}

// -----------------------------------------------------------------------
// bottom functions same as earlier project
// -----------------------------------------------------------------------
function createCamera()
{
    // Create a Camera  -------------------------------------------------
    const aspect = container.clientWidth / container.clientHeight;
    const fov=50;           // fov = Field Of View
    const near = 0.1;          // the near clipping plane
    const far = 100;          // the far clipping plane
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    // camera.position.set( 0, 0, 10 );
    // every object is initially created at ( 0, 0, 0 )
    // we'll move the camera **back** a bit so that we can view the scene
    camera.position.x = -2;   // x+ is to the right.
    camera.position.y = 6;    // y+ is up.
    camera.position.z = 4;   // z+ moves camera closer (to us). z- further away.
    camera.position.set( -10, 10, 20 );
    //camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    camera.lookAt( scene.position );
}


function createCameraControls()
{
    cameraControls = new THREE.OrbitControls( camera, container );
    cameraControls.keys = {
        LEFT: 'j',
        UP: 'i',
        RIGHT: 'l',
        BOTTOM: 'k'
    };
}



function createLights()
{
    // Create a directional light
    const light1 = new THREE.DirectionalLight( 0xffffff, 1.0 );
    // move the light back, right and up a bit
    light1.position.set( 4, 4, 8 );
    light1.castShadow = 'true';
    // remember to add the light to the scene
    scene.add( light1 );

    /* play around with multiple lights
    // Create another directional light */
    const light2 = new THREE.DirectionalLight( 0xffffff, 0.7 );
    // move the light back, left and down a bit */
    light2.position.set( -20, -20, 10 );
    // remember to add the light to the scene
    scene.add( light2 );
    //light1.target(0,0,0) - light points by default to origin

}

function createHelperGrids()
{
    // Create a Helper Grid ---------------------------------------------
    let size = 40;
    let divisions = 40;

    // Ground
    let gridHelper = new THREE.GridHelper( size, divisions, 0xff5555, 0x444488 );
    scene.add( gridHelper );

    //  Vertical
    let gridGround = new THREE.GridHelper( size, divisions, 0x55ff55, 0x667744 );
    gridGround.rotation.x = Math.PI / 2;
    scene.add( gridGround );
}

function createRenderer()
{
    //renderer = new THREE.WebGLRenderer();
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    // we set this according to the div container.
    renderer.setSize( container.clientWidth, container.clientHeight );
    renderer.setClearColor( 0x000000, 1.0 );
    container.appendChild( renderer.domElement );  // adding 'canvas; to container here
    // render, or 'create a still image', of the scene
}

//
// set the animation loop - setAnimationLoop  will do all the work for us.
function play()
{
    renderer.setAnimationLoop( ( timestamp ) =>
    {
        update( timestamp );
        render();
    } );

    // we used the funky - arrow function for our function here, for more details
    // on this syntax see here:
    // https://www.w3schools.com/js/js_arrow_function.asp
}

function addWavyPlane()
{
    let planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 30);
    let planeMesh = new THREE.MeshBasicMaterial(
        {
            //color: 0x2244ee,
            side: THREE.DoubleSide,
            map: loader.load("textures/lava.jpg"),
            wireframe: false
        }
    );
    plane = new THREE.Mesh(planeGeometry, planeMesh);
    plane.rotateOnAxis( new THREE.Vector3(1,0,0), -Math.PI/2 );
    scene.add(plane);
    plane.position.y = -5;
    resetMeshList.push(plane);
}

// Create NewtonBall object
let m = new THREE.Vector3(0, 0, 0);
let nBall = new NewtonBall(scene, 'ball1', {color: 0x2244ee}, 0, 5, 0, m);

let keydown = '';
document.body.addEventListener('keydown', e => {
    keydown = e.key;
});
document.body.addEventListener('keyup', e => {
    keydown = '';
});

let trailTime = 0;

function update( timestamp )
{

    const t = clock.getElapsedTime();
    nBall.update();
    nBall.makeTrail(scene, trailTime);
    trailTime++;

    //document.onkeydown = function(e) {
        switch (keydown) {
            case 'd':
                walls[wallNum-1].rotation.x += 0.05;
                break;
            case 'w':
                walls[wallNum-1].rotation.z -= 0.05;
                break;
            case 'a':
                walls[wallNum-1].rotation.x -= 0.05;
                break;
            case 's':
                walls[wallNum-1].rotation.z += 0.05;
                break;
            case 'r':
                walls[wallNum-1].rotation.x = 0;
                walls[wallNum-1].rotation.z = 0;
                break;
            case 'ArrowUp':
                walls[wallNum-1].position.x += 0.1;
                break;
            case 'ArrowLeft':
                walls[wallNum-1].position.z -= 0.1;
                break;
            case 'ArrowDown':
                walls[wallNum-1].position.x -= 0.1;
                break;
            case 'ArrowRight':
                walls[wallNum-1].position.z += 0.1;
                break;
            case 'e':
                walls[wallNum-1].position.y += 0.1;
                break;
            case 'q':
                walls[wallNum-1].position.y -= 0.1;
                break;
        }
    //};
    document.onkeydown = function(e) {
        switch (e.key) {
            case 'g':
                nBall.toggleGravity();
                break;
            case 'n':
                addWall();
                break;
            case 'Backspace':
                removeWall();
                break;
        }
    };




    plane.geometry.vertices.map(v =>
        {
            const waveX1 = .5*Math.sin(2*v.x + 2*v.y + t); // Diagonal wave
            const waveX3 = .5*Math.sin(1 * Math.sqrt((v.x * v.x + v.y * v.y)) + t);
            //const waveX2 = .25*Math.sin(v.x + 2*t);
            //const waveY1 = .25*Math.sin(v.y + t);
            v.z = waveX3;

        }
    );
    plane.geometry.verticesNeedUpdate = true;



}


// called by play
function render( )
{
    // render, or 'create a still image', of the scene
    renderer.render( scene, camera );
}


function onWindowResize()
{
    // set the aspect ratio to match the new browser window aspect ratio
    camera.aspect = container.clientWidth / container.clientHeight;

    // update the camera's frustum - so that the new aspect size takes effect.
    camera.updateProjectionMatrix();

    // update the size of the renderer AND the canvas (done for us!)
    renderer.setSize( container.clientWidth, container.clientHeight );
}


function init()
{
    // Get a reference to the container element that will hold our scene
    container = document.querySelector('#scene-container');

    // Just set this resizing up right away - we are suing of window here.
    window.addEventListener( 'resize', onWindowResize );

    // Create a Bare Scene-----------------------------------------------
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x555555 )

    // Create a Camera  -------------------------------------------------
    createCamera();

    // Let there be Light  ---------------------------------------------
    createLights();

    // Create a Grids Horizontal & Vertical -----------------------------
    //createHelperGrids();

    // Enable the Camera to move around
    createCameraControls();

    // Create the subject of
    //createCubes();

    // Create plane
    addWavyPlane();

    addWall();

    scene.add(nBall.ball);

    // Create & Install Renderer ---------------------------------------
    createRenderer();

    play();

    renderer.render( scene, camera );  // renders once.

    // -----------------------------------------------------------------------
}

// call the init function to set everything up
init();
