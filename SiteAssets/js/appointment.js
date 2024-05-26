const auth = firebase.auth();

auth.onAuthStateChanged(function (user) {
    if (user) {
        var email_id = user.email;
        var userId = user.uid;

        console.log(user.uid);
        var dbRef = firebase.database().ref('Users/' + userId);

        dbRef.once('value').then((snapshot) => {
            if (snapshot.exists()) {
                var userData = snapshot.val();
                var userName = userData.name;
                console.log("User's name is: " + userName);

                const divName = document.getElementById("div-name");
                const usernamePlaceholder = document.getElementById("usernamePlaceholder");

                if (divName) {
                    divName.innerText = userName.split(" ")[0];
                }

                if (usernamePlaceholder) {
                    usernamePlaceholder.innerHTML = email_id;
                }

                fetchPatientsData(user);
                fetchPatientsList(user); // Fetch the list of patients for the dropdown
            } else {
                console.log("No data available for the specified user ID");
            }
        }).catch((error) => {
            console.log("Error fetching user data:", error);
        });
    } 
});

function fetchPatientsData(user) {
    const appointmentsRef = firebase.database().ref('Doctors/' + user.uid + '/Appointments');
    appointmentsRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const appointments = snapshot.val();
            
            // Convert object to array for sorting
            const appointmentsArray = Object.entries(appointments).map(([key, value]) => ({ id: key, ...value }));
            
            // Sort appointments by date and time
            appointmentsArray.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

            const tableViewBody = document.querySelector('#appoint-app');

            tableViewBody.innerHTML = '';

            for (const appointment of appointmentsArray) {
                const appointmentRow = createAppointmentTableRow(appointment);

                tableViewBody.appendChild(appointmentRow);
            }
        } else {
            console.log("No appointments data available");
        }
    }).catch((error) => {
        console.log("Error fetching appointments data:", error);
    });
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
        <td>${appointment.stage}</td>
        <td>${appointment.place}</td>
        <td>${appointment.description}</td>
        <td><a class="view-more btn btn-sm btn-dark-red-f" href="details.html?patientId=${appointment.patientId}">view profile</a></td>
        <button class="delete-appointment btn btn-sm btn-danger" data-appointment-id="${appointment.id}">Delete Appointment</button>
    `;

    return appointmentRow;
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-appointment')) {
        const appointmentId = event.target.getAttribute('data-appointment-id');
        deleteAppointment(appointmentId);
        location.reload();
    }
});

function deleteAppointment(appointmentId) {
    const user = firebase.auth().currentUser;
    if (user) {
        const appointmentsRef = firebase.database().ref('Doctors/' + user.uid + '/Appointments/' + appointmentId);
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