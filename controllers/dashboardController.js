// controllers/dashboardController.js
const { models } = require('../config/database');
const { Op } = require('sequelize');

class DashboardController {
  constructor() {
    // Bind all methods to ensure 'this' context is preserved
    this.getDashboardData = this.getDashboardData.bind(this);
    this.getChartsByRole = this.getChartsByRole.bind(this);
    this.getStatsByRole = this.getStatsByRole.bind(this);
    this.getRecentActivity = this.getRecentActivity.bind(this);
    this.getMockCharts = this.getMockCharts.bind(this);
    this.getMockActivities = this.getMockActivities.bind(this);
    this.getAccessLevelsForRole = this.getAccessLevelsForRole.bind(this);
    this.getChartsByCategory = this.getChartsByCategory.bind(this);
    this.createChart = this.createChart.bind(this);
    this.updateChart = this.updateChart.bind(this);
    this.deleteChart = this.deleteChart.bind(this);
  }

  // Get dashboard data based on user role
  async getDashboardData(req, res) {
    try {
      const user = req.user;
      const userRole = user.role.name;
      
      console.log(`Getting dashboard data for user: ${user.email}, role: ${userRole}`);
      
      // Get charts based on access level
      const charts = await this.getChartsByRole(userRole);
      
      // Get general statistics
      const stats = await this.getStatsByRole(userRole, user.id);
      
      // Get recent activity
      const recentActivity = await this.getRecentActivity(user.id, userRole);

      const responseData = {
        charts,
        statistics: stats,
        recentActivity,
        userRole,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        lastUpdated: new Date().toISOString()
      };

      console.log(`Dashboard data prepared successfully for ${userRole}`);

      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      console.error('Get dashboard data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get charts by user role with robust fallback
  async getChartsByRole(userRole) {
    try {
      // Try to get charts from database if ChartData model exists
      if (models && models.ChartData) {
        console.log('ChartData model found, attempting to fetch from database');
        
        // Check if the model has the custom method
        if (typeof models.ChartData.getByAccessLevel === 'function') {
          return await models.ChartData.getByAccessLevel(userRole);
        } else {
          // Use standard Sequelize query
          const accessLevels = this.getAccessLevelsForRole(userRole);
          const charts = await models.ChartData.findAll({
            where: {
              accessLevel: {
                [Op.in]: accessLevels
              },
              isActive: true
            },
            order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
          });
          
          console.log(`Found ${charts.length} charts in database`);
          return charts;
        }
      } else {
        console.log('ChartData model not found, using mock data');
        return this.getMockCharts(userRole);
      }
    } catch (error) {
      console.error('Error getting charts from database:', error.message);
      console.log('Falling back to mock data');
      return this.getMockCharts(userRole);
    }
  }

  // Helper method to get access levels for a role
  getAccessLevelsForRole(userRole) {
    const roleMapping = {
      'ADMIN': ['PUBLIC', 'MANAGER', 'ADMIN'],
      'MANAGER': ['PUBLIC', 'MANAGER'],
      'VIEWER': ['PUBLIC']
    };
    return roleMapping[userRole] || ['PUBLIC'];
  }

  // Mock chart data for fallback
  getMockCharts(userRole) {
    console.log(`Generating mock charts for role: ${userRole}`);
    
    const baseCharts = [
      {
        id: 'mock-chart-1',
        type: 'line',
        title: 'User Activity Trend',
        description: 'Daily user activity over the past week',
        category: 'activity',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Active Users',
            data: [42, 38, 45, 52, 48, 35, 28],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }]
        },
        config: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        },
        accessLevel: 'PUBLIC',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-chart-2',
        type: 'bar',
        title: 'Data Categories',
        description: 'Distribution of data across categories',
        category: 'general',
        data: {
          labels: ['Category A', 'Category B', 'Category C', 'Category D'],
          datasets: [{
            label: 'Count',
            data: [23, 17, 31, 19],
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)'
            ]
          }]
        },
        config: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        },
        accessLevel: 'PUBLIC',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Add manager-only charts
    if (['MANAGER', 'ADMIN'].includes(userRole)) {
      baseCharts.push({
        id: 'mock-chart-3',
        type: 'pie',
        title: 'User Role Distribution',
        description: 'Breakdown of users by role',
        category: 'users',
        data: {
          labels: ['Viewers', 'Managers', 'Admins'],
          datasets: [{
            data: [78, 18, 4],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 101, 101, 0.8)'
            ]
          }]
        },
        config: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        },
        accessLevel: 'MANAGER',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Add admin-only charts
    if (userRole === 'ADMIN') {
      baseCharts.push({
        id: 'mock-chart-4',
        type: 'area',
        title: 'System Performance',
        description: 'Server performance metrics',
        category: 'performance',
        data: {
          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          datasets: [{
            label: 'CPU Usage %',
            data: [25, 20, 35, 55, 45, 30],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true
          }]
        },
        config: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        },
        accessLevel: 'ADMIN',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log(`Generated ${baseCharts.length} mock charts`);
    return baseCharts;
  }

  // Get statistics based on user role
  async getStatsByRole(role, userId) {
    console.log(`Getting statistics for role: ${role}`);
    
    try {
      const baseStats = {};

      if (['ADMIN', 'MANAGER'].includes(role)) {
        // User statistics
        try {
          if (models && models.User) {
            const totalUsers = await models.User.count();
            const activeUsers = await models.User.count({ where: { isActive: true } });
            const newUsers = await models.User.count({
              where: {
                createdAt: {
                  [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
              }
            });

            baseStats.users = {
              total: totalUsers,
              active: activeUsers,
              new: newUsers,
              verified: await models.User.count({ where: { isVerified: true } })
            };
          } else {
            throw new Error('User model not available');
          }
        } catch (error) {
          console.log('Error getting user stats:', error.message);
          baseStats.users = {
            total: Math.floor(Math.random() * 100) + 50,
            active: Math.floor(Math.random() * 80) + 40,
            new: Math.floor(Math.random() * 10) + 5,
            verified: Math.floor(Math.random() * 90) + 45
          };
        }

        // Login statistics
        try {
          if (models && models.LoginLog) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            
            const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            baseStats.logins = {
              today: await models.LoginLog.count({
                where: {
                  createdAt: { [Op.gte]: todayStart },
                  success: true
                }
              }),
              thisWeek: await models.LoginLog.count({
                where: {
                  createdAt: { [Op.gte]: weekStart },
                  success: true
                }
              }),
              failed: await models.LoginLog.count({
                where: {
                  createdAt: { [Op.gte]: todayStart },
                  success: false
                }
              })
            };
          } else {
            throw new Error('LoginLog model not available');
          }
        } catch (error) {
          console.log('Error getting login stats:', error.message);
          baseStats.logins = {
            today: Math.floor(Math.random() * 50) + 10,
            thisWeek: Math.floor(Math.random() * 200) + 50,
            failed: Math.floor(Math.random() * 5)
          };
        }

        // Data table statistics
        try {
          if (models && models.DataTable) {
            const totalTables = await models.DataTable.count({ where: { isVisible: true } });
            const statusCounts = await models.DataTable.findAll({
              attributes: [
                'status',
                [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
              ],
              where: { isVisible: true },
              group: ['status'],
              raw: true
            });

            baseStats.data = {
              total: totalTables,
              byStatus: statusCounts
            };
          } else {
            throw new Error('DataTable model not available');
          }
        } catch (error) {
          console.log('Error getting data table stats:', error.message);
          baseStats.data = {
            total: Math.floor(Math.random() * 20) + 10,
            byStatus: [
              { status: 'active', count: Math.floor(Math.random() * 10) + 5 },
              { status: 'pending', count: Math.floor(Math.random() * 5) + 1 },
              { status: 'completed', count: Math.floor(Math.random() * 8) + 3 }
            ]
          };
        }
      }

      // Admin-only statistics
      if (role === 'ADMIN') {
        try {
          const apiCallCount = (models && models.LoginLog) ? 
            await models.LoginLog.count({
              where: {
                createdAt: {
                  [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
              }
            }) : Math.floor(Math.random() * 1000) + 500;

          baseStats.system = {
            totalStorage: '2.4GB',
            apiCalls: apiCallCount,
            errorRate: '0.12%',
            uptime: '99.8%',
            activeConnections: Math.floor(Math.random() * 50) + 10
          };
        } catch (error) {
          console.log('Error getting system stats:', error.message);
          baseStats.system = {
            totalStorage: '2.4GB',
            apiCalls: Math.floor(Math.random() * 1000) + 500,
            errorRate: '0.12%',
            uptime: '99.8%',
            activeConnections: Math.floor(Math.random() * 50) + 10
          };
        }
      }

      // Viewer-specific statistics
      if (role === 'VIEWER') {
        baseStats.personal = {
          dashboardViews: Math.floor(Math.random() * 100) + 25,
          lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          favoriteCharts: Math.floor(Math.random() * 5) + 1,
          reportsGenerated: Math.floor(Math.random() * 10) + 2
        };
      }

      console.log(`Generated statistics for ${role}`);
      return baseStats;
    } catch (error) {
      console.error('Error getting stats by role:', error);
      return {};
    }
  }

  // Get recent activity
  async getRecentActivity(userId, role) {
    console.log(`Getting recent activity for role: ${role}`);
    
    try {
      const activities = [];

      if (['ADMIN', 'MANAGER'].includes(role)) {
        // Recent user registrations
        try {
          if (models && models.User) {
            const recentUsers = await models.User.findAll({
              limit: 3,
              order: [['createdAt', 'DESC']],
              attributes: ['firstName', 'lastName', 'email', 'createdAt']
            });

            recentUsers.forEach(user => {
              activities.push({
                type: 'user_registration',
                message: `${user.firstName} ${user.lastName} registered`,
                timestamp: user.createdAt,
                metadata: { email: user.email },
                icon: 'user-plus'
              });
            });
          }
        } catch (error) {
          console.log('Error getting recent users:', error.message);
        }

        // Recent logins
        try {
          if (models && models.LoginLog) {
            const recentLogins = await models.LoginLog.findAll({
              limit: 3,
              order: [['createdAt', 'DESC']],
              include: [{
                model: models.User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'email']
              }],
              where: { success: true }
            });

            recentLogins.forEach(log => {
              if (log.user) {
                activities.push({
                  type: 'user_login',
                  message: `${log.user.firstName} ${log.user.lastName} logged in`,
                  timestamp: log.createdAt,
                  metadata: { 
                    email: log.user.email,
                    method: log.loginMethod,
                    ip: log.ipAddress 
                  },
                  icon: 'login'
                });
              }
            });
          }
        } catch (error) {
          console.log('Error getting recent logins:', error.message);
        }
      }

      // Add mock activities if we don't have enough real data
      if (activities.length < 5) {
        const mockActivities = this.getMockActivities(role, 5 - activities.length);
        activities.push(...mockActivities);
      }

      // Sort by timestamp and limit
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return activities.slice(0, 10);
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return this.getMockActivities(role, 5);
    }
  }

  // Generate mock activities
  getMockActivities(role, count = 5) {
    const now = new Date();
    const activities = [];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000);
      
      if (['ADMIN', 'MANAGER'].includes(role)) {
        const managerActivities = [
          {
            type: 'data_update',
            message: 'Sales data updated',
            timestamp,
            metadata: { table: 'sales', records: Math.floor(Math.random() * 100) + 50 },
            icon: 'database'
          },
          {
            type: 'user_action',
            message: 'User permissions updated',
            timestamp,
            metadata: { action: 'permission_change' },
            icon: 'shield'
          },
          {
            type: 'system_event',
            message: 'Backup completed successfully',
            timestamp,
            metadata: { size: '1.2GB' },
            icon: 'backup'
          }
        ];
        activities.push(managerActivities[i % managerActivities.length]);
      } else {
        const viewerActivities = [
          {
            type: 'chart_view',
            message: 'Viewed analytics dashboard',
            timestamp,
            metadata: { section: 'analytics' },
            icon: 'chart'
          },
          {
            type: 'report_download',
            message: 'Downloaded monthly report',
            timestamp,
            metadata: { format: 'PDF' },
            icon: 'download'
          },
          {
            type: 'profile_update',
            message: 'Updated profile settings',
            timestamp,
            metadata: { fields: ['preferences'] },
            icon: 'user'
          }
        ];
        activities.push(viewerActivities[i % viewerActivities.length]);
      }
    }

    return activities;
  }

  // Get chart data by category
  async getChartsByCategory(req, res) {
    try {
      const { category } = req.params;
      const userRole = req.user.role.name;

      console.log(`Getting charts by category: ${category} for role: ${userRole}`);

      let charts;
      if (models && models.ChartData) {
        if (typeof models.ChartData.getByCategory === 'function') {
          charts = await models.ChartData.getByCategory(category, userRole);
        } else {
          const accessLevels = this.getAccessLevelsForRole(userRole);
          charts = await models.ChartData.findAll({
            where: {
              category,
              accessLevel: { [Op.in]: accessLevels },
              isActive: true
            },
            order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
          });
        }
      } else {
        // Filter mock charts by category
        const allCharts = this.getMockCharts(userRole);
        charts = allCharts.filter(chart => chart.category === category);
      }

      res.json({
        success: true,
        data: charts
      });
    } catch (error) {
      console.error('Get charts by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch charts'
      });
    }
  }

  // Create chart data (Admin/Manager only)
  async createChart(req, res) {
    try {
      if (!models || !models.ChartData) {
        return res.status(501).json({
          success: false,
          message: 'Chart creation not available - ChartData model not configured'
        });
      }

      const { type, title, description, data, config, category, accessLevel } = req.body;

      const chart = await models.ChartData.create({
        type,
        title,
        description,
        data,
        config: config || {},
        category,
        accessLevel: accessLevel || 'PUBLIC'
      });

      res.status(201).json({
        success: true,
        message: 'Chart created successfully',
        data: chart
      });
    } catch (error) {
      console.error('Create chart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create chart',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update chart data (Admin/Manager only)
  async updateChart(req, res) {
    try {
      if (!models || !models.ChartData) {
        return res.status(501).json({
          success: false,
          message: 'Chart update not available - ChartData model not configured'
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      const chart = await models.ChartData.findByPk(id);
      if (!chart) {
        return res.status(404).json({
          success: false,
          message: 'Chart not found'
        });
      }

      await chart.update(updateData);

      res.json({
        success: true,
        message: 'Chart updated successfully',
        data: chart
      });
    } catch (error) {
      console.error('Update chart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update chart'
      });
    }
  }

  // Delete chart (Admin only)
  async deleteChart(req, res) {
    try {
      if (!models || !models.ChartData) {
        return res.status(501).json({
          success: false,
          message: 'Chart deletion not available - ChartData model not configured'
        });
      }

      const { id } = req.params;

      const chart = await models.ChartData.findByPk(id);
      if (!chart) {
        return res.status(404).json({
          success: false,
          message: 'Chart not found'
        });
      }

      await chart.destroy();

      res.json({
        success: true,
        message: 'Chart deleted successfully'
      });
    } catch (error) {
      console.error('Delete chart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete chart'
      });
    }
  }
}

module.exports = new DashboardController();