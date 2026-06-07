const { readData } = require("../services/json.service");

const getStats = async (req, res) => {
  const departments = await readData("departments.json");
  const doctors = await readData("doctors.json");
  const patients = await readData("patients.json");
  const diseases = await readData("diseases.json");

  // The dashboard counts how many records exist in each JSON file.
  return res.status(200).json({
    totalDepartments: departments.length,
    totalDoctors: doctors.length,
    totalPatients: patients.length,
    totalDiseases: diseases.length,
  });
};

const getRecentPatients = async (req, res) => {
  const patients = await readData("patients.json");

  // Higher patientId means the patient was added more recently.
  const recentPatients = patients
    .sort((a, b) => b.patientId - a.patientId)
    .slice(0, 5)
    .map((patient) => {
      return {
        patientId: patient.patientId,
        fullName: patient.fullName,
      };
    });

  return res.status(200).json(recentPatients);
};

const getRecentDiseases = async (req, res) => {
  const diseases = await readData("diseases.json");

  // Higher diseaseId means the disease record was added more recently.
  const recentDiseases = diseases
    .sort((a, b) => b.diseaseId - a.diseaseId)
    .slice(0, 5)
    .map((disease) => {
      return {
        diseaseId: disease.diseaseId,
        description: disease.description,
      };
    });

  return res.status(200).json(recentDiseases);
};

module.exports = {
  getStats,
  getRecentPatients,
  getRecentDiseases,
};
