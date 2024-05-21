$(() => {
	$('#card-view-btn').on('click', function () {
		$('.patients-card-view').removeClass('no-display');
		$('.patients-table-view').addClass('no-display');
	});

	$('#table-view-btn').on('click', function () {
		$('.patients-table-view').removeClass('no-display');
		$('.patients-card-view').addClass('no-display');
	})

	const auth = firebase.auth();
	auth.onAuthStateChanged(function (user) {
		if (user) {
			var email_id = user.email;
			var userId = user.uid;

			console.log(user.uid);
			var dbRef = firebase.database().ref('Users/' + userId);

			dbRef.once('value').then((snapshot) => {
				if (snapshot.exists()) {
					var userData = snapshot.val();
					var userName = userData.name;
					console.log("User's name is: " + userName);

					const divName = document.getElementById("div-name");
					const usernamePlaceholder = document.getElementById("usernamePlaceholder");

					if (divName) {
						divName.innerText = userName.split(" ")[0];
					}

					if (usernamePlaceholder) {
						usernamePlaceholder.innerHTML = email_id;
					}

					fetchPatientsData(user);
				} else {
					console.log("No data available for the specified user ID");
				}
			}).catch((error) => {
				console.log("Error fetching user data:", error);
			});
		}
	});

	function fetchPatientsData(user) {
		const patientsRef = firebase.database().ref('Doctors/' + user.uid + '/Patients');
		patientsRef.once('value').then((snapshot) => {
			if (snapshot.exists()) {
				snapshot.forEach((patientSnapshot) => {
					const patientId = patientSnapshot.key;
					const patientDataRef = firebase.database().ref('Users/' + patientId);

					patientDataRef.once('value').then((patientDataSnapshot) => {
						const patient = patientDataSnapshot.val();
						const cardViewContainer = document.querySelector('.patients-card-view .row');
						const tableViewBody = document.querySelector('.patients-table-view tbody');

						cardViewContainer.innerHTML = '';
						tableViewBody.innerHTML = '';

						const patientCard = createPatientCard(patient, patientId);
						const patientRow = createPatientTableRow(patient, patientId);

						cardViewContainer.appendChild(patientCard);
						tableViewBody.appendChild(patientRow);
					}).catch((error) => {
						console.error('Error fetching patient data:', error);
						errorNotification('Error fetching patient data: ' + error.message);
					});
				});
			} else {
				console.log("No patients data available");
			}
		}).catch((error) => {
			console.log("Error fetching patients data:", error);
		});
	}

	function createPatientCard(patient, patientId) {
		const card = document.createElement('div');
		card.className = 'col-md-4';

		card.innerHTML = `
		<div class="card">
		<div class="card-header">
			<div class="card-img-top"><img class="rounded-circle" src="${patient.imageUrl}" loading="lazy" /><a class="view-more" href="details.html?patientId=${patientId}">view profile</a></div>
		</div>
		<div class="card-body">
			<div class="card-subsection-title">
				<h5>${patient.name}</h5>
				<p class="text-muted">patient-id: ${patientId}</p>
			</div>
			<div class="card-subsection-body">
				<label class="text-muted">Email</label>
				<p>${patient.email}</p>
				<label class="text-muted">date of birth</label>
				<p>${patient.dob}</p>
				<label class="text-muted">stage</label>
				<p>${patient.Stage}</p>
			</div>
		</div>
		<div class="card-footer"></div>
	</div>
		`;

		return card;
	}

	function createPatientTableRow(patient, patientId) {
		const row = document.createElement('tr');

		row.innerHTML = `
		<td>${patientId}</td>
		<td><img class="rounded-circle" src="${patient.imageUrl}" loading="lazy" /><span class="ml-2">${patient.name}</span></td>
		<td>${patient.email}</td>
		<td>${patient.dob}</td>
		<td>${patient.Stage}</td>
		<td><a class="view-more btn btn-sm btn-dark-red-f" href="details.html?patientId=${patientId}">view profile</a></td>
		`;

		return row;
	}
});