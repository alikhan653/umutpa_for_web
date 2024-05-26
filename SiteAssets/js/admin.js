const auth = firebase.auth();

auth.onAuthStateChanged(function (user) {
    if (user) {
        const patientForm = document.getElementById('patientForm');

        patientForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // Get form values
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const birth = document.getElementById('patientBirth').value;
            const age = document.getElementById('patientAge').value;
            const email = document.getElementById('patientEmail').value;
            const stage = document.getElementById('patientStage').value;
            const phone = document.getElementById('patientPhone').value;

            // Create a new patient object
            const newPatient = {
                name: `${firstName} ${lastName}`,
                birth: birth,
                age: age,
                stage: stage,
                email: email,
                phone: phone,
                role: 'patient' // Set role to patient
            };

            // Add the new patient to the common patients collection
            const patientsRef = firebase.database().ref('Users');
            patientsRef.push(newPatient)
                .then(function () {
                    // Reset form after successful submission
                    patientForm.reset();
                    alert('New patient added successfully!');
                })
                .catch(function (error) {
                    console.error('Error adding new patient: ', error);
                    alert('Error adding new patient. Please try again.');
                });
        });

        // Upload profile picture button listener
        document.getElementById('profilePicture').addEventListener('change', function(event) {
            const file = event.target.files[0];
            const storageRef = firebase.storage().ref('profile_pictures/' + user.uid + '/' + file.name);

            storageRef.put(file).then(function(snapshot) {
                snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    // Save the download URL to the database
                    firebase.database().ref('Users/' + user.uid + '/profilePicture').set(downloadURL);
                    alert('Profile picture uploaded successfully!');
                });
            }).catch(function(error) {
                alert('Error uploading profile picture: ' + error.message);
            });
        });
    } 
});
