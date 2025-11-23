import React from 'react'
import DashboardStats from '../components/Dashboard'
import RebindRequests from '../components/RebindRequests'
import SubmissionTracking from '../components/SubmissionTracking'
import CardAssignment from '../components/CardAssignment'
import '../styles/Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard-container">
      <DashboardStats />
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px', 
        marginTop: '32px' 
      }}>
        <RebindRequests />
        <CardAssignment />
      </div>
      <div style={{ marginTop: '32px' }}>
        <SubmissionTracking />
      </div>
    </div>
  )
}

export default Dashboard

