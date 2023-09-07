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
    if (currentUser.uid == "SqymHXTOofddIpM8AmUDRZQg2jT2") {
      document.getElementById("admin-tools").innerHTML = `<button onclick="populateBets()">Populate</button>
                                                            <input type="file" id="file-selector">`
    }
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
  document.getElementById("credits").innerHTML = credits.toFixed(2) + " c";
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


// ADMIN CODE BELOW ----------------------------------------------------------------------------------------


function CSVToArray( strData, strDelimiter ){
  strDelimiter = (strDelimiter || ",");
  var objPattern = new RegExp(
      (
          "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
          "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
          "([^\"\\" + strDelimiter + "\\r\\n]*))"
      ),
      "gi"
      );
  var arrData = [[]];
  var arrMatches = null;
  while (arrMatches = objPattern.exec( strData )){
      var strMatchedDelimiter = arrMatches[ 1 ];
      if (
          strMatchedDelimiter.length &&
          strMatchedDelimiter !== strDelimiter
          ){
          arrData.push( [] );
      }
      var strMatchedValue;
      if (arrMatches[ 2 ]){
          strMatchedValue = arrMatches[ 2 ].replace(
              new RegExp( "\"\"", "g" ),
              "\""
              );
      } else {
          strMatchedValue = arrMatches[ 3 ];
      }
      arrData[ arrData.length - 1 ].push( strMatchedValue );
  }
  return( arrData );
}

async function populateBets() {
  const fileInput = document.getElementById('file-selector');

  if (fileInput.files.length === 0) {
      console.log("No file selected.");
      return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function(event) {
      const fileContent = event.target.result;
      var fullCSVArray = CSVToArray(fileContent);
      // console.log(fullCSVArray);
      fullCSVArray.forEach(async (csvArray) => {
        await createNFLBet(csvArray);
      });
      // for (var i = 0; i < 10; ++i) {
      //   await createNFLBet(fullCSVArray[i]);
      // }
  };

  reader.readAsText(file);
}

var readDate = "";
var readTime = "";
var readTeam1 = "";
var readTeam2 = "";

async function createNFLBet(csvArray) {
  var docRef = null;

  var datum = csvArray[2];

  if (/^[A-Za-z]+, [A-Za-z]+ \d{1,2}, \d{4}$/.test(datum)) {
    // console.log("Date Format"); // Matches "Thursday, September 7, 2023" format
    readDate = datum;
    return;
  } else if (/^[A-Za-z]{2,3}$/.test(datum)) {
    // console.log("Abbreviation"); // Matches "DET" format
    if (readTeam1 == "") {
      readTeam1 = datum;
      return;
    } else {
      readTeam2 = datum;
      return;
    }
  } else if (/^\d{1,2}:\d{2} [APap][Mm]$/.test(datum)) {
    // console.log("Time Format"); // Matches "8:20 PM" format
    readTime = datum;
  } else {
    // console.log("Unknown"); // Doesn't match any of the specified formats
    return;
  }

  var title = readTeam1 + " vs. " + readTeam2;

  // get options
  var optionArray = [readTeam1 + " | 0 | 0 ", readTeam2 + " | 0 | 0 "];
  var optionsWagerArray = [" -:- ", " -:- "];

  // time limit?
  const timeLimit = true;
  var date = parseDateString(readDate);
  var time = parseTimeString(readTime);

  // family?
  var betFamily = "Sports";

  // add group to bet
  var docId = null;
  if (readTime != "") {
    readTeam1 = "";
    readTeam2 = "";
    readTime = "";

    docRef = db.collection('bets').doc();
    docId = docRef.id;
    await docRef.set({
        title: title,
        options: optionArray,
        optionswagerarray: optionsWagerArray,
        pool: 0,
        groupID: "4ZkJ5O7oa2i0YgfTAIYy",
        family: betFamily,
        timelimit: timeLimit,
        date: date,
        time: time
    });

    // add betID to group
    docRef = db.collection("groups").doc("4ZkJ5O7oa2i0YgfTAIYy");
    await docRef.update({
        bets: firebase.firestore.FieldValue.arrayUnion(docId)
    });

    // add betID to users created bets
    var usersRef = db.collection("users").doc(currentUser.uid);
    await usersRef.update({
        bets: firebase.firestore.FieldValue.arrayUnion(docId)
    });
    console.log("posted bet");
  }
}

function parseDateString(input) {
  // Create a Date object from the input string
  const date = new Date(input);

  // Check if the Date object is valid
  if (isNaN(date)) {
    return "Invalid Date";
  }

  // Get the year, month, and day from the Date object
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");

  // Format the result as "YYYY-MM-DD"
  const result = `${year}-${month}-${day}`;

  return result;
}

function parseTimeString(input) {
  // Create a Date object with today's date and the input time
  const date = new Date();
  const timeRegex = /^(\d{1,2}):(\d{2})\s+(AM|PM)$/i;
  const match = input.match(timeRegex);

  if (!match) {
    return "Invalid Time Format";
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3].toLowerCase();

  if (ampm === "pm" && hours < 12) {
    hours += 12;
  } else if (ampm === "am" && hours === 12) {
    hours = 0;
  }

  // Format the result as "HH:MM"
  const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}`;

  return formattedTime;
}