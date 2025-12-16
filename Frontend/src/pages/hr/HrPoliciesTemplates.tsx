/**
 * HR Policies & Templates - Manage company policies and document templates
 */

import React, { useState } from 'react';
import { 
  FiFileText, 
  FiDownload, 
  FiEdit2, 
  FiPlus, 
  FiSearch,
  FiFilter,
  FiCalendar,
  FiUser,
  FiTag
} from 'react-icons/fi';

export const HrPoliciesTemplates = () => {
  console.log('HR Policies & Templates rendering...');
  
  const [activeTab, setActiveTab] = useState<'policies' | 'templates'>('policies');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock policies data - TODO: Replace with API data
  const policies = [
    {
      id: 1,
      title: 'Employee Code of Conduct',
      category: 'Compliance',
      version: '2.1',
      lastUpdated: '2024-01-15',
      updatedBy: 'HR Team',
      description: 'Guidelines for professional behavior and ethical standards',
      status: 'active',
      type: 'policy',
      downloadCount: 156,
      size: '2.3 MB'
    },
    {
      id: 2,
      title: 'Remote Work Policy',
      category: 'Work Arrangements',
      version: '1.3',
      lastUpdated: '2024-01-10',
      updatedBy: 'Sarah Johnson',
      description: 'Guidelines and requirements for remote work arrangements',
      status: 'active',
      type: 'policy',
      downloadCount: 89,
      size: '1.8 MB'
    },
    {
      id: 3,
      title: 'Leave and Vacation Policy',
      category: 'Benefits',
      version: '3.0',
      lastUpdated: '2024-01-08',
      updatedBy: 'Mike Wilson',
      description: 'Comprehensive guide to leave types, accrual, and approval process',
      status: 'active',
      type: 'policy',
      downloadCount: 234,
      size: '1.5 MB'
    },
    {
      id: 4,
      title: 'Performance Review Process',
      category: 'Performance',
      version: '2.0',
      lastUpdated: '2023-12-20',
      updatedBy: 'Lisa Chen',
      description: 'Annual and quarterly performance review procedures',
      status: 'review',
      type: 'policy',
      downloadCount: 67,
      size: '2.1 MB'
    },
    {
      id: 5,
      title: 'Data Security and Privacy',
      category: 'Security',
      version: '1.5',
      lastUpdated: '2023-11-30',
      updatedBy: 'Security Team',
      description: 'Information security policies and data handling procedures',
      status: 'active',
      type: 'policy',
      downloadCount: 145,
      size: '3.2 MB'
    }
  ];

  // Mock templates data - TODO: Replace with API data
  const templates = [
    {
      id: 1,
      title: 'Offer Letter Template',
      category: 'Recruitment',
      version: '1.8',
      lastUpdated: '2024-01-12',
      updatedBy: 'HR Team',
      description: 'Standard offer letter template for new hires',
      status: 'active',
      type: 'template',
      downloadCount: 45,
      size: '256 KB'
    },
    {
      id: 2,
      title: 'Employee Onboarding Checklist',
      category: 'Onboarding',
      version: '2.2',
      lastUpdated: '2024-01-05',
      updatedBy: 'Sarah Johnson',
      description: 'Comprehensive checklist for new employee onboarding',
      status: 'active',
      type: 'template',
      downloadCount: 78,
      size: '512 KB'
    },
    {
      id: 3,
      title: 'Performance Review Form',
      category: 'Performance',
      version: '1.4',
      lastUpdated: '2023-12-18',
      updatedBy: 'Lisa Chen',
      description: 'Standard performance evaluation form',
      status: 'active',
      type: 'template',
      downloadCount: 92,
      size: '385 KB'
    },
    {
      id: 4,
      title: 'Exit Interview Template',
      category: 'Offboarding',
      version: '1.1',
      lastUpdated: '2023-12-10',
      updatedBy: 'Mike Wilson',
      description: 'Exit interview questionnaire and documentation',
      status: 'active',
      type: 'template',
      downloadCount: 23,
      size: '298 KB'
    },
    {
      id: 5,
      title: 'Disciplinary Action Form',
      category: 'HR Management',
      version: '2.0',
      lastUpdated: '2023-11-25',
      updatedBy: 'HR Legal',
      description: 'Documentation template for disciplinary actions',
      status: 'review',
      type: 'template',
      downloadCount: 12,
      size: '445 KB'
    }
  ];

  const currentData = activeTab === 'policies' ? policies : templates;
  
  const filteredData = currentData.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'review': return '#f59e0b';
      case 'draft': return '#6b7280';
      case 'archived': return '#9ca3af';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status: string) => {
    const color = getStatusColor(status);
    return (
      <span style={{
        backgroundColor: `${color}20`,
        color: color,
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase'
      }}>
        {status}
      </span>
    );
  };

  const categories = [...new Set(currentData.map(item => item.category))];

  // TODO: Add version control system
  // TODO: Add approval workflow
  // TODO: Add template builder

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#1f2937', 
          fontSize: '32px', 
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          Policies & Templates
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px'
        }}>
          Manage company policies and document templates
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('policies')}
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: 'transparent',
            fontSize: '16px',
            fontWeight: '600',
            color: activeTab === 'policies' ? '#2563eb' : '#6b7280',
            borderBottom: activeTab === 'policies' ? '2px solid #2563eb' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Policies ({policies.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: 'transparent',
            fontSize: '16px',
            fontWeight: '600',
            color: activeTab === 'templates' ? '#2563eb' : '#6b7280',
            borderBottom: activeTab === 'templates' ? '2px solid #2563eb' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Templates ({templates.length})
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <FiSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#6b7280'
            }} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151'
              }}
            />
          </div>

          <select style={{
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            color: '#374151'
          }}>
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <button style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FiPlus style={{ width: '16px', height: '16px' }} />
          Add {activeTab === 'policies' ? 'Policy' : 'Template'}
        </button>
      </div>

      {/* Document Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {filteredData.map((item) => (
          <div key={item.id} style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          }}>
            {/* Document Header */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiFileText style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                  <span style={{
                    backgroundColor: '#e2e8f0',
                    color: '#6b7280',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    <FiTag style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                    {item.category}
                  </span>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 8px 0',
                lineHeight: '1.3'
              }}>
                {item.title}
              </h3>

              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0',
                lineHeight: '1.4'
              }}>
                {item.description}
              </p>
            </div>

            {/* Document Meta */}
            <div style={{
              padding: '12px 0',
              borderTop: '1px solid #e2e8f0',
              borderBottom: '1px solid #e2e8f0',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCalendar style={{ width: '12px', height: '12px' }} />
                  Version {item.version}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiUser style={{ width: '12px', height: '12px' }} />
                  {item.updatedBy}
                </div>
                <div>Updated: {item.lastUpdated}</div>
                <div>Size: {item.size}</div>
              </div>
            </div>

            {/* Document Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>
                <FiDownload style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                {item.downloadCount} downloads
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <FiDownload style={{ width: '14px', height: '14px' }} />
                Download
              </button>

              <button style={{
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Edit">
                <FiEdit2 style={{ width: '14px', height: '14px', color: '#6b7280' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          textAlign: 'center'
        }}>
          <FiFileText style={{ width: '48px', height: '48px', color: '#d1d5db', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '8px' }}>
            No {activeTab} found
          </h3>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>
            {searchTerm ? 'Try adjusting your search terms' : `No ${activeTab} available yet`}
          </p>
        </div>
      )}

      {/* TODO: Add document viewer */}
      {/* TODO: Add version history */}
      {/* TODO: Add approval workflow */}
      {/* TODO: Add template builder with form fields */}
    </div>
  );
};