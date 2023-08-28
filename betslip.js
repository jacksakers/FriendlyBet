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
  document.getElementById("credits").innerHTML = credits + " c";
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
            
            betList.appendChild(betElement);
        } else {
            // doc.data() will be undefined in this case
            console.log("No such bet document!");
        }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    })
}