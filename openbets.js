const db = firebase.firestore();

const betList = document.getElementById('bet-list');
var currentUser = null;

//Handle Account Status
firebase.auth().onAuthStateChanged(async (_user) => {
    if(_user) {
      currentUser = _user;
      getGroups();
    } else {
      console.log("Not logged in");
    }
  });
  

async function getGroupBets() {
    // Real-time updates
    db.collection('bets').onSnapshot(snapshot => {
        betList.innerHTML = '';
        snapshot.forEach(doc => {
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
        });
    });
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
          groupDDElement.setAttribute('href', "#");
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
