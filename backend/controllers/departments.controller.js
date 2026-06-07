const { readData, writeData } = require("../services/json.service");
const { generateId } = require("../utils/id.util");

const fileName = "departments.json";

const getDepartments = async (req, res) => {
  const departments = await readData(fileName);

  return res.status(200).json({
    success: true,
    data: departments,
  });
};

const getDepartmentById = async (req, res) => {
  const departmentId = Number(req.params.id);
  const departments = await readData(fileName);

  // Find the department whose id matches the id from the URL.
  const department = departments.find((item) => {
    return item.departmentId === departmentId;
  });

  if (!department) {
    return res.status(404).json({
      success: false,
      message: "Department not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: department,
  });
};

const createDepartment = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Department name is required",
    });
  }

  const departments = await readData(fileName);

  const newDepartment = {
    departmentId: generateId(departments, "departmentId"),
    name,
  };

  departments.push(newDepartment);
  await writeData(fileName, departments);

  return res.status(201).json({
    success: true,
    message: "Department created successfully",
    data: newDepartment,
  });
};

const updateDepartment = async (req, res) => {
  const departmentId = Number(req.params.id);
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Department name is required",
    });
  }

  const departments = await readData(fileName);

  const department = departments.find((item) => {
    return item.departmentId === departmentId;
  });

  if (!department) {
    return res.status(404).json({
      success: false,
      message: "Department not found",
    });
  }

  department.name = name;
  await writeData(fileName, departments);

  return res.status(200).json({
    success: true,
    message: "Department updated successfully",
    data: department,
  });
};

const deleteDepartment = async (req, res) => {
  const departmentId = Number(req.params.id);
  const departments = await readData(fileName);

  const departmentExists = departments.some((item) => {
    return item.departmentId === departmentId;
  });

  if (!departmentExists) {
    return res.status(404).json({
      success: false,
      message: "Department not found",
    });
  }

  const updatedDepartments = departments.filter((item) => {
    return item.departmentId !== departmentId;
  });

  await writeData(fileName, updatedDepartments);

  return res.status(200).json({
    success: true,
    message: "Department deleted successfully",
  });
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
