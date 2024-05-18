/**
 * @file register.js
 * @author Sanjay Sunil
 * @license MIT
 */

function registration() {
  console.log('Attempting to register user ...')
  var user_email = document.getElementById("email-signup").value;
  var user_password = document.getElementById("password-signup").value;
  var confirm_password = document.getElementById("confirm-password-signup").value;
  if (user_password !== confirm_password) {
    errorNotification("Passwords do not match!")
  } else {
    const auth = firebase.auth();
    const promise = auth.createUserWithEmailAndPassword(user_email, user_password);
    document.getElementById("login-div").style.display = "none";
    document.getElementById("registration-div").style.display = "none";
    document.getElementById("send-verification-div").style.display =
        "block";
    promise.catch((err) => errorNotification(err.message))
  }
}
