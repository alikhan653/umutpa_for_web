function setPatientData(user) {
	console.log('Setting patient data:', user);
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

auth.onAuthStateChanged(function (user) {
	if (user) {
		var email_id = user.email;
		var userId = user.uid;
		fetchPatientsData(user);
		setPatientData(user);
	}
});
function addPatientRow(patient, patientId) {
	const tableBody = document.getElementById('patients-table-body');
	const row = document.createElement('tr');
	if(patient.imageUrl == null){
		patient.imageUrl = "../SiteAssets/images/people.svg";
	}
	row.innerHTML = `
    <td><img class="rounded-circle" src="${patient.imageUrl}" loading="lazy" /></td>
    <td><p>${patient.name}</p></td>
    <td><p class="text-muted">${patient.stage}</p></td>
    <td class="text-right"><p>${patient.phone}</p></td>
    <td class="text-right"><button class="btn btn-dark-blue-f btn-sm" onclick="location.href='details.html?patientId=${patientId}'">details</button></td>
    <td><button class="btn btn-sm"><i class="las la-ellipsis-h"></i></button></td>
  `;

	tableBody.appendChild(row);
}
function addAppointmentRow(appointment) {
	const tableBody = document.getElementById('appointments-table-body');
	const row = document.createElement('tr');

	const patientDataRef = firebase.database().ref('Users/' + appointment.patientId + '/Appointments');
	patientDataRef.once('value').then((patientDataSnapshot) => {
		const patient = patientDataSnapshot.val();
		if(patient.imageUrl == null){
			patient.imageUrl = "../SiteAssets/images/undraw_medicine_b1ol.svg";
		}
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

	const tableBody = document.getElementById('patients-table-body');
	const row = document.createElement('tr');
	row.innerHTML = `
	<th scope="col"></th>
	<th scope="col">Patient</th>
	<th scope="col">Stage</th>
	<th scope="col" class="text-right">Phone</th>
	<th scope="col" class="text-right">Details</th>
	<th scope="col"></th>
	`;

	tableBody.appendChild(row);

	doctorPatientsRef.once('value').then((snapshot) => {
		snapshot.forEach((patientSnapshot) => {
			const patientId = patientSnapshot.key;
			const patientDataRef = firebase.database().ref('Users/' + patientId);

			patientDataRef.once('value').then((patientDataSnapshot) => {
				const patient = patientDataSnapshot.val();
				addPatientRow(patient, patientId);
			}).catch((error) => {
				console.error('Error fetching patient data:', error);
				errorNotification('Error fetching patient data: ' + error.message);
			});
		});

	}).catch((error) => {
		console.error('Error fetching patients data:', error);
		errorNotification('Error fetching patients data: ' + error.message);
	});

	const appointmentRef = firebase.database().ref('Users/' + doctor.uid + '/Appointments');

	appointmentRef.once('value').then((snapshot) => {
		snapshot.forEach((appointmentSnapshot) => {
			const appointment = appointmentSnapshot.val();
			addAppointmentRow(appointment);
		});
	}).catch((error) => {
		console.error('Error fetching appointments data:', error);
		errorNotification('Error fetching appointments data: ' + error.message);
	});

}
