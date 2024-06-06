
console.log(auth.currentUser);
auth.onAuthStateChanged(function (user) {
	if (user) {
		var email_id = user.email;
		var userId = user.uid;
		const patientId = getUrlParameter('patientId');
		fetchPatientsData(patientId);
		displayPatientMedications(patientId, userId);


		var dbRef = firebase.database().ref('Users/' + userId);

		dbRef.once('value').then((snapshot) => {
			if (snapshot.exists()) {
				var userData = snapshot.val();
				var doctorName = userData.first_name;
				fetchUpcomingAppointments(patientId, userId, doctorName);
				if(document.getElementById("namePlaceholder"))
					document.getElementById("namePlaceholder").innerHTML =  doctorName;

				document.getElementById("usernamePlaceholder").innerHTML = email_id;
			} else {
				console.log("No data available for the specified user ID");
			}
		}).catch((error) => {
			console.error("Error fetching data: ", error);
		});
		document.getElementById("usernamePlaceholder").innerHTML =  email_id;
	} else {
		window.location.href = "login.html";
	}
});

function setPatientData(user) {
	var patientsRef = firebase.database().ref('Doctors/' + user.uid + '/Patients');
	patientsRef.once('value', function(snapshot) {
		var count = snapshot.numChildren();
		console.log('Number of patients:', count);
		document.getElementById('patientCount').innerText = count;
	});
	var doctorRef = firebase.database().ref('Doctors');
	doctorRef.once('value', function(snapshot) {
		var doctorData = snapshot.val()
		console.log(doctorData)
	});
}

function fetchPatientsData(patientId) {
	const patientDataRef = firebase.database().ref('Users/' + patientId);

	patientDataRef.once('value').then((patientDataSnapshot) => {
		const patient = patientDataSnapshot.val();

		if (patient) {
			// Update the HTML with the patient data
			console.log(patient.dob)
			document.querySelector('.mini-card .card-header img').src = patient.imageUrl || '';
			document.querySelector('.mini-card .card-body h4').textContent = patient.name || 'N/A';
			document.querySelector('.breadcrumb-item.active ').textContent = patient.name || 'N/A';
			document.querySelector('.mini-card .card-body small').textContent = patient.email || 'N/A';
			document.querySelector('.mini-card .card-body h5').textContent = 'Age';
			document.querySelector('.mini-card .card-body p').textContent = patient.age || 'N/A';
			document.querySelector('.patients-details-card-wrapper .form-group #patient-dob').value = patient.birth || 'N/A';
			document.querySelector('.patients-details-card-wrapper .form-group #patient-number').value = patient.phone || 'N/A';
			document.querySelector('.patients-details-card-wrapper .form-group #patient-address').value = patient.address || 'N/A';
			document.querySelector('.patients-details-card-wrapper .form-group #patient-city').value = patient.city || 'N/A';
		} else {
			console.error('No patient data available');
			errorNotification('No patient data available');
		}
	}).catch((error) => {
		console.error('Error fetching patient data:', error);
		errorNotification('Error fetching patient data: ' + error.message);
	});
}

