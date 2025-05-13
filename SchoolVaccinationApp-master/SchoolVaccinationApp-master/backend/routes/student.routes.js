const express = require('express');
const studentController = require('../controllers/student.controller');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - name
 *         - studentId
 *         - class
 *         - section
 *         - age
 *         - gender
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the student
 *         studentId:
 *           type: string
 *           description: Unique identifier for the student
 *         class:
 *           type: string
 *           description: Class the student belongs to
 *         section:
 *           type: string
 *           description: Section within the class
 *         age:
 *           type: integer
 *           description: Age of the student
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *           description: Gender of the student
 *         vaccinations:
 *           type: array
 *           description: List of vaccination records
 *           items:
 *             type: object
 *             properties:
 *               drive:
 *                 type: string
 *                 description: ObjectId reference to the vaccination drive
 *               vaccineName:
 *                 type: string
 *                 description: Name of the vaccine
 *               dateAdministered:
 *                 type: string
 *                 format: date
 *                 description: Date when the vaccine was administered
 *               status:
 *                 type: string
 *                 enum: [Scheduled, Completed, Missed]
 *                 description: Vaccination status
 */


/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Retrieve a list of students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of students
 */
router.get('/', studentController.getAllStudents);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Student ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student details
 *       404:
 *         description: Student not found
 */
router.get('/:id', studentController.getStudentById);

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - class
 *             properties:
 *               name:
 *                 type: string
 *               class:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', studentController.createStudent);

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Student ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               class:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Student not found
 */
router.put('/:id', studentController.updateStudent);

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Student ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       404:
 *         description: Student not found
 */
router.delete('/:id', studentController.deleteStudent);

/**
 * @swagger
 * /api/students/{id}/vaccinate:
 *   post:
 *     summary: Mark student as vaccinated
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drive:
 *                 type: string
 *               vaccineName:
 *                 type: string
 *               dateAdministered:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Student Vaccinated successfully
 *       404:
 *         description: Student not found
 */
router.post('/:id/vaccinate', studentController.vaccinateStudent);

/**
 * @swagger
 * /api/students/import:
 *   post:
 *     summary: Bulk import students via CSV
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Students imported successfully
 */
router.post('/import', upload.single('file'), studentController.importStudents);

module.exports = router;
