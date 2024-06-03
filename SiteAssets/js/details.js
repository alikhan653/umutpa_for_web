
console.log(auth.currentUser);
auth.onAuthStateChanged(function (user) {
	if (user) {
		var email_id = user.email;
		var userId = user.uid;
		const patientId = getUrlParameter('patientId');
		fetchPatientsData(patientId);
		fetchUpcomingAppointments(patientId, userId);
		displayPatientMedications(patientId, userId);

		var dbRef = firebase.database().ref('Users/' + userId);

		dbRef.once('value').then((snapshot) => {
			if (snapshot.exists()) {
				var userData = snapshot.val();
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
			document.querySelector('.mini-card .card-header img').src = patient.imageUrl || 'https://placebeard.it/640x360';
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

function fetchUpcomingAppointments(patientId) {
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
				const appointmentHTML = createAppointmentHTML(appointment);
				upcomingAppointmentsDiv.insertAdjacentHTML('beforeend', appointmentHTML);
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
	doctorDataRef.once('value').then((snapshot) => {
		const doctorData = snapshot.val();
		console.log('Doctor Data: ', doctorData.first_name);
		return doctorData.first_name;
	}).catch((error) => {
		console.error('Error fetching doctor data:', error);
		throw error;
	});
}
function createAppointmentHTML(appointment) {
	const user = firebase.auth().currentUser;

	const doctorDataRef = firebase.database().ref('Users/' + appointment.doctorId);

	// Generate the HTML with a placeholder for the doctor name
	const appointmentHTML = `
        <div class="media">
            <div class="align-self-center mr-3">
                <p>${getDayOfWeek(appointment.date)}</p>
                <h3>${getDayOfMonth(appointment.date)}</h3>
                <p>${getYear(appointment.date)}</p>
            </div>
            <div class="media-body">
                <div class="row">
                    <label class="label-green-bl">${appointment.description}</label>
                    <p>with Dr. <span id="doctor-name-${appointment.doctorId}">Loading...</span></p>
                    <p><i class="las la-tv"></i>on ${appointment.place}</p>
                    <p><i class="las la-clock"></i>${appointment.time} - ${addMinutesToTime(appointment.time, 30)}</p>
                    <label class="label-cream label-sm">
                        <i class="las la-hourglass-half"></i>30 min
                    </label>
                    <a href=""><i class="las la-ellipsis-v"></i></a>
                </div>
            </div>
        </div>
    `;

	document.getElementById('upcoming-appointments').innerHTML += appointmentHTML;

	// Fetch the doctor data and update the doctor name span
	doctorDataRef.once('value').then((snapshot) => {
		const doctorData = snapshot.val();
		const doctorNameSpan = document.getElementById(`doctor-name-${appointment.doctorId}`);
		if (doctorNameSpan) {
			doctorNameSpan.textContent = doctorData.first_name;
		}
	}).catch((error) => {
		console.error('Error fetching doctor data:', error);
		const doctorNameSpan = document.getElementById(`doctor-name-${appointment.doctorId}`);
		if (doctorNameSpan) {
			doctorNameSpan.textContent = 'Unknown';
		}
	});
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
	const duration = (endTime - startTime) / (1000 * 60); // Convert milliseconds to minutes
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