import './style.css'
import * as THREE from 'three'
import Voronoi from 'voronoi'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm//geometries/TextGeometry.js';
import { ReverseSubtractEquation } from 'three';


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
};




//game type
// const gameType = new Object();
// gameType.neoShuffle = true;
// gameType.classicShuffle = true;
// gameType.spaceInvaders = true;
// gameType.blackJack = true;
// gameType.neoCurling = true;

let gameType = null;

//game states
//idle, inProgress, endOfRound, endOfGame
let gameState = "idle";

let instructions = document.getElementById('instructions');
let instructionRow = document.getElementById('bottomRowHud');
let gsRedScore = document.getElementById("redRoundScore");
let gsBlueScore = document.getElementById("blueRoundScore");
let redGameScore = document.getElementById("redGameScore");
let blueGameScore = document.getElementById("blueGameScore");
let redGamesWonScore = document.getElementById("redGamesWon");
let blueGamesWonScore = document.getElementById("blueGamesWon");
var backTurn = document.getElementById('backTurn');
var nextTurn = document.getElementById('nextTurn');
var turnNumber = document.getElementById('turnNumber');
var startNextRoundBtn = document.getElementById('startNextRound');
var roundNumberTxt = document.getElementById('roundNumber');

instructionRow.style.backgroundColor = "linear-gradient(180deg, #34FD8400 0%, #34FD84 100%)";
instructions.innerHTML = "Press Start";

//score and round trackers

let shotsThrown = 0;
let roundsPlayed = 0;
let redGameScoreTotal = 0;
let blueGameScoreTotal = 0;
let redGamesWon = 0;
let blueGamesWon = 0;
let gameTypeDB = null;
let gameStateDB = null;
let shotsPlayedDB = 0;
let roundsPlayedDB = 0;

let pythonShotCounterDB = 0;

//---table shit---

let prevPythonShotCount = 0;
let prevPuckPosSum = 1;
let puckMovement = false;
let puckData = undefined;
let tableData = undefined;

callAPI("TableData", 1, "PATCH", '{"ShotsPlayed": 0, "RoundsPlayed": 0, "GameState": "idle", "GameType": null}');

turnNumber.innerHTML = (shotsPlayedDB + 1).toString();

//---------------------kiosk stuff-------------------



//----start Game---
var startGameBtn = document.getElementById('startGame');

function startGame() {
    callAPI("TableData", 1, "PATCH", 
            '{"ShotsPlayed":' + 0 + ', "RoundsPlayed":' + 0  + ', "GameState": "inProgress"}');

}

startGameBtn.onclick = function() { startGame() };

//----manually increment shot----


function shotsThrownUp() {
    shotsThrown = shotsPlayedDB + 1;

    if (shotsThrown > 7) {
        shotsThrown = 8;
    }
    console.log("shotsThrown = ", shotsPlayedDB);
    callAPI("TableData", 1, "PATCH", '{"ShotsPlayed":' + shotsThrown + '}');
};

function shotsThrownDown() {
    shotsThrown = shotsPlayedDB - 1;
        if (shotsThrown < 1) {
        shotsThrown = 0;
    }
    console.log("shotsThrown = ", shotsPlayedDB);
    callAPI("TableData", 1, "PATCH", '{"ShotsPlayed":' + shotsThrown + '}');

};

backTurn.onclick = function() { shotsThrownDown() };
nextTurn.onclick = function() { shotsThrownUp() };

//--- Start Next Round ---


startNextRoundBtn.onclick = () => {
    shotsThrown = 0;
    roundsPlayed = roundsPlayedDB + 1;
    if (roundsPlayed > 7) {
        roundsPlayed = 8;
    }
    callAPI("TableData", 1, "PATCH", '{"ShotsPlayed":' + shotsThrown + ', "RoundsPlayed":' + roundsPlayed  + '}');

    //---add score to game scrore
    addRoundScoreToGameScore();

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
    // setAllGamesFalse();
    // gameType.neoShuffle = true;
    callAPI("TableData", 1, "PATCH", '{"GameType": "neoShuffle" }')
};

