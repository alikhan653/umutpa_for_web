firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        $('#addDocForm').on('submit', function (event) {
            event.preventDefault();

            const email = $('#demail').val();
            const first_name = $('#fName').val();
            const last_name = $('#lName').val();
            const phone = $('#phone').val();
            const position = $('#position').val();
            const password = $('#password').val();

            const newDoctor = {
                email: email,
                first_name: first_name,
                last_name: last_name,
                phone: phone,
                position: position,
                role: 'Doctor', 
                imageUrl: ''
            };

            const doctorsRef = firebase.database().ref('Users').push(); // Use push() to create a unique key
            const newDoctorKey = doctorsRef.key; // Get the unique key

            doctorsRef.set(newDoctor)
                .then(() => {
                    // File upload
                    const file = $('#profilePicture')[0].files[0];
                    if (file) {
                        const storageRef = firebase.storage().ref('profile_pictures/' + newDoctorKey + '/' + file.name); // Use newDoctorKey to construct storage path
                        storageRef.put(file).then(function (snapshot) {
                            snapshot.ref.getDownloadURL().then(function (downloadURL) {
                                // Update doctor data with image URL
                                doctorsRef.update({ imageUrl: downloadURL })
                                    .then(function () {
                                        $('#addDocForm')[0].reset();
                                        alert('New doctor added successfully!');
                                        loadDoctors(); // Call loadDoctors() to refresh the doctors list
                                    });
                            });
                        }).catch((error) => {
                            console.error('Error uploading profile picture: ', error);
                            alert('Error uploading profile picture. Please try again.');
                        });
                    } else {
                        $('#addDocForm')[0].reset();
                        alert('New doctor added successfully!');
                        loadDoctors(); // Call loadDoctors() to refresh the doctors list
                    }
                })
                .catch((error) => {
                    console.error('Error saving doctor data: ', error);
                    alert('Error adding new doctor. Please try again.');
                });
        });
    }

    function loadDoctors() {
        const doctorsRef = firebase.database().ref('Users').orderByChild('role').equalTo('Doctor');
        doctorsRef.once('value').then(function (snapshot) {
            const doctors = snapshot.val();
            if (doctors) {
                const tableBody = $('.doctors-table-view tbody');

                tableBody.empty();

                $.each(doctors, function (key, doctor) {
                    const tableRow = `
                        <tr data-id="${key}">
                            <td>${doctor.email}</td>
                            <td>${doctor.first_name}</td>
                            <td>${doctor.last_name}</td>
                            <td>${doctor.phone}</td>
                            <td>${doctor.position}</td>
                            <td>
                                <button class="btn btn-info">View</button>
                                <button class="btn btn-danger delete-doctor">Delete</button>
                            </td>
                        </tr>
                    `;
                    tableBody.append(tableRow);
                });

                // Attach event listeners for delete buttons
                $('.delete-doctor').on('click', handleDeleteDoctor);
            }
        });
    }

    // Function to handle deleting a doctor
    function handleDeleteDoctor() {
        const doctorId = $(this).closest('tr').data('id');
        const doctorRef = firebase.database().ref('Users/' + doctorId);

        if (confirm('Are you sure you want to delete this doctor?')) {
            doctorRef.remove()
                .then(() => {
                    alert('Doctor deleted successfully.');
                    loadDoctors();
                })
                .catch((error) => {
                    console.error('Error deleting doctor: ', error);
                    alert('Error deleting doctor. Please try again.');
                });
        }
    }

    loadDoctors();
});
