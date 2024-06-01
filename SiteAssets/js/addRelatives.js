firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Load patients into the select element
        loadPatients();

        $('#addRelativeForm').on('submit', function(event) {
            event.preventDefault();

            const firstName = $('#rFirstName').val();
            const lastName = $('#rLastName').val();
            const phone = $('#rPhone').val();
            const relationship = $('#rRelationship').val();
            const patientId = $('#patientSelect').val(); // Get the selected patient ID

            // Save relative data in Firebase database
            const newRelative = {
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                relationship: relationship,
                role: 'relative',
                patientId: patientId // Add patientId to relative data
            };

            const relativesRef = firebase.database().ref('Users/');
            relativesRef.push(newRelative)
                .then(() => {
                    $('#addRelativeForm')[0].reset();
                    alert('New relative added successfully!');
                    loadRelatives(); // Call loadRelatives() to refresh the relatives list
                })
                .catch((error) => {
                    console.error('Error saving relative data: ', error);
                    alert('Error adding new relative. Please try again.');
                });
        });
    }
});

function loadPatients() {
    const patientsRef = firebase.database().ref('Users').orderByChild('role').equalTo('patient');
    patientsRef.once('value').then(function(snapshot) {
        const patients = snapshot.val();
        if (patients) {
            const patientSelect = $('#patientSelect');
            patientSelect.empty();
            $.each(patients, function(key, patient) {
                const option = `<option value="${key}">${patient.name}</option>`;
                patientSelect.append(option);
            });
        }
    }).catch((error) => {
        console.error('Error loading patients: ', error);
    });
}

function loadRelatives() {
    const relativesRef = firebase.database().ref('Users').orderByChild('role').equalTo('relative');
    relativesRef.once('value').then(function(snapshot) {
        const relatives = snapshot.val();
        if (relatives) {
            const tableBody = $('.relatives-table-view tbody');
            tableBody.empty();

            const patientsRef = firebase.database().ref('Users').orderByChild('role').equalTo('patient');
            patientsRef.once('value').then(function(patientsSnapshot) {
                const patients = patientsSnapshot.val();

                $.each(relatives, function(key, relative) {
                    const patientName = patients[relative.patientId] ? patients[relative.patientId].name : 'Unknown';
                    const tableRow = `
                        <tr data-id="${key}">
                            <td>${patientName}</td>
                            <td>${relative.firstName}</td>
                            <td>${relative.lastName}</td>
                            <td>${relative.phone}</td>
                            <td>${relative.relationship}</td>
                            <td>
                                <button class="btn btn-info">View</button>
                                <button class="btn btn-danger delete-relative">Delete</button>
                            </td>
                        </tr>
                    `;
                    tableBody.append(tableRow);
                });

                // Attach event listeners for delete buttons
                $('.delete-relative').on('click', function() {
                    const relativeId = $(this).closest('tr').data('id');
                    const relative = relatives[relativeId];
                    deleteRelative(relative.patientId, relativeId);
                });
            }).catch((error) => {
                console.error('Error loading patients: ', error);
            });
        } else {
            const tableBody = $('.relatives-table-view tbody');
            tableBody.empty();
            tableBody.append('<tr><td colspan="7">No relatives found.</td></tr>');
        }
    }).catch((error) => {
        console.error('Error loading relatives: ', error);
    });
}

function deleteRelative(patientId, relativeId) {
    const relativeRef = firebase.database().ref('Users/'+relativeId);
    relativeRef.remove()
        .then(() => {
            alert('Relative deleted successfully!');
            loadRelatives();
        })
        .catch((error) => {
            console.error('Error deleting relative: ', error);
            alert('Error deleting relative. Please try again.');
        });
}

// Initial call to load relatives
loadRelatives();
