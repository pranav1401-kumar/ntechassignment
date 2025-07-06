// routes/dashboard.js
const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');
const { hasRole, hasPermission } = require('../middleware/rbac');

const router = express.Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data based on user role
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     charts:
 *                       type: array
 *                     statistics:
 *                       type: object
 *                     recentActivity:
 *                       type: array
 *                     userRole:
 *                       type: string
 */
router.get('/', 
  authenticateToken, 
  dashboardController.getDashboardData
);

/**
 * @swagger
 * /api/dashboard/charts/{category}:
 *   get:
 *     summary: Get charts by category
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Charts for the specified category
 */
router.get('/charts/:category', 
  authenticateToken, 
  dashboardController.getChartsByCategory
);

/**
 * @swagger
 * /api/dashboard/charts:
 *   post:
 *     summary: Create new chart (Manager/Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - data
 *               - category
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [line, bar, pie, area, column, spline]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               data:
 *                 type: object
 *               config:
 *                 type: object
 *               category:
 *                 type: string
 *               accessLevel:
 *                 type: string
 *                 enum: [PUBLIC, MANAGER, ADMIN]
 *     responses:
 *       201:
 *         description: Chart created successfully
 */
router.post('/charts', 
  authenticateToken, 
  hasRole('MANAGER', 'ADMIN'), 
  dashboardController.createChart
);

/**
 * @swagger
 * /api/dashboard/charts/{id}:
 *   put:
 *     summary: Update chart (Manager/Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chart updated successfully
 */
router.put('/charts/:id', 
  authenticateToken, 
  hasRole('MANAGER', 'ADMIN'), 
  dashboardController.updateChart
);

/**
 * @swagger
 * /api/dashboard/charts/{id}:
 *   delete:
 *     summary: Delete chart (Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chart deleted successfully
 */
router.delete('/charts/:id', 
  authenticateToken, 
  hasRole('ADMIN'), 
  dashboardController.deleteChart
);

module.exports = router;