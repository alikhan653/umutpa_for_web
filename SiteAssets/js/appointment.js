
auth.onAuthStateChanged(function (user) {
    if (user) {
        var email_id = user.email;
        var userId = user.uid;

        console.log(user.uid);
        var doctorRef = firebase.database().ref('Doctors/' + userId + '/Patients');

        doctorRef.once('value').then((doctorSnapshot) => {
            doctorSnapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                console.log("ChildKey "+childKey);

                var dbRef = firebase.database().ref('Users/' + childKey + "/Appointments");

                dbRef.once('value').then((snapshot) => {
                    if (snapshot.exists()) {
                        var userData = snapshot.val();
                        var userName = userData.name;
                        console.log("User's name is: " + userName);

                        fetchPatientsData(userData);
                        fetchPatientsList(userData);
                    } else {
                        console.log("No data available for the specified user ID");
                    }
                }).catch((error) => {
                    console.log("Error fetching user data:", error);
                });
            });
        });
    } 
});

function fetchPatientsData(appointments) {

    const appointmentsArray = Object.entries(appointments).map(([key, value]) => ({ id: key, ...value }));

    // Sort appointments by date and time
    appointmentsArray.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

    const tableViewBody = document.querySelector('#appoint-app');

    tableViewBody.innerHTML = '';

    for (const appointment of appointmentsArray) {
        const appointmentRow = createAppointmentTableRow(appointment);

        tableViewBody.appendChild(appointmentRow);
    }
}

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

function createAppointmentTableRow(appointment) {
    const appointmentRow = document.createElement('tr');

    appointmentRow.innerHTML = `
        <td>${appointment.name}</td>
        <td>${appointment.date}</td>
        <td>${appointment.time}</td>
        <td>${appointment.place}</td>
        <td>${appointment.description}</td>
        <td><a class="view-more btn btn-sm btn-dark-f" href="details.html?patientId=${appointment.patientId}">view profile</a></td>
        <button class="delete-appointment btn btn-sm btn-secondary" data-appointment-id="${appointment.id}" data-patient-id="${appointment.patientId}">Delete Appointment</button>
    `;

    return appointmentRow;
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-appointment')) {
        console.log('Delete appointment button clicked!' + event.target.getAttribute('data-appointment-id') + ' ' + event.target.getAttribute('data-patient-id'));
        const appointmentId = event.target.getAttribute('data-appointment-id');
        const patientId = event.target.getAttribute('data-patient-id');
        deleteAppointment(appointmentId, patientId);
        location.reload();
    }
});

function deleteAppointment(appointmentId, patientId) {
    const user = firebase.auth().currentUser;
    if (user) {
        const appointmentsRef = firebase.database().ref('Users/' + patientId + '/Appointments/' + appointmentId);
        appointmentsRef.remove()
            .then(function() {
                console.log('Appointment deleted successfully!');
                fetchPatientsData(user);
            })
            .catch(function(error) {
                console.error('Error deleting appointment: ', error);
            });
    } else {
        console.error('User not authenticated!');
    }
}