const express = require("express")
const reportController = require("../controllers/report.controller")

const router = express.Router()

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Generate a vaccination report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vaccineName
 *         schema:
 *           type: string
 *         description: Filter by vaccine name
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report
 *       - in: query
 *         name: class
 *         schema:
 *           type: string
 *         description: Filter by class
 *     responses:
 *       200:
 *         description: Report generated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", reportController.generateReport)

/**
 * @swagger
 * /api/reports/vaccines:
 *   get:
 *     summary: Get vaccine statistics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vaccine statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/vaccines", reportController.getVaccineStats)

/**
 * @swagger
 * /api/reports/class-stats:
 *   get:
 *     summary: Get vaccination statistics by class
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Class statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/class-stats", reportController.getClassStats)

/**
 * @swagger
 * /api/reports/available-vaccines:
 *   get:
 *     summary: Get list of available vaccines
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available vaccines retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/available-vaccines", reportController.getAvailableVaccines)

module.exports = router
