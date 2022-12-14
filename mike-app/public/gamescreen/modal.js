
// Get the modal
const orderModal = document.getElementById('orderModal');


// Listen for clicks on the entire window
document.addEventListener('click', function (event) {

    // If the clicked element has the `.click-me` class, it's a match!
    if (event.target.matches('#testPopUp')) {
        // Do something...
        orderModal.style.display = "flex";
        var randomNumber = Math.floor(Math.random() * 12) + 1;
        popUpGif.src = "/static/reactionGifs/g" + randomNumber + ".gif";
        console.log("open modal")
    }

    // If the clicked element has the `.click-me` class, it's a match!
    if (event.target.matches('.modalClose')) {
        // Do something...
        orderModal.style.display = "none";
        console.log("close modal")
    }

    if (event.target == orderModal) {
        orderModal.style.display = "none";
        console.log("close modal via outside")
    }

});

  
  
  