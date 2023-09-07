const db = firebase.firestore();

const betList = document.getElementById('bet-list');
var currentUser = null;
var currentFamily = "Sports";
var credits = 0;

//Handle Account Status
firebase.auth().onAuthStateChanged(async (_user) => {
    if(_user) {
      currentUser = _user;
      await getCredits();
      await getBetslip();
    } else {
      console.log("Not logged in");
      window.location = "./login.html";
    }
  });
  

async function getCredits() {
  var docRef = db.collection("users").doc(currentUser.uid);
  await docRef.get().then((doc) => {
    if (doc.exists) {
        credits = doc.data().credits;
    } else {
        console.log("No such user document!");
    }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });
  document.getElementById("credits").innerHTML = credits.toFixed(2) + " c";
  return credits;
}

async function getBetslip() {
    // document.getElementById("selected-tab").id = "new-bet";
    // document.getElementById("created-bets").id = "selected-tab";
    var docRef = db.collection("users").doc(currentUser.uid);
    var betsArray = [];
    await docRef.get().then((doc) => {
        if (doc.exists) {
            betsArray = doc.data().wagered;
        } else {
            console.log("No such user document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

    var betList = document.getElementById("bet-list");
    betList.innerHTML = '';
    var betElementsArray = [];
    var newBEArray = [];
    var lastElementDate = "2023-01-01";
    betsArray.forEach(async (betID) => {
        var docRef = db.collection('bets').doc(betID);
        await docRef.get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            const optionsWagerArray = data.optionswagerarray;
            const betElement = document.createElement('div');
            betElement.classList.add('item');
            const betOptions = data.options;
            var betOptionsDivs = ``;
            var i = 0;
            betOptions.forEach((option) => {
                var optionsWASplit = optionsWagerArray[i].split(" -:- ");
                var amount = 0;
                optionsWASplit.forEach((pair) => {
                    var uid = pair.split(" | ")[0];
                    if (uid != currentUser.uid) return;
                    amount = parseInt(pair.split(" | ")[1]);
                })
                var couldWin = amount * parseFloat(option.split(" | ")[1]);
                betOptionsDivs += `<div class="bet-option">
                    ${option} | Wagered: ${amount} c, could win: ${couldWin.toFixed(2)} c
                    </div>`;
                i++;
            });
            betElement.innerHTML = `<div class="bet-name">
                ${data.title}</div>` + betOptionsDivs;
            
            // betList.appendChild(betElement);
            // console.log([betElement, data.date]);
            // if (data.date) {
            //     betElementsArray.push([betElement, data.date]);
            // } else {
            //     betElementsArray.push([betElement, "2023-01-01"]);
            // }
            var betElementPair = [betElement, data.date];
            const betElementItself = betElementPair[0];
            const [year1, month1, day1] = betElementPair[1].split("-").map(Number);
            const [year2, month2, day2] = lastElementDate.split("-").map(Number);

            if (year1 < year2) {
                // new element is earlier
                newBEArray.unshift(betElementItself);
            } else if (year1 > year2) {
                // new element is later
                newBEArray.push(betElementItself);
            } else {
                if (month1 < month2) {
                    // new element is earlier
                    newBEArray.unshift(betElementItself);
                } else if (month1 > month2) {
                    // new element is later
                    newBEArray.push(betElementItself);
                } else {
                    if (day1 < day2) {
                        // new element is earlier
                        newBEArray.unshift(betElementItself);
                    } else if (day1 > day2) {
                        // new element is later
                        newBEArray.push(betElementItself);
                    } else {
                        // dates are equal
                        newBEArray.push(betElementItself);
                    }
                }
            }
            lastElementDate = betElementPair[1];
            betList.innerHTML = "";
            newBEArray.forEach((betElement) => {
                // console.log("appending...")
                betList.appendChild(betElement);
            })
        } else {
            // doc.data() will be undefined in this case
            console.log("No such bet document!");
        }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    })
    // var lastElementDate = betElementsArray[0][1];
    // betElementsArray.forEach((betElement) => {
    //     const betElementItself = betElement[0];
    //     const [year1, month1, day1] = betElement[1].split("-").map(Number);
    //     const [year2, month2, day2] = lastElementDate.split("-").map(Number);

    //     if (year1 < year2) {
    //         // new element is earlier
    //         newBEArray.unshift(betElementItself);
    //     } else if (year1 > year2) {
    //         // new element is later
    //         newBEArray.push(betElementItself);
    //     } else {
    //         if (month1 < month2) {
    //             // new element is earlier
    //             newBEArray.unshift(betElementItself);
    //         } else if (month1 > month2) {
    //             // new element is later
    //             newBEArray.push(betElementItself);
    //         } else {
    //             if (day1 < day2) {
    //                 // new element is earlier
    //                 newBEArray.unshift(betElementItself);
    //             } else if (day1 > day2) {
    //                 // new element is later
    //                 newBEArray.push(betElementItself);
    //             } else {
    //                 // dates are equal
    //                 newBEArray.push(betElementItself);
    //             }
    //         }
    //     }
    //     lastElementDate = betElement[1];
    // })

    // console.log("Got here")
    newBEArray.forEach((betElement) => {
        console.log("appending...")
        betList.appendChild(betElement);
    })
}