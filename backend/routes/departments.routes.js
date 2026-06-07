const express = require("express");
const departmentsController = require("../controllers/departments.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { ADMIN } = require("../config/roles");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management routes
 */

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: Departments returned successfully
 */
router.get("/", departmentsController.getDepartments);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get one department by id
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Department returned successfully
 *       404:
 *         description: Department not found
 */
router.get("/:id", departmentsController.getDepartmentById);

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create a department
 *     description: Protected route. Only ADMIN users can create departments.
 *     tags: [Departments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cardiology
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Department name is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", authenticate, authorize(ADMIN), departmentsController.createDepartment);

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Update a department
 *     description: Protected route. Only ADMIN users can update departments.
 *     tags: [Departments]
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Neurology
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       400:
 *         description: Department name is required
 *       404:
 *         description: Department not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/:id", authenticate, authorize(ADMIN), departmentsController.updateDepartment);

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete a department
 *     description: Protected route. Only ADMIN users can delete departments.
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       404:
 *         description: Department not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete("/:id", authenticate, authorize(ADMIN), departmentsController.deleteDepartment);

module.exports = router;
