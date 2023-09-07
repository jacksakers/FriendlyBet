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
      getGroups();
      getGroupBets(currentFamily);
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

async function getGroupBets(family) {
  var currentGroup = [];
  var docRef = db.collection("users").doc(currentUser.uid);
  await docRef.get().then((doc) => {
    if (doc.exists) {
        // console.log("Document data:", doc.data());
        currentGroup = doc.data().currentgroupID;
    } else {
        // doc.data() will be undefined in this case
        console.log("No such user document!");
    }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });

  docRef = db.collection("groups").doc(currentGroup);
  var betsArray = [];
  await docRef.get().then((doc) => {
    if (doc.exists) {
        betsArray = doc.data().bets;
    } else {
        // doc.data() will be undefined in this case
        console.log("No such group document!");
    }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });
  var betList = document.getElementById("bet-list");
  betList.innerHTML = '';
  var betElementsArray = [];
  betsArray.forEach(async (betID) => {
    var docRef = db.collection('bets').doc(betID);
    await docRef.onSnapshot((doc) => {
      if (doc.exists) {
          const data = doc.data();
          const timeLimit = data.timelimit;
          const betElement = document.createElement('div');
          const betFamily = data.family;
          if (betFamily != currentFamily) return;
          betElement.classList.add('item');
          betElement.id = doc.id;
          const betOptions = data.options;
          var betOptionsDivs = ``;
          var index = 1;
          betOptions.forEach((option) => {
              var optionArray = option.split(" | ");
              var optionTitle = optionArray[0];
              var optionOdds = optionArray[1];
              var optionPool = optionArray[2];
              betOptionsDivs += `<div class="bet-option">
                  <span id="option-${betID}-${index}"> ${optionTitle} | ${optionOdds}</span>
                  <input class="enter-bet" id="${betID}-${index}">
                  c
                  <button class="wager-button" onclick="wagerOnOption('${betID}',${index})">
                  Wager
                  </button>
                  </div>`;
              index++;
          });
          
          if (timeLimit) {

            var q = new Date();

            var dateSplit = data.date.split("-");
            var timeSplit = data.time.split(":");
            var limit=new Date(dateSplit[0],dateSplit[1]-1,dateSplit[2],
                                timeSplit[0], timeSplit[1]);

            var hour = timeSplit[0];
            var time = data.time;
            if (hour > 12) {
              time = (hour - 12) + ":" + timeSplit[1] + " PM";
            } else {
              time += " AM";
            }

            if (q>limit) {
              // console.log("expired");
              // betElement.innerHTML = `<div class="bet-name">
              //   ${data.title} | Expired! </div>` + betOptionsDivs;
            } else {
              if (q.getTime() < limit.getTime()) {
                // console.log("not expired");
                betElement.innerHTML = `<div class="bet-name">
                  ${data.title} | Ends on ${data.date} at ${time}</div>` + betOptionsDivs;
              }
            }

            // betElement.innerHTML = `<div class="bet-name">
            //   ${data.title} | Ends on ${data.date} at ${time}</div>` + betOptionsDivs;
          } else {
            betElement.innerHTML = `<div class="bet-name">
              ${data.title}</div>` + betOptionsDivs;
          }
          try {
            document.getElementById(doc.id).innerHTML = betElement.innerHTML;
          } catch(err) {
            if (betElement.innerHTML != "") betList.appendChild(betElement);
          }
      } else {
          // doc.data() will be undefined in this case
          console.log("No such bet document!");
      }
    });
  })

    // Real-time updates
    // db.collection('bets').onSnapshot(snapshot => {
    // });
}

