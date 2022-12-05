

//🎉🎉🎉Kiosk screen!!🎉🎉🎉



console.log("Fuck yess !!!")


//score and round trackers

let shotsThrown = 0;
let gameTypeDB = null;
let gameStateDB = null;
let shotsPlayedDB = 0;
let roundsPlayedDB = 0;
let roundsPlayed = 0;

const roundScoresRedLocal = [];
const roundScoresBlueLocal =[];

let roundScoresRedDB = [];
let roundScoresBlueDB = [];
let pythonShotCounterDB = 0;
let currentRedScoreDB = 0;
let currentBlueScoreDB = 0;

//---table shit---

let prevPythonShotCount = 0;
let prevPuckPosSum = 1;
let puckMovement = false;
let puckData = undefined;
let tableData = undefined;



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
        currentRedScoreDB = tableDataObj.CurrentRedScore;
        currentBlueScoreDB = tableDataObj.CurrentBlueScore;
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

const startGameBtn = document.getElementById('startGame');
const nextTurn = document.getElementById('nextTurn');
const backTurn = document.getElementById('backTurn');
const startNextRoundBtn = document.getElementById('startNextRound');


//---------------------kiosk stuff-------------------





//----start Game---


function startGame() {
    console.log("startGame Pressed")
    callAPI("TableData", 1, "PATCH", '{"ShotsPlayed": 0, "RoundsPlayed": 0, "GameState": "inProgress", "RoundScoresRed": [], "RoundScoresBlue": []}');

}




startGameBtn.onclick = function() { 
    startGame() 
};

//----manually increment shot----




backTurn.onclick = function() {  
    shotsThrownDown() 
};
nextTurn.onclick = function() { 
    shotsThrownUp()
};

//--- Start Next Round ---

function saveRound(){
    roundScoresBlueLocal.splice(0, roundScoresBlueLocal.length, ...roundScoresBlueDB);
    roundScoresRedLocal.splice(0, roundScoresRedLocal.length, ...roundScoresRedDB);

    shotsThrown = 0;
    console.log("rounds played before add =", roundsPlayedDB)
    roundsPlayed = roundsPlayedDB + 1;
    if (roundsPlayed > 7) {
        roundsPlayed = 8;
    }
    console.log("rounds played before add =", roundsPlayedDB)

    roundScoresRedLocal.push(currentRedScoreDB);
    roundScoresBlueLocal.push(currentBlueScoreDB);

    callAPI("TableData", 1, "PATCH", '{"ShotsPlayed": ' + shotsThrown + ', "RoundsPlayed": ' + roundsPlayed + ', "RoundScoresBlue":[' + roundScoresBlueLocal + '], "RoundScoresRed":[' + roundScoresRedLocal + '], "GameState": "inProgress"}');

}


startNextRoundBtn.onclick = () => {
    //---add score to game scrore
    saveRound();
    

};



//----select game-----
const selectNS = document.getElementsByClassName("selectNS")[0];
const selectCS = document.getElementsByClassName("selectCS")[0];
const selectSI = document.getElementsByClassName("selectSI")[0];
const selectBJ = document.getElementsByClassName("selectBJ")[0];
const selectCU = document.getElementsByClassName("selectCU")[0];
let gameChanged = false;



startGameBtn.onclick = () => {
    startGame()
};


selectNS.onclick = () => {
    callAPI("TableData", 1, "PATCH", '{"GameType": "neoShuffle" }')
};

selectCS.onclick = () => {
    callAPI("TableData", 1, "PATCH", '{"GameType": "classicShuffle" }')
};

selectSI.onclick = () => {
    callAPI("TableData", 1, "PATCH", '{"GameType": "spaceInvaders" }')
};

selectBJ.onclick = () => {
    callAPI("TableData", 1, "PATCH", '{"GameType": "blackJack" }')
};

selectCU.onclick = () => {
    callAPI("TableData", 1, "PATCH", '{"GameType": "neoCurling" }')
};

//---add player---
//---red player
var addRedBtn = document.getElementById('addRedPlayerBtn');
addRedBtn.onclick = () => {
    addRedPlayer();
};

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
    removeBtn.value = "❌";
    removeBtn.className = "removePlayerButton";
    removeBtn.onclick = remove;
    li.appendChild(removeBtn);
    document.getElementById("bluePlayerList").appendChild(li);
}

function remove(e) {
    console.log("test =",e);
    var el = e.target;
    el.parentNode.remove();
    console.log(e);
}


function addRedPlayer() {
    var inputField = document.getElementById('playerNameInputRed');
    var w = inputField.value;
    var li = document.createElement("li");
    var rule = document.createTextNode(w);
    li.appendChild(rule);
    inputField.value = "";

    var removeBtn = document.createElement("input");
    removeBtn.type = "button";
    removeBtn.value = "❌";
    removeBtn.className = "removePlayerButton";
    removeBtn.onclick = remove;
    li.appendChild(removeBtn);
    document.getElementById("redPlayerList").appendChild(li);
}

function animate() {
    requestAnimationFrame(animate);
    updateValuesFromDB()
}
animate()


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





//🏁🏁🏁Kiosk Screen End 🏁🏁🏁