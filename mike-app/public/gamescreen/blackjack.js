// define when pucks stop
    // check for pucks in each zone
    // compare to last number of pucks in each zone
    // if more pucks in a zone add cards
    // if less pucks in a zone remove cards
    // asign cards to zones and team
    // score


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




    console.log("test: ", allCards);

    let testCard = document.getElementById("testCard");
    testCard.setAttribute("src", "/static/images/cards/" + allCards[34].image);


        
