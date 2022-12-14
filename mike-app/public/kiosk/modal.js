
// Get the modal
const orderModal = document.getElementById('orderModal');


// Listen for clicks on the entire window
document.addEventListener('click', function (event) {

    // If the clicked element has the `.click-me` class, it's a match!
    if (event.target.matches('.orderButton')) {
        // Do something...
        orderModal.style.display = "flex";
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

  
  
  