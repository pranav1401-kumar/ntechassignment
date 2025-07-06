// src/components/dashboard/Charts.js - Complete Implementation
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { selectCharts } from '../../redux/slices/dashboardSlice';

const Charts = () => {
  const charts = useSelector(selectCharts);
  const chartRefs = useRef([]);

  useEffect(() => {
    // Update chart themes
    Highcharts.setOptions({
      colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b'],
      chart: {
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      },
      title: {
        style: {
          color: '#1f2937',
          fontSize: '16px',
          fontWeight: '600',
        },
      },
      legend: {
        itemStyle: {
          color: '#6b7280',
          fontSize: '12px',
        },
      },
      xAxis: {
        labels: {
          style: {
            color: '#6b7280',
            fontSize: '11px',
          },
        },
        title: {
          style: {
            color: '#374151',
            fontSize: '12px',
          },
        },
      },
      yAxis: {
        labels: {
          style: {
            color: '#6b7280',
            fontSize: '11px',
          },
        },
        title: {
          style: {
            color: '#374151',
            fontSize: '12px',
          },
        },
      },
    });
  }, []);

  const getChartOptions = (chart) => {
    const baseOptions = {
      chart: {
        type: chart.type,
        height: 300,
      },
      title: {
        text: chart.title,
      },
      credits: {
        enabled: false,
      },
      ...chart.config,
    };

    // Handle different chart types
    switch (chart.type) {
      case 'pie':
        return {
          ...baseOptions,
          series: chart.data.series,
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
              },
              showInLegend: true,
            },
          },
        };
      
      case 'line':
      case 'spline':
      case 'area':
        return {
          ...baseOptions,
          xAxis: {
            categories: chart.data.categories,
            ...baseOptions.xAxis,
          },
          series: chart.data.series,
          plotOptions: {
            [chart.type]: {
              marker: {
                enabled: true,
                radius: 4,
              },
            },
          },
        };
      
      case 'column':
      case 'bar':
        return {
          ...baseOptions,
          xAxis: {
            categories: chart.data.categories,
            ...baseOptions.xAxis,
          },
          series: chart.data.series,
          plotOptions: {
            [chart.type]: {
              dataLabels: {
                enabled: false,
              },
            },
          },
        };
      
      default:
        return {
          ...baseOptions,
          xAxis: {
            categories: chart.data.categories,
            ...baseOptions.xAxis,
          },
          series: chart.data.series,
        };
    }
  };

  if (!charts || charts.length === 0) {
    return (
      <div className="bg-white shadow-soft rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics</h3>
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No charts available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Charts will appear here once data is available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {charts.slice(0, 2).map((chart, index) => (
        <div key={chart.id || index} className="bg-white shadow-soft rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">{chart.title}</h3>
            {chart.description && (
              <p className="text-sm text-gray-500">{chart.description}</p>
            )}
          </div>
          <HighchartsReact
            highcharts={Highcharts}
            options={getChartOptions(chart)}
            ref={(el) => (chartRefs.current[index] = el)}
          />
        </div>
      ))}
    </div>
  );
};

export default Charts;