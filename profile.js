// Get a reference to the Firebase Auth service
const auth = firebase.auth();
const db = firebase.firestore();

var currentUser;
const groups = document.getElementById("groups");

//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
  if(user) {
    currentUser = user;
    // console.log(currentUser);
    // window.location = './profile.html';
    userIsLoggedIn();
  } else {
    console.log("not signed in");
    window.location = "./login.html"
  }
});

async function userIsLoggedIn() {
  document.getElementById("selected-tab").innerHTML = "Hello, " + currentUser.email.split("@")[0];
  // await db.collection("users").doc(currentUser.uid).set({
  //   username: currentUser.email.split("@")[0]
  // });
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
  const docRef = db.collection("groups").doc();
  const docId = docRef.id;
  await docRef.set({
    groupname: groupName
  });
  var usersRef = db.collection("users").doc(currentUser.uid);
  await usersRef.update({
      groups: firebase.firestore.FieldValue.arrayUnion(docId)
  });
  document.getElementById("group-input").value = "";
}

db.collection('groups').onSnapshot(snapshot => {
  groups.innerHTML = '';
  snapshot.forEach(doc => {
      const data = doc.data();
      const group = document.createElement('div');
      group.classList.add('group');
      group.innerHTML = `${data.groupname}`;
      groups.appendChild(group);
  });
});