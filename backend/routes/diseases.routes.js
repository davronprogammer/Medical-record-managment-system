const express = require("express");
const diseasesController = require("../controllers/diseases.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { ADMIN, CLINICIAN } = require("../config/roles");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Diseases
 *   description: Disease record management routes
 */

/**
 * @swagger
 * /api/diseases:
 *   get:
 *     summary: Get all disease records
 *     tags: [Diseases]
 *     responses:
 *       200:
 *         description: Disease records returned successfully
 */
router.get("/", diseasesController.getDiseases);

/**
 * @swagger
 * /api/diseases/search:
 *   get:
 *     summary: Search disease records
 *     description: Performs a case-insensitive partial search by ICD code or disease description.
 *     tags: [Diseases]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         example: diabetes
 *     responses:
 *       200:
 *         description: Matching disease records returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - diseaseId: 2
 *                   patientId: 1
 *                   icdCode: E11
 *                   description: Type 2 Diabetes
 */
router.get("/search", diseasesController.searchDiseases);

/**
 * @swagger
 * /api/diseases/{id}:
 *   get:
 *     summary: Get one disease record by id
 *     tags: [Diseases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Disease record returned successfully
 *       404:
 *         description: Disease not found
 */
router.get("/:id", diseasesController.getDiseaseById);

/**
 * @swagger
 * /api/diseases:
 *   post:
 *     summary: Create a disease record
 *     description: Protected route. ADMIN and CLINICIAN users can create disease records.
 *     tags: [Diseases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - icdCode
 *               - description
 *             properties:
 *               patientId:
 *                 type: integer
 *                 example: 1
 *               icdCode:
 *                 type: string
 *                 example: I10
 *               description:
 *                 type: string
 *                 example: Hypertension
 *     responses:
 *       201:
 *         description: Disease record created successfully
 *       400:
 *         description: Missing required fields or patient not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", authenticate, authorize(ADMIN, CLINICIAN), diseasesController.createDisease);

/**
 * @swagger
 * /api/diseases/{id}:
 *   put:
 *     summary: Update a disease record
 *     description: Protected route. ADMIN and CLINICIAN users can update disease records.
 *     tags: [Diseases]
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
 *               - patientId
 *               - icdCode
 *               - description
 *             properties:
 *               patientId:
 *                 type: integer
 *                 example: 1
 *               icdCode:
 *                 type: string
 *                 example: E11
 *               description:
 *                 type: string
 *                 example: Type 2 Diabetes
 *     responses:
 *       200:
 *         description: Disease record updated successfully
 *       400:
 *         description: Missing required fields or patient not found
 *       404:
 *         description: Disease not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/:id", authenticate, authorize(ADMIN, CLINICIAN), diseasesController.updateDisease);

/**
 * @swagger
 * /api/diseases/{id}:
 *   delete:
 *     summary: Delete a disease record
 *     description: Protected route. ADMIN and CLINICIAN users can delete disease records.
 *     tags: [Diseases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Disease record deleted successfully
 *       404:
 *         description: Disease not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete("/:id", authenticate, authorize(ADMIN, CLINICIAN), diseasesController.deleteDisease);

module.exports = router;
