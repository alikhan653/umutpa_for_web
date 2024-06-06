
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

            const userName = document.getElementById('usernamePlaceholder').textContent;

            const user = firebase.auth().currentUser;
            if (!user) {
                alert('User not authenticated. Please log in.');
                return;
            }

            const userId = user.uid;

            // Reference to the patient's appointments
            const appointmentsRef = firebase.database().ref('Users/' + patientId + '/Appointments');
            // Generate a new unique key for the appointment
            const newAppointmentRef = appointmentsRef.push();
            const appointmentId = newAppointmentRef.key;

            const newAppointment = {
                appointmentId: appointmentId,
                doctorId: userId,
                doctorName: userName,
                patientId: patientId,
                name: name,
                date: date,
                time: time,
                place: place,
                description: description
            };

            // Save the new appointment using the generated ID
            newAppointmentRef.set(newAppointment)
                .then(function() {
                    appointmentForm.reset();
                    alert('New appointment added successfully!');
                    window.location.href = 'appointments.html';
                })
                .catch(function(error) {
                    console.error('Error adding new appointment: ', error);
                    alert('Error adding new appointment. Please try again.');
                });

            // Save the new appointment under the doctor's appointments as well
            const doctorAppointmentsRef = firebase.database().ref('Users/' + userId + '/Appointments/' + appointmentId);
            doctorAppointmentsRef.set(newAppointment)
                .catch(function(error) {
                    console.error('Error adding appointment to doctors record: ', error);
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
            const patients = snapshot.val();
            const patientsSelect = document.getElementById('patient-select');

            patientsSelect.innerHTML = '';

            for (const patientId in patients) {
                if (patients.hasOwnProperty(patientId)) {
                    const patient = patients[patientId];
                    const option = document.createElement('option');
                    option.value = patientId;
                    option.textContent = patient.name;
                    option.setAttribute('data-stage', patient.stage || 'first');
                    patientsSelect.appendChild(option);
                }
            }
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
            event.preventDefault();
        }
    });
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
});
