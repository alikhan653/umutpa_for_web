firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var email_id = user.email;
        var email_verified = user.emailVerified;

            console.log("User is logged in.");
            successNotification("Welcome, " + email_id + "!");
            window.location.href = "dashboard.html";
            document.getElementById("usernamePlaceholder").innerHTML = email_id;

    } else {
        console.log("You are currently not logged in to any account.");
        document.getElementById("login-div").style.display = "block";
        document.getElementById("registration-div").style.display = "none";
        document.getElementById("send-verification-div").style.display = "none";
    }
});