const db = firebase.firestore();

var currentUser = null;
var currentGroup = null;
var numOfOptions = 2;

//Handle Account Status
firebase.auth().onAuthStateChanged(async (_user) => {
    if(_user) {
      currentUser = _user;
      await userIsLoggedIn();
    } else {
      console.log("Not logged in");
    }
  });

  
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
        optionArray.push(document.getElementById(`bet-option${i}`).value);
    }

    // time limit?
    const timeLimit = document.getElementById('time-limit').checked;
    var date = document.getElementById('date').value;
    var time = document.getElementById('time').value;

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