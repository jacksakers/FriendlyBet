const db = firebase.firestore();

var currentUser = null;
var currentGroup = null;

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
    const option1 = document.getElementById('bet-option1').value;
    const option2 = document.getElementById('bet-option2').value;

    const optionArray = [option1, option2];

    // add group to bet
    
    var docId = null;
    if (title && option1 && option2) {
        docRef = db.collection('bets').doc();
        docId = docRef.id;
        await docRef.set({
            title: title,
            options: optionArray,
            groupID: currentGroup
        });

        document.getElementById('title').value = '';
        document.getElementById('bet-option1').value = '';
        document.getElementById('bet-option2').value = '';
    }

    // add betID to group
    docRef = db.collection("groups").doc(currentGroup);
    await docRef.update({
        bets: firebase.firestore.FieldValue.arrayUnion(docId)
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