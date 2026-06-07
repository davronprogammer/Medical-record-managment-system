const { readData, writeData } = require("../services/json.service");
const { generateId } = require("../utils/id.util");

const doctorsFile = "doctors.json";
const departmentsFile = "departments.json";

const isMissing = (value) => {
  return value === undefined || value === null || value === "";
};

const departmentExists = async (departmentId) => {
  const departments = await readData(departmentsFile);

  return departments.some((department) => {
    return department.departmentId === Number(departmentId);
  });
};

const getDoctors = async (req, res) => {
  const doctors = await readData(doctorsFile);

  return res.status(200).json({
    success: true,
    data: doctors,
  });
};

const searchDoctors = async (req, res) => {
  const name = (req.query.name || "").toLowerCase();
  const doctors = await readData(doctorsFile);

  // Convert both values to lowercase so Ali, ali, and ALI all match.
  const results = doctors
    .filter((doctor) => {
      return doctor.fullName.toLowerCase().includes(name);
    })
    .map((doctor) => {
      return {
        doctorId: doctor.doctorId,
        fullName: doctor.fullName,
      };
    });

  return res.status(200).json({
    success: true,
    data: name ? results : [],
  });
};

const filterDoctorsByDepartment = async (req, res) => {
  const departmentId = Number(req.query.departmentId);
  const doctors = await readData(doctorsFile);

  // Return only doctors whose departmentId matches the query parameter.
  const results = doctors.filter((doctor) => {
    return doctor.departmentId === departmentId;
  });

  return res.status(200).json({
    success: true,
    data: departmentId ? results : [],
  });
};

const getDoctorById = async (req, res) => {
  const doctorId = Number(req.params.id);
  const doctors = await readData(doctorsFile);

  // Find the doctor whose id matches the id from the URL.
  const doctor = doctors.find((item) => {
    return item.doctorId === doctorId;
  });

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: "Doctor not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: doctor,
  });
};

const createDoctor = async (req, res) => {
  const { fullName, specialization, departmentId, phone, email } = req.body;

  if (
    isMissing(fullName) ||
    isMissing(specialization) ||
    isMissing(departmentId) ||
    isMissing(phone) ||
    isMissing(email)
  ) {
    return res.status(400).json({
      success: false,
      message: "All doctor fields are required",
    });
  }

  // A doctor must belong to an existing department.
  if (!(await departmentExists(departmentId))) {
    return res.status(400).json({
      success: false,
      message: "Department not found",
    });
  }

  const doctors = await readData(doctorsFile);

  const newDoctor = {
    doctorId: generateId(doctors, "doctorId"),
    fullName,
    specialization,
    departmentId: Number(departmentId),
    phone,
    email,
  };

  doctors.push(newDoctor);
  await writeData(doctorsFile, doctors);

  return res.status(201).json({
    success: true,
    message: "Doctor created successfully",
    data: newDoctor,
  });
};

const updateDoctor = async (req, res) => {
  const doctorId = Number(req.params.id);
  const { fullName, specialization, departmentId, phone, email } = req.body;

  if (
    isMissing(fullName) ||
    isMissing(specialization) ||
    isMissing(departmentId) ||
    isMissing(phone) ||
    isMissing(email)
  ) {
    return res.status(400).json({
      success: false,
      message: "All doctor fields are required",
    });
  }

  const doctors = await readData(doctorsFile);

  const doctor = doctors.find((item) => {
    return item.doctorId === doctorId;
  });

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: "Doctor not found",
    });
  }

  // The new departmentId must also exist before updating the doctor.
  if (!(await departmentExists(departmentId))) {
    return res.status(400).json({
      success: false,
      message: "Department not found",
    });
  }

  doctor.fullName = fullName;
  doctor.specialization = specialization;
  doctor.departmentId = Number(departmentId);
  doctor.phone = phone;
  doctor.email = email;

  await writeData(doctorsFile, doctors);

  return res.status(200).json({
    success: true,
    message: "Doctor updated successfully",
    data: doctor,
  });
};

const deleteDoctor = async (req, res) => {
  const doctorId = Number(req.params.id);
  const doctors = await readData(doctorsFile);

  const doctorExists = doctors.some((item) => {
    return item.doctorId === doctorId;
  });

  if (!doctorExists) {
    return res.status(404).json({
      success: false,
      message: "Doctor not found",
    });
  }

  const updatedDoctors = doctors.filter((item) => {
    return item.doctorId !== doctorId;
  });

  await writeData(doctorsFile, updatedDoctors);

  return res.status(200).json({
    success: true,
    message: "Doctor deleted successfully",
  });
};

module.exports = {
  getDoctors,
  searchDoctors,
  filterDoctorsByDepartment,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
