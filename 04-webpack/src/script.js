import './style.css'
import * as THREE from 'three'
import Voronoi from 'voronoi'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm//geometries/TextGeometry.js';


//game type
const gameType = new Object();
gameType.neoShuffle = true;
gameType.classicShuffle = true;
gameType.spaceInvaders = true;
gameType.blackJack = true;
gameType.neoCurling = true;

//game states
//idle, inProgress, endOfRound, endOfGame
let gameState = "idle";

var instructions = document.getElementById('instructions');

//score and round trackers

let shotsThrown = 0;
let roundsPlayed = 0;




//---------------------kiosk stuff-------------------



//----start Game---
var startGameBtn = document.getElementById('startGame');

function startGame() {
    shotsThrown = 0
    roundsPlayed = 0
    gameState = "inProgress";
    console.log("run");
    turnNumber.innerHTML = (shotsThrown + 1).toString();
    roundNumberTxt.innerHTML = (roundsPlayed + 1).toString();
}

startGameBtn.onclick = function() { startGame() };

//----manually increment shot----
var backTurn = document.getElementById('backTurn');
var nextTurn = document.getElementById('nextTurn');
var turnNumber = document.getElementById('turnNumber');

turnNumber.innerHTML = (shotsThrown + 1).toString();


function shotsThrownUp() {
    shotsThrown = shotsThrown + 1;
    turnNumber.innerHTML = (shotsThrown + 1).toString();
    if (shotsThrown > 8) {
        shotsThrown = 8;
        turnNumber.innerHTML = "8";
    }
    console.log("shotsThrown = ", shotsThrown);
    callAPI("TableData", 1, "PATCH", '{"ShotsPlayed":' + shotsThrown + '}')
};

function shotsThrownDown() {
    shotsThrown = shotsThrown - 1;
    if (shotsThrown < 0) {
        shotsThrown = 0;
    }
    turnNumber.innerHTML = (shotsThrown + 1).toString();
    console.log("shotsThrown = ", shotsThrown);
    callAPI("TableData", 1, "PATCH", '{"ShotsPlayed":' + shotsThrown + '}')

};

backTurn.onclick = function() { shotsThrownDown() };
nextTurn.onclick = function() { shotsThrownUp() };

//--- Start Next Round ---

var startNextRoundBtn = document.getElementById('startNextRound');
var roundNumberTxt = document.getElementById('roundNumber');

roundNumberTxt.innerHTML = (roundsPlayed + 1).toString()

startNextRoundBtn.onclick = () => {
    shotsThrown = 0;
    roundsPlayed = roundsPlayed + 1;
    roundNumberTxt.innerHTML = (roundsPlayed + 1).toString();
    if (roundsPlayed > 7) {
        roundsPlayed = 8;
        roundNumberTxt.innerHTML = "8";
    }

    turnNumber.innerHTML = (shotsThrown + 1).toString();
    gameState = "inProgress";

};




//----select game-----
const selectNS = document.getElementsByClassName("selectNS")[0];
const selectCS = document.getElementsByClassName("selectCS")[0];
const selectSI = document.getElementsByClassName("selectSI")[0];
const selectBJ = document.getElementsByClassName("selectBJ")[0];
const selectCU = document.getElementsByClassName("selectCU")[0];
const selectALL = document.getElementsByClassName("selectALL")[0];
let gameChanged = false;

function setAllGamesFalse() {
    gameChanged = true;
    gameType.neoShuffle = false;
    gameType.classicShuffle = false;
    gameType.spaceInvaders = false;
    gameType.blackJack = false;
    gameType.neoCurling = false;
};

selectNS.onclick = () => {
    setAllGamesFalse();
    gameType.neoShuffle = true;
};

selectCS.onclick = () => {
    setAllGamesFalse();
    gameType.classicShuffle = true;
};

selectSI.onclick = () => {
    setAllGamesFalse();
    gameType.spaceInvaders = true;
};

selectBJ.onclick = () => {
    setAllGamesFalse();
    gameType.blackJack = true;
};

selectCU.onclick = () => {
    setAllGamesFalse();
    gameType.neoCurling = true;
};

selectALL.onclick = () => {
    setAllGamesFalse();
    gameType.neoShuffle = true;
    gameType.classicShuffle = true;
    gameType.spaceInvaders = true;
    gameType.blackJack = true;
    gameType.neoCurling = true;
};

//---add player---
//---red player
var addRedBtn = document.getElementById('addRedPlayerBtn');
addRedBtn.onclick = () => {
    addRedPlayer();
};


function addRedPlayer() {
    var inputField = document.getElementById('playerNameInputRed');
    var w = inputField.value;
    var li = document.createElement("li");
    var rule = document.createTextNode(w);
    li.appendChild(rule);
    inputField.value = "";

    var removeBtn = document.createElement("input");
    removeBtn.type = "button";
    removeBtn.value = "Remove";
    removeBtn.onclick = remove;
    li.appendChild(removeBtn);
    document.getElementById("redPlayerList").appendChild(li);
}


//---Blue player
var addBlueBtn = document.getElementById('addBluePlayerBtn');
addBlueBtn.onclick = () => {
    addBluePlayer();
};


