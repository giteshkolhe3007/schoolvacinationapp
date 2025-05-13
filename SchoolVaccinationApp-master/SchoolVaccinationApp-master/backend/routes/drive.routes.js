const express = require('express');
const driveController = require('../controllers/drive.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Vaccination Drives
 *     description: Managing vaccination drives
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VaccinationDrive:
 *       type: object
 *       required:
 *         - vaccineName
 *         - date
 *         - availableDoses
 *         - applicableClasses
 *       properties:
 *         vaccineName:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         availableDoses:
 *           type: integer
 *           minimum: 1
 *         applicableClasses:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [Scheduled, Completed, Cancelled]
 *         createdBy:
 *           type: string
 *           description: ObjectId of the user who created the drive
 */

/**
 * @swagger
 * /api/drives:
 *   get:
 *     summary: Get all vaccination drives
 *     tags: [Vaccination Drives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vaccination drives
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VaccinationDrive'
 */
router.get('/', driveController.getAllDrives);

/**
 * @swagger
 * /api/drives/{id}:
 *   get:
 *     summary: Get a vaccination drive by ID
 *     tags: [Vaccination Drives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vaccination drive details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VaccinationDrive'
 */
router.get('/:id', driveController.getDriveById);

/**
 * @swagger
 * /api/drives:
 *   post:
 *     summary: Create a new vaccination drive
 *     tags: [Vaccination Drives]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VaccinationDrive'
 *     responses:
 *       201:
 *         description: Vaccination drive created
 */
router.post('/', driveController.createDrive);

/**
 * @swagger
 * /api/drives/{id}:
 *   put:
 *     summary: Update a vaccination drive
 *     tags: [Vaccination Drives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VaccinationDrive'
 *     responses:
 *       200:
 *         description: Vaccination drive updated
 */
router.put('/:id', driveController.updateDrive);

/**
 * @swagger
 * /api/drives/{id}:
 *   delete:
 *     summary: Delete a vaccination drive
 *     tags: [Vaccination Drives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VaccinationDrive'
 *     responses:
 *       200:
 *         description: Vaccination drive deleted
 */
router.delete("/:id", driveController.deleteDrive)

/**
 * @swagger
 * /api/drives/{id}/cancel:
 *   patch:
 *     summary: Cancel a vaccination drive
 *     tags: [Vaccination Drives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vaccination drive cancelled
 */
router.patch('/:id/cancel', driveController.cancelDrive);

/**
 * @swagger
 * /api/drives/{id}/complete:
 *   patch:
 *     summary: Mark a vaccination drive as completed
 *     tags: [Vaccination Drives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vaccination drive marked as completed
 */
router.patch('/:id/complete', driveController.completeDrive);

/**
 * @swagger
 * /api/drives/{id}/students:
 *   get:
 *     summary: Get students for a specific vaccination drive
 *     tags: [Vaccination Drives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Vaccination drive ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of students for the drive
 */
router.get('/:id/students', driveController.getDriveStudents);

module.exports = router;
