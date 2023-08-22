
// Get a reference to the Firebase Auth service
const auth = firebase.auth();

var user = firebase.auth().currentUser;

if (user) {
  // User is signed in.
  console.log(user);
} else {
  // No user is signed in.
  console.log("not signed in");
}

// Function to register a new user with email and password
function registerUser() {
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // User registration successful
      const user = userCredential.user;
      console.log('User registered:', user);
    })
    .catch((error) => {
      console.error('Error during user registration:', error);
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
    });
}

function switchToSignIn() {
  document.getElementById("switch-label").innerHTML = "Or Sign Up:";
  document.getElementById("selected-tab").innerHTML = "Sign In";
  document.getElementById("sign-btn").innerHTML = "Sign Up";
  document.getElementById("sign-btn").setAttribute('onclick', "switchToSignUp()");
  document.getElementById("login-form").setAttribute('onsubmit', "loginUser();return false;");
}

function switchToSignUp() {
  document.getElementById("switch-label").innerHTML = "Or Sign In:";
  document.getElementById("selected-tab").innerHTML = "Sign Up";
  document.getElementById("sign-btn").innerHTML = "Sign In";
  document.getElementById("sign-btn").setAttribute('onclick', "switchToSignIn()");
  document.getElementById("login-form").setAttribute('onsubmit', "registerUser();return false;");
}