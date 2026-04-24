import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { showToast } from './ToastContainer'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    showToast('Logged out successfully')
    navigate('/')
  }

  const active = (path) => (location.pathname === path ? 'active' : '')

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">🏛️</span>
        <span>HallBook</span>
      </Link>

      <ul className="navbar-links">
        <li>
          <Link to="/" className={active('/')}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/halls" className={active('/halls')}>
            Halls
          </Link>
        </li>
        {user && (
          <li>
            <Link to="/my-bookings" className={active('/my-bookings')}>
              My Bookings
            </Link>
          </li>
        )}
        {user?.role === 'admin' && (
          <li>
            <Link to="/admin" className={active('/admin')}>
              Admin Panel
            </Link>
          </li>
        )}
      </ul>

      <div className="navbar-user">
        {user ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="user-name">{user.name}</span>
            <span className="user-badge">{user.role}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </span>
        ) : (
          <span>
            <Link to="/login" className="btn btn-secondary btn-sm" style={{ marginRight: '0.5rem' }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </span>
        )}
      </div>
    </nav>
  )
}
