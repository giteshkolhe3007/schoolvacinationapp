const express = require("express")
const authController = require("../controllers/auth.controller")
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated unique identifier for the user
 *         username:
 *           type: string
 *           description: Unique username of the user
 *         password:
 *           type: string
 *           description: Hashed password of the user
 *         role:
 *           type: string
 *           enum: [admin]
 *           default: admin
 *           description: Role of the user (only 'admin' supported)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of user creation
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last update
 *       example:
 *         id: 60d21b4667d0d8992e610c85
 *         username: admin
 *         password: $2a$10$hashedpassword
 *         role: admin
 *         createdAt: 2023-05-10T08:15:00.000Z
 *         updatedAt: 2023-05-10T08:15:00.000Z
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authController.login)

module.exports = router
