$(() => {
    $('#card-view-btn').on('click', function () {
        $('.patients-card-view').removeClass('no-display');
        $('.patients-table-view').addClass('no-display');
    });

    $('#table-view-btn').on('click', function () {
        $('.patients-table-view').removeClass('no-display');
        $('.patients-card-view').addClass('no-display');
    });

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
                } else {
                    console.log("No data available for the specified user ID");
                }
            }).catch((error) => {
                console.log("Error fetching user data:", error);
            });
        }
    });

    function fetchPatientsData(user) {
        const patientsRef = firebase.database().ref('Doctors/' + user.uid + '/Patients');
        patientsRef.once('value').then((snapshot) => {
            if (snapshot.exists()) {
                const patients = snapshot.val();
                const cardViewContainer = document.querySelector('.patients-card-view .row');
                const tableViewBody = document.querySelector('.patients-table-view tbody');

                cardViewContainer.innerHTML = '';
                tableViewBody.innerHTML = '';

                for (const patientId in patients) {
                    if (patients.hasOwnProperty(patientId)) {
                        const patient = patients[patientId];
                        const patientCard = createPatientCard(patient, patientId);
                        const patientRow = createPatientTableRow(patient, patientId);

                        cardViewContainer.appendChild(patientCard);
                        tableViewBody.appendChild(patientRow);
                    }
                }
            } else {
                console.log("No patients data available");
            }
        }).catch((error) => {
            console.log("Error fetching patients data:", error);
        });
    }

    function createPatientCard(patient, patientId) {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        if(patient.imageUrl == null){
            patient.imageUrl = "../SiteAssets/images/people.svg";
        }
        card.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div class="card-img-top"><img class="rounded-circle" src="${patient.imageUrl}" loading="lazy" /><a class="view-more" href="details.html?patientId=${patientId}">view profile</a></div>
            </div>
            <div class="card-body">
                <div class="card-subsection-title">
                    <h5>${patient.name}</h5>
                </div>
                <div class="card-subsection-body">
                    <label class="text-muted">age</label>
                    <p>${patient.age}</p>
                    <label class="text-muted">date of birth</label>
                    <p>${patient.birth}</p>
                    <label class="text-muted">stage</label>
                    <p>${patient.stage}</p>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-danger delete-patient-btn" data-patient-id="${patientId}"><i class="las la-minus"></i></button>
            </div>
        </div>
        `;

        return card;
    }

    function createPatientTableRow(patient, patientId) {
        const row = document.createElement('tr');
        if(patient.imageUrl == null){
            patient.imageUrl = "../SiteAssets/images/people.svg";
        }
        row.innerHTML = `
        <td><img class="rounded-circle" src="${patient.imageUrl}" loading="lazy" /><span class="ml-2">${patient.name}</span></td>
        <td>${patient.age}</td>
        <td>${patient.birth}</td>
        <td>${patient.stage}</td>
        <td><a class="view-more btn btn-sm btn-dark-blue" href="details.html?patientId=${patientId}">view profile</a></td>
        <td><button class="btn btn-danger delete-patient-btn" data-patient-id="${patientId}"><i class="las la-minus"></i></button></td>
        `;

        return row;
    }

    // Function to delete a patient
    $(document).on('click', '.delete-patient-btn', function() {
        var patientId = $(this).attr('data-patient-id');
        if (confirm('Are you sure you want to delete this patient?')) {
            deletePatient(patientId);
        }
    });

    function deletePatient(patientId) {
        const user = auth.currentUser;
        if (user) {
            const doctorId = user.uid;
            const patientRef = firebase.database().ref('Doctors/' + doctorId + '/Patients/' + patientId);

            // Remove the patient from the doctor's list and the database
            patientRef.remove().then(function() {
                alert('Patient deleted successfully.');
                // Optionally, remove the patient element from the DOM
                $(`.delete-patient-btn[data-patient-id="${patientId}"]`).closest('.card').remove();
                window.location.reload();
            }).catch(function(error) {
                alert('Error deleting patient: ' + error.message);
            });
        } else {
            console.log('No user is signed in.');
        }
    }
});
