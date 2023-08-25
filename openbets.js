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

  betsArray.forEach(async (betID) => {
    var docRef = db.collection('bets').doc(betID);
    var betList = document.getElementById("bet-list");
    betList.innerHTML = '';
    await docRef.get().then((doc) => {
      if (doc.exists) {
          // console.log("Document data:", doc.data());
          const data = doc.data();
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
            // betElement.innerHTML = `<strong>${data.description}</strong> - $${data.amount}`;
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
    // Real-time updates
    // db.collection('bets').onSnapshot(snapshot => {
    //     betList.innerHTML = '';
    //     snapshot.forEach(doc => {
    //         const data = doc.data();
    //         const betElement = document.createElement('div');
    //         betElement.classList.add('item');
    //         const betOptions = data.options;
    //         var betOptionsDivs = ``;
    //         betOptions.forEach((option) => {
    //             betOptionsDivs += `<div class="bet-option">
    //                 ${option} | 1.5
    //                 <input class="enter-bet">
    //                 c
    //                 <button class="wager-button">
    //                 Wager
    //                 </button>
    //                 </div>`;
    //         });
    //         // betElement.innerHTML = `<strong>${data.description}</strong> - $${data.amount}`;
    //         betElement.innerHTML = `<div class="bet-name">
    //             ${data.title}</div>` + betOptionsDivs;
    //         betList.appendChild(betElement);
    //     });
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