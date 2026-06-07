const { readData, writeData } = require("../services/json.service");
const { generateId } = require("../utils/id.util");

const patientsFile = "patients.json";
const doctorsFile = "doctors.json";
const departmentsFile = "departments.json";
const diseasesFile = "diseases.json";

const isMissing = (value) => {
  return value === undefined || value === null || value === "";
};

const doctorExists = async (doctorId) => {
  const doctors = await readData(doctorsFile);

  return doctors.some((doctor) => {
    return doctor.doctorId === Number(doctorId);
  });
};

const getPatients = async (req, res) => {
  const patients = await readData(patientsFile);

  return res.status(200).json({
    success: true,
    data: patients,
  });
};

const searchPatients = async (req, res) => {
  const name = (req.query.name || "").toLowerCase();
  const patients = await readData(patientsFile);

  // Convert both values to lowercase so John, john, and JOHN all match.
  const results = patients
    .filter((patient) => {
      return patient.fullName.toLowerCase().includes(name);
    })
    .map((patient) => {
      return {
        patientId: patient.patientId,
        fullName: patient.fullName,
      };
    });

  return res.status(200).json({
    success: true,
    data: name ? results : [],
  });
};

const getPatientById = async (req, res) => {
  const patientId = Number(req.params.id);
  const patients = await readData(patientsFile);

  // Find the patient whose id matches the id from the URL.
  const patient = patients.find((item) => {
    return item.patientId === patientId;
  });

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: "Patient not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: patient,
  });
};

const getPatientProfile = async (req, res) => {
  const patientId = Number(req.params.id);

  const patients = await readData(patientsFile);
  const doctors = await readData(doctorsFile);
  const departments = await readData(departmentsFile);
  const diseases = await readData(diseasesFile);

  // First, find the patient. Without a patient, there is no profile.
  const patient = patients.find((item) => {
    return item.patientId === patientId;
  });

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: "Patient not found",
    });
  }

  // Then find the assigned doctor and the doctor's department.
  const doctor = doctors.find((item) => {
    return item.doctorId === patient.doctorId;
  });

  const department = doctor
    ? departments.find((item) => {
        return item.departmentId === doctor.departmentId;
      })
    : null;

  // A patient can have many disease records.
  const patientDiseases = diseases.filter((item) => {
    return item.patientId === patient.patientId;
  });

  return res.status(200).json({
    patient: {
      patientId: patient.patientId,
      fullName: patient.fullName,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
    },
    doctor: doctor
      ? {
          doctorId: doctor.doctorId,
          fullName: doctor.fullName,
          specialization: doctor.specialization,
        }
      : null,
    department: department
      ? {
          departmentId: department.departmentId,
          name: department.name,
        }
      : null,
    diseases: patientDiseases.map((disease) => {
      return {
        diseaseId: disease.diseaseId,
        icdCode: disease.icdCode,
        description: disease.description,
      };
    }),
  });
};

const createPatient = async (req, res) => {
  const { fullName, age, gender, phone, address, doctorId } = req.body;

  if (
    isMissing(fullName) ||
    isMissing(age) ||
    isMissing(gender) ||
    isMissing(phone) ||
    isMissing(address) ||
    isMissing(doctorId)
  ) {
    return res.status(400).json({
      success: false,
      message: "All patient fields are required",
    });
  }

  // A patient must belong to an existing doctor.
  if (!(await doctorExists(doctorId))) {
    return res.status(400).json({
      success: false,
      message: "Doctor not found",
    });
  }

  const patients = await readData(patientsFile);

  const newPatient = {
    patientId: generateId(patients, "patientId"),
    fullName,
    age: Number(age),
    gender,
    phone,
    address,
    doctorId: Number(doctorId),
  };

  patients.push(newPatient);
  await writeData(patientsFile, patients);

  return res.status(201).json({
    success: true,
    message: "Patient created successfully",
    data: newPatient,
  });
};

const updatePatient = async (req, res) => {
  const patientId = Number(req.params.id);
  const { fullName, age, gender, phone, address, doctorId } = req.body;

  if (
    isMissing(fullName) ||
    isMissing(age) ||
    isMissing(gender) ||
    isMissing(phone) ||
    isMissing(address) ||
    isMissing(doctorId)
  ) {
    return res.status(400).json({
      success: false,
      message: "All patient fields are required",
    });
  }

  const patients = await readData(patientsFile);

  const patient = patients.find((item) => {
    return item.patientId === patientId;
  });

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: "Patient not found",
    });
  }

  // The new doctorId must also exist before updating the patient.
  if (!(await doctorExists(doctorId))) {
    return res.status(400).json({
      success: false,
      message: "Doctor not found",
    });
  }

  patient.fullName = fullName;
  patient.age = Number(age);
  patient.gender = gender;
  patient.phone = phone;
  patient.address = address;
  patient.doctorId = Number(doctorId);

  await writeData(patientsFile, patients);

  return res.status(200).json({
    success: true,
    message: "Patient updated successfully",
    data: patient,
  });
};

const deletePatient = async (req, res) => {
  const patientId = Number(req.params.id);
  const patients = await readData(patientsFile);

  const patientExists = patients.some((item) => {
    return item.patientId === patientId;
  });

  if (!patientExists) {
    return res.status(404).json({
      success: false,
      message: "Patient not found",
    });
  }

  const updatedPatients = patients.filter((item) => {
    return item.patientId !== patientId;
  });

  await writeData(patientsFile, updatedPatients);

  return res.status(200).json({
    success: true,
    message: "Patient deleted successfully",
  });
};

module.exports = {
  getPatients,
  searchPatients,
  getPatientById,
  getPatientProfile,
  createPatient,
  updatePatient,
  deletePatient,
};
