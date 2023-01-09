
// Get the modal
const gifModal = document.getElementById('gifModal');


// Listen for clicks on the entire window
document.addEventListener('click', function (event) {

    // If the clicked element has the `.click-me` class, it's a match!
    if (event.target.matches('#testPopUp')) {
        // Do something...
        gifModal.style.display = "flex";
        var randomNumber = Math.floor(Math.random() * 12) + 1;
        popUpGif.src = "/static/reactionGifs/g" + randomNumber + ".gif";
        console.log("open modal")
    }

    // If the clicked element has the `.click-me` class, it's a match!
    if (event.target.matches('.modalClose')) {
        // Do something...
        gifModal.style.display = "none";
        console.log("close modal")
    }

    if (event.target == gifModal) {
        gifModal.style.display = "none";
        console.log("close modal via outside")
    }

});

  
  
  