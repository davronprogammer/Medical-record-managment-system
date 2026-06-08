const express = require("express");
const patientsController = require("../controllers/patients.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { ADMIN, CLINICIAN, RECEPTIONIST } = require("../config/roles");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management routes
 */

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: Patients returned successfully
 */
router.get("/", patientsController.getPatients);

/**
 * @swagger
 * /api/patients/search:
 *   get:
 *     summary: Search patients by name
 *     description: Performs a case-insensitive partial search using the patient's full name.
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         example: john
 *     responses:
 *       200:
 *         description: Matching patients returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - patientId: 1
 *                   fullName: John Doe
 */
router.get("/search", patientsController.searchPatients);

/**
 * @swagger
 * /api/patients/{id}/profile:
 *   get:
 *     summary: Get full patient medical profile
 *     description: Protected route for ADMIN and CLINICIAN users. Combines patient, assigned doctor, department, and disease records into one response.
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Full patient profile returned successfully
 *         content:
 *           application/json:
 *             example:
 *               patient:
 *                 patientId: 1
 *                 fullName: John Doe
 *                 age: 35
 *                 gender: Male
 *                 phone: "+998901234567"
 *                 address: Tashkent
 *               doctor:
 *                 doctorId: 1
 *                 fullName: Ali Karimov
 *                 specialization: Cardiology
 *               department:
 *                 departmentId: 1
 *                 name: Cardiology
 *               diseases:
 *                 - diseaseId: 1
 *                   icdCode: I10
 *                   description: Hypertension
 *                 - diseaseId: 2
 *                   icdCode: E11
 *                   description: Type 2 Diabetes
 *       404:
 *         description: Patient not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Patient not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:id/profile",
  authenticate,
  authorize(ADMIN, CLINICIAN),
  patientsController.getPatientProfile
);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get one patient by id
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Patient returned successfully
 *       404:
 *         description: Patient not found
 */
router.get("/:id", patientsController.getPatientById);

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Create a patient
 *     description: Protected route. ADMIN, CLINICIAN and RECEPTIONIST users can create patients.
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - age
 *               - gender
 *               - phone
 *               - address
 *               - doctorId
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               age:
 *                 type: integer
 *                 example: 35
 *               gender:
 *                 type: string
 *                 example: Male
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *               address:
 *                 type: string
 *                 example: Tashkent
 *               doctorId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Missing required fields or doctor not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  authenticate,
  authorize(ADMIN, CLINICIAN, RECEPTIONIST),
  patientsController.createPatient
);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Update a patient
 *     description: Protected route. ADMIN, CLINICIAN and RECEPTIONIST users can update patients.
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - age
 *               - gender
 *               - phone
 *               - address
 *               - doctorId
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               age:
 *                 type: integer
 *                 example: 36
 *               gender:
 *                 type: string
 *                 example: Male
 *               phone:
 *                 type: string
 *                 example: "+998901111111"
 *               address:
 *                 type: string
 *                 example: Samarkand
 *               doctorId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       400:
 *         description: Missing required fields or doctor not found
 *       404:
 *         description: Patient not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  authenticate,
  authorize(ADMIN, CLINICIAN, RECEPTIONIST),
  patientsController.updatePatient
);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Delete a patient
 *     description: Protected route. ADMIN, CLINICIAN and RECEPTIONIST users can delete patients.
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       404:
 *         description: Patient not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN, CLINICIAN, RECEPTIONIST),
  patientsController.deletePatient
);

module.exports = router;
