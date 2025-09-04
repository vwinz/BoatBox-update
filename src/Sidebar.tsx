import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', height: '100vh', minWidth: 0 }}>
      {/* Arrow button, always visible, changes direction */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: open ? 'translate(200px, -50%)' : 'translate(0, -50%)',
          zIndex: 10,
          background: '#19376d',
          border: 'none',
          borderRadius: '0 0.5rem 0.5rem 0',
          color: '#fff',
          padding: '0.5rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px #0002',
          fontSize: '1.5rem',
          transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
        }}
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
      >
        {open ? <span>&#8592;</span> : <span>&#8594;</span>}
      </button>

      <aside
        className="sidebar"
        style={{
          background: 'linear-gradient(180deg, #19376d 0%, #0a2342 100%)',
          color: '#fff',
          minWidth: '160px',
          maxWidth: '200px',
          width: '200px',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          position: 'absolute',
          left: 0,
          top: 0,
          boxShadow: open ? '2px 0 8px #0002' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s cubic-bezier(.4,0,.2,1)',
          willChange: 'transform',
        }}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: open ? 'auto' : 'none',
            opacity: open ? 1 : 0,
            transition: 'opacity 0.3s cubic-bezier(.4,0,.2,1)',
            padding: open ? '1.2rem 1rem 1rem 1rem' : '0',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div
            className="sidebar-header"
            style={{
              fontWeight: 'bold',
              fontSize: '1.7rem',
              color: '#fff',
              letterSpacing: '2px',
              marginBottom: '1.2rem',
              textAlign: 'center',
            }}
          >
            BoatBox
            <div
              style={{
                fontWeight: 'normal',
                fontSize: '1rem',
                color: '#b3b8e0',
                marginTop: '0.2rem',
              }}
            >
              Municipality of What the Helly
            </div>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav" style={{ marginBottom: '1.5rem' }}>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <li>
                <NavLink
                  to="/"
                  end
                  style={({ isActive }) => ({
                    background: isActive ? '#25406d' : '#e0e7ef',
                    color: isActive ? '#fff' : '#25406d',
                    borderRadius: '0.5rem',
                    padding: '0.7rem 1.2rem',
                    fontWeight: isActive ? 'bold' : 'normal',
                    display: 'block',
                    textDecoration: 'none',
                    boxShadow: '0 1px 4px #0001',
                  })}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/tracking"
                  style={({ isActive }) => ({
                    background: isActive ? '#25406d' : '#e0e7ef',
                    color: isActive ? '#fff' : '#25406d',
                    borderRadius: '0.5rem',
                    padding: '0.7rem 1.2rem',
                    fontWeight: isActive ? 'bold' : 'normal',
                    display: 'block',
                    textDecoration: 'none',
                    boxShadow: '0 1px 4px #0001',
                  })}
                >
                  Tracking
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/messages"
                  style={({ isActive }) => ({
                    background: isActive ? '#25406d' : '#e0e7ef',
                    color: isActive ? '#fff' : '#25406d',
                    borderRadius: '0.5rem',
                    padding: '0.7rem 1.2rem',
                    fontWeight: isActive ? 'bold' : 'normal',
                    display: 'block',
                    textDecoration: 'none',
                    boxShadow: '0 1px 4px #0001',
                  })}
                >
                  Messages
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/settings"
                  style={({ isActive }) => ({
                    background: isActive ? '#25406d' : '#e0e7ef',
                    color: isActive ? '#fff' : '#25406d',
                    borderRadius: '0.5rem',
                    padding: '0.7rem 1.2rem',
                    fontWeight: isActive ? 'bold' : 'normal',
                    display: 'block',
                    textDecoration: 'none',
                    boxShadow: '0 1px 4px #0001',
                  })}
                >
                  Settings
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Footer */}
          <div
            className="sidebar-footer"
            style={{
              marginTop: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.7rem',
              padding: '0.5rem 0 0 0',
            }}
          >
            <button
              style={{
                background: '#25406d',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.7rem 1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '0.3rem',
                boxShadow: '0 1px 4px #0001',
              }}
            >
              Help
            </button>
            <button
              style={{
                background: '#0a2342',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.7rem 1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 1px 4px #0001',
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
