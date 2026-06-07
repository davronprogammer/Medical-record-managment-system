const express = require("express");
const doctorsController = require("../controllers/doctors.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { ADMIN } = require("../config/roles");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management routes
 */

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Doctors returned successfully
 */
router.get("/", doctorsController.getDoctors);

/**
 * @swagger
 * /api/doctors/search:
 *   get:
 *     summary: Search doctors by name
 *     description: Performs a case-insensitive partial search using the doctor's full name.
 *     tags: [Doctors]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         example: ali
 *     responses:
 *       200:
 *         description: Matching doctors returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - doctorId: 1
 *                   fullName: Ali Karimov
 */
router.get("/search", doctorsController.searchDoctors);

/**
 * @swagger
 * /api/doctors/filter:
 *   get:
 *     summary: Filter doctors by department
 *     description: Returns doctors who belong to the departmentId provided in the query string.
 *     tags: [Doctors]
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Matching doctors returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - doctorId: 1
 *                   fullName: Ali Karimov
 *                   specialization: Cardiology
 *                   departmentId: 1
 *                   phone: "+998901234567"
 *                   email: ali@gmail.com
 */
router.get("/filter", doctorsController.filterDoctorsByDepartment);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get one doctor by id
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Doctor returned successfully
 *       404:
 *         description: Doctor not found
 */
router.get("/:id", doctorsController.getDoctorById);

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Create a doctor
 *     description: Protected route. Only ADMIN users can create doctors.
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - specialization
 *               - departmentId
 *               - phone
 *               - email
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Ali Karimov
 *               specialization:
 *                 type: string
 *                 example: Cardiology
 *               departmentId:
 *                 type: integer
 *                 example: 1
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *               email:
 *                 type: string
 *                 example: ali@gmail.com
 *     responses:
 *       201:
 *         description: Doctor created successfully
 *       400:
 *         description: Missing required fields or department not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", authenticate, authorize(ADMIN), doctorsController.createDoctor);

/**
 * @swagger
 * /api/doctors/{id}:
 *   put:
 *     summary: Update a doctor
 *     description: Protected route. Only ADMIN users can update doctors.
 *     tags: [Doctors]
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
 *               - specialization
 *               - departmentId
 *               - phone
 *               - email
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Ali Karimov
 *               specialization:
 *                 type: string
 *                 example: Neurology
 *               departmentId:
 *                 type: integer
 *                 example: 2
 *               phone:
 *                 type: string
 *                 example: "+998901111111"
 *               email:
 *                 type: string
 *                 example: ali@example.com
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 *       400:
 *         description: Missing required fields or department not found
 *       404:
 *         description: Doctor not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/:id", authenticate, authorize(ADMIN), doctorsController.updateDoctor);

/**
 * @swagger
 * /api/doctors/{id}:
 *   delete:
 *     summary: Delete a doctor
 *     description: Protected route. Only ADMIN users can delete doctors.
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       404:
 *         description: Doctor not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete("/:id", authenticate, authorize(ADMIN), doctorsController.deleteDoctor);

module.exports = router;
