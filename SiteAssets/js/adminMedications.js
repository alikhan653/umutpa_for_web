document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();

    auth.onAuthStateChanged(function(user) {
        if (user) {
            loadMedications();

            const medicationForm = document.getElementById('adminMedicationForm');
            medicationForm.addEventListener('submit', function(event) {
                event.preventDefault();

                const medicationName = document.getElementById('medicationName').value;
                const medicationDescription = document.getElementById('medicationDescription').value;
                const medicationsRef = firebase.database().ref('Medications');

                const newMedRef = medicationsRef.push();
                newMedRef.set({
                    name: medicationName,
                    description: medicationDescription
                }).then(function() {
                    alert('Medication added successfully!');
                    loadMedications();
                }).catch(function(error) {
                    console.error('Error adding medication: ', error);
                });
            });
        }
    });

    function loadMedications() {
        const medicationsRef = firebase.database().ref('Medications');
        medicationsRef.once('value').then(function(snapshot) {
            const medicationList = document.getElementById('medicationsList');
            medicationList.innerHTML = '';

            snapshot.forEach(function(childSnapshot) {
                const medication = childSnapshot.val();
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${medication.name}</td>
                    <td>${medication.description}</td>
                    <td>
                        <button class="btn btn-primary btn-sm edit-btn" data-id="${childSnapshot.key}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${childSnapshot.key}">Delete</button>
                    </td>
                `;

                medicationList.appendChild(row);
            });

            // Attach event listeners for edit and delete buttons
            document.querySelectorAll('.edit-btn').forEach(function(button) {
                button.addEventListener('click', function() {
                    const medicationId = this.getAttribute('data-id');
                    // Add code to handle editing medication
                });
            });

            document.querySelectorAll('.delete-btn').forEach(function(button) {
                button.addEventListener('click', function() {
                    const medicationId = this.getAttribute('data-id');
                    medicationsRef.child(medicationId).remove()
                        .then(function() {
                            alert('Medication deleted successfully!');
                            loadMedications();
                        })
                        .catch(function(error) {
                            console.error('Error deleting medication: ', error);
                        });
                });
            });
        }).catch(function(error) {
            console.error('Error loading medications: ', error);
        });
    }
});
