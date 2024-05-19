$(function () {
	initCharts();
});

const auth = firebase.auth();
console.log(auth.currentUser);
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
	var doctorRef = firebase.database().ref('patients');
	patientsRef.once('value', function(snapshot) {
		var count = snapshot.numChildren();
		console.log('Number of patients:', count);
		document.getElementById('patientCount').innerText = count;
	});
}

function bsEvents(){
	$('.onboarding-modal').modal('show');
}

function initCharts() {
	Chart.defaults.global.legend.labels.usePointStyle = true;

	var ctx = $('#bookings-chart');
	var ctx2 = $('#diseases-chart');
	var ctx3 = $('#recent-activity-chart');

	var recentActivitesChart = new Chart(ctx3, {
		type: 'line',
		data: {
			labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
			datasets: [{
				label: '# of patients',
				data: [12, 19, 3, 5, 1, 2, 4, 15],
				backgroundColor: [
					'rgba(255, 99, 132, 0.7)',
					'rgba(54, 162, 235, 0.7)',
					'rgba(255, 206, 86, 0.7)',
					'rgba(75, 192, 192, 0.7)',
				],
			}],
		},
		options: {
			legend: {
				display: true,
				position: 'bottom',
			}
		},
	})
	var bookingsChart = new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: ['urgent', 'no urgent', 'resuscitation', 'emergency'],
			datasets: [{
				label: '# of Votes',
				data: [12, 19, 3, 5],
				backgroundColor: [
					'rgba(255, 206, 86, 0.7)',
					'rgba(75, 192, 192, 0.7)',
					'rgba(54, 162, 235, 0.7)',
					'rgba(255, 99, 132, 0.7)',
				],
			}],
		},
		options: {
			legend: {
				display: true,
				position: 'bottom',
			}
		},
	})
	var diseasesChart = new Chart(ctx2, {
		type: 'doughnut',
		data: {
			labels: ['malaria', 'tuberculosis', 'pneumonia', 'diabetes'],
			datasets: [{
				label: '# of Votes',
				data: [13, 1, 8, 15],
				backgroundColor: [
					'rgba(255, 206, 86, 0.7)',
					'rgba(75, 192, 192, 0.7)',
					'rgba(54, 162, 235, 0.7)',
					'rgba(255, 99, 132, 0.7)',
				],
			}],
		},
		options: {
			legend: {
				display: true,
				position: 'bottom',
			}
		},
	})
}