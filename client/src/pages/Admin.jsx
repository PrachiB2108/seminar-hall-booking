import React, { useState, useEffect } from 'react'
import { showToast } from '../components/ToastContainer'
import api from '../api/api'

// ─── Helpers ─────────────────────────────────────────────────
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

// ─── Dashboard Tab ────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    api.get('/api/admin/dashboard').then((r) => {
      setStats(r.data.stats)
      setRecent(r.data.recentBookings)
    })
  }, [])

  if (!stats) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  const STAT_ITEMS = [
    { label: 'Active Halls', value: stats.totalHalls, color: 'var(--primary)' },
    { label: 'Total Users', value: stats.totalUsers, color: 'var(--info)' },
    { label: 'Pending', value: stats.pendingBookings, color: 'var(--warning)' },
    { label: 'Approved', value: stats.approvedBookings, color: 'var(--success)' },
    { label: 'Rejected', value: stats.rejectedBookings, color: 'var(--danger)' },
    { label: 'Total Bookings', value: stats.totalBookings, color: 'var(--gray-700)' }
  ]

  return (
    <>
      <div className="stats-grid">
        {STAT_ITEMS.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-value" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card mt-2">
        <div className="card-header">
          <h2>Recent Bookings</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>User</th>
                <th>Hall</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.id}>
                  <td>{b.event_name}</td>
                  <td>
                    {b.user_name}
                    <br />
                    <small style={{ color: 'var(--gray-500)' }}>{b.user_department}</small>
                  </td>
                  <td>{b.hall_name}</td>
                  <td>
                    {formatDate(b.booking_date)}
                    <br />
                    <small>
                      {formatTime(b.start_time)} – {formatTime(b.end_time)}
                    </small>
                  </td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ─── Bookings Tab ─────────────────────────────────────────────
function BookingsTab() {
  const [bookings, setBookings] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [actionModal, setActionModal] = useState(null) // { id, action }
  const [remarks, setRemarks] = useState('')

  const load = async () => {
    let url = `/api/admin/bookings?status=${filterStatus}`
    if (filterDate) url += `&date=${filterDate}`
    const { data } = await api.get(url)
    setBookings(data.bookings)
  }

  useEffect(() => {
    load()
  }, [filterStatus, filterDate])

  const updateStatus = async (status) => {
    try {
      await api.put(`/api/admin/bookings/${actionModal.id}`, { status, admin_remarks: remarks })
      showToast(`Booking ${status} successfully`, 'success')
      setActionModal(null)
      load()
    } catch (err) {
      showToast('Failed: ' + (err.response?.data?.error || 'Error'), 'danger')
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Manage Bookings</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="form-control"
              style={{ width: 'auto' }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setFilterStatus('all')
                setFilterDate('')
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>User</th>
                  <th>Hall</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}
                    >
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.event_name}</strong>
                      </td>
                      <td>
                        <strong>{b.user_name}</strong>
                        <br />
                        <small style={{ color: 'var(--gray-500)' }}>
                          {b.user_department} — {b.user_email}
                        </small>
                      </td>
                      <td>{b.hall_name}</td>
                      <td>
                        {formatDate(b.booking_date)}
                        <br />
                        <small>
                          {formatTime(b.start_time)} – {formatTime(b.end_time)}
                        </small>
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td>
                        {b.status === 'pending' ? (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => {
                                setActionModal({ id: b.id, action: 'approve' })
                                setRemarks('')
                              }}
                            >
                              Approve
                            </button>{' '}
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                setActionModal({ id: b.id, action: 'reject' })
                                setRemarks('')
                              }}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <small style={{ color: 'var(--gray-500)' }}>{b.admin_remarks || '-'}</small>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{actionModal.action === 'approve' ? 'Approve Booking' : 'Reject Booking'}</h3>
              <button className="modal-close" onClick={() => setActionModal(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Admin Remarks (Optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add remarks for the user..."
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setActionModal(null)}>
                  Cancel
                </button>
                {actionModal.action === 'approve' ? (
                  <button className="btn btn-success" onClick={() => updateStatus('approved')}>
                    Approve
                  </button>
                ) : (
                  <button className="btn btn-danger" onClick={() => updateStatus('rejected')}>
                    Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Halls Tab ────────────────────────────────────────────────
function HallsTab() {
  const [halls, setHalls] = useState([])
  const [hallModal, setHallModal] = useState(null) // null | 'add' | hall._id
  const [form, setForm] = useState({ name: '', location: '', capacity: '', facilities: '' })

  const load = () => api.get('/api/halls').then((r) => setHalls(r.data.halls))

  useEffect(() => {
    load()
  }, [])

  const openAdd = () => {
    setForm({ name: '', location: '', capacity: '', facilities: '' })
    setHallModal('add')
  }

  const openEdit = (h) => {
    setForm({ name: h.name, location: h.location, capacity: h.capacity, facilities: h.facilities || '' })
    setHallModal(h._id)
  }

  const saveHall = async () => {
    try {
      if (hallModal === 'add') {
        await api.post('/api/admin/halls', form)
        showToast('Hall added successfully', 'success')
      } else {
        await api.put(`/api/admin/halls/${hallModal}`, form)
        showToast('Hall updated successfully', 'success')
      }
      setHallModal(null)
      load()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save hall', 'danger')
    }
  }

  const deleteHall = async (id) => {
    if (!confirm('Remove this hall?')) return
    await api.delete(`/api/admin/halls/${id}`)
    showToast('Hall removed', 'success')
    load()
  }

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Manage Halls</h2>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Add Hall
          </button>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Facilities</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {halls.map((h) => (
                  <tr key={h._id}>
                    <td>
                      <strong>{h.name}</strong>
                    </td>
                    <td>{h.location}</td>
                    <td>{h.capacity}</td>
                    <td>
                      <div className="hall-facilities">
                        {(h.facilities || '')
                          .split(',')
                          .map((f) => f.trim())
                          .filter(Boolean)
                          .map((f) => (
                            <span key={f} className="facility-tag">
                              {f}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td>
                      {h.is_active ? (
                        <span className="badge badge-approved">Active</span>
                      ) : (
                        <span className="badge badge-cancelled">Inactive</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(h)}>
                        Edit
                      </button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteHall(h._id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {hallModal && (
        <div className="modal-overlay" onClick={() => setHallModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{hallModal === 'add' ? 'Add New Hall' : 'Edit Hall'}</h3>
              <button className="modal-close" onClick={() => setHallModal(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Hall Name *</label>
                <input className="form-control" value={form.name} onChange={update('name')} />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input className="form-control" value={form.location} onChange={update('location')} />
              </div>
              <div className="form-group">
                <label>Capacity *</label>
                <input
                  className="form-control"
                  type="number"
                  value={form.capacity}
                  onChange={update('capacity')}
                />
              </div>
              <div className="form-group">
                <label>Facilities (comma-separated)</label>
                <input
                  className="form-control"
                  value={form.facilities}
                  onChange={update('facilities')}
                  placeholder="Projector, AC, WiFi"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setHallModal(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveHall}>
                  Save Hall
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Users Tab ────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    api.get('/api/admin/users').then((r) => setUsers(r.data.users))
  }, [])

  return (
    <div className="card">
      <div className="card-header">
        <h2>Registered Users</h2>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <strong>{u.name}</strong>
                </td>
                <td>{u.email}</td>
                <td>{u.department}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'bookings', label: '📋 Bookings' },
  { id: 'halls', label: '🏫 Halls' },
  { id: 'users', label: '👥 Users' }
]

export default function Admin() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div className="container">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage bookings, halls, and users</p>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'bookings' && <BookingsTab />}
        {tab === 'halls' && <HallsTab />}
        {tab === 'users' && <UsersTab />}
      </div>
    </div>
  )
}