function addBluePlayer() {
    var inputField = document.getElementById('playerNameInputBlue');
    var w = inputField.value;
    var li = document.createElement("li");
    var rule = document.createTextNode(w);
    li.appendChild(rule);
    inputField.value = "";

    var removeBtn = document.createElement("input");
    removeBtn.type = "button";
    removeBtn.value = "Remove";
    removeBtn.onclick = remove;
    li.appendChild(removeBtn);
    document.getElementById("bluePlayerList").appendChild(li);
}

function remove(e) {
    var el = e.target;
    el.parentNode.remove();
}



const backendless = false;

//set table and puck values
const tableWidth = 600;
const tableLength = 4500;
const puckRadius = 30;
const puckHeight = 20;




var xmlHttp = new XMLHttpRequest();









//create scene
const scene = new THREE.Scene();
const fontLoader = new FontLoader();

//Add Renderer
const renderer = new THREE.WebGLRenderer();
var container = document.getElementById('scene');
var w = container.offsetWidth;
var h = container.offsetHeight;
renderer.setSize(w, h);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

//Background
scene.background = new THREE.CubeTextureLoader()

.setPath('/cubeMaps/space/')
    .load([
        'lft.jpg',
        'rht.jpg',
        'top.jpg',
        'btm.jpg',
        'fnt.jpg',
        'bck.jpg'
    ]);




//Camera
const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 10000);
camera.position.x = 2790;
camera.position.z = 400;
camera.position.y = 2790;
const camLookAt = new THREE.Vector3(300, 0, 1800);


//----------------------------------Changes for backendless----------------------------------
//orbit controls
var controls = new OrbitControls(camera, container);


//Lights
const lightAmb = new THREE.AmbientLight(0x404040, 2.5); // soft white light
// const lightPoint = new THREE.PointLight( 0xffffff, .8, 0, 2 );
scene.add(lightAmb);

const lightGeometry = new THREE.SphereGeometry(5, 32, 16);
const lightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff
});

//table lights
const numLights = 5;
const lightsDist = 1000

for (let i = 0; i < numLights; i++) {
    const lightPoint = new THREE.PointLight(0xffffff, 2.2, 1200, 2);
    const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
    lightPoint.position.set(300, 400, i * lightsDist);
    lightMesh.position.set(300, 400, i * lightsDist);
    scene.add(lightMesh);
    scene.add(lightPoint);
}


//Table
const tableGeometry = new THREE.BoxGeometry(tableWidth, 100, tableLength);

const tableCoreMat = new THREE.MeshPhongMaterial({
    color: 0x250b52
});
// const tableMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe: true} );

const tableOuter = new THREE.Mesh(tableGeometry, tableCoreMat);

scene.add(tableOuter);

tableOuter.position.set(300, -50, 2250);



//Pucks
const puckCylinder = new THREE.CylinderGeometry(puckRadius, puckRadius, puckHeight, 16, 1);
const puckGrp = new THREE.Group();

//Red Puck
const rpCoreMat = new THREE.MeshPhongMaterial({
    color: 0xfc0352
});

//Blue Puck
const bpCoreMat = new THREE.MeshPhongMaterial({
    color: 0x03b1fc
});

const bpLocation = new Object();
bpLocation.x = 100;
bpLocation.y = 3000;

const rpLocation = new Object();
rpLocation.x = 400;
rpLocation.y = 3080;

// ------------Game Specific UI-----------

// ---Space Invaders---
var voronoiLinesMat = new THREE.LineBasicMaterial({
    color: 0x9f9fff
});
//bar Chart
const barBaseX = 50;
const barHeight = 1;
const barBaseY = 50;
const bpBarWFMaterial = new THREE.MeshBasicMaterial({
    color: 0x03b1fc,
    wireframe: true
});
const bpBarMat = new THREE.MeshPhongMaterial({
    color: 0x03b1fc
});
const rpBarMat = new THREE.MeshPhongMaterial({
    color: 0xfc0352
});
const barBlueGeometry = new THREE.BoxGeometry(barBaseX, barHeight, barBaseY);
const barRedGeometry = new THREE.BoxGeometry(barBaseX, barHeight, barBaseY);
barRedGeometry.translate(0, barHeight / 2, 0);
barBlueGeometry.translate(0, barHeight / 2, 0);
const bpBar = new THREE.Mesh(barBlueGeometry, bpBarMat);
const rpBar = new THREE.Mesh(barRedGeometry, rpBarMat);
const spaceInvadersGroup = new THREE.Group();

let bluePercent = 0;
let redPercent = 0;

// ---Classic Shuffle---
//Score Boxes
const scoreBoxNeoGeometry = new THREE.BoxGeometry(10, 30, 240);
const scoreBoxClassicGeometry = new THREE.BoxGeometry(30, 30, 60);
//Lines
const scoreLines = [60, 165, 524, 1054, 1768, 2762]; // y value of lines

if (gameType.classicShuffle || gameType.neoShuffle) {


    const lineGeometries = [];
    for (let i = 0; i < scoreLines.length; i++) {
        const points = [];
        const lineY = scoreLines[i];
        points.push(new THREE.Vector3(0, 1, lineY));
        points.push(new THREE.Vector3(600, 1, lineY));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        lineGeometries.push(geometry);
    }
    const material = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        linewidth: 1,
    });
    for (let i = 0; i < lineGeometries.length; i++) {
        const line = new THREE.Line(lineGeometries[i], material);
        scene.add(line); //adding each line to the scene
    };
};