function getUrlParameter(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	const results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function fetchUpcomingAppointments(patientId, userId, doctorName) {
	const appointmentsRef = firebase.database().ref('Users/' + patientId + '/Appointments');

	appointmentsRef.once('value').then((snapshot) => {
		const appointments = snapshot.val();
		const upcomingAppointmentsDiv = document.getElementById('upcoming-appointments');

		upcomingAppointmentsDiv.innerHTML = `
            <div class="section-title">
                <button class="btn btn-dark-red-f btn-sm" onclick="location.href='makeAppoint.html'">
                    <i class="las la-calendar-plus"></i>create an appointment
                </button>
            </div>
        `;

		if (appointments) {
			Object.keys(appointments).forEach(key => {
				const appointment = appointments[key];
				const appointmentHTML = createAppointmentHTML(appointment, doctorName, key);
				upcomingAppointmentsDiv.insertAdjacentHTML('beforeend', appointmentHTML);
				fetchAndRenderFiles(userId, key);
			});
		} else {
			upcomingAppointmentsDiv.insertAdjacentHTML('beforeend', '<p>No upcoming appointments</p>');
		}
	}).catch((error) => {
		console.error('Error fetching appointments:', error);
	});
}
function getDoctorName(doctorId) {
	console.log('Doctor ID:', doctorId);
	const doctorDataRef = firebase.database().ref('Users/' + doctorId);
	console.log('Doctor Data Ref:', doctorDataRef);
	doctorDataRef.once('value').then((snapshot) => {
		const doctorData = snapshot.val();
		console.log('Doctor Data:', doctorData.first_name);
		return doctorData.first_name;
	}).catch((error) => {
		console.error('Error fetching doctor data:', error);
		throw error;
	});
}// Function to create HTML for an appointment
function createAppointmentHTML(appointment, doctorName, appointmentId) {
	const user = firebase.auth().currentUser;
	return `
        <div class="media">
            <div class="align-self-center mr-3">
                <p>${getDayOfWeek(appointment.date)}</p>
                <h3>${getDayOfMonth(appointment.date)}</h3>
                <p>${getYear(appointment.date)}</p>
            </div>
            <div class="media-body">
                <div class="row">
                    <label class="label-green-bl">${appointment.description}</label>
                    <p>with Dr. ${doctorName}</p>
                    <p><i class="las la-tv"></i>on ${appointment.place}</p>
                    <p><i class="las la-clock"></i>${appointment.time} - ${addMinutesToTime(appointment.time, 30)}</p>
                    <label class="label-cream label-sm">
                        <i class="las la-hourglass-half"></i>30 min
                    </label>
                    <a href=""><i class="las la-ellipsis-v"></i></a>
                    <button class="btn btn-dark-red-f btn-sm" data-toggle="modal" data-target="#addRecordModal" data-appointment-id="${appointmentId}"><i class="las la-plus"></i>Add Medical Record</button>
                </div>
            </div>
        </div>
    `;
}


function getDayOfWeek(dateString) {
	const date = new Date(dateString);
	return date.toLocaleString('en-US', { weekday: 'short' });
}
function addMinutesToTime(time, minutesToAdd) {
	const [hours, minutes] = time.split(':').map(Number);

	const date = new Date();
	date.setHours(hours);
	date.setMinutes(minutes);

	date.setMinutes(date.getMinutes() + minutesToAdd);

	const newHours = date.getHours();
	const newMinutes = date.getMinutes();

	const formattedTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;

	return formattedTime;
}
function getDayOfMonth(dateString) {
	const date = new Date(dateString);
	return date.getDate();
}

function getYear(dateString) {
	const date = new Date(dateString);
	return date.getFullYear();
}

function getDuration(timeString) {
	const times = timeString.split(' - ');
	const startTime = new Date(`1970-01-01T${times[0]}:00`);
	const endTime = new Date(`1970-01-01T${times[1]}:00`);
	const duration = (endTime - startTime) / (1000 * 60);
	return duration;
}

function fetchPatientMedications(patientId) {
	const medicationsRef = firebase.database().ref('Users/' + patientId + '/Medications');

	return medicationsRef.once('value').then((snapshot) => {
		const medications = snapshot.val();
		if (medications) {
			return medications;
		} else {
			throw new Error('No medications found for this patient.');
		}
	}).catch((error) => {
		console.error('Error fetching medications:', error);
		throw error;
	});
}

function createMedicationHTML(medication) {
	return `
		<div class="media">
            <div class="align-self-center mr-3">
                <img class="rounded-circle medication-img" src="${medication.imageUrl}" loading="lazy" />
            </div>
            <div class="media-body">
                <div class="row">
                    <label class="label-blue-bl">${medication.name}</label>
                    <p>${medication.description}</p>
                    <p><i class="las la-clock"></i>${medication.medtime}</p>
                    <p><i class="las la-notes-medical"></i>${medication.dosage}</p>
                   
                    <a href=""><i class="las la-ellipsis-v"></i></a>
                </div>
            </div>
        </div>
        
    `;
}

function displayPatientMedications(patientId, userId) {
	try {
		const medicationsRef = firebase.database().ref('Doctors/' + userId + '/Patients/' + patientId + '/Prescriptions');

		medicationsRef.once('value').then((snapshot) => {
			var medications = snapshot.val();
			if (medications) {
				const container = document.getElementById("medications");
				const medicationsRef = firebase.database().ref('Medications/' + medications.medicationId);
				medicationsRef.once('value').then((snapshot) => {
					const medication = snapshot.val();
					const medicationHTML = createMedicationHTML(medication);
					container.insertAdjacentHTML('beforeend', medicationHTML);
				}).catch((error) => {
					console.error('Error fetching medications:', error);
					throw error;
				});
				container.innerHTML = `
            		<div class="section-title">
                		<button onclick="location.href='medicaments.html'" class="btn btn-dark-red-f btn-sm">
                    	<i class="las la-calendar-plus"></i>Add a medication
                		</button>
            		</div>
        		`;
				Object.keys(medications).forEach(key => {
					console.log('Key:', key);
					const medication = medications[key];
					const medicationHTML = createMedicationHTML(medication);
					container.insertAdjacentHTML('beforeend', medicationHTML);
				});
			} else {
				throw new Error('No medications found for this patient.');
			}
		}).catch((error) => {
			console.error('Error fetching medications:', error);
			throw error;
		});

	} catch (error) {
		const container = document.getElementById("medications");
		container.innerHTML = `<p>Error loading medications: ${error.message}</p>`;
	}

}
// Function to format file size
function formatFileSize(bytes) {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0) return '0 Byte';
	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

// Function to create HTML for a file
function createFileHTML(fileName, fileSize, fileURL, fileId, appointmentId, userId) {
	return `
        <a class="list-group-item" href="${fileURL}" target="_blank">
            <i class="las la-file"></i>${fileName}
            <div class="float-right">
                <small class="text-muted">${formatFileSize(fileSize)}</small>
                <div class="action-buttons no-display">
                    <button class="btn btn-sm btn-dark-red-f delete-file" onclick="deleteFile(${userId}, ${appointmentId}, ${fileId}, ${fileURL})"
                     data-file-id="${fileId}" data-file-url="${fileURL}">
                        <i class="las la-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-dark-red-f download-file" data-file-url="${fileURL}">
                        <i class="las la-download"></i>
                    </button>
                </div>
            </div>
        </a>
    `;
}

// Function to fetch files from Firebase and render them
function fetchAndRenderFiles(userId, appointmentId) {
	console.log('Fetching files for Appointment ID:', appointmentId + ' and User ID:', userId);
	const recordRef = firebase.database().ref('Users/' + userId + '/Appointments/' + appointmentId + '/Records');

	// Fetch records from Firebase
	recordRef.once('value', function(snapshot) {
		const filesList = document.getElementById('filesList');
		if (!filesList) {
			console.error('filesList element not found');
			return;
		}

		snapshot.forEach(function(childSnapshot) {
			const record = childSnapshot.val();
			const fileId = childSnapshot.key;
			if (record.fileURL) {
				const fileName = record.fileName || 'Unknown';
				const fileSize = record.fileSize || 0;
				const fileURL = record.fileURL;

				const fileHTML = createFileHTML(fileName, fileSize, fileURL, fileId, appointmentId, userId);
				console.log('File HTML:', fileHTML);
				filesList.insertAdjacentHTML('beforeend', fileHTML);
			}
		});
	});
}

// Ensure the DOM is fully loaded before executing fetchAndRenderFiles
document.addEventListener('DOMContentLoaded', function() {
	auth.onAuthStateChanged(function (user) {
		if (user) {
			var userId = user.uid;
			const patientId = getUrlParameter('patientId');
			fetchPatientsData(patientId);
			displayPatientMedications(patientId, userId);

			var dbRef = firebase.database().ref('Users/' + userId);

			dbRef.once('value').then((snapshot) => {
				if (snapshot.exists()) {
					var userData = snapshot.val();
					var doctorName = userData.first_name;
					fetchUpcomingAppointments(patientId, userId, doctorName);
					if(document.getElementById("namePlaceholder"))
						document.getElementById("namePlaceholder").innerHTML =  doctorName;

					document.getElementById("usernamePlaceholder").innerHTML = user.email;
				} else {
					console.log("No data available for the specified user ID");
				}
			}).catch((error) => {
				console.error("Error fetching data: ", error);
			});
			document.getElementById("usernamePlaceholder").innerHTML =  user.email;
		} else {
			window.location.href = "login.html";
		}
	});

	$(document).on('click', '.btn[data-toggle="modal"][data-target="#addRecordModal"]', function() {
		var appointmentId = $(this).data('appointment-id');
		console.log('Button clicked, Appointment ID:', appointmentId);
		$('#addRecordModal').attr('data-appointment-id', appointmentId);
	});

	$(document).on('click', '#submitRecord', function(event) {
		event.preventDefault(); // Prevent any default action

		// Get the form values
		var recordDate = document.getElementById('recordDate').value;
		var recordDescription = document.getElementById('recordDescription').value;
		console.log('Record Date:', recordDate);
		var recordFile = document.getElementById('recordFile').files[0];
		var recordFileName = recordFile.name;
		var recordFileSize = recordFile.size;
		console.log('Record File:', recordFile.name);
		console.log('Record File Size:', recordFile.size);

		var user = firebase.auth().currentUser;

		if (user) {
			var userId = user.uid;

			var appointmentId = document.querySelector('#addRecordModal').getAttribute('data-appointment-id');
			console.log('Submitting record for Appointment ID:', appointmentId);

			var recordRef1 = firebase.database().ref('Users/' + userId + '/Appointments/' + appointmentId + '/Records');
			var recordRef2 = firebase.database().ref('Users/' + getUrlParameter('patientId') + '/Appointments/' + appointmentId + '/Records');

			var newRecord = {
				appointmentId: appointmentId,
				date: recordDate,
				description: recordDescription,
				fileName: recordFileName,
				fileSize: recordFileSize
			};

			function pushRecordData(recordData) {
				recordRef1.push(recordData);
				recordRef2.push(recordData)
					.then(function() {
						console.log('Medical record added successfully!');
						document.getElementById('recordDate').value = '';
						document.getElementById('recordDescription').value = '';
						document.getElementById('recordFile').value = '';
					})
					.catch(function(error) {
						console.error('Error adding medical record:', error);
					});
			}

			if (recordFile) {
				var storageRef = firebase.storage().ref('Users/' + userId + '/Appointments/' + appointmentId + '/Records/' + recordFile.name);

				var uploadTask = storageRef.put(recordFile);

				uploadTask.on('state_changed',
					function(snapshot) {
						// Observe state change events such as progress, pause, and resume
					},
					function(error) {
						console.error('Error uploading file:', error);
					},
					function() {
						uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
							newRecord.fileURL = downloadURL;

							pushRecordData(newRecord);
						});
					}
				);
			} else {
				pushRecordData(newRecord);
			}
		} else {
			console.log('User is not signed in');
			// Handle the case where the user is not signed in
		}
	});
});

function deleteFile(userId, appointmentId, fileId, fileURL) {
	// Create reference to the file in Firebase Storage
	const storageRef = firebase.storage().refFromURL(fileURL);

	// Delete the file from Firebase Storage
	storageRef.delete().then(() => {
		console.log('File deleted from storage successfully');

		// Delete the file metadata from Firebase Realtime Database
		const fileRef1 = firebase.database().ref('Users/' + userId + '/Appointments/' + appointmentId + '/Records/' + fileId);
		const fileRef2 = firebase.database().ref('Users/' + getUrlParameter('patientId') + '/Appointments/' + appointmentId + '/Records/' + fileId);

		fileRef1.remove().then(() => {
			console.log('File metadata deleted from database successfully');
			document.getElementById('file-' + fileId).remove();
		}).catch((error) => {
			console.error('Error deleting file metadata from database:', error);
		});

		fileRef2.remove().then(() => {
			console.log('File metadata deleted from database successfully');
		}).catch((error) => {
			console.error('Error deleting file metadata from database:', error);
		});
	}).catch((error) => {
		console.error('Error deleting file from storage:', error);
	});
}

