// import './style.css'
import * as THREE from 'three'
// import Voronoi from 'voronoi'
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from '/node_modules/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from '/node_modules/three/examples/jsm/geometries/TextGeometry.js';
// import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';


let newRedNameOne = ''
let newRedImageOne = ''

let newRedNameTwo = ''
let newRedImageTwo = ''

let newRedNameThree = ''
let newRedImageThree = ''

let newRedNameFour = ''
let newRedImageFour = ''

let newBlueNameOne = ''
let newBlueImageOne = ''

let newBlueNameTwo = ''
let newBlueImageTwo = ''

let newBlueNameThree = ''
let newBlueImageThree = ''

let newBlueNameFour = ''
let newBlueImageFour = ''

const redTeamOne = document.getElementById('redTeamNameOne')
const redImageOne = document.getElementById('redTeamImageOne')

const redTeamTwo = document.getElementById('redTeamNameTwo')
const redImageTwo = document.getElementById('redTeamImageTwo')

const redTeamThree = document.getElementById('redTeamNameThree')
const redImageThree = document.getElementById('redTeamImageThree')

const redTeamFour = document.getElementById('redTeamNameFour')
const redImageFour = document.getElementById('redTeamImageFour')

const blueTeamOne = document.getElementById('blueTeamNameOne')
const blueImageOne = document.getElementById('blueTeamImageOne')

const blueTeamTwo = document.getElementById('blueTeamNameTwo')
const blueImageTwo = document.getElementById('blueTeamImageTwo')

const blueTeamThree = document.getElementById('blueTeamNameThree')
const blueImageThree = document.getElementById('blueTeamImageThree')

const blueTeamFour = document.getElementById('blueTeamNameFour')
const blueImageFour = document.getElementById('blueTeamImageFour')








//🎉🎉🎉Game screen!!🎉🎉🎉




    ////🎉🎉🎉Both Pages!!🎉🎉🎉

console.log("bbb= ", window.location.href);

//game states
//idle, inProgress, endOfRound, endOfGame
let gameState = "idle";

//score and round trackers

let shotsThrown = 0;
let roundsPlayed = 0;
let redRoundScore = 0;
let blueRoundScore = 0;
let redGamesWon = 0;
let blueGamesWon = 0;
let gameTypeDB = null;
let gameStateDB = null;
let shotsPlayedDB = 0;
let roundsPlayedDB = 0;
const roundScoresRedLocal = [];
const roundScoresBlueLocal =[];
let blueGameScoreTotal = 0;
let redGameScoreTotal = 0;
let roundScoresRedDB = [];
let roundScoresBlueDB = [];
let pythonShotCounterDB = 0;

//---table shit---

let prevPythonShotCount = 0;
let prevPuckPosSum = 1;
let puckMovement = true;
let puckData = undefined;
let tableData = undefined;


// ------ 🕹🕹🕹🕹 Check for movement 🕹🕹🕹🕹 -------

let currentTick = 0;
let movementTick = 0;
let pucksStationary = true;

function ticks(){
    currentTick +=1;
    return currentTick
}
// ------ 🕹🕹🕹🕹 End 🕹🕹🕹🕹 -------









function updateValuesFromDB(){
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
        let tableDataObj = JSON.parse(tableData);
        shotsPlayedDB = tableDataObj.ShotsPlayed;
        roundsPlayedDB = tableDataObj.RoundsPlayed;
        gameTypeDB = tableDataObj.GameType;
        gameStateDB = tableDataObj.GameState;
        pythonShotCounterDB = tableDataObj.PythonShotCounter;
        roundScoresRedDB = tableDataObj.RoundScoresRed;
        roundScoresBlueDB = tableDataObj.RoundScoresBlue;
    }
}

function shotsThrownUp() {
    shotsThrown = shotsPlayedDB + 1;

    if (shotsThrown > 7) {
        shotsThrown = 8;
    }
    
    callAPI("TableData", 1, "PATCH", '{"ShotsPlayed":' + shotsThrown + '}');

};

function shotsThrownDown() {
    shotsThrown = shotsPlayedDB - 1;
        if (shotsThrown < 1) {
        shotsThrown = 0;
    }
    callAPI("TableData", 1, "PATCH", '{"ShotsPlayed":' + shotsThrown + '}');
    

};



