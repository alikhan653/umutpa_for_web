document.addEventListener('DOMContentLoaded', function() {
  const auth = firebase.auth();

  auth.onAuthStateChanged(function(user) {
      if (user) {
          loadDoctorPatients(user.uid);
          loadMedications();
          loadPrescriptions(user.uid);

          const prescriptionForm = document.getElementById('doctorPrescriptionForm');
          prescriptionForm.addEventListener('submit', addPrescription);

      } else {
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
      const medicationsRef = firebase.database().ref('Medications');
      medicationsRef.once('value').then(function(snapshot) {
          const medications = snapshot.val();
          const medicationSelect = document.getElementById('medicationSelect');
          medicationSelect.innerHTML = '';

          for (const medicationId in medications) {
              if (medications.hasOwnProperty(medicationId)) {
                  const medication = medications[medicationId];
                  const option = document.createElement('option');
                  option.value = medicationId;
                  option.textContent = medication.name;
                  medicationSelect.appendChild(option);
              }
          }
      }).catch(function(error) {
          console.error('Error loading medications: ', error);
      });
  }

  async function loadPrescriptions(doctorId) {
      const prescriptionsRef = firebase.database().ref('Doctors/' + doctorId + '/Prescriptions');
      prescriptionsRef.once('value').then(async function(snapshot) {
          const prescriptions = snapshot.val();
          const prescriptionsList = document.getElementById('prescriptionsList');
          prescriptionsList.innerHTML = '';

          for (const prescriptionId in prescriptions) {
              if (prescriptions.hasOwnProperty(prescriptionId)) {
                  const prescription = prescriptions[prescriptionId];
                  const patientName = await getPatientName(prescription.patientId);
                  const medicationName = await getMedicationName(prescription.medicationId);

                  const row = document.createElement('tr');
                  row.innerHTML = `
                      <td>${patientName}</td>
                      <td>${medicationName}</td>
                      <td>${prescription.dosage}</td>
                      <td>${prescription.frequency}</td>
                      <td>
                          <button class="btn btn-warning btn-sm" onclick="editPrescription('${prescriptionId}', '${prescription.patientId}', '${prescription.medicationId}', '${prescription.dosage}', '${prescription.frequency}')">Edit</button>
                          <button class="btn btn-danger btn-sm" onclick="deletePrescription('${prescriptionId}')">Delete</button>
                      </td>
                  `;
                  prescriptionsList.appendChild(row);
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

  async function getMedicationName(medicationId) {
      const snapshot = await firebase.database().ref('Medications/' + medicationId).once('value');
      const medicationData = snapshot.val();
      return medicationData ? medicationData.name : 'Unknown Medication';
  }

  function addPrescription(event) {
      event.preventDefault();

      const patientId = document.getElementById('patientSelect').value;
      const medicationId = document.getElementById('medicationSelect').value;
      const dosage = document.getElementById('dosage').value;
      const frequency = document.getElementById('frequency').value;
      const prescriptionsRef = firebase.database().ref('Doctors/' + auth.currentUser.uid + '/Prescriptions');

      const newPresRef = prescriptionsRef.push();
      newPresRef.set({
          patientId: patientId,
          medicationId: medicationId,
          dosage: dosage,
          frequency: frequency
      }).then(function() {
          alert('Medication prescribed successfully!');
          loadPrescriptions(auth.currentUser.uid);
      }).catch(function(error) {
          console.error('Error prescribing medication: ', error);
      });
  }

  window.editPrescription = function(prescriptionId, patientId, medicationId, dosage, frequency) {
      document.getElementById('patientSelect').value = patientId;
      document.getElementById('medicationSelect').value = medicationId;
      document.getElementById('dosage').value = dosage;
      document.getElementById('frequency').value = frequency;

      const prescriptionForm = document.getElementById('doctorPrescriptionForm');
      prescriptionForm.removeEventListener('submit', addPrescription);
      prescriptionForm.addEventListener('submit', function updatePrescription(event) {
          event.preventDefault();

          const updatedPatientId = document.getElementById('patientSelect').value;
          const updatedMedicationId = document.getElementById('medicationSelect').value;
          const updatedDosage = document.getElementById('dosage').value;
          const updatedFrequency = document.getElementById('frequency').value;
          const prescriptionsRef = firebase.database().ref('Doctors/' + auth.currentUser.uid + '/Prescriptions/' + prescriptionId);

          prescriptionsRef.set({
              patientId: updatedPatientId,
              medicationId: updatedMedicationId,
              dosage: updatedDosage,
              frequency: updatedFrequency
          }).then(function() {
              alert('Medication updated successfully!');
              loadPrescriptions(auth.currentUser.uid);
              prescriptionForm.removeEventListener('submit', updatePrescription);
              prescriptionForm.addEventListener('submit', addPrescription);
              prescriptionForm.reset();
          }).catch(function(error) {
              console.error('Error updating medication: ', error);
          });
      });
  };

  window.deletePrescription = function(prescriptionId) {
      const prescriptionsRef = firebase.database().ref('Doctors/' + auth.currentUser.uid + '/Prescriptions/' + prescriptionId);
      prescriptionsRef.remove().then(function() {
          alert('Medication deleted successfully!');
          loadPrescriptions(auth.currentUser.uid);
      }).catch(function(error) {
          console.error('Error deleting medication: ', error);
      });
  };
});
