const auth = firebase.auth();

auth.onAuthStateChanged(function(user) {
    
        // Check if the user is an admin
        firebase.database().ref('Users/' + user.uid).once('value').then(function(snapshot) {
            const userData = snapshot.val();
                const patientForm = document.getElementById('patientForm');

                patientForm.addEventListener('submit', function(event) {
                    event.preventDefault();

                    // Get form values
                    const name = document.getElementById('patientName').value;
                    const age = document.getElementById('patientAge').value;
                    const birth = document.getElementById('patientBirth').value;
                    const stage = document.getElementById('patientStage').value;
                    const email = document.getElementById('patientEmail').value;
                    const phone = document.getElementById('patientPhone').value;
                    const password = document.getElementById('patientPassword').value

                    // Create a new patient object
                    const newPatient = {
                        name: name,
                        birth: birth,
                        age: age,
                        stage: stage,
                        email: email,
                        phone: phone,
                        password: password,
                    };

                    // Add the new patient to the common patients collection
                    const patientsRef = firebase.database().ref('Users');
                    patientsRef.push(newPatient)
                        .then(function() {
                            // Reset form after successful submission
                            patientForm.reset();
                            alert('New patient added successfully!');
                        })
                        .catch(function(error) {
                            console.error('Error adding new patient: ', error);
                            alert('Error adding new patient. Please try again.');
                        });
                });
        });
});
