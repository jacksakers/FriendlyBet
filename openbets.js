const db = firebase.firestore();

const betList = document.getElementById('bet-list');
var currentUser = null;

//Handle Account Status
firebase.auth().onAuthStateChanged(async (_user) => {
    if(_user) {
      currentUser = _user;
      getGroups();
      getGroupBets();
    } else {
      console.log("Not logged in");
    }
  });
  

async function getGroupBets() {
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
  await betsArray.forEach(async (betID) => {
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
                  ${option} | 1.5
                  <input class="enter-bet">
                  c
                  <button class="wager-button">
                  Wager
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

    // Real-time updates
    // db.collection('bets').onSnapshot(snapshot => {
    // });
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

async function setCurrentGroup(newGroup, groupID) {
    document.getElementById("current-group").innerHTML = newGroup;
    var docRef = db.collection("users").doc(currentUser.uid);
    await docRef.set({currentgroup: newGroup, currentgroupID: groupID},
        { merge: true });
    await getGroupBets();
}