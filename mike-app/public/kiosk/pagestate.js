let pageState = null;

// pageState = "openKiosk"
// pageState = "selectGame"
// pageState = "kiosk"
pageState = "selectTeams"

selectTeamsPage = document.getElementById("selectTeamsPage");
selectGamePage = document.getElementById("selectGamePage");
kioskPage = document.getElementById("kioskPage");
goToSelectGame = document.getElementById("goToSelectGame");

// set initial page

// pageState = "openKiosk"
// pageState = "selectGame"
// pageState = "kiosk"
pageState = "selectTeams"

if(pageState == "selectTeams"){
    showSelectTeamsPage()
}

if(pageState == "selectGame"){
    showSelectGamePage()
}

if(pageState == "kiosk"){
    showKioskPage()
}

function showSelectTeamsPage(){
    console.log("pageState = ", pageState)
    selectTeamsPage.style.display = "grid";
    selectGamePage.style.display = "none";
    kioskPage.style.display = "none";
}

function showSelectGamePage(){
    console.log("pageState = ", pageState)
    selectTeamsPage.style.display = "none";
    selectGamePage.style.display = "grid";
    kioskPage.style.display = "none";
}

function showKioskPage(){
    console.log("pageState = ", pageState)
    selectTeamsPage.style.display = "none";
    selectGamePage.style.display = "none";
    kioskPage.style.display = "grid";
}




goToSelectGame.onclick = function(){
    showSelectGamePage()
};

const gameSelector = document.getElementsByClassName("gameSelector")[0];

gameSelector.addEventListener("click", function() {
    showKioskPage()
  });