async function wagerOnOption(betID, optionNum) {
  var betRef = db.collection('bets').doc(betID);
  var wagerAmount = parseInt(document.getElementById(betID+"-"+optionNum).value);
  console.log(wagerAmount);
  if (wagerAmount < 1 || !wagerAmount) return false;
  // credit check
  var availableCredits = await getCredits();
  if (wagerAmount > availableCredits) return false;
  availableCredits = availableCredits - wagerAmount;
  // update pool
  var currentPool = 0;
  var currentOptions = [];
  var optionsWagerArray = [];
  await betRef.get().then((doc) => {
    if (doc.exists) {
        currentPool = doc.data().pool;
        currentOptions = doc.data().options;
        optionsWagerArray = doc.data().optionswagerarray;
    } else {
        console.log("No such document!");
    }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });
  var newPool = (currentPool + wagerAmount);
  // update odds
  var index = 0;
  currentOptions.forEach((option) => {
    var optionTitle = option.split(" | ")[0];
    var optionAmount = parseInt(option.split(" | ")[2]);
    if ((index + 1) == optionNum) {
      optionAmount = optionAmount + wagerAmount;

      var optionsWASplit = optionsWagerArray[index].split(" -:- ");
      var i = 0;
      var set = false;
      var newPair = "";
      optionsWASplit.forEach((pair) => {
        var uid = pair.split(" | ")[0];
        var amount = parseFloat(pair.split(" | ")[1]);
        if (uid == currentUser.uid) {
          amount += wagerAmount;
          wagerAmount = amount;
          newPair = currentUser.uid + " | " + amount;
          optionsWASplit[i] = newPair;
          set = true;
        }
        i++;
      });
      if (!set) {
        optionsWASplit.push(currentUser.uid + " | " + wagerAmount);
      }
      optionsWagerArray[index] = ``;
      i = 0;
      optionsWASplit.forEach((pair) => {
        if (pair != "") optionsWagerArray[index] += " -:- " + pair;
        i++;
      });
    }
    var newOdds = 0;
    if (newPool > 0 && optionAmount > 0) newOdds = parseFloat((newPool / optionAmount).toFixed(2));
    currentOptions[index] = optionTitle + " | " + newOdds + " | " + optionAmount;
    document.getElementById(`option-${betID}-${index + 1}`).innerHTML = currentOptions[index];
    index++;
  });

  // write data
  await betRef.set({options: currentOptions, 
                    pool: newPool, 
                    optionswagerarray: optionsWagerArray},
    { merge: true });
  var userRef = db.collection("users").doc(currentUser.uid);
  availableCredits = parseFloat(availableCredits);
  await userRef.set({wagered: firebase.firestore.FieldValue.arrayUnion(betID),
                    credits: availableCredits},
    { merge: true });

  document.getElementById(betID+"-"+optionNum).value = "";
  document.getElementById("credits").innerHTML = availableCredits + " c";
}


async function getGroups() {
  var groupArray = [];
  var docRef = db.collection("users").doc(currentUser.uid);
  await docRef.get().then((doc) => {
    if (doc.exists) {
        // console.log("Document data:", doc.data());
        groupArray = doc.data().groups;
        document.getElementById("current-group").innerHTML = doc.data().currentgroup;
    } else {
        // doc.data() will be undefined in this case
        console.log("No such user document!");
    }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });

  groupArray.forEach(async (groupID) => {
    var docRef = db.collection('groups').doc(groupID);
    var groupDropdown = document.getElementById("group-dropdown");
    groupDropdown.innerHTML = '';
    await docRef.get().then((doc) => {
      if (doc.exists) {
          const data = doc.data();
          const groupDDElement = document.createElement('a');
          groupDDElement.setAttribute('onclick', `setCurrentGroup("${data.groupname}", "${groupID}")`);
          groupDDElement.innerHTML = `${data.groupname}`;
          groupDropdown.appendChild(groupDDElement);
      } else {
          console.log("No such group document!");
      }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
  })
}

async function setCurrentGroup(newGroup, groupID) {
    document.getElementById("current-group").innerHTML = newGroup;
    var docRef = db.collection("users").doc(currentUser.uid);
    await docRef.set({currentgroup: newGroup, currentgroupID: groupID},
        { merge: true });
    await getGroupBets();
}

function goToMisc() {
  if (currentFamily != "Misc") {
    document.getElementById("selected-tab").id = "sports";
    document.getElementById("misc").id = "selected-tab";
    currentFamily = "Misc";
  }
  getGroupBets(currentFamily);
}

function goToSports() {
  if (currentFamily != "Sports") {
    document.getElementById("selected-tab").id = "misc";
    document.getElementById("sports").id = "selected-tab";
    currentFamily = "Sports";
  }
  getGroupBets(currentFamily);
}