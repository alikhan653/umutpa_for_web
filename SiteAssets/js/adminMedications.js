$(document).ready(function () {
    const db = firebase.database();
    const storage = firebase.storage();

    // Handle form submission
    $('#adminMedicationForm').on('submit', function (e) {
        e.preventDefault();

        const medicationName = $('#medicationName').val().trim();
        const medicationDescription = $('#medicationDescription').val().trim();
        const file = $('#medicationImage').prop('files')[0];
        const medicationId = $('#adminMedicationForm').data('editing-id');

        if (!medicationName || !medicationDescription) {
            alert('Please fill out all fields.');
            return;
        }

        if (medicationId) {
            // If medicationId exists, update the medication
            updateMedication(medicationId, medicationName, medicationDescription, file);
        } else {
            // Otherwise, add a new medication
            addMedication(medicationName, medicationDescription, file);
        }
    });

    function addMedication(name, description, file) {
        const newMedication = {
            name: name,
            description: description,
            imageUrl: ''
        };

        const medicationsRef = db.ref('Medications');
        const newMedicationRef = medicationsRef.push();
        newMedicationRef.set(newMedication)
            .then(() => {
                if (file) {
                    const storageRef = storage.ref('medication_images/' + newMedicationRef.key + '/' + file.name);
                    storageRef.put(file).then(snapshot => {
                        return snapshot.ref.getDownloadURL();
                    }).then(downloadURL => {
                        newMedicationRef.update({ imageUrl: downloadURL })
                            .then(() => {
                                resetForm();
                                alert('Medication added successfully!');
                                loadMedications();
                            });
                    }).catch(error => {
                        console.error('Error uploading image: ', error);
                        alert('Error uploading image. Please try again.');
                    });
                } else {
                    resetForm();
                    alert('Medication added successfully!');
                    loadMedications();
                }
            })
            .catch(error => {
                console.error('Error adding medication: ', error);
                alert('Error adding medication. Please try again.');
            });
    }

    function updateMedication(id, name, description, file) {
        const medicationRef = db.ref('Medications/' + id);

        const updatedMedication = {
            name: name,
            description: description
        };

        medicationRef.update(updatedMedication)
            .then(() => {
                if (file) {
                    const storageRef = storage.ref('medication_images/' + id + '/' + file.name);
                    return storageRef.put(file).then(snapshot => {
                        return snapshot.ref.getDownloadURL();
                    }).then(downloadURL => {
                        return medicationRef.update({ imageUrl: downloadURL });
                    });
                }
            })
            .then(() => {
                resetForm();
                alert('Medication updated successfully!');
                loadMedications();
            })
            .catch(error => {
                console.error('Error updating medication: ', error);
                alert('Error updating medication. Please try again.');
            });
    }

    function loadMedications() {
        const medicationsRef = db.ref('Medications');
        medicationsRef.once('value', snapshot => {
            const medicationsList = $('#medicationsList');
            medicationsList.empty();
            snapshot.forEach(childSnapshot => {
                const medication = childSnapshot.val();
                const medicationRow = `
                    <tr>
                        <td><img src="${medication.imageUrl}" alt="${medication.name}" width="100"></td>
                        <td>${medication.name}</td>
                        <td>${medication.description}</td>
                        <td>
                            <button class="btn btn-success btn-sm edit-medication" data-id="${childSnapshot.key}">Edit</button>
                            <button class="btn btn-danger btn-sm delete-medication" data-id="${childSnapshot.key}">Delete</button>
                        </td>
                    </tr>
                `;
                medicationsList.append(medicationRow);
            });

            $('.edit-medication').on('click', handleEditMedication);
            $('.delete-medication').on('click', handleDeleteMedication);
        });
    }

    function handleEditMedication() {
        const medicationId = $(this).data('id');
        const medicationRef = db.ref('Medications/' + medicationId);

        medicationRef.once('value', snapshot => {
            const medication = snapshot.val();
            $('#medicationName').val(medication.name);
            $('#medicationDescription').val(medication.description);
            $('#adminMedicationForm').data('editing-id', medicationId);
        });
    }

    function handleDeleteMedication() {
        const medicationId = $(this).data('id');
        const medicationRef = db.ref('Medications/' + medicationId);

        if (confirm('Are you sure you want to delete this medication?')) {
            medicationRef.remove()
                .then(() => {
                    alert('Medication deleted successfully.');
                    loadMedications();
                })
                .catch(error => {
                    console.error('Error deleting medication: ', error);
                    alert('Error deleting medication. Please try again.');
                });
        }
    }

    function resetForm() {
        $('#adminMedicationForm')[0].reset();
        $('#adminMedicationForm').removeData('editing-id');
    }

    loadMedications();
});