selectCS.onclick = () => {
    // setAllGamesFalse();
    // gameType.classicShuffle = true;
    callAPI("TableData", 1, "PATCH", '{"GameType": "classicShuffle" }')
};

selectSI.onclick = () => {
    // setAllGamesFalse();
    // gameType.spaceInvaders = true;
    callAPI("TableData", 1, "PATCH", '{"GameType": "spaceInvaders" }')
};

selectBJ.onclick = () => {
    // setAllGamesFalse();
    // gameType.blackJack = true;
    callAPI("TableData", 1, "PATCH", '{"GameType": "blackJack" }')
};

selectCU.onclick = () => {
    // setAllGamesFalse();
    // gameType.neoCurling = true;
    callAPI("TableData", 1, "PATCH", '{"GameType": "neoCurling" }')
};

selectALL.onclick = () => {
    // setAllGamesFalse();
    // gameType.neoShuffle = true;
    // gameType.classicShuffle = true;
    // gameType.spaceInvaders = true;
    // gameType.blackJack = true;
    // gameType.neoCurling = true;
    callAPI("TableData", 1, "PATCH", '{"GameType": "ALL" }')
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
const detectionZone = 2000


// var xmlHttp = new XMLHttpRequest();


//create scene
const scene = new THREE.Scene();
const fontLoader = new FontLoader();

//Add Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
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
const camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 10000);
camera.position.x = 2400;
camera.position.z = 1000;
camera.position.y = 1400;
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

// ---Black Jack---

// 1 area = random cards between 2 and 4
// 2 area = random cards between 5 and 7
// 3 area = random cards between 8 and 10
// 4 area = random Picture cards (J, Q, or K)
// 5/6 area = Ace

// let cardsObjArray = [];

// let cardsArray =  ['H2', 'D2', 'S2', 'C2', 'H3', 'D3', 'S3', 'C3', 'H4', 'D4', 'S4', 'C4', 'H5', 'D5', 'S5', 'C5', 'H6', 'D6', 'S6', 'C6', 'H7', 'D7', 'S7', 'C7', 'H8', 'D8', 'S8', 'C8', 'H9', 'D9', 'S9', 'C9', 'H10', 'D10', 'S10', 'C10', 'HJ', 'DJ', 'SJ', 'CJ', 'HQ', 'DQ', 'SQ', 'CQ', 'HK', 'DK', 'SK', 'CK', 'HA', 'DA', 'SA', 'CA'];

// cardsArray.forEach(e => {
//     const cardObj = new Object();
//     cardObj.name = e;
//     cardObj. value = 0;
//     cardObj.zone = 0;
//     let card = "H" + e;
//     allCards.push(card);
//     card = "D" + e;
//     allCards.push(card);
//     card = "S" + e;
//     allCards.push(card);
//     card = "C" + e;
//     allCards.push(card);
// });
// console.log("ccc=",allCards)

// ---Space Invaders---
const extrudeSettings = {
    steps: 1,
    depth: -1,
    bevelEnabled: false,
    bevelThickness: 0,
    bevelSize: 0,
    bevelOffset: 0,
    bevelSegments: 0
};

var voronoiLinesMat = new THREE.LineBasicMaterial({
    color: 0xffffff
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
const blueSiMat = new THREE.MeshBasicMaterial({
    color: 0x03b1fc,
    transparent: true,
    opacity: 0.5
});
const redSiMat = new THREE.MeshBasicMaterial({
    color: 0xfc0352,
    transparent: true,
    opacity: 0.5
});
const greySiMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
});


const siFullRectangle = new THREE.Shape();
siFullRectangle.moveTo(0, 0);
siFullRectangle.lineTo(tableWidth, 0);
siFullRectangle.lineTo(tableWidth, detectionZone);
siFullRectangle.lineTo(0, detectionZone);

