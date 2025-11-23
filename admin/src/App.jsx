import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import { authAPI } from './api'
import './styles/Navigation.css'

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token')
  return token ? children : <Navigate to="/login" replace />
}

// Navigation Component
function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userStr = localStorage.getItem('admin_user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  const handleLogout = () => {
    authAPI.logout()
    navigate('/login')
    window.location.reload()
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="nav-header">
      <div className="nav-left">
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L12 6H16L13 9L15 13L10 11L5 13L7 9L4 6H8L10 2Z" fill="white"/>
            </svg>
          </div>
          Production Card Admin
        </div>
        <nav className="nav-menu">
          <button
            onClick={() => navigate('/dashboard')}
            className={`nav-button ${isActive('/dashboard') ? 'nav-button-active' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className={`nav-button ${isActive('/analytics') ? 'nav-button-active' : ''}`}
          >
            Analytics
          </button>
        </nav>
      </div>
      <div className="nav-right">
        {user && (
          <div className="nav-user">
            <div className="nav-user-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z" fill="currentColor"/>
                <path d="M8 10C4.68629 10 2 12.6863 2 16H14C14 12.6863 11.3137 10 8 10Z" fill="currentColor"/>
              </svg>
            </div>
            {user.name || user.phone}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="nav-logout-btn"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
            <path d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 11L14 7L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Logout
        </button>
      </div>
    </header>
  )
}

function App() {
  return (
    <Router>
      <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <main style={{ padding: '24px', flex: 1, background: '#f7fafc', minHeight: 'calc(100vh - 80px)' }}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
