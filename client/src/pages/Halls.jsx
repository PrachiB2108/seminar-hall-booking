import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

export default function Halls() {
  const [halls, setHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [availDate, setAvailDate] = useState(new Date().toISOString().split('T')[0])
  const [availability, setAvailability] = useState([])
  const [availLoading, setAvailLoading] = useState(false)

  useEffect(() => {
    api
      .get('/api/halls')
      .then((r) => setHalls(r.data.halls))
      .finally(() => setLoading(false))
  }, [])

  const openAvailability = (hall) => {
    setModal(hall)
    setAvailability([])
    checkAvailability(hall._id, availDate)
  }

  const checkAvailability = async (hallId, date) => {
    setAvailLoading(true)
    try {
      const r = await api.get(`/api/halls/${hallId}/availability?date=${date}`)
      setAvailability(r.data.bookings)
    } catch {
      setAvailability([])
    }
    setAvailLoading(false)
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
        <h1>Available Halls</h1>
        <p>Browse and book seminar halls, auditoriums, and conference rooms</p>
      </div>

      {halls.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏫</div>
          <h3>No halls available</h3>
          <p>Check back later for available halls.</p>
        </div>
      ) : (
        <div className="halls-grid">
          {halls.map((hall) => (
            <div key={hall._id} className="hall-card">
              <div className="hall-card-image">🏛️</div>
              <div className="hall-card-body">
                <h3>{hall.name}</h3>
                <div className="hall-info">
                  <div className="hall-info-item">
                    <span className="icon">📍</span> {hall.location}
                  </div>
                  <div className="hall-info-item">
                    <span className="icon">👥</span> Capacity: {hall.capacity} seats
                  </div>
                </div>
                <div className="hall-facilities">
                  {(hall.facilities || '')
                    .split(',')
                    .map((f) => f.trim())
                    .filter(Boolean)
                    .map((f) => (
                      <span key={f} className="facility-tag">
                        {f}
                      </span>
                    ))}
                </div>
                <div className="hall-card-actions">
                  <Link to={`/book?hall=${hall._id}`} className="btn btn-primary btn-sm">
                    Book Now
                  </Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => openAvailability(hall)}>
                    Check Availability
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.name} — Availability</h3>
              <button className="modal-close" onClick={() => setModal(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={availDate}
                  onChange={(e) => {
                    setAvailDate(e.target.value)
                    checkAvailability(modal._id, e.target.value)
                  }}
                />
              </div>

              {availLoading ? (
                <div className="loading">
                  <div className="spinner"></div>
                </div>
              ) : availability.length === 0 ? (
                <div className="alert alert-success">
                  ✅ No bookings on {formatDate(availDate)}. Hall is fully available!
                </div>
              ) : (
                <>
                  <div className="alert alert-warning">⚠️ {availability.length} booking(s) found</div>
                  <div className="availability-list">
                    {availability.map((b) => (
                      <div key={b.id} className="availability-item booked">
                        <div className="time">
                          {formatTime(b.start_time)} – {formatTime(b.end_time)}
                        </div>
                        <div className="event">
                          {b.event_name} ({b.status}) — by {b.booked_by}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
