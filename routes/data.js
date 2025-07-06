const express = require('express');
const dataController = require('../controllers/dataController');
const { authenticateToken } = require('../middleware/auth');
const { hasRole, hasPermission } = require('../middleware/rbac');
const { validate, querySchemas } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/data/table:
 *   get:
 *     summary: Get paginated table data
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by priority
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Paginated table data
 */
router.get('/table', 
  authenticateToken, 
  dataController.getTableData
);

/**
 * @swagger
 * /api/data/categories:
 *   get:
 *     summary: Get all data categories
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', 
  authenticateToken, 
  dataController.getCategories
);

/**
 * @swagger
 * /api/data/statistics:
 *   get:
 *     summary: Get data statistics
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data statistics
 */
router.get('/statistics', 
  authenticateToken, 
  hasRole('MANAGER', 'ADMIN'), 
  dataController.getDataStatistics
);

/**
 * @swagger
 * /api/data/export:
 *   get:
 *     summary: Export data (Manager/Admin only)
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         description: Export format
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Exported data
 */
router.get('/export', 
  authenticateToken, 
  hasRole('MANAGER', 'ADMIN'), 
  dataController.exportData
);

/**
 * @swagger
 * /api/data/entries:
 *   post:
 *     summary: Create new data entry (Manager/Admin only)
 *     tags: [Data]
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
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               value:
 *                 type: number
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               metadata:
 *                 type: object
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               accessLevel:
 *                 type: string
 *                 enum: [PUBLIC, MANAGER, ADMIN]
 *     responses:
 *       201:
 *         description: Data entry created successfully
 */
router.post('/entries', 
  authenticateToken, 
  hasRole('MANAGER', 'ADMIN'), 
  dataController.createDataEntry
);

/**
 * @swagger
 * /api/data/entries/{id}:
 *   put:
 *     summary: Update data entry (Manager/Admin only)
 *     tags: [Data]
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
 *         description: Data entry updated successfully
 */
router.put('/entries/:id', 
  authenticateToken, 
  hasRole('MANAGER', 'ADMIN'), 
  dataController.updateDataEntry
);

/**
 * @swagger
 * /api/data/entries/{id}:
 *   delete:
 *     summary: Delete data entry (Admin only)
 *     tags: [Data]
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
 *         description: Data entry deleted successfully
 */
router.delete('/entries/:id', 
  authenticateToken, 
  hasRole('ADMIN'), 
  dataController.deleteDataEntry
);

/**
 * @swagger
 * /api/data/entries/bulk:
 *   put:
 *     summary: Bulk update data entries (Admin only)
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *               - updateData
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               updateData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Entries updated successfully
 */
router.put('/entries/bulk', 
  authenticateToken, 
  hasRole('ADMIN'), 
  dataController.bulkUpdateDataEntries
);

module.exports = router;