const siFullRectangleEx = new THREE.ExtrudeGeometry( siFullRectangle, extrudeSettings );

const barBlueGeometry = new THREE.BoxGeometry(barBaseX, barHeight, barBaseY);
const barRedGeometry = new THREE.BoxGeometry(barBaseX, barHeight, barBaseY);
barRedGeometry.translate(0, barHeight / 2, 0);
barBlueGeometry.translate(0, barHeight / 2, 0);
const bpBar = new THREE.Mesh(barBlueGeometry, bpBarMat);
const rpBar = new THREE.Mesh(barRedGeometry, rpBarMat);
const spaceInvadersGroup = new THREE.Group();

let bluePercent = 50;
let redPercent = 50;
let siFullRectangleMat = greySiMat

// ---Classic Shuffle---
//Score Boxes
const scoreBoxNeoGeometry = new THREE.BoxGeometry(10, 30, 240);
const scoreBoxClassicGeometry = new THREE.BoxGeometry(30, 30, 60);
//Lines
const scoreLines = [60, 165, 524, 1054, 1768, 2762]; // y value of lines




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
    //------!! add these later only for games with table lines------
    scene.add(line); //adding each line to the scene
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



// console.log("curling center x = ", curlingCenter.x, "curling center y = ", curlingCenter.y)
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



//new cube  

// const newCubeGeo = new THREE.BoxGeometry(1000, 1000, 1000);


// const loader = new THREE.TextureLoader();
// loader.setPath('/cubeMaps/synthwave/');

// const textureCube = [
//     new THREE.MeshStandardMaterial({ map: loader.load('lft.jpg'), side: THREE.DoubleSide }),
//     new THREE.MeshStandardMaterial({ map: loader.load('rht.jpg'), side: THREE.DoubleSide }),
//     new THREE.MeshStandardMaterial({ map: loader.load('top.jpg'), side: THREE.DoubleSide }),
//     new THREE.MeshStandardMaterial({ map: loader.load('btm.jpg'), side: THREE.DoubleSide }),
//     new THREE.MeshStandardMaterial({ map: loader.load('fnt.jpg'), side: THREE.DoubleSide }),
//     new THREE.MeshStandardMaterial({ map: loader.load('bck.jpg'), side: THREE.DoubleSide })
// ]



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


//-----------------------animation loop--------------------

