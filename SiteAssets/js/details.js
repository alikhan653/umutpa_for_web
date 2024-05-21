
const auth = firebase.auth();
console.log(auth.currentUser);
auth.onAuthStateChanged(function (user) {
	if (user) {
		var email_id = user.email;
		var userId = user.uid;
		const patientId = getUrlParameter('patientId');
		fetchPatientsData(patientId);

		var dbRef = firebase.database().ref('Users/' + userId);

		dbRef.once('value').then((snapshot) => {
			if (snapshot.exists()) {
				var userData = snapshot.val();
				var userName = userData.name;
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

function fetchPatientsData(patientId) {
	const patientDataRef = firebase.database().ref('Users/' + patientId);

	patientDataRef.once('value').then((patientDataSnapshot) => {
		const patient = patientDataSnapshot.val();

		if (patient) {
			// Update the HTML with the patient data
			document.querySelector('.mini-card .card-header img').src = patient.profileImage || 'https://placebeard.it/640x360';
			document.querySelector('.mini-card .card-body h4').textContent = patient.name || 'N/A';
			document.querySelector('.mini-card .card-body small').textContent = patient.email || 'N/A';
			document.querySelector('.mini-card .card-body h5').textContent = 'Age';
			document.querySelector('.mini-card .card-body p').textContent = patient.age || 'N/A';
			document.querySelector('.patients-details-card-wrapper .form-group #patient-gender').value = patient.gender || 'N/A';
			document.querySelector('.patients-details-card-wrapper .form-group #patient-dob').value = patient.dateOfBirth || 'N/A';
			document.querySelector('.patients-details-card-wrapper .form-group #patient-number').value = patient.phoneNumber || 'N/A';
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