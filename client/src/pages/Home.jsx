import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: '🏫', title: 'Multiple Halls', desc: 'Browse through various seminar halls, auditoriums, and conference rooms with detailed info.' },
  { icon: '📅', title: 'Easy Booking', desc: 'Check availability for any date and book your preferred time slot with just a few clicks.' },
  { icon: '✅', title: 'Quick Approval', desc: 'Booking requests are reviewed by admin and approved or rejected with remarks.' },
  { icon: '📊', title: 'Track Bookings', desc: 'View all your bookings with real-time status updates — pending, approved, or rejected.' },
  { icon: '🔒', title: 'Secure Access', desc: 'Role-based login ensures only authorized users can book, and admins can manage everything.' },
  { icon: '📱', title: 'Responsive Design', desc: 'Works seamlessly on desktop, tablet, and mobile — book a hall from anywhere on campus.' }
]

export default function Home() {
  const { user } = useAuth()

  return (
    <>
      <section className="hero">
        <h1>Seminar Hall Booking System</h1>
        <p>
          Book seminar halls, auditoriums, and conference rooms for your college events — quick, easy,
          and hassle-free.
        </p>
        <div className="hero-actions">
          <Link
            to="/halls"
            className="btn btn-lg btn-primary"
            style={{ background: 'white', color: 'var(--primary)' }}
          >
            Browse Halls
          </Link>
          {user ? (
            <Link to="/book" className="btn btn-lg btn-outline">
              Book Now
            </Link>
          ) : (
            <Link to="/register" className="btn btn-lg btn-outline">
              Get Started
            </Link>
          )}
        </div>
      </section>

      <section className="features">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="footer">
        <p>© 2026 HallBook — Seminar Hall Booking System</p>
      </footer>
    </>
  )
}
