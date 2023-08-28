const db = firebase.firestore();

var currentUser = null;
var currentGroup = null;
var numOfOptions = 2;
var credits = 0;

//Handle Account Status
firebase.auth().onAuthStateChanged(async (_user) => {
    if(_user) {
      currentUser = _user;
      await getCredits();
      await userIsLoggedIn();
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
  }

  
async function setCurrentGroup(newGroup, groupID) {
    document.getElementById("current-group").innerHTML = newGroup;
    var docRef = db.collection("users").doc(currentUser.uid);
    await docRef.set({currentgroup: newGroup, currentgroupID: groupID},
        { merge: true });
    currentGroup = groupID;
}
  

// const betList = document.getElementById('bet-list');
const createBetButton = document.getElementById('create-bet-btn');

async function userIsLoggedIn() {
    
    getGroups();
    // createBetButton.addEventListener('click', async () => {
        
    // });
}

async function submitNewBet() {
    var docRef = null;

    const title = document.getElementById('title').value;

    // get options
    var optionArray = [];
    for (var i = 1; i < numOfOptions+1; ++i) {
        optionArray.push(document.getElementById(`bet-option${i}`).value + " | 0 | 0");
    }

    // time limit?
    const timeLimit = document.getElementById('time-limit').checked;
    var date = document.getElementById('date').value;
    var time = document.getElementById('time').value;

    // family?
    var betFamily = document.getElementById("fam-select").value;

    // add group to bet
    var docId = null;
    if (title && (optionArray[0] != "" && optionArray[1] != "") &&
            (!timeLimit || (date != "" && time != ""))) {
        docRef = db.collection('bets').doc();
        docId = docRef.id;
        await docRef.set({
            title: title,
            options: optionArray,
            groupID: currentGroup,
            family: betFamily,
            timelimit: timeLimit,
            date: date,
            time: time
        });

        document.getElementById('title').value = '';
        document.getElementById('bet-option1').value = '';
        document.getElementById('bet-option2').value = '';
        document.getElementById('bet-options').innerHTML = `<div id="bet-options">
            <input class="enter-bet-option" placeholder="Enter Bet Option 1"
            id="bet-option1">
            <br>
            <input class="enter-bet-option" placeholder="Enter Bet Option 2"
                id="bet-option2">
            </div>`;
        numOfOptions = 2;

        // add betID to group
        docRef = db.collection("groups").doc(currentGroup);
        var betsArray;
        await docRef.get().then((doc) => {
            if (doc.exists) {
                betsArray = doc.data().bets;
            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
        betsArray.unshift(docId);
        await docRef.update({
            bets: betsArray
        });
        var usersRef = db.collection("users").doc(currentUser.uid);
        await usersRef.update({
            bets: firebase.firestore.FieldValue.arrayUnion(docId)
        });
    }
    
}


async function getGroups() {
  var groupArray = [];
  var docRef = db.collection("users").doc(currentUser.uid);
  await docRef.get().then((doc) => {
    if (doc.exists) {
        // console.log("Document data:", doc.data());
        groupArray = doc.data().groups;
        document.getElementById("current-group").innerHTML = doc.data().currentgroup;
        currentGroup = doc.data().currentgroupID;
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
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
          // console.log("Document data:", doc.data());
          const data = doc.data();
          const groupDDElement = document.createElement('a');
          groupDDElement.setAttribute('onclick', `setCurrentGroup("${data.groupname}", "${groupID}")`);
          groupDDElement.innerHTML = `${data.groupname}`;
          groupDropdown.appendChild(groupDDElement);
      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
      }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
  })
}

function addNewOption() {
    numOfOptions++;
    var betOptions = document.getElementById("bet-options");
    var newOption = document.createElement('input');
    newOption.classList.add("enter-bet-option");
    newOption.setAttribute('placeholder', `Enter Bet Option ${numOfOptions}`);
    newOption.setAttribute('id', `bet-option${numOfOptions}`);
    betOptions.appendChild(newOption);
}

async function getCreatedBets() {
    document.getElementById("selected-tab").id = "new-bet";
    document.getElementById("created-bets").id = "selected-tab";
    var docRef = db.collection("users").doc(currentUser.uid);
    var betsArray = [];
    await docRef.get().then((doc) => {
        if (doc.exists) {
            betsArray = doc.data().bets;
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
            const timeLimit = data.timelimit;
            const betElement = document.createElement('div');
            betElement.classList.add('item');
            const betOptions = data.options;
            var betOptionsDivs = ``;
            betOptions.forEach((option) => {
                betOptionsDivs += `<div class="bet-option">
                    ${option}
                    <button class="wager-button">
                    Winner
                    </button>
                    </div>`;
            });
            if (timeLimit) {

                var q = new Date();

                var dateSplit = data.date.split("-");
                var timeSplit = data.time.split(":");
                var limit=new Date(dateSplit[0],dateSplit[1]-1,dateSplit[2],
                                    timeSplit[0], timeSplit[1]);

                if (q>limit) {
                    console.log("expired");
                } else {
                if (q.getTime() < limit.getTime()) {
                    console.log("not expired")
                }
                }

                var hour = timeSplit[0];
                var time = data.time;
                if (hour > 12) time = (hour - 12) + ":" + timeSplit[1];

                betElement.innerHTML = `<div class="bet-name">
                ${data.title} | Ends on ${data.date} at ${time}</div>` + betOptionsDivs;
            } else {
                betElement.innerHTML = `<div class="bet-name">
                ${data.title}</div>` + betOptionsDivs;
            }
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

function goToNewBet() {
    document.getElementById("selected-tab").id = "created-bets";
    document.getElementById("new-bet").id = "selected-tab";
    document.getElementById("bet-list").innerHTML = `<div class="create-item">
        <div id="new-bet-form" >
        <input class="enter-title" placeholder="Enter Title"
            id="title">
        <div id="bet-options">
            <input class="enter-bet-option" placeholder="Enter Bet Option 1"
            id="bet-option1">
            <br>
            <input class="enter-bet-option" placeholder="Enter Bet Option 2"
                id="bet-option2">
        </div>
        <br>
        <button onclick="addNewOption()">Add New Option</button>
        <br>
        <label for="time-limit" class="time-limit-options">Time Limit?</label>
        <input name="time-limit" id="time-limit" type="checkbox">
        <br>
        <input id="date" type="date"> <input id="time" type="time">
        <br>
        <input type="submit" value="Create Bet" id="create-bet-btn" onclick="submitNewBet();return false;">
        </div>
        </div>`
}