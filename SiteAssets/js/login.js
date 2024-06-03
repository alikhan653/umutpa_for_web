function login() {
    console.log('Attempting to login user ...')
    var userEmail = document.getElementById("email").value;
    var userPass = document.getElementById("password").value;
    const auth = firebase.auth();

    const promise = auth.signInWithEmailAndPassword(userEmail, userPass);
    promise.then((userCredential) => {
        var user = userCredential.user;

        if (user.emailVerified) {
            console.log('Email is verified.');
            // Retrieve user data from the Realtime Database
            var userId = user.uid;
            var userRef = firebase.database().ref('Users/' + userId);

            userRef.once('value').then((snapshot) => {
                var userData = snapshot.val();
                console.log('User Data:', userData);

                if (userData.role === 'Admin') {
                    window.location.href = "addPat.html";
                } else {
                    window.location.href = "dashboard.html";
                }
            }).catch((error) => {
                console.error('Error fetching user data:', error);
                errorNotification('Failed to retrieve user data. Please try again.');
            });
        } else {
            console.log('Email is not verified.');
            errorNotification('Email is not verified. Please verify your email address.');
            firebase.auth().signOut();

        }
    })
    promise.catch((err) => {
        handleFirebaseAuthError(err);
    });
}

function handleFirebaseAuthError(error) {
    let message;
    switch (error.message) {
        case '{"error":{"code":400,"message":"INVALID_LOGIN_CREDENTIALS","errors":[{"message":"INVALID_LOGIN_CREDENTIALS","domain":"global","reason":"invalid"}]}}':
            message = 'The password is invalid or the user does not have a password.';
            break;
        case 'auth/user-disabled':
            message = 'The user account has been disabled by an administrator.';
            break;
        case 'auth/user-not-found':
            message = 'There is no user record corresponding to this identifier. The user may have been deleted.';
            break;
        case 'auth/wrong-password':
            message = 'The password is invalid or the user does not have a password.';
            break;
        default:
            message = error.message;
    }
    errorNotification(message);
}