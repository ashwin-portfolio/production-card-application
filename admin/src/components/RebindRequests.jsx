import React, { useState, useEffect } from 'react'
import { adminAPI } from '../api'
import '../styles/Dashboard.css'

function RebindRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const response = await adminAPI.getRebindRequests()
      setRequests(response.data || [])
    } catch (err) {
      // Mock data for development
      setRequests([
        {
          id: 1,
          user_name: 'Ravi Kumar',
          phone: '+919876543211',
          old_device_hash: 'abc123...',
          new_device_hash: 'xyz789...',
          requested_at: '2024-11-23T10:30:00',
          status: 'pending'
        },
        {
          id: 2,
          user_name: 'Priya Sharma',
          phone: '+919876543212',
          old_device_hash: 'def456...',
          new_device_hash: 'uvw012...',
          requested_at: '2024-11-23T11:15:00',
          status: 'pending'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    setProcessing(requestId)
    try {
      await adminAPI.approveRebind(requestId)
      setRequests(requests.filter(r => r.id !== requestId))
    } catch (err) {
      alert('Failed to approve request: ' + (err.response?.data?.detail || err.message))
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (requestId) => {
    setProcessing(requestId)
    try {
      setRequests(requests.filter(r => r.id !== requestId))
    } catch (err) {
      alert('Failed to reject request: ' + (err.response?.data?.detail || err.message))
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Loading rebind requests...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-card">
      <h3 className="dashboard-card-title">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 16V10H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.49 9A9 9 0 0 0 4.64 4.64L1 8M19 12L15.36 15.36A9 9 0 0 1 3.51 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Device Rebind Requests
      </h3>
      {requests.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="empty-state-text">No pending rebind requests</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map((request) => (
            <div
              key={request.id}
              style={{
                padding: '20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {request.user_name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1a202c', marginBottom: '4px' }}>
                    {request.user_name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#718096' }}>
                    {request.phone}
                  </div>
                </div>
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#4a5568', 
                marginBottom: '16px',
                padding: '12px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Requested:</strong> {new Date(request.requested_at).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleApprove(request.id)}
                  disabled={processing === request.id}
                  className="btn btn-success btn-sm"
                >
                  {processing === request.id ? (
                    <>
                      <div className="loading-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  disabled={processing === request.id}
                  className="btn btn-danger btn-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RebindRequests

