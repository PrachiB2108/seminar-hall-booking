import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { showToast } from '../components/ToastContainer'
import api from '../api/api'

function formatTime(t) {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`
}

export default function Book() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [halls, setHalls] = useState([])
  const [form, setForm] = useState({
    hall_id: searchParams.get('hall') || '',
    event_name: '',
    event_description: '',
    booking_date: '',
    start_time: '',
    end_time: '',
    attendees: ''
  })
  const [availability, setAvailability] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    api.get('/api/halls').then((r) => setHalls(r.data.halls))
  }, [])

  useEffect(() => {
    if (form.hall_id && form.booking_date) {
      api
        .get(`/api/halls/${form.hall_id}/availability?date=${form.booking_date}`)
        .then((r) => setAvailability(r.data.bookings))
        .catch(() => setAvailability(null))
    } else {
      setAvailability(null)
    }
  }, [form.hall_id, form.booking_date])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/bookings', { ...form, attendees: parseInt(form.attendees) || 0 })
      showToast('Booking request submitted! Waiting for admin approval.', 'success')
      setTimeout(() => navigate('/my-bookings'), 1000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '700px' }}>
      <div className="page-header">
        <h1>Book a Hall</h1>
        <p>Fill in the details below to submit a booking request</p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger mb-2">{error}</div>}

            <div className="form-group">
              <label>Select Hall *</label>
              <select className="form-control" required value={form.hall_id} onChange={update('hall_id')}>
                <option value="">Choose a hall...</option>
                {halls.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name} ({h.location}) — {h.capacity} seats
                  </option>
                ))}
              </select>
            </div>

            {availability !== null && (
              <div className={`alert ${availability.length === 0 ? 'alert-success' : 'alert-warning'} mb-2`}>
                {availability.length === 0
                  ? '✅ No existing bookings on this date. Hall is available!'
                  : `⚠️ ${availability.length} booking(s) found. Please choose a different time slot.`}
                {availability.length > 0 && (
                  <div className="availability-list mt-1">
                    {availability.map((b) => (
                      <div key={b.id} className="availability-item booked">
                        <div className="time">
                          {formatTime(b.start_time)} – {formatTime(b.end_time)}
                        </div>
                        <div className="event">
                          {b.event_name} ({b.status})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Event Name *</label>
              <input
                className="form-control"
                required
                value={form.event_name}
                onChange={update('event_name')}
                placeholder="e.g. AI Workshop"
              />
            </div>

            <div className="form-group">
              <label>Event Description</label>
              <textarea
                className="form-control"
                value={form.event_description}
                onChange={update('event_description')}
                placeholder="Brief description (optional)"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Booking Date *</label>
              <input
                className="form-control"
                type="date"
                required
                min={today}
                value={form.booking_date}
                onChange={update('booking_date')}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time *</label>
                <input
                  className="form-control"
                  type="time"
                  required
                  value={form.start_time}
                  onChange={update('start_time')}
                />
              </div>
              <div className="form-group">
                <label>End Time *</label>
                <input
                  className="form-control"
                  type="time"
                  required
                  value={form.end_time}
                  onChange={update('end_time')}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Expected Attendees</label>
              <input
                className="form-control"
                type="number"
                min="1"
                value={form.attendees}
                onChange={update('attendees')}
                placeholder="Number of attendees"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
