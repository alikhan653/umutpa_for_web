var database = firebase.database();

// Function to load profile data
function loadProfile() {
    var user = auth.currentUser;
    if (user) {
        var userId = user.uid;
        database.ref('Users/' + userId).once('value').then(function(snapshot) {
            var data = snapshot.val();
            console.log(data);
            document.querySelector('input[name="firstName"]').value = data.first_name;
            document.querySelector('input[name="email"]').value = data.email;

            if (data.profilePicture) {
                document.querySelector('.profile-picture-img').src = data.profilePicture;
            }
        });
        database.ref('Users/' + userId).once('value').then(function(snapshot) {
            var data = snapshot.val();
            console.log(data);

            if (data.imageUrl) {
                document.querySelector('.profile-picture-img').src = data.imageUrl;
            }
        });
    } else {
        console.log('No user is signed in.');
    }
}

// Function to change password
function changePassword() {
    var user = auth.currentUser;
    var currentPassword = document.querySelector('input[name="currentPassword"]').value;
    var newPassword = document.querySelector('input[name="newPassword"]').value;
    var retypeNewPassword = document.querySelector('input[name="retypeNewPassword"]').value;

    if (newPassword !== retypeNewPassword) {
        alert('New passwords do not match.');
        return;
    }

    var credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    user.reauthenticateWithCredential(credential).then(function() {
        user.updatePassword(newPassword).then(function() {
            alert('Password changed successfully.');
        }).catch(function(error) {
            alert('Error changing password: ' + error.message);
        });
    }).catch(function(error) {
        alert('Error reauthenticating: ' + error.message);
    });
}

// Load profile on page load
document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            loadProfile();
        } else {
            console.log('No user is signed in.');
            // Redirect to login page if needed
        }
    });

    // Change password button listener
    document.querySelector('.change-password-btn').addEventListener('click', function() {
        changePassword();
    });

    // Upload profile picture button listener
    document.querySelector('.upload-profile-pic').addEventListener('click', function() {
        document.querySelector('.profile-picture-input').click();
    });

    document.querySelector('.profile-picture-input').addEventListener('change', function(event) {
        var file = event.target.files[0];
        var user = auth.currentUser;
        var storageRef = firebase.storage().ref('profile_pictures/' + user.uid + '/' + file.name);
        storageRef.put(file).then(function(snapshot) {
            snapshot.ref.getDownloadURL().then(function(downloadURL) {
                // Update the image source on the page
                document.querySelector('.profile-picture-img').src = downloadURL;

                // Save the download URL to the database
                database.ref('Users/' + user.uid + '/profilePicture').set(downloadURL);
            });
        }).catch(function(error) {
            alert('Error uploading profile picture: ' + error.message);
        });
    });
});