//Anitmation
function animate() {
    requestAnimationFrame(animate);

    camera.lookAt(camLookAt);

    // Get TableData

    fetch('http://localhost:3000/TableData/1', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.text())
        .then(data => {
            tableData = data;
        })

        if (tableData) {
            const tableDataObj = JSON.parse(tableData);
            shotsPlayedDB = tableDataObj.ShotsPlayed;
            roundsPlayedDB = tableDataObj.RoundsPlayed;
            gameTypeDB = tableDataObj.GameType;
            gameStateDB = tableDataObj.GameState;
            pythonShotCounterDB = tableDataObj.PythonShotCounter;

            //check for change


            if (pythonShotCounterDB !== prevPythonShotCount) {
                console.log("change");
                shotsThrownUp()
                prevPythonShotCount = pythonShotCounterDB;
            };

        }

    //update HUD
    turnNumber.innerHTML = (shotsPlayedDB + 1).toString();
    if (shotsPlayedDB > 7) {
        turnNumber.innerHTML = "8";
    }
    roundNumberTxt.innerHTML = (roundsPlayedDB + 1).toString()
    if (roundsPlayedDB > 7) {
        turnNumber.innerHTML = "8";
    }


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

    fetch('http://localhost:3000/PuckLocations/1', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.text())
        .then(data => {
            puckData = data;
        })



    if (puckData) {
        const puckDataObj = JSON.parse(puckData);

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

        //redpucklocations

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
        if (gameTypeDB == "neoCurling") {

            console.log("neo = running")


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

        if (gameTypeDB == "classicShuffle") {
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

        if (gameTypeDB == "neoShuffle") {

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

        if (gameTypeDB == "spaceInvaders") {
            const cellObjArray = [];
            // console.log("spaceInvaders = ", gameType.spaceInvaders)

            spaceInvadersGroup.add(bpBar, rpBar);
            bpBar.position.set(-80, 0, 25);
            rpBar.position.set(-80, 0, 85);

            //voronoi
            var redSites = [];

            for (let i = 0; i < rpxv.length; i++) {
                if(rpyv[i]<=detectionZone){
                    redSites.push({
                        x: rpxv[i],
                        y: rpyv[i]
                    });
                };
            };

            var blueSites = [];

            for (let i = 0; i < bpxv.length; i++) {
                if(bpyv[i]<=detectionZone){
                    blueSites.push({
                        x: bpxv[i],
                        y: bpyv[i]
                    });
                };
            };

            const sites = blueSites.concat(redSites);

            var voronoi = new Voronoi();
            var bbox = {
                xl: 0,
                xr: tableWidth,
                yt: 0,
                yb: detectionZone
            };
            var diagram = voronoi.compute(sites, bbox);
            diagram.puckColour = "not-assigned";


            var voronoiLinesPoints = [];
            var voronoiLinesColors = [];
            diagram.edges.forEach(ed => {
                voronoiLinesPoints.push(ed.va.x, 3, ed.va.y, ed.vb.x, 3, ed.vb.y, ed.va.x, 4, ed.va.y, ed.vb.x, 4, ed.vb.y);
                voronoiLinesColors.push(1, .8, .8, 1, .8, .8, 1, .8, .8, 1, .8, .8);
            });

            var voronoiLinesGeom = new THREE.BufferGeometry();
            voronoiLinesGeom.setAttribute("position", new THREE.Float32BufferAttribute(voronoiLinesPoints, 3));
            var voronoiLines = new THREE.LineSegments(voronoiLinesGeom, voronoiLinesMat);
            // console.log("zzz = ", voronoiLinesPoints)

            spaceInvadersGroup.add(voronoiLines);

            scene.add(spaceInvadersGroup);


            diagram.cells.forEach(function(cell, i, a) {
                // console.log("cell = ", cell);

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
                    const segArea = (aX * (bY - cY) + bX * (cY - aY) + cX * (aY - bY)) / 2;

                    
                    const triangle = new THREE.Shape();
                    triangle.moveTo(aX, aY);
                    triangle.lineTo(bX, bY);
                    triangle.lineTo(cX, cY);
                    // const TriangleGeometry = new THREE.ShapeGeometry(triangle);
                    let triangleMat = greySiMat
                    if (cell.puckColour === "blue" ){
                        triangleMat = blueSiMat
                    }
                    if (cell.puckColour === "red" ){
                        triangleMat = redSiMat
                    }

                    const TriangleGeometryEx = new THREE.ExtrudeGeometry( triangle, extrudeSettings );
                    const triangleMesh = new THREE.Mesh( TriangleGeometryEx, triangleMat )
                    triangleMesh.position.set(0, 3, 0);
                    triangleMesh.rotation.x = Math.PI / 2;
            


                    spaceInvadersGroup.add(triangleMesh);
                    
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

            // const totalArea = cellAreaArray.reduce((a, b) => a + b, 0);
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




            let redArea = redAreaArray.reduce((a, b) => a + b, 0);;
            let blueArea = blueAreaArray.reduce((a, b) => a + b, 0);;
            const totalArea = redArea + blueArea;







            

            if(blueAreaArray.length == 0 && redAreaArray.length != 0) {
                console.log("xxx ba= ", blueAreaArray.length)
                bluePercent = 0
                redPercent = 100
                siFullRectangleMat = redSiMat
                //redbox
            }

            if(redAreaArray.length == 0) {
                console.log("xxx ra= ", redAreaArray.length)
                redPercent = 0
                siFullRectangleMat = blueSiMat
                //blue box
            }

            if((redAreaArray.length == 0) && (blueAreaArray.length == 0)) {
                bluePercent = 0
                redPercent = 0
                siFullRectangleMat = greySiMat
                //grey box
            }




            if(redAreaArray.length + blueAreaArray.length > 1){
                console.log("xxx ra+ba= ", redAreaArray.length + blueAreaArray.length)
                bluePercent = blueArea / totalArea * 100;
                redPercent = redArea / totalArea * 100;
            }else{
                const siFullRectangleMesh = new THREE.Mesh( siFullRectangleEx, siFullRectangleMat )
                siFullRectangleMesh.position.set(0, 3, 0);
                siFullRectangleMesh.rotation.x = Math.PI / 2;
                spaceInvadersGroup.add(siFullRectangleMesh);
            };


            // console.log("blue % = ", bluePercent);
            // console.log("red % = ", redPercent);

            rpBar.scale.y = redPercent * 5;
            bpBar.scale.y = bluePercent * 5;

        }

        //----------spaceinvades end-------------------------
    }




    if (gameTypeDB == "neoCurling") {

        console.log("curling running score red =", redCurlingScore)
        if (gsRedScore) {
            gsRedScore.innerHTML = redCurlingScore;
        };
        if (gsBlueScore) {
            gsBlueScore.innerHTML = blueCurlingScore;
        };
    };

    if (gameTypeDB == "classicShuffle") {
        if (gsRedScore) {
            gsRedScore.innerHTML = roundScoreClassicShuffle.red;
        };
        if (gsBlueScore) {
            gsBlueScore.innerHTML = roundScoreClassicShuffle.blue;
        };
    };

    if (gameTypeDB == "spaceInvaders") {
        if (gsRedScore) {
            gsRedScore.innerHTML = Math.round(redPercent) + "﹪";
        };
        if (gsBlueScore) {
            gsBlueScore.innerHTML = Math.round(bluePercent) + "﹪";
        };
    };

    if (gameTypeDB == "blackJack") {
        if (gsRedScore) {
            gsRedScore.innerHTML = 0;
        };
        if (gsBlueScore) {
            gsBlueScore.innerHTML = 0;
        };
    };

    if (gameTypeDB == "neoShuffle") {
        if (gsRedScore) {
            gsRedScore.innerHTML = roundScoreNeoShuffle.red;
        };
        if (gsBlueScore) {
            gsBlueScore.innerHTML = roundScoreNeoShuffle.blue;
        };
    };

    //------ turn round and game stuff ----

    // ----display turn---
    if (gameStateDB == "inProgress"){
        if(roundsPlayedDB % 2 == 0){
            if(shotsPlayedDB % 2 == 0){
                redTurnIndicator();
            } else {
                blueTurnIndicator();
            };
        } else {
            if(shotsPlayedDB % 2 == 0){
                blueTurnIndicator();
            } else {
                redTurnIndicator();
            };
        };
    };

    // ---end of round----
    if (shotsPlayedDB == 8) {
        console.log("round over")
        gameStateDB = "endOfRound";
        instructionRow.style = "background: linear-gradient(180deg, rgba(52, 205, 253, 0) 0%, #34FD84 100%);";
        instructions.innerHTML = "round over press next round";

    };

    //---end of game
    if (roundsPlayedDB == 8) {
        console.log("game over")
        gameStateDB = "endOfGame";
        instructionRow.style = "background: linear-gradient(180deg, rgba(52, 205, 253, 0) 0%, #34FD84 100%);";
        instructions.innerHTML = "game over press new game";
    };




    renderer.render(scene, camera);
}
animate();





function addRoundScoreToGameScore(){

    if (gameTypeDB == "neoCurling") {
        if (redGameScore) {
            // redGameScore.innerHTML = redGameScoreTotal + redCurlingScore;
            redGameScoreTotal = redGameScoreTotal + redCurlingScore;
        };
        if (blueGameScore) {
            // blueGameScore.innerHTML = blueGameScoreTotal + blueCurlingScore;
            blueGameScoreTotal = blueGameScoreTotal + blueCurlingScore;
        };
    };

    if (gameTypeDB == "classicShuffle") {
        if (redGameScore) {
            // redGameScore.innerHTML = redGameScoreTotal + roundScoreClassicShuffle.red;
            redGameScoreTotal = redGameScoreTotal + roundScoreClassicShuffle.red
        };
        if (blueGameScore) {
            // blueGameScore.innerHTML = blueGameScoreTotal + roundScoreClassicShuffle.blue;
            blueGameScoreTotal = blueGameScoreTotal + roundScoreClassicShuffle.blue
        };
        if ( blueGameScoreTotal>=21 && redGameScoreTotal<21 ){
            console.log("blue won");
        }
        if ( redGameScoreTotal>=21 && blueGameScoreTotal<21 ){
            console.log("red won");
        }

    };

    if (gameTypeDB == "spaceInvaders") {
        if (redGameScore && blueGameScore) {
            redGameScore.innerHTML = Math.round(redPercent) + "﹪";
            if(Math.round(redPercent) >= Math.round(bluePercent)){
                redGameScoreTotal = redGameScoreTotal + 1
            }
            if(Math.round(redPercent) <= Math.round(bluePercent)){
                blueGameScoreTotal = blueGameScoreTotal + 1
            }

        
        };

    };

    if (gameTypeDB == "blackJack") {
        if (redGameScore) {
            redGameScore.innerHTML = 0;
        };
        if (blueGameScore) {
            blueGameScore.innerHTML = 0;
        };
    };

    if (gameTypeDB == "neoShuffle") {
        if (redGameScore) {
            // redGameScore.innerHTML = redGameScoreTotal + roundScoreNeoShuffle.red;
            redGameScoreTotal = redGameScoreTotal + roundScoreNeoShuffle.red;
        };
        if (blueGameScore) {
            // blueGameScore.innerHTML = blueGameScoreTotal + roundScoreNeoShuffle.blue;
            blueGameScoreTotal = blueGameScoreTotal + roundScoreNeoShuffle.blue
        };

    };
    updateGameScore()

};

function updateShotsPlayedText(){
    turnNumber.innerHTML = (shotsThrown + 1).toString();
};

function updateRoundsPlayedText(){
    roundNumberTxt.innerHTML = (roundsPlayed + 1).toString();
};

function updateGameScore(){
    blueGameScore.innerHTML = blueGameScoreTotal;
    redGameScore.innerHTML = redGameScoreTotal;
};

function addToGamesWon(){
    if (blueGameScoreTotal >= redGameScoreTotal){
        blueGamesWon = blueGamesWon + 1;
    }
    if (blueGameScoreTotal <= redGameScoreTotal){
        redGamesWon = redGamesWon + 1;
    }

    console.log("blue = ", blueGamesWon)
    console.log("red = ", redGamesWonScore)
    redGamesWonScore.innerHTML = redGamesWon;
    blueGamesWonScore.innerHTML = blueGamesWon;
};

function redTurnIndicator(){
    instructionRow.style.background = "linear-gradient(180deg, #fc035200 0%, #fc0352 100%)";
    instructions.innerHTML = "red turn";
};

function blueTurnIndicator(){
    instructionRow.style.background = "linear-gradient(180deg, #03b1fc00 0%, #03b1fc 100%)";
    instructions.innerHTML = "blue turn";
};


//✅curling blue cant win
//end of each round add to game score
//end of each game add to games won
//✅keep tracking after last shot thrown
//first push start should go to throw 1 not 2
//classic shuffle is first to 21
//blackjack
//visuals