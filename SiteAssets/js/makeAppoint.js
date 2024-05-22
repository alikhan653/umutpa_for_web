const auth = firebase.auth();

auth.onAuthStateChanged(function(user) {
    if (user) {
        fetchPatientsList(user); // Load patients list for the dropdown

        const appointmentForm = document.getElementById('appointmentForm');

        appointmentForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const patientSelect = document.getElementById('patient-select');
            const patientId = patientSelect.value;
            const name = patientSelect.options[patientSelect.selectedIndex].text;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const place = document.getElementById('place').value;
            const description = document.getElementById('description').value;
            const userId = user.uid;

            const newAppointment = {
                patientId: patientId,
                name: name,
                date: date,
                time: time,
                place: place,
                description: description
            };
            const newAppointment1 = {
                doctorId: userId,
                name: name,
                date: date,
                time: time,
                place: place,
                description: description
            };

            const appointmentsRef1 = firebase.database().ref('Users/' + patientId + '/Appointments');
            appointmentsRef1.push(newAppointment1)

            const appointmentsRef = firebase.database().ref('Doctors/' + userId + '/Appointments');
            appointmentsRef.push(newAppointment)
                .then(function() {
                    appointmentForm.reset();
                    alert('New appointment added successfully!');
                    window.location.href = 'appointments.html';
                })
                .catch(function(error) {
                    console.error('Error adding new appointment: ', error);
                    alert('Error adding new appointment. Please try again.');
                });

        });

        // Add event listener for patient select change
        document.getElementById('patient-select').addEventListener('change', function() {
            const selectedPatientId = this.value;
        });
    } else {
        console.log('User is not signed in.');
    }
});

function fetchPatientsList(user) {
    const patientsRef = firebase.database().ref('Doctors/' + user.uid + '/Patients');
    patientsRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const patientsSelect = document.getElementById('patient-select');

            patientsSelect.innerHTML = '';
            snapshot.forEach((patientSnapshot) => {
                const patientId = patientSnapshot.key;
                console.log("Patient ID:", patientId);
                const patientDataRef = firebase.database().ref('Users/' + patientId);

                patientDataRef.once('value').then((patientDataSnapshot) => {
                    if(patientDataSnapshot.exists()) {
                        const patientData = patientDataSnapshot.val();
                        console.log("Patient data:", patientData);
                        const patientName = patientData.name;
                        const option = document.createElement('option');
                        option.value = patientId;
                        option.textContent = patientName;
                        patientsSelect.appendChild(option);
                    }
                });
            });

        } else {
            console.log("No patients data available");
        }
    }).catch((error) => {
        console.log("Error fetching patients data:", error);
    });
}

// Validate form before submission
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('appointmentForm').addEventListener('submit', function(event) {
        const patientSelect = document.getElementById('patient-select').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const place = document.getElementById('place').value;
        const description = document.getElementById('description').value;
        
        if (patientSelect === '' || date === '' || time === '' || place === '' || description === '') {
            alert('Please fill out all fields');
            event.preventDefault(); // Prevent form submission
        }
    });
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
});
