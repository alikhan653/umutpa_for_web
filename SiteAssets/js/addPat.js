let allPatients = {};
let doctorPatients = {}; // Добавляем переменную для хранения пациентов доктора

auth.onAuthStateChanged(function(user) {
    if (user) {
        loadCommonPatients(user);

        document.getElementById('patientsList').addEventListener('click', function(event) {
            if (event.target.classList.contains('add-patient-btn')) {
                const patientId = event.target.getAttribute('data-patient-id');
                addPatientToDoctor(user, patientId);
            }
        });

        document.getElementById('searchInput').addEventListener('input', function(event) {
            const searchTerm = event.target.value.toLowerCase();
            filterPatientsList(searchTerm);
        });
    } else {
        window.location.href = 'login.html';
    }
});

function loadCommonPatients(user) {
    const usersRef = firebase.database().ref('Users');
    const doctorPatientsRef = firebase.database().ref('Doctors/' + user.uid + '/Patients');

    doctorPatientsRef.once('value').then(function(doctorSnapshot) {
        doctorPatients = doctorSnapshot.val() || {};

        usersRef.once('value').then(function(usersSnapshot) {
            if (usersSnapshot.exists()) {
                allPatients = usersSnapshot.val();
                renderPatientsList();
            } else {
                console.log("No users data available");
            }
        }).catch(function(error) {
            console.log("Error fetching users data:", error);
        });
    }).catch(function(error) {
        console.log("Error fetching doctor's patients data:", error);
    });
}

function createPatientTableRow(patient, patientId) {
    const row = document.createElement('tr');
    row.classList.add('patient-row');

    row.innerHTML = `
        <td><img class="rounded-circle" src="../SiteAssets/images/people.svg" loading="lazy" /><span class="ml-2">${patient.name}</span></td>
        <td>${patient.age}</td>
        <td>${patient.birth}</td>
        <td>${patient.stage}</td>
        <td><button class="btn btn-primary add-patient-btn" data-patient-id="${patientId}">Add</button></td>
    `;

    return row;
}

function addPatientToDoctor(user, patientId) {
    const doctorPatientsRef = firebase.database().ref('Doctors/' + user.uid + '/Patients');

    firebase.database().ref('Users/' + patientId).once('value').then(function(snapshot) {
        const patientData = snapshot.val();
        if (patientData) {
            doctorPatientsRef.child(patientId).set(patientData)
                .then(function() {
                    alert('Patient added to your list successfully!');
                    delete allPatients[patientId]; // Удаляем пациента из общего списка
                    renderPatientsList(); // Обновляем список пациентов
                })
                .catch(function(error) {
                    console.error('Error adding patient to your list: ', error);
                });
        } else {
            alert('Error fetching patient data.');
        }
    });
}

function filterPatientsList(searchTerm) {
    const patientsList = document.getElementById('patientsList');
    patientsList.innerHTML = '';

    for (const userId in allPatients) {
        if (allPatients.hasOwnProperty(userId)) {
            const patient = allPatients[userId];
            if (patient.role === 'patient' && !doctorPatients.hasOwnProperty(userId) && patient.name.toLowerCase().includes(searchTerm)) {
                const row = createPatientTableRow(patient, userId);
                patientsList.appendChild(row);
            }
        }
    }
}

function renderPatientsList() {
    const patientsList = document.getElementById('patientsList');
    patientsList.innerHTML = '';

    for (const userId in allPatients) {
        if (allPatients.hasOwnProperty(userId)) {
            const patient = allPatients[userId];
            if (patient.role === 'patient' && !doctorPatients.hasOwnProperty(userId)) {
                const row = createPatientTableRow(patient, userId);
                patientsList.appendChild(row);
            }
        }
    }
}

function errorNotification(message) {
    alert(message);
}

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.log('Error during logout: ', error);
    });
}
