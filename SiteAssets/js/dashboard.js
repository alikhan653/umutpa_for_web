
const auth = firebase.auth();
console.log(auth.currentUser);
auth.onAuthStateChanged(function (user) {
	if (user) {
		var email_id = user.email;
		var userId = user.uid;
		fetchPatientsData(user);

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

function setPatientData() {
	var patientsRef = firebase.database().ref('patients');
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
	console.log("Patients" + patient);
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

function fetchPatientsData(doctor) {
	const doctorPatientsRef = firebase.database().ref('Doctors/' + doctor.uid + '/Patients');

	doctorPatientsRef.once('value').then((snapshot) => {
		console.log("TEST1");
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
}