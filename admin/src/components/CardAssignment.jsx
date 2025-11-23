import React, { useState, useEffect } from 'react'
import { adminAPI } from '../api'
import '../styles/Dashboard.css'

function CardAssignment() {
  const [cardNumber, setCardNumber] = useState('')
  const [userId, setUserId] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers()
      setUsers(response.data || [])
    } catch (err) {
      // Fallback to mock data if API fails
      setUsers([
        { id: 2, name: 'Ravi Kumar', phone: '+919876543211' },
        { id: 3, name: 'Priya Sharma', phone: '+919876543212' },
        { id: 4, name: 'Arun Patel', phone: '+919876543213' }
      ])
    }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!cardNumber || !userId) {
      setMessage('Please fill all fields')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      await adminAPI.assignCard({
        card_number: cardNumber,
        user_id: parseInt(userId),
        site_id: 1 // Default site
      })
      setMessage('Card assigned successfully!')
      setCardNumber('')
      setUserId('')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Failed to assign card: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-card">
      <h3 className="dashboard-card-title">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 4H18V16H2V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Assign Production Card
      </h3>
      
      <form onSubmit={handleAssign}>
        <div className="form-group">
          <label className="form-label">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 8H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Card Number
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="CARD-001"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 10C5.23858 10 3 11.2386 3 13V14H13V13C13 11.2386 10.7614 10 8 10Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Assign To
          </label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="form-select"
          >
            <option value="">Select employee...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.phone})
              </option>
            ))}
          </select>
        </div>

        {message && (
          <div className={`message ${message.includes('success') ? 'message-success' : 'message-error'}`}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              {message.includes('success') ? (
                <path d="M15 4.5L6.75 12.75L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <>
                  <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 13H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </>
              )}
            </svg>
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-full"
        >
          {loading ? (
            <>
              <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              Assigning...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 1V9M9 9L17 1M9 9L1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Assign Card
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default CardAssignment