callAPI("TableData", 1, "PATCH", '{"ShotsPlayed": 0, "RoundsPlayed": 0, "GameState": "inProgress", "RoundScoresRed": [], "RoundScoresBlue": []}');


//🏁🏁🏁Both Pages End 🏁🏁🏁

    const instructions = document.getElementById('instructions');
    const instructionRow = document.getElementById('bottomRowHud');
    const gsRedScore = document.getElementById("redRoundScore");
    const gsBlueScore = document.getElementById("blueRoundScore");
    const redGameScore = document.getElementById("redGameScore");
    const blueGameScore = document.getElementById("blueGameScore");
    const redGamesWonScore = document.getElementById("redGamesWon");
    const blueGamesWonScore = document.getElementById("blueGamesWon");
    const turnNumber = document.getElementById('turnNumber');
    const roundNumberTxt = document.getElementById('roundNumber');
    const gameTitle = document.getElementById('gameTitle');

    instructionRow.style.backgroundColor = "linear-gradient(180deg, #34FD8400 0%, #34FD84 100%)";
    instructions.innerHTML = "Press Start";


    

    

    //set table and puck values
    const tableWidth = 600;
    const tableLength = 4500;
    const puckRadius = 30;
    const puckHeight = 20;

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

    .setPath('../static/cubeMaps/space/')
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

    // ---🃏♠️♥️♣️♦️ Black Jack 🃏♠️♥️♣️♦️---

    const blackJackUI = document.getElementById('blackJackUI');

    let blueBlackJackScore = 0;
    let redBlackJackScore = 0;

    //is, isnt bust gif
    let redIsBust = false
    let blueIsBust = false
    let thisFrameRedIsBust = false
    let thisFrameBlueIsBust = false
    let bustDelay = 0

    //number of red pucks per zone

    let currentZone1red = [];
    let currentZone2red = [];
    let currentZone3red = [];
    let currentZone4red = [];
    let currentZone5red = [];

    let currentZone1blue = [];
    let currentZone2blue = [];
    let currentZone3blue = [];
    let currentZone4blue = [];
    let currentZone5blue = [];

    let zone1redCardsArray = [];
    let zone2redCardsArray = [];
    let zone3redCardsArray = [];
    let zone4redCardsArray = [];
    let zone5redCardsArray = [];

    let zone1blueCardsArray = [];
    let zone2blueCardsArray = [];
    let zone3blueCardsArray = [];
    let zone4blueCardsArray = [];
    let zone5blueCardsArray = [];


    //set up cards
    let allCards = []
    let cardNumbers =  ['A','2','3','4','5','6','7','8','9','10','J','Q','K']
    let cardSuits = ['H','D','S','C']
    cardSuits.forEach((suit, i) => {
        cardNumbers.forEach((e, i) => {
            const cardObj = new Object();
            cardObj.number = e;
            cardObj.suit = suit;
            let x = i+1
            cardObj.image = "Card-" + suit + x + ".svg"
            //assign card values
            if (i<1){
                cardObj.value = 11;
            } else if (i<10){
                cardObj.value = i+1;
            } else {
                cardObj.value = 10;
            };
            //assign card zones
            if(i<13){
                cardObj.zone = 4;
            }
            if(i<10){
                cardObj.zone = 3;
            }
            if(i<7){
                cardObj.zone = 2;
            }
            if(i<4){
                cardObj.zone = 1;
            }
            if(i<1){
                cardObj.zone = 5;
            }
            allCards.push(cardObj);
        });
    });

    function showGifPopUp (imageSrc, text){
        const slideIn = [
            { transform: 'scale(0)' },
            { transform: 'scale(0)' },
            { transform: 'scale(1)' },
            { transform: 'scale(1)' },
            { transform: 'scale(1)' },
            { transform: 'scale(1)' },
            { transform: 'scale(1)' },
            { transform: 'scale(1)' },
            { transform: 'scale(1)' },
            { transform: 'scale(1)' },
            { transform: 'scale(0)' }

          ];
          
        const slideInTiming = {
        duration: 6500,
        iterations: 1,
        }

        const gifModal = document.getElementById('gifModal');
        const gifSrc = imageSrc;
        const gifImage = document.getElementById('popUpGif');
        const popUpText = document.getElementById('popUpText');
        popUpText.innerText = text;
        gifImage.src = gifSrc;
        gifModal.animate(slideIn, slideInTiming);
        
    }



    //add card function
    function addCard(zone, team, card) {
        let image = document.createElement("img");
        image.src = "/static/images/cards/" + card; 
        image.className = "cardImage"
        let slotId = "zone-" + zone + "-" + team
        let slot =  document.getElementById(slotId)
        slot.appendChild(image);
        const rotateIn = [
            { transform: 'scale(0) rotate(-10deg)' },
            { transform: 'scale(1) rotate(-80deg)' }
          ];
          
        const rotateInTiming = {
        duration: 750,
        iterations: 1,
        }
        image.animate(rotateIn, rotateInTiming);

        
    }

    function removeCard(zone, team) {
        let slotId = "zone-" + zone + "-" + team
        let slot =  document.getElementById(slotId)
        slot.removeChild(slot.lastElementChild)
        // slot.removeChild(slot.getElementsByTagName('img')[0]);

        let explodeAnimation = slot.getElementsByTagName('img')[0];

        const explosion = [
            { transform: 'scale(0)' },
            { transform: 'scale(1)' },
            { transform: 'scale(1)' },
            { transform: 'scale(0)' }
          ];
          
          const explosionTiming = {
            duration: 900,
            iterations: 1,
          }

        explodeAnimation.animate(explosion, explosionTiming);
          

    }



    // const body = document.querySelector('body');

    // body.addEventListener('click', (event) => {
    //     console.log("hi")
    //     removeCard("1","red");
    // });

    

    // ----------🃏♠️♥️♣️♦️  End 🃏♠️♥️♣️♦️---------



    // ---Space Invaders---
    const detectionZone = 2000 //length of zone
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

    const curlingCircGeo1 = new THREE.CircleGeometry(80, 36);
    const curlingCircMat1 = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
    });

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
    scene.add(curlingLines);
    



    //---------------------------------------------------------
    //-----------------------animation loop--------------------
    //---------------------------------------------------------

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
                roundScoresRedDB = tableDataObj.RoundScoresRed;
                roundScoresBlueDB = tableDataObj.RoundScoresBlue;

                newRedNameOne = tableDataObj.redPlayers[0].name
                newRedImageOne = tableDataObj.redPlayers[0].image
                newRedNameTwo = tableDataObj.redPlayers[1].name
                newRedImageTwo = tableDataObj.redPlayers[1].image
                newRedNameThree = tableDataObj.redPlayers[2].name
                newRedImageThree = tableDataObj.redPlayers[2].image

                newBlueNameOne = tableDataObj.bluePlayers[0].name
                newBlueImageOne = tableDataObj.bluePlayers[0].image
                newBlueNameTwo = tableDataObj.bluePlayers[1].name
                newBlueImageTwo = tableDataObj.bluePlayers[1].image
                newBlueNameThree = tableDataObj.bluePlayers[2].name
                newBlueImageThree = tableDataObj.bluePlayers[2].image

                redTeamOne.innerHTML = newRedNameOne
                redImageOne.src = newRedImageOne
                redTeamTwo.innerHTML = newRedNameTwo
                redImageTwo.src = newRedImageTwo
                redTeamThree.innerHTML = newRedNameThree
                redImageThree.src = newRedImageThree

                blueTeamOne.innerHTML = newBlueNameOne
                blueImageOne.src = newBlueImageOne
                blueTeamTwo.innerHTML = newBlueNameTwo
                blueImageTwo.src = newBlueImageTwo
                blueTeamThree.innerHTML = newBlueNameThree
                blueImageThree.src = newBlueImageThree


                //check for change
                if (pythonShotCounterDB !== prevPythonShotCount) {
                    console.log("change");
                    shotsThrownUp()
                    prevPythonShotCount = pythonShotCounterDB;
                };

            }

        //update HUD
        updateShotsPlayedText();
        updateRoundsPlayedText();
        updateGameScore();

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


        // ------ 🕹🕹🕹🕹 Check for movement 🕹🕹🕹🕹 -------

        function checkForPuckStillness(buffer, ticks) {
            const puckPosArr = rpxv.concat(rpyv, bpxv, bpyv);
            const puckPosSum = puckPosArr.reduce((a, b) => a + b, 0);
            let totalPuckMovement = puckPosSum - prevPuckPosSum;
            totalPuckMovement = Math.abs(totalPuckMovement)

            if(totalPuckMovement < buffer){
                puckMovement = false;
            } else {
                puckMovement = true;
            }

            // if (puckPosSum === prevPuckPosSum) {
            //     puckMovement = false;
            //     // console.log("puckMovement = ", puckMovement);
            // } else {
            //     puckMovement = true;
            //     // console.log("puckMovement = ", puckMovement);
            // }

            if (puckMovement == false){
                movementTick += 1
            } else {
                movementTick = 0
            }

            if (movementTick > ticks){
                pucksStationary = true
                console.log("pucksStationary: ", pucksStationary)
            } else {
                pucksStationary = false
            }

            prevPuckPosSum = puckPosSum;
        
            return pucksStationary;
        }    
        console.log("current tick = ", ticks())
        console.log("Pucks Still: ", checkForPuckStillness(8, 1));


        // ------ 🕹🕹🕹🕹 Check for movement 🕹🕹🕹🕹 -------

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




        //-----------NeoCurling---------------
        curlingLines.remove(...curlingLines.children);
        curlingPuckCircles.remove(...curlingPuckCircles.children);
        
        if (gameTypeDB == "neoCurling") {

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

                //add dist above puck

                fontLoader.load('fonts/helvetiker_bold.typeface.json', function(font) {

                    const textGeo = new TextGeometry(String(Math.round(lineLength)), {
                        font: font,
                        size: 50,
                        height: 5,
                        curveSegments: 12,
                    });

                    const mesh = new THREE.Mesh(textGeo, redTextMat);
                    mesh.position.x = redX;
                    mesh.position.y = 80;
                    mesh.position.z = redY;
                    mesh.lookAt(camera.position);
                    mesh.geometry.center()
                    curlingLines.add(mesh);

                });

        
                

                //scoring
                const rpCurlingObj = new Object();
                rpCurlingObj.dist = lineLength;
                rpCurlingObj.x = redX;
                rpCurlingObj.y = redY;
                rpCurlingDistances.push(rpCurlingObj);


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
                line.name = "helloPoppet";

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

                    const mesh = new THREE.Mesh(textGeo, blueTextMat);
                    mesh.position.x = blueX;
                    mesh.position.y = 80;
                    mesh.position.z = blueY;
                    mesh.lookAt(camera.position);
                    mesh.geometry.center()
                    mesh.name = "curlingNumber";
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


    

            // if ((rpCurlingDistances.length == 0)||){
            //     console.log("no red pucks")
            // }

            // if (bpCurlingDistances.length == 0){
            //     console.log("no blue pucks")
            // }
            let rpCurlBestDist = 10000;
            let bpCurlBestDist = 10000;

            if (rpCurlingDistances.length > 0){
                console.log(" curl red pucks")
                rpCurlBestDist = rpCurlingDistances[0].dist
            }

            if (bpCurlingDistances.length > 0){
                console.log("curl blue pucks")
                bpCurlBestDist = bpCurlingDistances[0].dist
            }



            if (rpCurlingDistances[0] && rpCurlBestDist < bpCurlBestDist) {
                //red wins
                for (let i = 0; i < rpCurlingDistances.length; i++) {
                    if (rpCurlingDistances[i].dist < bpCurlBestDist) {
                        curlingRedScore.push(1);
                        const puckScoreBox = new THREE.Mesh(puckScoreBoxGeo, puckScoreBoxMat);
                        puckScoreBox.position.set(rpCurlingDistances[i].x, 60, rpCurlingDistances[i].y);
                        curlingLines.add(puckScoreBox);
                    } else {
                        break;
                    };
                };
            };


            if (bpCurlingDistances[0] && bpCurlBestDist < rpCurlBestDist) {
                //blue wins

                for (let i = 0; i < bpCurlingDistances.length; i++) {
                    if (bpCurlingDistances[i].dist < rpCurlBestDist) {
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
            console.log(scene);

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
                bluePercent = 100
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


            rpBar.scale.y = redPercent * 5;
            bpBar.scale.y = bluePercent * 5;

        }

        //----------spaceinvaders end-------------------------



        //----------🃏♠️♥️♣️♦️ Black Jack Start 🃏♠️♥️♣️♦️-------------------------

        if (gameTypeDB == "blackJack") {

            //number of red pucks per zone

            let zone1red = 0;
            let zone2red = 0;
            let zone3red = 0;
            let zone4red = 0;
            let zone5red = 0;

            let zone1blue = 0;
            let zone2blue = 0;
            let zone3blue = 0;
            let zone4blue = 0;
            let zone5blue = 0;



            // red puck in each zone
            rpyv.forEach((e, i) => {
                if (rpyv[i] + puckRadius < scoreLines[1]) {
                    zone5red += 1
                } else if (rpyv[i] + puckRadius < scoreLines[2]) {
                    zone4red += 1
                } else if (rpyv[i] + puckRadius < scoreLines[3]) {
                    zone3red += 1
                } else if (rpyv[i] + puckRadius < scoreLines[4]) {
                    zone2red += 1
                } else if (rpyv[i] + puckRadius < scoreLines[5]) {
                    zone1red += 1
                } else {
                    // do nothing
                }
            });

            // blue puck in each zone
            bpyv.forEach((e, i) => {
                if (bpyv[i] + puckRadius < scoreLines[1]) {
                    zone5blue += 1
                } else if (bpyv[i] + puckRadius < scoreLines[2]) {
                    zone4blue += 1
                } else if (bpyv[i] + puckRadius < scoreLines[3]) {
                    zone3blue += 1
                } else if (bpyv[i] + puckRadius < scoreLines[4]) {
                    zone2blue += 1
                } else if (bpyv[i] + puckRadius < scoreLines[5]) {
                    zone1blue += 1
                } else {
                    // do nothing
                }
            });



            function assignCards(oldPucksPerZone, currentPucksPerZone, zoneCardsArray, zone, team) {

                // if change assign cards to zones

                if (oldPucksPerZone !== currentPucksPerZone[0]){ 

                    let dif = oldPucksPerZone - currentPucksPerZone;
                    dif = Math.abs(dif)


                    if (oldPucksPerZone < currentPucksPerZone){
                        console.log("remove card")
                        for (let index = 0; index < dif; index++) {
                            zoneCardsArray.pop();
                            removeCard(zone, team)
                        }
                        
                    }

                    if (oldPucksPerZone > currentPucksPerZone){
                        console.log("add card")
                        for (let index = 0; index < dif; index++) {
                            let filteredCards = allCards.filter(function (el) {
                                return el.zone == parseInt(zone)
                            });
        
                            const random = Math.floor(Math.random() * filteredCards.length);
                            zoneCardsArray.push(filteredCards[random])
                            console.log(filteredCards[random].image)
                            console.log("run")
                            addCard(zone, team, filteredCards[random].image)
        
                            

                        }
                    }

                    currentPucksPerZone.pop();
                    currentPucksPerZone.push(oldPucksPerZone);
                }

                
            }

            assignCards(zone1red, currentZone1red, zone1redCardsArray, "1", "red");
            assignCards(zone2red, currentZone2red, zone2redCardsArray, "2", "red");
            assignCards(zone3red, currentZone3red, zone3redCardsArray, "3", "red");
            assignCards(zone4red, currentZone4red, zone4redCardsArray, "4", "red");
            assignCards(zone5red, currentZone5red, zone5redCardsArray, "5", "red");

            assignCards(zone1blue, currentZone1blue, zone1blueCardsArray, "1", "blue");
            assignCards(zone2blue, currentZone2blue, zone2blueCardsArray, "2", "blue");
            assignCards(zone3blue, currentZone3blue, zone3blueCardsArray, "3", "blue");
            assignCards(zone4blue, currentZone4blue, zone4blueCardsArray, "4", "blue");
            assignCards(zone5blue, currentZone5blue, zone5blueCardsArray, "5", "blue");
            

            function getBlackJackScoreRed() {
                //loop through each array
                let allCardValues = zone1redCardsArray.concat(zone2redCardsArray, zone3redCardsArray, zone4redCardsArray, zone5redCardsArray);
                const allCardsValueSum = allCardValues.reduce((accumulator, object) => {
                    return accumulator + object.value;
                  }, 0);
                 return allCardsValueSum 
            }

            function getBlackJackScoreBlue() {
                //loop through each array
                let allCardValues = zone1blueCardsArray.concat(zone2blueCardsArray, zone3blueCardsArray, zone4blueCardsArray, zone5blueCardsArray);
                const allCardsValueSum = allCardValues.reduce((accumulator, object) => {
                    return accumulator + object.value;
                  }, 0);
                 return allCardsValueSum 
            }




            // blueBlackJackScore = 
            redBlackJackScore = getBlackJackScoreRed()
            blueBlackJackScore = getBlackJackScoreBlue()






        };


    

        //----------🃏♠️♥️♣️♦️  Black Jack end  🃏♠️♥️♣️♦️-------------------------








        if (gameTypeDB == "neoCurling") {
            gameTitle.innerHTML = "Neo Curling";

            console.log("curling running score red =", redCurlingScore)
            if (gsRedScore) {
                gsRedScore.innerHTML = redCurlingScore;
            };
            if (gsBlueScore) {
                gsBlueScore.innerHTML = blueCurlingScore;
            };
        };

        if (gameTypeDB == "classicShuffle") {
            gameTitle.innerHTML = "Classic Shuffle";
            if (gsRedScore) {
                gsRedScore.innerHTML = roundScoreClassicShuffle.red;
            };
            if (gsBlueScore) {
                gsBlueScore.innerHTML = roundScoreClassicShuffle.blue;
            };
        };

        if (gameTypeDB == "spaceInvaders") {
            gameTitle.innerHTML = "Space Invaders";
            if (gsRedScore) {
                gsRedScore.innerHTML = Math.round(redPercent) + "﹪";
            };
            if (gsBlueScore) {
                gsBlueScore.innerHTML = Math.round(bluePercent) + "﹪";
            };
        };

        // ---🃏♠️♥️♣️♦️ Black Jack 🃏♠️♥️♣️♦️---

        if (gameTypeDB == "blackJack") {



            //show gif if score goes over 21

            blackJackUI.style.display = "grid";
            gameTitle.innerHTML = "Black Jack";

            if (checkForPuckStillness(10,30)){

                if (gsRedScore) {
                    gsRedScore.innerHTML = redBlackJackScore;
                    if (redBlackJackScore>21){
                        gsRedScore.style.textDecoration = "line-through";
                        gsRedScore.style.opacity = "50%"
    
    
                        //start delay
                        
    
    
                        thisFrameRedIsBust = true
    
    
    
                        // let thisFrameRedIsBust = true
    
                        if (redIsBust != thisFrameRedIsBust) {
                            console.log("red bust!!")
    
                            redIsBust = thisFrameRedIsBust
                            showGifPopUp("/static/images/bust.gif", "Ooooo Red Team busted!!!");
    
                        }
    
                    } else {
                        gsRedScore.style.textDecoration = "none";
                        gsRedScore.style.opacity = "100%"
                        
    
                        thisFrameRedIsBust = false
    
                        
                        if (redIsBust != thisFrameRedIsBust) {
                            console.log("red safe!!")
                            redIsBust = thisFrameRedIsBust
    
                            showGifPopUp("/static/images/safe.gif", "Red Back in the game! Noice");
                        }
    
                    }
                };
                if (gsBlueScore) {
                    gsBlueScore.innerHTML = blueBlackJackScore;
                    if (blueBlackJackScore>21){
                        gsBlueScore.style.textDecoration = "line-through";
                        gsBlueScore.style.opacity = "50%"
    
    
                        thisFrameBlueIsBust = true
    
    
                        if (blueIsBust != thisFrameBlueIsBust) {
                            console.log("blue bust!!")
    
                            blueIsBust = thisFrameBlueIsBust
    
                            showGifPopUp("/static/images/bust.gif", "Ooooo Blue Team busted!!!");
    
                        }
    
                    } else {
                        gsBlueScore.style.textDecoration = "none";
                        gsBlueScore.style.opacity = "100%"
                        
    
                        thisFrameBlueIsBust = false
    
    
                        if (blueIsBust != thisFrameBlueIsBust) {
                            console.log("blue safe!!")
    
                            blueIsBust = thisFrameBlueIsBust
    
                            showGifPopUp("/static/images/safe.gif", "Blue Back in the game! Noice");
                        }
    
                    }
                };

            }
        };

        if (gameTypeDB != "blackJack") {
            gsBlueScore.style.textDecoration = "none";
            gsBlueScore.style.opacity = "100%";
            gsRedScore.style.textDecoration = "none";
            gsRedScore.style.opacity = "100%";
            blackJackUI.style.display = "none";
        }

        // ---🃏♠️♥️♣️♦️ End 🃏♠️♥️♣️♦️---

        if (gameTypeDB == "neoShuffle") {
            gameTitle.innerHTML = "Neo Shuffle";
            if (gsRedScore) {
                gsRedScore.innerHTML = roundScoreNeoShuffle.red;
            };
            if (gsBlueScore) {
                gsBlueScore.innerHTML = roundScoreNeoShuffle.blue;
            };
        };

        calculateCurrentScore();

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
        if (checkForPuckStillness(8,30)){
            if (shotsPlayedDB == 8) {
                endOfRound();
                console.log("round over")
                if (redRoundScore > blueRoundScore) {
                    showGifPopUp("/static/images/redwins.gif", "Red Wins!!!");
                }
                if (redRoundScore < blueRoundScore) {
                    showGifPopUp("/static/images/bluewins.gif", "Blue Wins!!!");
                }
                if (redRoundScore == blueRoundScore) {
                    showGifPopUp("/static/images/draw.gif", "It's a draw 😬");
                }
            };
    
            //---end of game
            if (roundsPlayedDB == 8) {
                console.log("game over")
                gameStateDB = "endOfGame";
                instructionRow.style = "background: linear-gradient(180deg, rgba(52, 205, 253, 0) 0%, #34FD84 100%);";
                instructions.innerHTML = "game over press new game";
            };
        }




        renderer.render(scene, camera);
    }
    animate();

    function calculateCurrentScore(){

        if (gameTypeDB == "neoCurling") {
            if (redGameScore) {
                redRoundScore = redCurlingScore;
            };
            if (blueGameScore) {
                blueRoundScore = blueCurlingScore;
            };
        };

        if (gameTypeDB == "classicShuffle") {
            if (redGameScore) {
                redRoundScore = roundScoreClassicShuffle.red
            };
            if (blueGameScore) {
                blueRoundScore = roundScoreClassicShuffle.blue
            };
            console.log("run cs")
            // if ( blueGameScoreTotal>=21 && redGameScoreTotal<21 ){
            //     console.log("blue won");
            // }
            // if ( redGameScoreTotal>=21 && blueGameScoreTotal<21 ){
            //     console.log("red won");
            // }

        };

        if (gameTypeDB == "spaceInvaders") {
            if (redGameScore && blueGameScore) {
                if(Math.round(redPercent) >= Math.round(bluePercent)){
                    redRoundScore = 1
                }
                if(Math.round(redPercent) <= Math.round(bluePercent)){
                    blueRoundScore = 1
                }
            };
        };

        if (gameTypeDB == "blackJack") {
            if (redGameScore) {
                redRoundScore = redBlackJackScore
                console.log("run bj")
            };
            if (blueGameScore) {
                blueRoundScore = 1
            };

        };

        if (gameTypeDB == "neoShuffle") {
            if (redGameScore) {
                redRoundScore = roundScoreNeoShuffle.red;
            };
            if (blueGameScore) {
                blueRoundScore = roundScoreNeoShuffle.blue
            };

        };
        // console.log("redscore =", redRoundScore)
        // console.log("bluescore =", blueRoundScore)

        // callAPI("TableData", 1, "PATCH", '{"CurrentRedScore": ' + redRoundScore + ', "CurrentBlueScore": ' + blueRoundScore + '}');

    };







    // function addRoundScoreToGameScore(){

    //     if (gameTypeDB == "neoCurling") {
    //         if (redGameScore) {
    //             redRoundScore = redCurlingScore;
    //         };
    //         if (blueGameScore) {
    //             blueRoundScore = blueCurlingScore;
    //         };
    //     };

    //     if (gameTypeDB == "classicShuffle") {
    //         if (redGameScore) {
    //             redRoundScore = roundScoreClassicShuffle.red
    //         };
    //         if (blueGameScore) {
    //             blueRoundScore = roundScoreClassicShuffle.blue
    //         };
    //         // if ( blueGameScoreTotal>=21 && redGameScoreTotal<21 ){
    //         //     console.log("blue won");
    //         // }
    //         // if ( redGameScoreTotal>=21 && blueGameScoreTotal<21 ){
    //         //     console.log("red won");
    //         // }

    //     };

    //     if (gameTypeDB == "spaceInvaders") {
    //         if (redGameScore && blueGameScore) {
    //             if(Math.round(redPercent) >= Math.round(bluePercent)){
    //                 redRoundScore = 1
    //             }
    //             if(Math.round(redPercent) <= Math.round(bluePercent)){
    //                 blueRoundScore = 1
    //             }
    //         };
    //     };

    //     if (gameTypeDB == "blackJack") {
    //         if (redGameScore) {
    //             redRoundScore = 1
    //         };
    //         if (blueGameScore) {
    //             blueRoundScore = 1
    //         };
    //     };

    //     if (gameTypeDB == "neoShuffle") {
    //         if (redGameScore) {
    //             redRoundScore = roundScoreNeoShuffle.red;
    //         };
    //         if (blueGameScore) {
    //             blueRoundScore = roundScoreNeoShuffle.blue
    //         };

    //     };

    //     roundScoresBlueLocal.splice(0, roundScoresBlueLocal.length, ...roundScoresBlueDB);
    //     roundScoresRedLocal.splice(0, roundScoresRedLocal.length, ...roundScoresRedDB);

    
    //     shotsThrown = 0;
    //     console.log("rounds played before add =", roundsPlayedDB)
    //     roundsPlayed = roundsPlayedDB + 1;
    //     if (roundsPlayed > 7) {
    //         roundsPlayed = 8;
    //     }
    //     console.log("rounds played before add =", roundsPlayedDB)

    //     roundScoresRedLocal.push(redRoundScore);
    //     roundScoresBlueLocal.push(blueRoundScore);
        

    //     callAPI("TableData", 1, "PATCH", '{"ShotsPlayed": ' + shotsThrown + ', "RoundsPlayed": ' + roundsPlayed + ', "RoundScoresBlue":[' + roundScoresBlueLocal + '], "RoundScoresRed":[' + roundScoresRedLocal + '], "GameState": "inProgress"}');
    //     updateGameScore()
    // };








    function updateShotsPlayedText(){
        turnNumber.innerHTML = (shotsPlayedDB + 1).toString();
        if (shotsPlayedDB > 7) {
            turnNumber.innerHTML = "8";
        }
    };

    function updateRoundsPlayedText(){
        roundNumberTxt.innerHTML = (roundsPlayedDB + 1).toString()
        if (roundsPlayedDB > 7) {
            roundNumberTxt.innerHTML = "8";
        }
    };

    function updateGameScore(){
        blueGameScore.innerHTML = roundScoresBlueDB.reduce((a, b) => a + b, 0);
        redGameScore.innerHTML = roundScoresRedDB.reduce((a, b) => a + b, 0);
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





    function endOfRound() {
        instructionRow.style = "background: linear-gradient(180deg, rgba(52, 205, 253, 0) 0%, #34FD84 100%);";
        instructions.innerHTML = "round over press next round";
        
        if (gameStateDB != "endOfRound"){
            
            console.log("running end of round")
            callAPI("TableData", 1, "PATCH", '{"GameState": "endOfRound"}');   
        }
    }


    //----------------
    //Create Session--
    //----------------

    //Open Kiosk With Passcode 
    //Create Session
    //With  Start Time = Current Time, Location, and table number pre defined
    //Set End Time

    //---------------
    //Create Game Object
    //-----------------
    //Create Player Objects and Add to red or blue team within the Game object
    //Select game type
    //Add Game type and Game start time when the start game button is pressed
    //Add Game Completed status, Game end time, and add Game to Session object when either quit game or Game over occurs.

    //---------------
    //During game
    //-----------------
    //Add Round Scores to game object at the end of each round























    //✅curling blue cant win
    //end of each round add to game score
    //end of each game add to games won
    //✅keep tracking after last shot thrown
    //first push start should go to throw 1 not 2
    //classic shuffle is first to 21
    //blackjack
    //visuals



//🏁🏁🏁Game Screen End 🏁🏁🏁






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



