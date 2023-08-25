// const auth = firebase.auth();
// const db = firebase.firestore();

// const currentUser = null;

// //Handle Account Status
// firebase.auth().onAuthStateChanged(async (_user) => {
//   if(_user) {
//     currentUser = _user;
//     getGroups();
//   } else {
//     console.log("Not logged in");
//   }
// });

// async function getGroups() {
//   var groupArray = [];
//   var docRef = db.collection("users").doc(currentUser.uid);
//   docRef.get().then((doc) => {
//     if (doc.exists) {
//         // console.log("Document data:", doc.data());
//         groupArray = doc.data().groups;
//     } else {
//         // doc.data() will be undefined in this case
//         console.log("No such document!");
//     }
//   }).catch((error) => {
//       console.log("Error getting document:", error);
//   });

//   groupArray.forEach((groupID) => {
//     var docRef = db.collection('groups').doc(groupID);
//     var groupDropdown = document.getElementById("group-dropdown");
//     groupDropdown.innerHTML = '';
//     docRef.get().then((doc) => {
//       if (doc.exists) {
//           // console.log("Document data:", doc.data());
//           const data = doc.data();
//           const groupDDElement = document.createElement('a');
//           groupDDElement.setAttribute('href', "#");
//           groupDDElement.innerHTML = `${data.groupname}`;
//           groupDropdown.appendChild(groupDDElement);
//       } else {
//           // doc.data() will be undefined in this case
//           console.log("No such document!");
//       }
//     }).catch((error) => {
//         console.log("Error getting document:", error);
//     });
//   })

//   // db.collection('groups').onSnapshot(snapshot => {
//   //   document.getElementById("group-dropdown").innerHTML = '';
//   //   snapshot.forEach(doc => {
//   //       const data = doc.data();
//   //       const group = document.createElement('a');
//   //       group.setAttribute('href', "#");
//   //       group.innerHTML = `${data.groupname}`;
//   //       groups.appendChild(group);
//   //   });
//   // });
// }

