document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();

    auth.onAuthStateChanged(function(user) {
        if (user) {
            loadDoctorPatients(user.uid);
            loadMedications();
            loadPrescriptions(user.uid);

            const prescriptionForm = document.getElementById('doctorPrescriptionForm');
            prescriptionForm.addEventListener('submit', addPrescription);

            const frequencyInput = document.getElementById('frequency');
            frequencyInput.addEventListener('change', updateMedtimeFields);
        }
    });

    function loadDoctorPatients(doctorId) {
        const doctorPatientsRef = firebase.database().ref('Doctors/' + doctorId + '/Patients');
        doctorPatientsRef.once('value').then(function(snapshot) {
            const patients = snapshot.val();
            const patientSelect = document.getElementById('patientSelect');
            patientSelect.innerHTML = '';

            for (const patientId in patients) {
                if (patients.hasOwnProperty(patientId)) {
                    const patient = patients[patientId];
                    const option = document.createElement('option');
                    option.value = patientId;
                    option.textContent = patient.name;
                    patientSelect.appendChild(option);
                }
            }
        }).catch(function(error) {
            console.error('Error loading patients: ', error);
        });
    }

    function loadMedications() {
        const medicationsRef = firebase.database().ref('Medications/');
        medicationsRef.once('value').then(function(snapshot) {
            const medications = snapshot.val();
            const medicationSelect = document.getElementById('medicationSelect');
            medicationSelect.innerHTML = '';

            for (const medicationId in medications) {
                if (medications.hasOwnProperty(medicationId)) {
                    const medication = medications[medicationId];
                    const option = document.createElement('option');
                    option.value = medicationId;
                    option.innerHTML = `
                        <div class="medication-option">
                            ${medication.name}
                        </div>
                    `;
                    medicationSelect.appendChild(option);
                }
            }
        }).catch(function(error) {
            console.error('Error loading medications: ', error);
        });
    }

    async function loadPrescriptions(doctorId) {
        const doctorPatientsRef = firebase.database().ref('Doctors/' + doctorId + '/Patients');
        const prescriptionsList = document.getElementById('prescriptionsList');
        prescriptionsList.innerHTML = '';

        doctorPatientsRef.once('value').then(async function(snapshot) {
            const patients = snapshot.val();
            for (const patientId in patients) {
                if (patients.hasOwnProperty(patientId)) {
                    const patientName = patients[patientId].name;
                    const prescriptionsRef = firebase.database().ref('Doctors/' + doctorId + '/Patients/' + patientId + '/Prescriptions');
                    const prescriptionsSnapshot = await prescriptionsRef.once('value');
                    const prescriptions = prescriptionsSnapshot.val();

                    for (const prescriptionId in prescriptions) {
                        if (prescriptions.hasOwnProperty(prescriptionId)) {
                            const prescription = prescriptions[prescriptionId];
                            const medication = await getMedication(prescription.medicationId);

                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${patientName}</td>
                                <td>
                                    <img src="${medication.imageUrl}" class="medication-image" alt="${medication.name}"> 
                                    ${medication.name}
                                </td>
                                <td>${prescription.dosage}</td>
                                <td>${prescription.frequency}</td>
                                <td>${Array.isArray(prescription.medtime) ? prescription.medtime.join(', ') : prescription.medtime}</td>
                                <td>
                                    <button class="btn btn-info btn-sm" onclick="editPrescription('${prescriptionId}', '${patientId}', '${prescription.medicationId}', '${prescription.dosage}', '${prescription.frequency}', '${Array.isArray(prescription.medtime) ? prescription.medtime.join(', ') : prescription.medtime}')">Edit</button>
                                    <button class="btn btn-secondary btn-sm" onclick="deletePrescription('${prescriptionId}', '${patientId}')">Delete</button>
                                </td>
                            `;
                            prescriptionsList.appendChild(row);
                        }
                    }
                }
            }
        }).catch(function(error) {
            console.error('Error loading prescriptions: ', error);
        });
    }

    async function getPatientName(patientId) {
        const snapshot = await firebase.database().ref('Users/' + patientId).once('value');
        const patientData = snapshot.val();
        return patientData ? patientData.name : 'Unknown Patient';
    }

    async function getMedication(medicationId) {
        const snapshot = await firebase.database().ref('Medications/' + medicationId).once('value');
        const medicationData = snapshot.val();
        return medicationData ? medicationData : { name: 'Unknown Medication', description: '', imageUrl: '' };
    }

    function updateMedtimeFields() {
        const frequency = parseInt(document.getElementById('frequency').value);
        const medtimeContainer = document.getElementById('medtimeContainer');
        medtimeContainer.innerHTML = '';

        for (let i = 0; i < frequency; i++) {
            const input = document.createElement('input');
            input.type = 'time';
            input.className = 'form-control mb-2';
            input.name = 'medtime';
            input.required = true;
            medtimeContainer.appendChild(input);
        }
    }

    function addPrescription(event) {
        event.preventDefault();

        const patientId = document.getElementById('patientSelect').value;
        const medicationId = document.getElementById('medicationSelect').value;
        const dosage = document.getElementById('dosage').value;
        const frequency = document.getElementById('frequency').value;
        const medtimeInputs = document.querySelectorAll('#medtimeContainer input');
        const medtime = Array.from(medtimeInputs).map(input => input.value);

        // Fetch medication details to include description and imageUrl
        getMedication(medicationId).then(medication => {
            const prescriptionsRef = firebase.database().ref('Doctors/' + auth.currentUser.uid + '/Patients/' + patientId + '/Prescriptions');

            const newPresRef = prescriptionsRef.push();
            newPresRef.set({
                patientId: patientId,
                medicationId: medicationId,
                description: medication.description, // Save medication description
                imageUrl: medication.imageUrl, // Save medication imageUrl
                dosage: dosage,
                frequency: frequency,
                medtime: medtime,
            }).then(function() {
                alert('Medication prescribed successfully!');
                loadPrescriptions(auth.currentUser.uid);
                document.getElementById('doctorPrescriptionForm').reset();
                document.getElementById('medtimeContainer').innerHTML = '';
            }).catch(function(error) {
                console.error('Error prescribing medication: ', error);
            });
        });
    }

    window.editPrescription = function(prescriptionId, patientId, medicationId, dosage, frequency, medtime) {
        document.getElementById('patientSelect').value = patientId;
        document.getElementById('medicationSelect').value = medicationId;
        document.getElementById('dosage').value = dosage;
        document.getElementById('frequency').value = frequency;
        updateMedtimeFields();

        const medtimeInputs = document.querySelectorAll('#medtimeContainer input');
        const medtimeArray = medtime.split(', ');

        for (let i = 0; i < medtimeInputs.length; i++) {
            medtimeInputs[i].value = medtimeArray[i];
        }

        const prescriptionForm = document.getElementById('doctorPrescriptionForm');
        prescriptionForm.removeEventListener('submit', addPrescription);
        prescriptionForm.addEventListener('submit', function updatePrescription(event) {
            event.preventDefault();

            const updatedPatientId = document.getElementById('patientSelect').value;
            const updatedMedicationId = document.getElementById('medicationSelect').value;
            const updatedDosage = document.getElementById('dosage').value;
            const updatedFrequency = document.getElementById('frequency').value;
            const updatedMedtimeInputs = document.querySelectorAll('#medtimeContainer input');
            const updatedMedtime = Array.from(updatedMedtimeInputs).map(input => input.value);

            // Fetch medication details to include description
            getMedication(updatedMedicationId).then(medication => {
                const prescriptionsRef = firebase.database().ref('Doctors/' + auth.currentUser.uid + '/Patients/' + patientId + '/Prescriptions/' + prescriptionId);

                prescriptionsRef.set({
                    patientId: updatedPatientId,
                    medicationId: updatedMedicationId,
                    description: medication.description, // Save medication description
                    imageUrl: medication.imageUrl,
                    dosage: updatedDosage,
                    frequency: updatedFrequency,
                    medtime: updatedMedtime,
                }).then(function() {
                    alert('Medication updated successfully!');
                    loadPrescriptions(auth.currentUser.uid);
                    prescriptionForm.removeEventListener('submit', updatePrescription);
                    prescriptionForm.addEventListener('submit', addPrescription);
                    prescriptionForm.reset();
                    document.getElementById('medtimeContainer').innerHTML = '';
                }).catch(function(error) {
                    console.error('Error updating medication: ', error);
                });
            });
        });
    };


    window.deletePrescription = function(prescriptionId, patientId) {
        const prescriptionsRef = firebase.database().ref('Doctors/' + auth.currentUser.uid + '/Patients/' + patientId + '/Prescriptions/' + prescriptionId);
        prescriptionsRef.remove().then(function() {
            alert('Medication deleted successfully!');
            loadPrescriptions(auth.currentUser.uid);
        }).catch(function(error) {
            console.error('Error deleting medication: ', error);
        });
    };
});
