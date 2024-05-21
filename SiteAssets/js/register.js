
function registration() {
  console.log('Attempting to register user ...')
  var user_email = document.getElementById("email-signup").value;
  var first_name = document.getElementById("fname-signup").value;
  var last_name = document.getElementById("lname-signup").value;
  var number = document.getElementById("number-signup").value;
  var position = document.getElementById("position-signup").value;
  var user_password = document.getElementById("password-signup").value;
  var confirm_password = document.getElementById("confirm-password-signup").value;
  if (user_password !== confirm_password) {
    errorNotification("Passwords do not match!")
  } else {
    const auth = firebase.auth();
    const promise = auth.createUserWithEmailAndPassword(user_email, user_password);

    promise.then((userCredential) => {
      var user = userCredential.user;

      // Prepare additional data
      var currentDate = new Date();
      var year = currentDate.getFullYear();
      var month = String(currentDate.getMonth() + 1).padStart(2, '0');
      var day = String(currentDate.getDate()).padStart(2, '0');
      var dob = `${year}/${month}/${day}`;
      var role = "Doctor";

      var additionalData = {
        dob: dob,
        email: user_email,
        first_name: first_name,
        last_name: last_name,
        number: number,
        position: position,
        role: role,
        imageUrl: "gs://umutpa-7caa0.appspot.com/ESbg4CXjMsQNdwzhXybiKeSKv2u2/profile.png"//TODO: Add default image
      };

      var doctorData = {
        email: user_email,
        first_name: first_name,
        last_name: last_name,
      };

      firebase.database().ref('Users/' + user.uid).set(additionalData)
          .then(() => {
            console.log('User data saved successfully.');
            sendVerificationEmail(user); // Send email verification
          })
          .catch((error) => {
            console.error('Error saving user data:', error);
            errorNotification(error.message);
          });

      firebase.database().ref('Doctors/' + user.uid).set(doctorData)
          .then(() => {
            console.log('Doctor data saved successfully.');
          })
          .catch((error) => {
            console.error('Error saving doctor data:', error);
          });

      document.getElementById("login-div").style.display = "none";
      document.getElementById("registration-div").style.display = "none";
      document.getElementById("send-verification-div").style.display = "block";
    }).catch((err) => {
      errorNotification(err.message);
    });
  }
}
