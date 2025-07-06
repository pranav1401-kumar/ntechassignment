const { models } = require('../config/database');

class DataController {
  // Get paginated table data
  async getTableData(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        search = '',
        category = '',
        status = '',
        priority = ''
      } = req.query;

      const userRole = req.user.role.name;
      const offset = (page - 1) * limit;

      const options = {
        category,
        status,
        priority,
        accessLevel: userRole,
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy,
        sortOrder
      };

      const result = await models.DataTable.search(search, options);

      const totalPages = Math.ceil(result.count / limit);

      res.json({
        success: true,
        data: {
          items: result.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: result.count,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Get table data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch table data'
      });
    }
  }

  // Get data categories
  async getCategories(req, res) {
    try {
      const categories = await models.DataTable.getCategories();
      
      res.json({
        success: true,
        data: categories.map(cat => cat.category)
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }
  }

  // Get data statistics
  async getDataStatistics(req, res) {
    try {
      const statistics = await models.DataTable.getStatistics();
      
      res.json({  success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Get data statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data statistics'
      });
    }
  }

  // Create new data entry (Manager/Admin only)
  async createDataEntry(req, res) {
    try {
      const {
        name,
        description,
        value,
        category,
        subcategory,
        status,
        priority,
        tags,
        metadata,
        startDate,
        endDate,
        progress,
        accessLevel
      } = req.body;

      const dataEntry = await models.DataTable.create({
        name,
        description,
        value,
        category,
        subcategory,
        status: status || 'active',
        priority: priority || 'medium',
        tags: tags || [],
        metadata: metadata || {},
        startDate,
        endDate,
        progress: progress || 0,
        accessLevel: accessLevel || 'PUBLIC'
      });

      res.status(201).json({
        success: true,
        message: 'Data entry created successfully',
        data: dataEntry
      });
    } catch (error) {
      console.error('Create data entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create data entry'
      });
    }
  }

  // Update data entry (Manager/Admin only)
  async updateDataEntry(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const dataEntry = await models.DataTable.findByPk(id);
      if (!dataEntry) {
        return res.status(404).json({
          success: false,
          message: 'Data entry not found'
        });
      }

      // Check if user has permission to edit this entry
      if (!dataEntry.isAccessibleBy(req.user.role.name)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to edit this entry'
        });
      }

      await dataEntry.update(updateData);

      res.json({
        success: true,
        message: 'Data entry updated successfully',
        data: dataEntry
      });
    } catch (error) {
      console.error('Update data entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update data entry'
      });
    }
  }

  // Delete data entry (Admin only)
  async deleteDataEntry(req, res) {
    try {
      const { id } = req.params;

      const dataEntry = await models.DataTable.findByPk(id);
      if (!dataEntry) {
        return res.status(404).json({
          success: false,
          message: 'Data entry not found'
        });
      }

      await dataEntry.destroy();

      res.json({
        success: true,
        message: 'Data entry deleted successfully'
      });
    } catch (error) {
      console.error('Delete data entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete data entry'
      });
    }
  }

  // Bulk operations (Admin only)
  async bulkUpdateDataEntries(req, res) {
    try {
      const { ids, updateData } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or empty IDs array'
        });
      }

      const result = await models.DataTable.update(updateData, {
        where: {
          id: ids
        }
      });

      res.json({
        success: true,
        message: `${result[0]} entries updated successfully`,
        data: { updatedCount: result[0] }
      });
    } catch (error) {
      console.error('Bulk update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update data entries'
      });
    }
  }

  // Export data (Manager/Admin only)
  async exportData(req, res) {
    try {
      const { format = 'json', category, status } = req.query;
      const userRole = req.user.role.name;

      const whereClause = { isVisible: true };
      
      if (category) whereClause.category = category;
      if (status) whereClause.status = status;

      // Apply access level filter
      const accessLevels = {
        'VIEWER': ['PUBLIC'],
        'MANAGER': ['PUBLIC', 'MANAGER'],
        'ADMIN': ['PUBLIC', 'MANAGER', 'ADMIN'],
      };
      whereClause.accessLevel = accessLevels[userRole] || ['PUBLIC'];

      const data = await models.DataTable.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });

      if (format === 'csv') {
        // Convert to CSV format
        const csv = this.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=data_export.csv');
        return res.send(csv);
      }

      res.json({
        success: true,
        data,
        meta: {
          exportedAt: new Date().toISOString(),
          totalRecords: data.length,
          format
        }
      });
    } catch (error) {
      console.error('Export data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export data'
      });
    }
  }

  // Helper method to convert data to CSV
  convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0].toJSON());
    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        return headers.map(header => {
          const value = row[header];
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
      })
    ].join('\n');

    return csvContent;
  }
}

module.exports = new DataController();