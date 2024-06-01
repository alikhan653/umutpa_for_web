$(() => {
    $('#card-view-btn').on('click', function () {
        $('.patients-card-view').removeClass('no-display');
        $('.patients-table-view').addClass('no-display');
    });

    $('#table-view-btn').on('click', function () {
        $('.patients-table-view').removeClass('no-display');
        $('.patients-card-view').addClass('no-display');
    });

    $('#toggleAddPatient').on('click', function () {
        $('#addPatientForm').toggle();
        const icon = $('#toggleAddPatientIcon');
        if ($('#addPatientForm').is(':visible')) {
            icon.removeClass('la-chevron-down').addClass('la-chevron-up');
        } else {
            icon.removeClass('la-chevron-up').addClass('la-chevron-down');
        }
    });

    const auth = firebase.auth();


    $('#patientForm').on('submit', function (event) {
        event.preventDefault();

        const firstName = $('#firstName').val();
        const lastName = $('#lastName').val();
        const birth = $('#patientBirth').val();
        const age = $('#patientAge').val();
        const email = $('#patientEmail').val();
        const stage = $('#patientStage').val();
        const phone = $('#patientPhone').val();
        const city = $('#patientCity').val();
        const address = $('#patientAddress').val();

        const newPatient = {
            name: `${firstName} ${lastName}`,
            birth: birth,
            age: age,
            stage: stage,
            email: email,
            phone: phone,
            role: 'patient',
            city: city,
            address: address,
            imageUrl: ''
        };

        const patientsRef = firebase.database().ref('Users');
        const newPatientRef = patientsRef.push();
        newPatientRef.set(newPatient)
            .then(function () {
                const file = $('#profilePicture')[0].files[0];
                if (file) {
                    const storageRef = firebase.storage().ref('profile_pictures/' + newPatientRef.key + '/' + file.name);
                    storageRef.put(file).then(function (snapshot) {
                        snapshot.ref.getDownloadURL().then(function (downloadURL) {
                            newPatientRef.update({ imageUrl: downloadURL })
                                .then(function () {
                                    $('#patientForm')[0].reset();
                                    alert('New patient added successfully!');
                                    loadPatients(); // Refresh the patient list
                                });
                        });
                    }).catch(function (error) {
                        alert('Error uploading profile picture: ' + error.message);
                    });
                } else {
                    $('#patientForm')[0].reset();
                    alert('New patient added successfully!');
                    loadPatients(); // Refresh the patient list
                }
            })
            .catch(function (error) {
                console.error('Error adding new patient: ', error);
                alert('Error adding new patient. Please try again.');
            });
    });

    function loadPatients() {
        const patientsRef = firebase.database().ref('Users').orderByChild('role').equalTo('patient');
        patientsRef.once('value').then(function (snapshot) {
            const patients = snapshot.val();
            if (patients) {
                const tableBody = $('.patients-table-view tbody');

                tableBody.empty();

                $.each(patients, function (key, patient) {
                    const tableRow = `
                        <tr data-id="${key}">
                            <td>${patient.name}</td>
                            <td>${patient.age}</td>
                            <td>${patient.birth}</td>
                            <td>${patient.stage}</td>
                            <td>${patient.city}</td>
                            <td>${patient.address}</td>
                            <td>
                                <button class="btn btn-info">View</button>
                                <button class="btn btn-danger delete-patient">Delete</button>
                            </td>
                        </tr>
                    `;
                    tableBody.append(tableRow);
                });

                // Attach event listeners for delete buttons
                $('.delete-patient').on('click', handleDeletePatient);
            }
        });
    }

    // Function to handle deleting a patient
    function handleDeletePatient() {
        const patientId = $(this).closest('tr').data('id');
        const patientRef = firebase.database().ref('Users/' + patientId);

        if (confirm('Are you sure you want to delete this patient?')) {
            patientRef.remove()
                .then(() => {
                    alert('Patient deleted successfully.');
                    loadPatients();
                })
                .catch((error) => {
                    console.error('Error deleting patient: ', error);
                    alert('Error deleting patient. Please try again.');
                });
        }
    }

    // Initial load
    loadPatients();
});
