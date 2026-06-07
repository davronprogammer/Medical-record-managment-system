const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { ADMIN, CLINICIAN, RECEPTIONIST } = require("../config/roles");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard summary and recent activity routes
 */

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Protected route for ADMIN, CLINICIAN, and RECEPTIONIST users.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard statistics returned successfully
 *         content:
 *           application/json:
 *             example:
 *               totalDepartments: 5
 *               totalDoctors: 12
 *               totalPatients: 58
 *               totalDiseases: 41
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/stats",
  authenticate,
  authorize(ADMIN, CLINICIAN, RECEPTIONIST),
  dashboardController.getStats
);

/**
 * @swagger
 * /api/dashboard/recent-patients:
 *   get:
 *     summary: Get recently added patients
 *     description: Protected route for ADMIN, CLINICIAN, and RECEPTIONIST users. Returns the latest 5 patients using patientId descending order.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Recent patients returned successfully
 *         content:
 *           application/json:
 *             example:
 *               - patientId: 10
 *                 fullName: John Doe
 *               - patientId: 9
 *                 fullName: Jane Smith
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/recent-patients",
  authenticate,
  authorize(ADMIN, CLINICIAN, RECEPTIONIST),
  dashboardController.getRecentPatients
);

/**
 * @swagger
 * /api/dashboard/recent-diseases:
 *   get:
 *     summary: Get recently added disease records
 *     description: Protected route for ADMIN, CLINICIAN, and RECEPTIONIST users. Returns the latest 5 disease records using diseaseId descending order.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Recent disease records returned successfully
 *         content:
 *           application/json:
 *             example:
 *               - diseaseId: 12
 *                 description: Hypertension
 *               - diseaseId: 11
 *                 description: Diabetes
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/recent-diseases",
  authenticate,
  authorize(ADMIN, CLINICIAN, RECEPTIONIST),
  dashboardController.getRecentDiseases
);

module.exports = router;
