import React, { useState } from 'react'
import { adminAPI } from '../api'
import '../styles/Dashboard.css'

function Analytics() {
  const [exporting, setExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState('')

  const handleExportCSV = async () => {
    setExporting(true)
    setExportMessage('')
    try {
      const response = await adminAPI.exportCSV()
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `submissions_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setExportMessage('CSV exported successfully!')
      setTimeout(() => setExportMessage(''), 3000)
    } catch (err) {
      setExportMessage('Failed to export CSV: ' + (err.response?.data?.detail || err.message))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-section-title">Analytics & Reports</h2>
      
      <div className="dashboard-card" style={{ marginBottom: '24px' }}>
        <h3 className="dashboard-card-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2L2 6V10C2 14.55 5.36 18.74 10 20C14.64 18.74 18 14.55 18 10V6L10 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 10L12 12L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Data Export
        </h3>
        <p style={{ 
          marginBottom: '24px', 
          color: '#4a5568',
          fontSize: '15px',
          lineHeight: '1.6'
        }}>
          Export all production card data, submissions, and user information to CSV format. 
          The exported file includes detailed production metrics including operator information, 
          machine details, production quantities, and quality metrics.
        </p>
        
        {exportMessage && (
          <div className={`message ${exportMessage.includes('success') ? 'message-success' : 'message-error'}`} style={{ marginBottom: '20px' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              {exportMessage.includes('success') ? (
                <path d="M15 4.5L6.75 12.75L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <>
                  <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 13H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </>
              )}
            </svg>
            <span>{exportMessage}</span>
          </div>
        )}

        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="btn btn-success"
          style={{ minWidth: '180px' }}
        >
          {exporting ? (
            <>
              <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              Exporting...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 12V14.5C15 15.3284 14.3284 16 13.5 16H4.5C3.67157 16 3 15.3284 3 14.5V12M12 9L9 12M9 12L6 9M9 12V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export to CSV
            </>
          )}
        </button>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 161, 105, 0.1) 100%)',
          border: '1px solid rgba(72, 187, 120, 0.2)',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#22543d'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 1V9M9 9L17 1M9 9L1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <strong>Export Format</strong>
          </div>
          <p style={{ margin: 0, lineHeight: '1.6' }}>
            The CSV file includes: date, operator name, machine name, part details, operation name, 
            production time, cycle time, target quantities, produced quantities, percentage calculations, 
            rejection and rework quantities, and remarks.
          </p>
        </div>
      </div>

      <div className="dashboard-card">
        <h3 className="dashboard-card-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2H2C0.9 2 0 2.9 0 4V16C0 17.1 0.9 18 2 18H18C19.1 18 20 17.1 20 16V4C20 2.9 19.1 2 18 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 8H14M6 12H14M6 4H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Reports & Analytics
        </h3>
        <p style={{ 
          marginBottom: '24px', 
          color: '#4a5568',
          fontSize: '15px',
          lineHeight: '1.6'
        }}>
          Comprehensive analytics and reporting features to help you track and analyze production performance.
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginTop: '24px'
        }}>
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 10V6H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'Submission Trends',
              description: 'Track submission trends over time with visual charts and graphs'
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'Site Performance',
              description: 'Analyze site-wise performance metrics and productivity'
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'Employee Productivity',
              description: 'Monitor individual employee productivity and performance reports'
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'Geofence Compliance',
              description: 'Track geofence compliance statistics and location validation'
            }
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                border: '2px solid rgba(102, 126, 234, 0.1)',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}>
                {feature.icon}
              </div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a202c',
                margin: '0 0 8px 0'
              }}>
                {feature.title}
              </h4>
              <p style={{
                fontSize: '14px',
                color: '#718096',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics

