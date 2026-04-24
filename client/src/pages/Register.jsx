import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { showToast } from '../components/ToastContainer'
import api from '../api/api'

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Administration',
  'Other'
]

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', department: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/register', {
        name: form.name,
        email: form.email,
        department: form.department,
        password: form.password
      })
      login(data.token, data.user)
      showToast('Account created successfully! Welcome, ' + data.user.name)
      setTimeout(() => navigate('/halls'), 500)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏛️</div>
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join the Hall Booking System</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="form-group">
            <label>Full Name</label>
            <input
              className="form-control"
              required
              value={form.name}
              onChange={update('name')}
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              className="form-control"
              type="email"
              required
              value={form.email}
              onChange={update('email')}
              placeholder="you@college.edu"
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <select className="form-control" required value={form.department} onChange={update('department')}>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                className="form-control"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={update('password')}
                placeholder="Min 6 chars"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                className="form-control"
                type="password"
                required
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                placeholder="Repeat password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}
