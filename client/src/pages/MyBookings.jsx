import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { showToast } from '../components/ToastContainer'
import api from '../api/api'

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatTime(t) {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`
}

function StatusBadge({ status }) {
  const classes = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    cancelled: 'badge-cancelled'
  }
  return <span className={`badge ${classes[status] || ''}`}>{status}</span>
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const { data } = await api.get('/api/bookings/my')
      setBookings(data.bookings)
    } catch {
      showToast('Failed to load bookings', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    try {
      await api.delete(`/api/bookings/${id}`)
      showToast('Booking cancelled successfully')
      loadBookings()
    } catch (err) {
      showToast('Failed to cancel: ' + (err.response?.data?.error || 'Error'), 'danger')
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>Track all your hall booking requests</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No bookings yet</h3>
          <p>
            You haven&apos;t made any bookings.{' '}
            <Link to="/halls">Browse available halls</Link> to get started.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Hall</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.event_name}</strong>
                        {b.event_description && (
                          <>
                            <br />
                            <small style={{ color: 'var(--gray-500)' }}>{b.event_description}</small>
                          </>
                        )}
                      </td>
                      <td>
                        {b.hall_name}
                        <br />
                        <small style={{ color: 'var(--gray-500)' }}>{b.hall_location}</small>
                      </td>
                      <td>{formatDate(b.booking_date)}</td>
                      <td>
                        {formatTime(b.start_time)} – {formatTime(b.end_time)}
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td>{b.admin_remarks || '-'}</td>
                      <td>
                        {(b.status === 'pending' || b.status === 'approved') && (
                          <button className="btn btn-danger btn-sm" onClick={() => cancelBooking(b.id)}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
