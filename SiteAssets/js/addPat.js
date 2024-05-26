const auth = firebase.auth();

auth.onAuthStateChanged(function(user) {
    if (user) {
        loadCommonPatients(user);

        const doctorPatientForm = document.getElementById('doctorPatientForm');

        doctorPatientForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const patientSelect = document.getElementById('commonPatients'); // ID остается тот же
            const patientId = patientSelect.value;
            const patientName = patientSelect.options[patientSelect.selectedIndex].text;

            const userId = user.uid;
            const doctorPatientsRef = firebase.database().ref('Doctors/' + userId + '/Patients');

            firebase.database().ref('Patients/' + patientId).once('value').then(function(patSnapshot) {
                const patData = patSnapshot.val();
                if (patData && patData.doctorId !== userId) {
                    // Пациент уже добавлен к другому доктору, удаляем из списка
                    patientSelect.removeChild(patientSelect.options[patientSelect.selectedIndex]);
                    alert('This patient is already added to another doctor. Removed from the list.');
                } else {
                    firebase.database().ref('Users/' + patientId).once('value').then(function(snapshot) {
                        const patientData = snapshot.val();
                        if (patientData) {
                            doctorPatientsRef.child(patientId).set(patientData)
                                .then(function() {
                                    alert('Patient added to your list successfully!');
                                    window.location.href = 'patients.html';
                                })
                                .catch(function(error) {
                                    console.error('Error adding patient to your list: ', error);
                                });
                        } else {
                            alert('Error fetching patient data.');
                        }
                    });
                }
            });
        });
    }
});

function loadCommonPatients(user) {
    const usersRef = firebase.database().ref('Users');
    usersRef.once('value').then(function(snapshot) {
        if (snapshot.exists()) {
            const users = snapshot.val();
            const commonPatientsSelect = document.getElementById('commonPatients'); // ID остается тот же

            commonPatientsSelect.innerHTML = '';

            for (const userId in users) {
                if (users.hasOwnProperty(userId)) {
                    const user = users[userId];
                    if (user.role === 'patient') {
                        const option = document.createElement('option');
                        option.value = userId;
                        option.textContent = user.name;
                        commonPatientsSelect.appendChild(option);
                    }
                }
            }
        } else {
            console.log("No users data available");
        }
    }).catch(function(error) {
        console.log("Error fetching users data:", error);
    });
}
