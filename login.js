
// Get a reference to the Firebase Auth service
const auth = firebase.auth();
const db = firebase.firestore();

var currentUser = null;
var action = "Logged In?";

//Handle Account Status
firebase.auth().onAuthStateChanged(async (_user) => {
  if(_user) {
    // console.log(_user);
    // user = _user;
    if (action == "Signing Up") {
      await db.collection("users").doc(_user.uid).set({
        username: _user.email.split("@")[0],
        credits: 1000
      });
    }
    window.location = './profile.html';
  } else {
    console.log("Not logged in");
    action = "Signing Up";
  }
});

// Function to register a new user with email and password
async function registerUser() {
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  await auth.createUserWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      // User registration successful
      const user = userCredential.user;
      currentUser = user;
      console.log('User registered:', user);
    })
    .catch((error) => {
      console.error('Error during user registration:', error);
      alert('Error during user registration: ' + error.message);
    });
}

// Function to authenticate an existing user with email and password
function loginUser() {
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // User authentication successful
      const user = userCredential.user;
      console.log('User authenticated:', user);
    })
    .catch((error) => {
      console.error('Error during user authentication:', error);
      alert('Error during user authentication: ' + error.message);
    });
}

function switchToSignIn() {
  action = "Signing In";
  document.getElementById("switch-label").innerHTML = "Or Sign Up:";
  document.getElementById("selected-tab").innerHTML = "Sign In";
  document.getElementById("sign-btn").innerHTML = "Sign Up";
  document.getElementById("sign-btn").setAttribute('onclick', "switchToSignUp()");
  document.getElementById("login-form").setAttribute('onsubmit', "loginUser();return false;");
}

function switchToSignUp() {
  action = "Signing Up";
  document.getElementById("switch-label").innerHTML = "Or Sign In:";
  document.getElementById("selected-tab").innerHTML = "Sign Up";
  document.getElementById("sign-btn").innerHTML = "Sign In";
  document.getElementById("sign-btn").setAttribute('onclick', "switchToSignIn()");
  document.getElementById("login-form").setAttribute('onsubmit', "registerUser();return false;");
}