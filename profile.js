// Get a reference to the Firebase Auth service
const auth = firebase.auth();
const db = firebase.firestore();

var currentUser;
const groups = document.getElementById("groups");
var credits = 0;

//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
  if(user) {
    currentUser = user;
    getCredits();
    userIsLoggedIn();
  } else {
    console.log("not signed in");
    window.location = "./login.html"
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

async function userIsLoggedIn() {
  document.getElementById("selected-tab").innerHTML = "Hello, " + currentUser.email.split("@")[0];
  // await db.collection("users").doc(currentUser.uid).set({
  //   username: currentUser.email.split("@")[0]
  // });
  getGroups();
}

function signOut() {
  auth.signOut().then(() => {
    // Sign-out successful.
    window.location = "./login.html";
  }).catch((error) => {
    // An error happened.
  });
}

async function createGroup() {
  var groupName = document.getElementById("group-input").value;
  if (groupName == "") return;
  const docRef = db.collection("groups").doc();
  const docId = docRef.id;
  const usersArray = [currentUser.uid];
  await docRef.set({
    groupname: groupName,
    users: usersArray,
    joinID: guidGenerator(),
    bets: []
  });
  var usersRef = db.collection("users").doc(currentUser.uid);
  await usersRef.update({
      groups: firebase.firestore.FieldValue.arrayUnion(docId)
  });
  document.getElementById("group-input").value = "";
  await getGroups();
}

async function joinGroup() {
  var joinID = document.getElementById("join-group-input").value;
  if (joinID == "") return;
  const groupRef = db.collection("groups").where("joinID", "==", joinID);
  var groupID;
  await groupRef.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      groupID = doc.id;
    });
    if (groupID == undefined) alert("Group does not exist");
  }).catch((error) => {
      console.log("Error getting document:", error);
  });
  if (groupID == undefined) return;
  var newGroupRef = db.collection("groups").doc(groupID);
  await newGroupRef.update({
    users: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
  });
  var usersRef = db.collection("users").doc(currentUser.uid);
  await usersRef.update({
      groups: firebase.firestore.FieldValue.arrayUnion(groupID)
  });
  document.getElementById("join-group-input").value = "";
  await getGroups();
}

function guidGenerator() {
  var S4 = function() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4());
}

async function getGroups() {
  var groupArray = [];
  var docRef = db.collection("users").doc(currentUser.uid);
  await docRef.get().then((doc) => {
    if (doc.exists) {
        groupArray = doc.data().groups;
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });

  groupArray.forEach(async (groupID) => {
    var docRef = db.collection('groups').doc(groupID);
    var groups = document.getElementById("groups");
    groups.innerHTML = '';
    await docRef.get().then((doc) => {
      if (doc.exists) {
          const data = doc.data();
          const groupElement = document.createElement('div');
          groupElement.classList.add("group");
          groupElement.innerHTML = `${data.groupname} | ID: ${data.joinID}`;
          groups.appendChild(groupElement);
      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
      }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
  })
}