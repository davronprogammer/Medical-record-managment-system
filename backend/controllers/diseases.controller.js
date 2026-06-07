const { readData, writeData } = require("../services/json.service");
const { generateId } = require("../utils/id.util");

const diseasesFile = "diseases.json";
const patientsFile = "patients.json";

const isMissing = (value) => {
  return value === undefined || value === null || value === "";
};

const patientExists = async (patientId) => {
  const patients = await readData(patientsFile);

  return patients.some((patient) => {
    return patient.patientId === Number(patientId);
  });
};

const getDiseases = async (req, res) => {
  const diseases = await readData(diseasesFile);

  return res.status(200).json({
    success: true,
    data: diseases,
  });
};

const searchDiseases = async (req, res) => {
  const keyword = (req.query.keyword || "").toLowerCase();
  const diseases = await readData(diseasesFile);

  // Search both ICD code and description using lowercase partial matching.
  const results = diseases.filter((disease) => {
    const icdCode = disease.icdCode.toLowerCase();
    const description = disease.description.toLowerCase();

    return icdCode.includes(keyword) || description.includes(keyword);
  });

  return res.status(200).json({
    success: true,
    data: keyword ? results : [],
  });
};

const getDiseaseById = async (req, res) => {
  const diseaseId = Number(req.params.id);
  const diseases = await readData(diseasesFile);

  // Find the disease record whose id matches the id from the URL.
  const disease = diseases.find((item) => {
    return item.diseaseId === diseaseId;
  });

  if (!disease) {
    return res.status(404).json({
      success: false,
      message: "Disease not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: disease,
  });
};

const createDisease = async (req, res) => {
  const { patientId, icdCode, description } = req.body;

  if (isMissing(patientId) || isMissing(icdCode) || isMissing(description)) {
    return res.status(400).json({
      success: false,
      message: "All disease fields are required",
    });
  }

  // A disease record must belong to an existing patient.
  if (!(await patientExists(patientId))) {
    return res.status(400).json({
      success: false,
      message: "Patient not found",
    });
  }

  const diseases = await readData(diseasesFile);

  const newDisease = {
    diseaseId: generateId(diseases, "diseaseId"),
    patientId: Number(patientId),
    icdCode,
    description,
  };

  diseases.push(newDisease);
  await writeData(diseasesFile, diseases);

  return res.status(201).json({
    success: true,
    message: "Disease created successfully",
    data: newDisease,
  });
};

const updateDisease = async (req, res) => {
  const diseaseId = Number(req.params.id);
  const { patientId, icdCode, description } = req.body;

  if (isMissing(patientId) || isMissing(icdCode) || isMissing(description)) {
    return res.status(400).json({
      success: false,
      message: "All disease fields are required",
    });
  }

  const diseases = await readData(diseasesFile);

  const disease = diseases.find((item) => {
    return item.diseaseId === diseaseId;
  });

  if (!disease) {
    return res.status(404).json({
      success: false,
      message: "Disease not found",
    });
  }

  // The new patientId must also exist before updating the disease record.
  if (!(await patientExists(patientId))) {
    return res.status(400).json({
      success: false,
      message: "Patient not found",
    });
  }

  disease.patientId = Number(patientId);
  disease.icdCode = icdCode;
  disease.description = description;

  await writeData(diseasesFile, diseases);

  return res.status(200).json({
    success: true,
    message: "Disease updated successfully",
    data: disease,
  });
};

const deleteDisease = async (req, res) => {
  const diseaseId = Number(req.params.id);
  const diseases = await readData(diseasesFile);

  const diseaseExists = diseases.some((item) => {
    return item.diseaseId === diseaseId;
  });

  if (!diseaseExists) {
    return res.status(404).json({
      success: false,
      message: "Disease not found",
    });
  }

  const updatedDiseases = diseases.filter((item) => {
    return item.diseaseId !== diseaseId;
  });

  await writeData(diseasesFile, updatedDiseases);

  return res.status(200).json({
    success: true,
    message: "Disease deleted successfully",
  });
};

module.exports = {
  getDiseases,
  searchDiseases,
  getDiseaseById,
  createDisease,
  updateDisease,
  deleteDisease,
};
