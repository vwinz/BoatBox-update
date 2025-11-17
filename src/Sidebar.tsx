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
          background: 'rgba(139, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0 0.5rem 0.5rem 0',
          color: '#fff',
          padding: '0.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(139, 0, 0, 0.3)',
          fontSize: '1.5rem',
          transition: 'transform 0.3s cubic-bezier(.4,0,.2,1), background 0.3s ease',
        }}
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
      >
        {open ? <span>&#8592;</span> : <span>&#8594;</span>}
      </button>

      <aside
        className="sidebar"
        style={{
          background: 'linear-gradient(180deg, rgba(139, 0, 0, 0.9) 0%, rgba(178, 34, 34, 0.9) 50%, rgba(220, 20, 60, 0.9) 100%)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
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
          boxShadow: open ? '8px 0 32px rgba(139, 0, 0, 0.4)' : 'none',
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
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            BoatBox
            <div
              style={{
                fontWeight: 'normal',
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginTop: '0.2rem',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              Municipality of Nasugbu
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
                    background: isActive 
                      ? 'rgba(255, 255, 255, 0.25)' 
                      : 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: isActive 
                      ? '1px solid rgba(255, 255, 255, 0.4)' 
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    borderRadius: '0.8rem',
                    padding: '0.7rem 1.2rem',
                    fontWeight: isActive ? 'bold' : 'normal',
                    display: 'block',
                    textDecoration: 'none',
                    boxShadow: isActive 
                      ? '0 4px 20px rgba(255, 255, 255, 0.2)' 
                      : '0 2px 12px rgba(0, 0, 0, 0.2)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                  })}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/tracking"
                  style={({ isActive }) => ({
                    background: isActive 
                      ? 'rgba(255, 255, 255, 0.25)' 
                      : 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: isActive 
                      ? '1px solid rgba(255, 255, 255, 0.4)' 
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    borderRadius: '0.8rem',
                    padding: '0.7rem 1.2rem',
                    fontWeight: isActive ? 'bold' : 'normal',
                    display: 'block',
                    textDecoration: 'none',
                    boxShadow: isActive 
                      ? '0 4px 20px rgba(255, 255, 255, 0.2)' 
                      : '0 2px 12px rgba(0, 0, 0, 0.2)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                  })}
                >
                  Tracking
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
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                borderRadius: '0.8rem',
                padding: '0.7rem 1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '0.3rem',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.2)';
              }}
            >
              Help
            </button>
            <button
              style={{
                background: 'rgba(139, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                borderRadius: '0.8rem',
                padding: '0.7rem 1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 0, 0, 0.8)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 0, 0, 0.6)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.3)';
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