import React, { useState, useEffect } from 'react'
import { adminAPI } from '../api'
import '../styles/Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_cards: 0,
    pending_submissions: 0,
    completed_submissions: 0,
    rebind_requests: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard()
      setStats(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard')
      // Set mock data for development
      setStats({
        total_users: 15,
        total_cards: 42,
        pending_submissions: 8,
        completed_submissions: 34,
        rebind_requests: 2
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <span>Loading dashboard...</span>
      </div>
    )
  }

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.total_users, 
      colorClass: 'stat-card-blue',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
          <path d="M12 14C7.58172 14 4 16.2386 4 19V22H20V19C20 16.2386 16.4183 14 12 14Z" fill="currentColor"/>
        </svg>
      )
    },
    { 
      title: 'Total Cards', 
      value: stats.total_cards, 
      colorClass: 'stat-card-green',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor"/>
          <path d="M2 8H22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      title: 'Pending Submissions', 
      value: stats.pending_submissions, 
      colorClass: 'stat-card-yellow',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="currentColor"/>
          <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      title: 'Completed', 
      value: stats.completed_submissions, 
      colorClass: 'stat-card-cyan',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
        </svg>
      )
    },
    { 
      title: 'Rebind Requests', 
      value: stats.rebind_requests, 
      colorClass: 'stat-card-red',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
          <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
        </svg>
      )
    }
  ]

  return (
    <div>
      <h2 className="dashboard-section-title">Dashboard Statistics</h2>
      {error && (
        <div className="message message-warning">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2L2 18H18L10 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 13H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{error} (Showing mock data)</span>
        </div>
      )}
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className={`stat-card ${card.colorClass}`}>
            <div className="stat-card-icon">{card.icon}</div>
            <div className="stat-card-label">{card.title}</div>
            <div className="stat-card-value">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard

