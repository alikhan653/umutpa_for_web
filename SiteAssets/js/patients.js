$(() => {
	$('#card-view-btn').on('click', function () {
		$('.patients-card-view').removeClass('no-display');
		$('.patients-table-view').addClass('no-display');
	});

	$('#table-view-btn').on('click', function () {
		$('.patients-table-view').removeClass('no-display');
		$('.patients-card-view').addClass('no-display');
	})

	const database = firebase.database();
	const patientsRef = database.ref('patients');
	const cardsContainer = document.querySelector('.patients-card-view .row');

	patientsRef.on('value', (snapshot) => {
		cardsContainer.innerHTML = ''; // Очищаем текущее содержимое контейнера для карточек

		const patientsData = snapshot.val();

		for (const patientId in patientsData) {
			const patient = patientsData[patientId];

			// Создаем новую карточку
			const newCard = document.createElement('div');
			newCard.classList.add('col-md-3');
			newCard.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <div class="card-img-top"><img class="rounded-circle" src="../SiteAssets/images/people.svg" loading="lazy" /><a class="view-more" href="details.html">view profile</a></div>
                    </div>
                    <div class="card-body">
                        <div class="card-subsection-title">
                            <h5>${patient.name}</h5>
                            <p class="text-muted">patient-id: ${patient.PatientID}</p>
                        </div>
                        <div class="card-subsection-body">
                            <label class="text-muted">age</label>
                            <p>${patient.age}</p>
                            <label class="text-muted">date of birth</label>
                            <p>${patient["Date of birth"]}</p>
                            <label class="text-muted">stage</label>
                            <p>${patient.Stage}</p>
                        </div>
                    </div>
                    <div class="card-footer"></div>
                </div>
            `;
			cardsContainer.appendChild(newCard);
		}
	});

	const tbody = document.querySelector('.patients-table-view tbody');

	// Обновляем содержимое таблицы при изменении данных в базе данных
	patientsRef.on('value', (snapshot) => {
		tbody.innerHTML = ''; // Очищаем текущее содержимое таблицы

		// Получаем данные о пациентах
		const patientsData = snapshot.val();

		// Проходимся по каждому пациенту и добавляем его в таблицу
		for (const patientId in patientsData) {
			const patient = patientsData[patientId];

			// Создаем новую строку таблицы
			const newRow = document.createElement('tr');

			// Заполняем ячейки данных для каждого пациента
			newRow.innerHTML = `
                <td>${patient.PatientID}</td>
                <td><img class="rounded-circle" src="../SiteAssets/images/people.svg" loading="lazy" /><span class="ml-2">${patient.name}</span></td>
                <td>${patient.age}</td>
                <td>${patient["Date of birth"]}</td>
                <td>${patient.Stage}</td>
                <td><a class="view-more btn btn-sm btn-dark-red-f" href="details.html">view profile</a></td>
            `;

			// Добавляем строку в tbody таблицы
			tbody.appendChild(newRow);
		}
	});
})