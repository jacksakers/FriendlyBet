var testPrint = () => {
    console.log("TEST");
}

var submitNewBet = () => {
  // var formData = new FormData(document.querySelector('form'))
  var formData = {};
  var title = document.getElementById("title").value;
  // var betOptions = document.getElementById("title").value;
  console.log(title);
  return false;
}

// document.addEventListener('DOMContentLoaded', (event) => {
//   document.getElementById("new-bet-form").addEventListener("submit", function(e) {
//       e.preventDefault() // Cancel the default action
//       submitNewBet();
//   });
// });

