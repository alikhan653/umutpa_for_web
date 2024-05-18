/**
 * @file logout.js
 * @author Sanjay Sunil
 * @license MIT
 */

function logout() {
  firebase.auth().signOut();
  successNotification("Successfully logged out!")
  document.getElementById("login-div").style.display = "block";
  document.getElementById("registration-div").style.display = "none";
  document.getElementById("send-verification-div").style.display = "none";
}