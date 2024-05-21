
const auth = firebase.auth();
console.log(auth.currentUser);
auth.onAuthStateChanged(function (user) {
	if (user) {
		var email_id = user.email;
		var userId = user.uid;
		fetchPatientsData(user);
		setPatientData(user);

		console.log(user.uid);
		var dbRef = firebase.database().ref('Users/' + userId);

		dbRef.once('value').then((snapshot) => {
			if (snapshot.exists()) {
				var userData = snapshot.val();
				var userName = userData.name;
				console.log("User's name is: " + userName);
				document.getElementById("div-name").innerText = userName.split(" ")[0];
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
function addPatientRow(patient) {
	const tableBody = document.getElementById('patients-table-body');
	const row = document.createElement('tr');

	row.innerHTML = `
    <td><img class="rounded-circle" src="${patient.imageUrl}" loading="lazy" /></td>
    <td><p>${patient.email}</p></td>
    <td><p class="text-muted">${patient.name}</p></td>
    <td class="text-right"><p>${patient.phone}</p></td>
    <td class="text-right"><button class="btn btn-dark-blue-f btn-sm">appointment</button></td>
    <td><button class="btn btn-sm"><i class="las la-ellipsis-h"></i></button></td>
  `;

	tableBody.appendChild(row);
}
function addAppointmentRow(appointment) {
	const tableBody = document.getElementById('appointments-table-body');
	const row = document.createElement('tr');

	const patientDataRef = firebase.database().ref('Users/' + appointment.patientId);
	console.log("TEST1" + appointment.patientId)
	patientDataRef.once('value').then((patientDataSnapshot) => {
		const patient = patientDataSnapshot.val();
		console.log("TEST2" + patient.imageUrl)
		row.innerHTML = `
    <td><img class="rounded-circle" src="${patient.imageUrl}" loading="lazy" /></td>
    <td><p>${appointment.name}</p></td>
    <td><p class="text-muted">${appointment.date}</p></td>
    <td><p class="text-muted">${appointment.description}</p></td>
    <td class="text-right"><p>${appointment.time}</p></td>
    <td><button class="btn btn-sm"><i class="las la-ellipsis-h"></i></button></td>
  `;
	});


	tableBody.appendChild(row);
}

function fetchPatientsData(doctor) {
	const doctorPatientsRef = firebase.database().ref('Doctors/' + doctor.uid + '/Patients');

	doctorPatientsRef.once('value').then((snapshot) => {
		snapshot.forEach((patientSnapshot) => {
			const patientId = patientSnapshot.key;
			const patientDataRef = firebase.database().ref('Users/' + patientId);

			patientDataRef.once('value').then((patientDataSnapshot) => {
				console.log("TEST2" + doctorPatientsRef);
				const patient = patientDataSnapshot.val();
				addPatientRow(patient);
			}).catch((error) => {
				console.error('Error fetching patient data:', error);
				errorNotification('Error fetching patient data: ' + error.message);
			});
		});

	}).catch((error) => {
		console.error('Error fetching patients data:', error);
		errorNotification('Error fetching patients data: ' + error.message);
	});

	const appointmentRef = firebase.database().ref('Doctors/' + doctor.uid + '/Appointments');

	appointmentRef.once('value').then((snapshot) => {
		snapshot.forEach((appointmentSnapshot) => {
			const appointmentId = appointmentSnapshot.key;
			console.log("AppointmentID"+appointmentId);
			const appointmentDataRef = firebase.database().ref('Doctors/' + doctor.uid + '/Appointments/' + appointmentId);
			appointmentDataRef.once('value').then((appointmentDataSnapshot) => {
				const appointment = appointmentDataSnapshot.val();
				addAppointmentRow(appointment);

			});
		});

	}).catch((error) => {
		console.error('Error fetching patients data:', error);
		errorNotification('Error fetching patients data: ' + error.message);
	});
}