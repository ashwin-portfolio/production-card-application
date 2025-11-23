import React, { useState, useEffect } from 'react'
import { adminAPI } from '../api'
import '../styles/Dashboard.css'

function SubmissionTracking() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, completed

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    try {
      const response = await adminAPI.getSubmissions()
      setSubmissions(response.data || [])
    } catch (err) {
      // Mock data for development
      setSubmissions([
        {
          id: 1,
          card_number: 'CARD-001',
          user_name: 'Ravi Kumar',
          site_name: 'Factory Site 1',
          submitted_at: '2024-11-23T09:30:00',
          status: 'completed',
          latitude: 13.0827,
          longitude: 80.2707
        },
        {
          id: 2,
          card_number: 'CARD-002',
          user_name: 'Priya Sharma',
          site_name: 'Factory Site 1',
          submitted_at: '2024-11-23T10:15:00',
          status: 'pending',
          latitude: 13.0827,
          longitude: 80.2707
        },
        {
          id: 3,
          card_number: 'CARD-003',
          user_name: 'Arun Patel',
          site_name: 'Factory Site 2',
          submitted_at: '2024-11-23T11:00:00',
          status: 'completed',
          latitude: 12.9716,
          longitude: 77.5946
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = filter === 'all'
    ? submissions
    : submissions.filter(s => s.status === filter)

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Loading submissions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h3 className="dashboard-card-title" style={{ margin: 0 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2L2 6V10C2 14.55 5.36 18.74 10 20C14.64 18.74 18 14.55 18 10V6L10 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Submission Tracking
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ minWidth: '70px' }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              minWidth: '90px',
              background: filter === 'pending' ? '#ed8936' : undefined,
              boxShadow: filter === 'pending' ? '0 2px 8px rgba(237, 137, 54, 0.3)' : undefined
            }}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              minWidth: '100px',
              background: filter === 'completed' ? '#48bb78' : undefined,
              boxShadow: filter === 'completed' ? '0 2px 8px rgba(72, 187, 120, 0.3)' : undefined
            }}
          >
            Completed
          </button>
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <p className="empty-state-text">No submissions found</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            minWidth: '800px'
          }}>
            <thead>
              <tr style={{ 
                background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                borderBottom: '2px solid #e2e8f0'
              }}>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2d3748',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Card #</th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2d3748',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Employee</th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2d3748',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Site</th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2d3748',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Submitted</th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2d3748',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Status</th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2d3748',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission, index) => (
                <tr 
                  key={submission.id} 
                  style={{ 
                    borderBottom: index < filteredSubmissions.length - 1 ? '1px solid #e2e8f0' : 'none',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px', fontWeight: '600', color: '#1a202c' }}>
                    {submission.card_number}
                  </td>
                  <td style={{ padding: '16px', color: '#2d3748' }}>
                    {submission.user_name}
                  </td>
                  <td style={{ padding: '16px', color: '#4a5568' }}>
                    {submission.site_name}
                  </td>
                  <td style={{ padding: '16px', color: '#4a5568', fontSize: '14px' }}>
                    {new Date(submission.submitted_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: submission.status === 'completed' 
                        ? 'linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%)' 
                        : 'linear-gradient(135deg, #feebc8 0%, #f6ad55 100%)',
                      color: submission.status === 'completed' ? '#22543d' : '#7c2d12',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    }}>
                      {submission.status === 'completed' ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="2"/>
                          <path d="M6 3V6L8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                      {submission.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#718096', fontFamily: 'monospace' }}>
                    {submission.latitude?.toFixed(4)}, {submission.longitude?.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SubmissionTracking