const roundScoreClassicShuffle = new Object();
roundScoreClassicShuffle.red = 0;
roundScoreClassicShuffle.blue = 0;

const roundScoreNeoShuffle = new Object();
roundScoreNeoShuffle.red = 0;
roundScoreNeoShuffle.blue = 0;

//Markers
const puckPointerGeo = new THREE.CylinderGeometry(20, 5, 20, 8, 2);
const puckPointerMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: true
});
const puckPointer = new THREE.Mesh(puckPointerGeo, puckPointerMaterial);
scene.add(puckPointer);
puckPointer.position.set(10000, 10000, 10000);
//ScoringPuckscircles
const scoringPuckGeo = new THREE.CircleGeometry(50, 8);
const scoringPuckIndicatorsGrp = new THREE.Group();
//Scroring puck points box
const puckScoreBoxGeo = new THREE.BoxGeometry(20, 20, 20);
const puckScoreBoxMat = new THREE.MeshPhongMaterial({
    color: 0xffff00
});




//------curling----------
const curlingCenter = {
    x: 300,
    y: 789
};

let blueCurlingScore = 0;
let redCurlingScore = 0;

const blueTextMat = new THREE.MeshPhongMaterial({
    color: 0x03b1fc
});
const redTextMat = new THREE.MeshPhongMaterial({
    color: 0xfc0352
});



console.log("curling center x = ", curlingCenter.x, "curling center y = ", curlingCenter.y)
const curlingCircGeo1 = new THREE.CircleGeometry(80, 36);
const curlingCircMat1 = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
});

// const curlingCircMat1 = new THREE.MeshPhongMaterial( {color: 0xffffff, wireframe: true} );
const curlingCircGeo2 = new THREE.CircleGeometry(30, 56);
const curlingCircMat2 = new THREE.MeshPhongMaterial({
    color: 0x250b52,
    side: THREE.DoubleSide
});
const curlingCircleMesh1 = new THREE.Mesh(curlingCircGeo1, curlingCircMat1);
const curlingCircleMesh2 = new THREE.Mesh(curlingCircGeo2, curlingCircMat2);
const curlingRedMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000
});
const curlingBlueMaterial = new THREE.LineBasicMaterial({
    color: 0x5599ff
});
const curlingPuckRadMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    wireframe: true
});

const curlingCircles = new THREE.Group();
const curlingPuckCircles = new THREE.Group();
const curlingPuckIndicatorsGrp = new THREE.Group();

curlingCircles.add(curlingPuckCircles);

curlingCircles.add(curlingCircleMesh1, curlingCircleMesh2);
scene.add(curlingCircles);
curlingCircles.position.set(curlingCenter.x, 1, curlingCenter.y);
curlingCircleMesh2.position.set(0, 0, -2);
curlingCircles.rotation.x = Math.PI / 2;

const curlingLines = new THREE.Group();


let prevPuckPosSum = 1;
let puckMovement = false;
let puckData = undefined;

//new cube  

const newCubeGeo = new THREE.BoxGeometry(1000, 1000, 1000);


const loader = new THREE.TextureLoader();
loader.setPath('/cubeMaps/synthwave/');

const textureCube = [
    new THREE.MeshStandardMaterial({ map: loader.load('lft.jpg'), side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ map: loader.load('rht.jpg'), side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ map: loader.load('top.jpg'), side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ map: loader.load('btm.jpg'), side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ map: loader.load('fnt.jpg'), side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ map: loader.load('bck.jpg'), side: THREE.DoubleSide })
]



// // const newCubeMat = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );
// const newCube = new THREE.Mesh(newCubeGeo, textureCube);
// scene.add(newCube);
// newCube.position.set(-600, 500, 2500);
// newCube.rotation.y = Math.PI / 2;


// const modelSign = new THREE.Group();


// const gltfLoader = new GLTFLoader();

// gltfLoader.load( '/models/cyberPunkSign/scene.gltf', function ( gltf ) {

// 	modelSign.add
//     const m = gltf.scene ;
//     m.rotation.y = Math.PI / 2;
//     m.scale.set = (100, 100, 100);

//     modelSign.add (m)


// // modelSign.position.set(-600, 500, 2500);


// }, undefined, function ( error ) {

// 	console.error( error );

// } );

// scene.add( modelSign );

// const fontLoader = new FontLoader();

// fontLoader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

// 	const textGeometry = new TextGeometry( 'Hello three.js!', {
// 		font: font,
// 		size: 80,
// 		height: 5,
// 		curveSegments: 12,
// 		bevelEnabled: true,
// 		bevelThickness: 10,
// 		bevelSize: 8,
// 		bevelOffset: 0,
// 		bevelSegments: 5
// 	} );
// } );



// TEXT


function callAPI(table, id, verb, APIdata) {
    let endPoint = "http://localhost:3000/" + table + "/" + id
    console.log(endPoint)
    console.log(verb)
    console.log(APIdata)
    fetch(endPoint, {
            method: verb,
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json; charset=UTF-8'
            },
            body: APIdata
        })
        .then(response => response.text())
        .then((data) => {
            console.log('Success:', data);
        })
        .then(data => {
            puckData = JSON.stringify(data);
        })
}



//-----------------------animation loop--------------------

//Anitmation
function animate() {
    requestAnimationFrame(animate);

    camera.lookAt(camLookAt);

    //check game state
    if (gameState == "inProgress") {


        // -----3d Perspective-----
        // camera.lookAt(300, -200, 1200);


        const bpBest = [];
        const rpBest = [];

        const rpxv = [];
        const rpyv = [];
        const bpxv = [];
        const bpyv = [];


        //Add Pucks
        puckGrp.remove(...puckGrp.children);

        //----------------------------------Changes for backendless----------------------------------
        let bpJSON = true;

        fetch('http://localhost:3000/PuckLocations/1', {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                },
            })
            .then(response => response.text())
            .then(data => {
                puckData = data;
            })



        const puckDataObj = JSON.parse(puckData);

        // console.log("zzz", puckDataObj.puckLocationsRed);

        if (puckData) {

            const bpObj = puckDataObj.puckLocationsBlue;

            for (let i = 0; i < bpObj.length; i++) {
                var bpx = 0;
                var bpy = 0;
                bpx = bpObj[i][0];
                bpy = bpObj[i][1];

                const bluePuck = new THREE.Mesh(puckCylinder, bpCoreMat);
                bluePuck.position.set(bpx, 10, bpy);
                puckGrp.add(bluePuck);

                bpxv.push(bpx);
                bpyv.push(bpy);

            }



            //add arrow to best red shot

            const bplowY = Math.min(...bpyv);
            const bplowYindex = bpyv.indexOf(bplowY);

            const bplowX = bpxv[bplowYindex];

            bpBest.push(bplowX);
            bpBest.push(bplowY);


        }


        //----------------------------------Changes for backendless----------------------------------
        let rpJSON = true;
        // let rpJSON = component.redPucks;

        if (rpJSON) {
            const rpObj = puckDataObj.puckLocationsRed;


            for (let i = 0; i < rpObj.length; i++) {
                var rpx = 0;
                var rpy = 0;
                rpx = rpObj[i][0];
                rpy = rpObj[i][1];

                const redPuck = new THREE.Mesh(puckCylinder, rpCoreMat);
                redPuck.position.set(rpx, 10, rpy);
                puckGrp.add(redPuck);

                rpxv.push(rpx);
                rpyv.push(rpy);
            }


            //add arrow to best red shot
            const lowY = Math.min(...rpyv);
            const lowYindex = rpyv.indexOf(lowY);

            const lowX = rpxv[lowYindex];

            rpBest.push(lowX);
            rpBest.push(lowY);
        }

        scene.add(puckGrp);


        //-------------------Check for movement---------------------

        const puckPosArr = rpxv.concat(rpyv, bpxv, bpyv);
        const puckPosSum = puckPosArr.reduce((a, b) => a + b, 0);


        if (puckPosSum === prevPuckPosSum) {
            puckMovement = false;
            // console.log("puckMovement = ", puckMovement);
        } else {
            puckMovement = true;
            // console.log("puckMovement = ", puckMovement);
        }

        prevPuckPosSum = puckPosSum;

        if (puckMovement || gameChanged) {

            gameChanged = false;

            //-----------NeoCurling---------------


            curlingLines.remove(...curlingLines.children);
            curlingPuckCircles.remove(...curlingPuckCircles.children);
            if (gameType.neoCurling) {


                const rpCurlingDistances = [];
                const bpCurlingDistances = [];
                const curlingRedScore = [];
                const curlingBlueScore = [];



                //get dist to centre for each puck
                //red
                for (let i = 0; i < rpyv.length; i++) {
                    const points = []
                    const redX = rpxv[i];
                    const redY = rpyv[i];
                    const redPos = new THREE.Vector3(redX, 2, redY)
                    const centerPos = new THREE.Vector3(curlingCenter.x, 2, curlingCenter.y)
                    points.push(redPos);
                    points.push(centerPos);
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, curlingRedMaterial);
                    curlingLines.add(line);
                    const lineLength = redPos.distanceTo(centerPos);
                    const curlingPuckRadGeo = new THREE.BufferGeometry().setFromPoints(
                        new THREE.Path().absarc(0, 0, lineLength, 0, Math.PI * 2).getSpacedPoints(50)
                    );

                    const lineCircle = new THREE.Line(curlingPuckRadGeo, curlingRedMaterial);
                    curlingPuckCircles.add(lineCircle);
                    // console.log("red line ", i, " length = ", lineLength)

                    //scoring
                    const rpCurlingObj = new Object();
                    rpCurlingObj.dist = lineLength;
                    rpCurlingObj.x = redX;
                    rpCurlingObj.y = redY;
                    rpCurlingDistances.push(rpCurlingObj);

                    //add dist above puck

                    fontLoader.load('fonts/helvetiker_bold.typeface.json', function(font) {

                        const textGeo = new TextGeometry(String(Math.round(lineLength)), {
                            font: font,
                            size: 50,
                            height: 5,
                            curveSegments: 12,
                        });
                        // textGeo.computeBoundingBox();
                        const mesh = new THREE.Mesh(textGeo, redTextMat);
                        mesh.position.x = redX;
                        mesh.position.y = 80;
                        mesh.position.z = redY;
                        mesh.lookAt(camera.position);
                        // mesh.castShadow = true;
                        // mesh.receiveShadow = true;
                        // const bbox = new THREE.BoxHelper( mesh, 0xffff00 );
                        mesh.geometry.center()
                        curlingLines.add(mesh);


                    });
                }

                for (let i = 0; i < bpyv.length; i++) {
                    const points = []
                    const blueX = bpxv[i];
                    const blueY = bpyv[i];
                    const bluePos = new THREE.Vector3(blueX, 2, blueY)
                    const centerPos = new THREE.Vector3(curlingCenter.x, 2, curlingCenter.y)
                    points.push(bluePos);
                    points.push(centerPos);
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);

                    const line = new THREE.Line(geometry, curlingBlueMaterial);

                    curlingLines.add(line);
                    const lineLength = bluePos.distanceTo(centerPos);
                    const curlingPuckRadGeo = new THREE.BufferGeometry().setFromPoints(
                        new THREE.Path().absarc(0, 0, lineLength, 0, Math.PI * 2).getSpacedPoints(50)
                    );

                    const lineCircle = new THREE.Line(curlingPuckRadGeo, curlingBlueMaterial);
                    curlingPuckCircles.add(lineCircle);


                    // console.log("blue line ", i, " length = ", lineLength)

                    //scoring
                    const bpCurlingObj = new Object();
                    bpCurlingObj.dist = lineLength;
                    bpCurlingObj.x = blueX;
                    bpCurlingObj.y = blueY;
                    bpCurlingDistances.push(bpCurlingObj);

                    fontLoader.load('fonts/helvetiker_bold.typeface.json', function(font) {

                        const textGeo = new TextGeometry(String(Math.round(lineLength)), {
                            font: font,
                            size: 50,
                            height: 5,
                            curveSegments: 12,
                        });
                        // textGeo.computeBoundingBox();
                        const mesh = new THREE.Mesh(textGeo, blueTextMat);
                        mesh.position.x = blueX;
                        mesh.position.y = 80;
                        mesh.position.z = blueY;
                        mesh.lookAt(camera.position);
                        // mesh.castShadow = true;
                        // mesh.receiveShadow = true;
                        // const bbox = new THREE.BoxHelper( mesh, 0xffff00 );
                        mesh.geometry.center()
                        curlingLines.add(mesh);


                    });
                }

                function compare(a, b) {
                    if (a.dist < b.dist) {
                        return -1;
                    }
                    if (a.dist > b.dist) {
                        return 1;
                    }
                    return 0;
                }



                bpCurlingDistances.sort(compare);
                rpCurlingDistances.sort(compare);


                if (rpCurlingDistances[0] && rpCurlingDistances[0].dist < bpCurlingDistances[0].dist) {
                    // console.log("red wins");

                    for (let i = 0; i < rpCurlingDistances.length; i++) {
                        if (rpCurlingDistances[i].dist < bpCurlingDistances[0].dist) {
                            curlingRedScore.push(1);
                            const puckScoreBox = new THREE.Mesh(puckScoreBoxGeo, puckScoreBoxMat);
                            puckScoreBox.position.set(rpCurlingDistances[i].x, 60, rpCurlingDistances[i].y);
                            curlingLines.add(puckScoreBox);
                        } else {
                            break;
                        };
                    };
                };


                if (bpCurlingDistances[0] && bpCurlingDistances[0].dist < rpCurlingDistances[0].dist) {
                    // console.log("blue wins");

                    for (let i = 0; i < bpCurlingDistances.length; i++) {
                        if (bpCurlingDistances[i].dist < rpCurlingDistances[0].dist) {
                            curlingBlueScore.push(1);
                            curlingRedScore.push(1);
                            const puckScoreBox = new THREE.Mesh(puckScoreBoxGeo, puckScoreBoxMat);
                            puckScoreBox.position.set(bpCurlingDistances[i].x, 60, bpCurlingDistances[i].y);
                            curlingLines.add(puckScoreBox);
                        } else {
                            break;
                        };
                    };
                }

                for (let i = 0; i < curlingRedScore.length; i++) {
                    const puckScoreBox = new THREE.Mesh(scoreBoxClassicGeometry, rpCoreMat);
                    const zDist = i * 90 + 30;
                    puckScoreBox.position.set(640, 0, zDist);
                    curlingLines.add(puckScoreBox);
                };
                for (let i = 0; i < curlingBlueScore.length; i++) {
                    const puckScoreBox = new THREE.Mesh(scoreBoxClassicGeometry, bpCoreMat);
                    const zDist = i * 90 + 30;
                    puckScoreBox.position.set(640, 0, zDist);
                    curlingLines.add(puckScoreBox);
                };
                // console.log("blue score = ", curlingBlueScore.length);
                // console.log("red score = ", curlingRedScore.length);

                blueCurlingScore = curlingBlueScore.length;
                redCurlingScore = curlingRedScore.length;

                scene.add(curlingLines);

            }


            //----------classic Shuffle-----------------------

            scoringPuckIndicatorsGrp.remove(...scoringPuckIndicatorsGrp.children);

            if (gameType.classicShuffle) {
                roundScoreClassicShuffle.red = 0;
                roundScoreClassicShuffle.blue = 0;

                if (rpBest[1] < bpBest[1]) {
                    // puckPointer.position.set(rpBest[0], 50, rpBest[1]);
                    rpyv.forEach(function(e, i, a) {
                        if (rpyv[i] < bpBest[1]) {
                            const scoringPuckIndicators = new THREE.Mesh(scoringPuckGeo, puckPointerMaterial);
                            scoringPuckIndicators.position.set(rpxv[i], 3, rpyv[i]);
                            scoringPuckIndicators.rotation.x = Math.PI / 2;
                            scoringPuckIndicatorsGrp.add(scoringPuckIndicators);

                            //point indicators

                            const scoreCountRed = [];

                            scoreLines.forEach(function(se, si, sa) {
                                // console.log("sl = ", scoreLines[si])
                                // console.log("rp = ", rpyv[i])
                                if (rpyv[i] + puckRadius < scoreLines[si]) {
                                    // console.log("test",scoreLines[si])
                                    scoreCountRed.push(1);
                                    roundScoreClassicShuffle.red = roundScoreClassicShuffle.red + 1;

                                }
                            });

                            for (let lp = 0; lp < scoreCountRed.length; lp++) {
                                const puckScoreBox = new THREE.Mesh(puckScoreBoxGeo, puckScoreBoxMat);
                                const zDist = lp * 60 + 60;
                                puckScoreBox.position.set(rpxv[i], zDist, rpyv[i]);
                                // puckScoreBox.rotation.x = Math.PI / 2;
                                scoringPuckIndicatorsGrp.add(puckScoreBox);
                            };
                        };
                    });

                } else {
                    // puckPointer.position.set(bpBest[0], 50, bpBest[1]);
                    bpyv.forEach(function(e, i, a) {
                        if (bpyv[i] < rpBest[1]) {
                            const scoringPuckIndicators = new THREE.Mesh(scoringPuckGeo, puckPointerMaterial);
                            scoringPuckIndicators.position.set(bpxv[i], 3, bpyv[i]);
                            scoringPuckIndicators.rotation.x = Math.PI / 2;
                            scoringPuckIndicatorsGrp.add(scoringPuckIndicators);

                            //point indicators

                            const scoreCountBlue = [];

                            scoreLines.forEach(function(se, si, sa) {
                                // console.log("sl = ", scoreLines[si])
                                // console.log("rp = ", rpyv[i])
                                if (bpyv[i] + puckRadius < scoreLines[si]) {
                                    // console.log("test",scoreLines[si])
                                    scoreCountBlue.push(1);
                                    roundScoreClassicShuffle.blue = roundScoreClassicShuffle.blue + 1;

                                }
                            });

                            for (let lp = 0; lp < scoreCountBlue.length; lp++) {
                                const puckScoreBox = new THREE.Mesh(puckScoreBoxGeo, puckScoreBoxMat);
                                const zDist = lp * 60 + 60;
                                puckScoreBox.position.set(bpxv[i], zDist, bpyv[i]);
                                // puckScoreBox.rotation.x = Math.PI / 2;
                                scoringPuckIndicatorsGrp.add(puckScoreBox);
                            };
                        }
                    });

                };

                for (let i = 0; i < roundScoreClassicShuffle.red; i++) {
                    const puckScoreBox = new THREE.Mesh(scoreBoxClassicGeometry, rpCoreMat);
                    const zDist = i * 90 + 30;
                    puckScoreBox.position.set(-40, 0, zDist);
                    scoringPuckIndicatorsGrp.add(puckScoreBox);
                };
                for (let i = 0; i < roundScoreClassicShuffle.blue; i++) {
                    const puckScoreBox = new THREE.Mesh(scoreBoxClassicGeometry, bpCoreMat);
                    const zDist = i * 90 + 30;
                    puckScoreBox.position.set(-40, 0, zDist);
                    scoringPuckIndicatorsGrp.add(puckScoreBox);
                };

                scene.add(scoringPuckIndicatorsGrp);

            };




            //-------------------Neo Shuffle-------------

            if (gameType.neoShuffle) {

                roundScoreNeoShuffle.red = 0;
                roundScoreNeoShuffle.blue = 0;


                const scoreCountRedTotals = [];
                // puckPointer.position.set(rpBest[0], 50, rpBest[1]);
                rpyv.forEach(function(e, i, a) {


                    //point indicators


                    const scoreCountRed = [];

                    scoreLines.forEach(function(se, si, sa) {
                        // console.log("sl = ", scoreLines[si])
                        // console.log("rp = ", rpyv[i])
                        if (rpyv[i] + puckRadius < scoreLines[si]) {
                            // console.log("test",scoreLines[si])
                            scoreCountRed.push(1);
                            roundScoreNeoShuffle.red = roundScoreNeoShuffle.red + 1;

                        }
                    });
                    scoreCountRedTotals.push(scoreCountRed);
                    // console.log('red total = ', scoreCountRedTotals);

                    for (let lp = 0; lp < scoreCountRed.length; lp++) {
                        const puckScoreBox = new THREE.Mesh(puckScoreBoxGeo, puckScoreBoxMat);
                        const zDist = lp * 60 + 60;
                        puckScoreBox.position.set(rpxv[i], zDist, rpyv[i]);
                        // puckScoreBox.rotation.x = Math.PI / 2;
                        scoringPuckIndicatorsGrp.add(puckScoreBox);
                    };

                });

                scene.add(scoringPuckIndicatorsGrp);



                // puckPointer.position.set(bpBest[0], 50, bpBest[1]);
                bpyv.forEach(function(e, i, a) {


                    //point indicators

                    const scoreCountBlue = [];

                    scoreLines.forEach(function(se, si, sa) {
                        // console.log("sl = ", scoreLines[si])
                        // console.log("rp = ", rpyv[i])
                        if (bpyv[i] + puckRadius < scoreLines[si]) {
                            // console.log("test",scoreLines[si])
                            scoreCountBlue.push(1);
                            roundScoreNeoShuffle.blue = roundScoreNeoShuffle.blue + 1;

                        }
                    });

                    for (let lp = 0; lp < scoreCountBlue.length; lp++) {
                        const puckScoreBox = new THREE.Mesh(puckScoreBoxGeo, puckScoreBoxMat);
                        const zDist = lp * 60 + 60;
                        puckScoreBox.position.set(bpxv[i], zDist, bpyv[i]);
                        // puckScoreBox.rotation.x = Math.PI / 2;
                        scoringPuckIndicatorsGrp.add(puckScoreBox);
                    };

                });
                scene.add(scoringPuckIndicatorsGrp);

                for (let i = 0; i < roundScoreNeoShuffle.red; i++) {
                    const puckScoreBox = new THREE.Mesh(scoreBoxNeoGeometry, rpCoreMat);
                    const zDist = i * 60 + 60;
                    puckScoreBox.position.set(-80, zDist, 120);
                    scoringPuckIndicatorsGrp.add(puckScoreBox);
                };
                for (let i = 0; i < roundScoreNeoShuffle.blue; i++) {
                    const puckScoreBox = new THREE.Mesh(scoreBoxNeoGeometry, bpCoreMat);
                    const zDist = i * 60 + 60;
                    puckScoreBox.position.set(-80, zDist, 400);
                    scoringPuckIndicatorsGrp.add(puckScoreBox);
                };

            };









            //----------spaceinvades start------------------------



            spaceInvadersGroup.remove(...spaceInvadersGroup.children);

            if (gameType.spaceInvaders) {
                const cellObjArray = [];
                // console.log("spaceInvaders = ", gameType.spaceInvaders)

                spaceInvadersGroup.add(bpBar, rpBar);
                bpBar.position.set(725, 0, 25);
                rpBar.position.set(725, 0, 85);
                //veronoi

                // var sites = [{x:300,y:300}, {x:100,y:100}, {x:200,y:500}, {x:250,y:450}, {x:600,y:150}];
                // // xl, xr means x left, x right
                // // yt, yb means y top, y bottom
                // var bbox = {xl:0, xr:600, yt:0, yb:3500};
                // var voronoi = new Voronoi();
                // // pass an object which exhibits xl, xr, yt, yb properties. The bounding
                // // box will be used to connect unbound edges, and to close open cells
                // result = voronoi.compute(sites, bbox);
                // // render, further analyze, etc.



                var redSites = [];
                for (let i = 0; i < rpxv.length; i++) {
                    redSites.push({
                        x: rpxv[i],
                        y: rpyv[i]
                    });
                };

                var blueSites = [];
                for (let i = 0; i < bpxv.length; i++) {
                    blueSites.push({
                        x: bpxv[i],
                        y: bpyv[i]
                    });
                };

                // var redSites = [ {x: rpxv[0], y: rpyv[0]}, {x: rpxv[1], y: rpyv[1]}, {x: rpxv[2], y: rpyv[2]}, {x: rpxv[3], y: rpyv[3]} ];
                // var blueSites = [ {x: bpxv[0], y: bpyv[0]}, {x: bpxv[1], y: bpyv[1]}, {x: bpxv[2], y: bpyv[2]}, {x: bpxv[3], y: bpyv[3]} ];
                const sites = blueSites.concat(redSites);

                var voronoi = new Voronoi();
                var bbox = {
                    xl: 0,
                    xr: 600,
                    yt: 0,
                    yb: 3500
                };
                var diagram = voronoi.compute(sites, bbox);
                diagram.puckColour = "not-assigned";


                var voronoiLinesPoints = [];
                var voronoiLinesColors = [];
                diagram.edges.forEach(ed => {
                    voronoiLinesPoints.push(ed.va.x, 1, ed.va.y, ed.vb.x, 1, ed.vb.y, ed.va.x, 3, ed.va.y, ed.vb.x, 3, ed.vb.y);
                    voronoiLinesColors.push(1, .8, .8, 1, .8, .8, 1, .8, .8, 1, .8, .8);
                });

                var voronoiLinesGeom = new THREE.BufferGeometry();
                voronoiLinesGeom.setAttribute("position", new THREE.Float32BufferAttribute(voronoiLinesPoints, 3));
                // voronoiLinesGeom.setAttribute("color", new THREE.Float32BufferAttribute(voronoiLinesColors, 3));
                var voronoiLines = new THREE.LineSegments(voronoiLinesGeom, voronoiLinesMat);

                // const spaceInvadersGroup = new THREE.Group();




                // spaceInvadersGroup.remove(...spaceInvadersGroup.children);
                spaceInvadersGroup.add(voronoiLines);

                scene.add(spaceInvadersGroup);


                // for (let i = 0; i < diagram.cells.length; i++) {
                //   const cell = diagram.cells[i];
                //   console.log("cell2 = ", cell);
                //   console.log("cell2 x = ", cell.site.x);
                // };

                // console.log("test  =", diagram.cells.length);




                diagram.cells.forEach(function(cell, i, a) {
                    // console.log("cell = ", cell);
                    // console.log("cell x = ", cell.site.x);
                    //check red or blue
                    //red
                    if (rpxv.includes(cell.site.x)) {
                        i = rpxv.indexOf(cell.site.x)
                        if (rpyv[i] === cell.site.y) {
                            cell.puckColour = "red";
                        };
                    };

                    //blue
                    if (bpxv.includes(cell.site.x)) {
                        i = bpxv.indexOf(cell.site.x)
                        if (bpyv[i] === cell.site.y) {
                            cell.puckColour = "blue";

                        };
                    };

                    const cellSegs = [];
                    const cellId = cell.site.voronoiId;
                    const cellCenter = cell.site; //{x: 218, y: 1420, voronoiId: 4}

                    cell.halfedges.forEach(halfedge => {
                        const edge = halfedge.edge;
                        const edgeVa = edge.va; //{x: 0, y: 1613.8425531914893}
                        const edgeVb = edge.vb; //{x: 600, y: 1772.1404255319148}
                        // console.log(edgeVa);
                        // console.log(edgeVb);
                        const aX = edgeVa.x;
                        const aY = edgeVa.y;
                        const bX = edgeVb.x;
                        const bY = edgeVb.y;
                        const cX = cellCenter.x;
                        const cY = cellCenter.y;
                        // console.log(
                        // "aX = " + aX ,
                        // "aY = " + aY ,
                        // "bX = " + bX ,
                        // "bY = " + bY ,
                        // "cX = " + cX ,
                        // "cY = " + cY ,);
                        const segArea = (aX * (bY - cY) + bX * (cY - aY) + cX * (aY - bY)) / 2
                        const segAreaPositive = Math.abs(segArea);
                        cellSegs.push(segAreaPositive);

                    });

                    const cellArea = cellSegs.reduce((a, b) => a + b, 0);

                    const cellObj = new Object();
                    cellObj.voronoiId = cellId;
                    cellObj.area = cellArea;
                    cellObj.site = cellCenter;
                    cellObj.colour = cell.puckColour;
                    cellObjArray.push(cellObj);
                });





                // console.log("---------areas calculated-------------")
                // console.log("cellObjArray = ", cellObjArray)




                //Total area
                const cellAreaArray = []

                cellObjArray.forEach((element, index, array) => {
                    cellAreaArray.push(element.area);
                });

                const totalArea = cellAreaArray.reduce((a, b) => a + b, 0);
                // console.log("totalArea = ", totalArea)

                //Blue and red area
                const redAreaArray = [];
                const blueAreaArray = [];

                cellObjArray.forEach((element, index, array) => {
                    if (element.colour === "blue") {
                        blueAreaArray.push(element.area);
                    }
                    if (element.colour === "red") {
                        redAreaArray.push(element.area);
                    }

                });


                const redArea = redAreaArray.reduce((a, b) => a + b, 0);;
                const blueArea = blueAreaArray.reduce((a, b) => a + b, 0);;


                bluePercent = blueArea / totalArea * 100;
                redPercent = redArea / totalArea * 100;

                // console.log("blue % = ", bluePercent);
                // console.log("red % = ", redPercent);

                rpBar.scale.y = redPercent * 5;
                bpBar.scale.y = bluePercent * 5;

                const barRedHeight = redPercent * 5;
                const barBlueHeight = bluePercent * 5;
            }

            //----------spaceinvades end-------------------------
        }

        //set displayed score in backendless

        const gsRedScore = document.getElementsByClassName("redTeamBigScore")[0];
        const gsBlueScore = document.getElementsByClassName("blueTeamBigScore")[0];

        if (gameType.neoCurling) {
            if (gsRedScore) {
                gsRedScore.innerHTML = redCurlingScore;
            };
            if (gsBlueScore) {
                gsBlueScore.innerHTML = blueCurlingScore;
            };
        };

        if (gameType.classicShuffle) {
            if (gsRedScore) {
                gsRedScore.innerHTML = roundScoreClassicShuffle.red;
            };
            if (gsBlueScore) {
                gsBlueScore.innerHTML = roundScoreClassicShuffle.blue;
            };
        };

        if (gameType.spaceInvaders) {
            if (gsRedScore) {
                gsRedScore.innerHTML = Math.round(redPercent) + "﹪";
            };
            if (gsBlueScore) {
                gsBlueScore.innerHTML = Math.round(bluePercent) + "﹪";
            };
        };

        if (gameType.blackJack) {
            if (gsRedScore) {
                gsRedScore.innerHTML = 0;
            };
            if (gsBlueScore) {
                gsBlueScore.innerHTML = 0;
            };
        };

        if (gameType.neoShuffle) {
            if (gsRedScore) {
                gsRedScore.innerHTML = roundScoreNeoShuffle.red;
            };
            if (gsBlueScore) {
                gsBlueScore.innerHTML = roundScoreNeoShuffle.blue;
            };
        };

        //------ turn round and game stuff ----

        // ----display turn---
        if (gameState = "inProgress") {
            instructions.innerHTML = "test";

        }

        // ---end of round----
        if (shotsThrown == 8) {
            console.log("round over")
            gameState = "endOfRound";

        };

        //---end of game
        if (roundsPlayed == 8) {
            console.log("game over")
            gameState = "endOfGame";
        };
    };


    renderer.render(scene, camera);
}
animate();
animate();