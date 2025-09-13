import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../App.css";

function Navbar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Cool Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '3px solid #3b82f6',
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
          `,
          animation: 'float 6s ease-in-out infinite'
        }} />
        
        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: '#3b82f6',
              borderRadius: '50%',
              opacity: 0.6,
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animation: `particle${i} ${3 + i * 0.5}s ease-in-out infinite`
            }}
          />
        ))}

        {/* Main content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Left side - Title and subtitle */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #3b82f6, #10b981, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
              animation: 'glow 2s ease-in-out infinite alternate'
            }}>
              Management Portal
            </h1>
            <p style={{
              margin: '0.5rem 0 0 0',
              fontSize: '1.1rem',
              color: '#94a3b8',
              fontWeight: 500,
              opacity: 0.9
            }}>
              Employee & Article Management System
            </p>
            
            {/* Status indicators */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.75rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '20px',
                fontSize: '0.9rem'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{ color: '#10b981' }}>System Online</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.75rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '20px',
                fontSize: '0.9rem'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#3b82f6',
                  borderRadius: '50%'
                }} />
                <span style={{ color: '#3b82f6' }}>Database Connected</span>
              </div>
            </div>
          </div>

          {/* Right side - Time and date */}
          <div style={{
            textAlign: 'right',
            minWidth: '250px'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#f3f4f6',
              fontFamily: 'monospace',
              textShadow: '0 0 20px rgba(243, 244, 246, 0.3)',
              marginBottom: '0.5rem'
            }}>
              {formatTime(currentTime)}
            </div>
            <div style={{
              fontSize: '1rem',
              color: '#94a3b8',
              fontWeight: 500
            }}>
              {formatDate(currentTime)}
            </div>
            
            {/* Weather-like info panel */}
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(31, 41, 55, 0.8)',
              borderRadius: '12px',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.9rem',
                color: '#94a3b8'
              }}>
                <span>Active Sessions</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>3</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.9rem',
                color: '#94a3b8',
                marginTop: '0.5rem'
              }}>
                <span>Server Load</span>
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>23%</span>
              </div>
            </div>
          </div>
        </div>

        {/* CSS animations */}
        <style>{`
          @keyframes glow {
            0% { filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3)); }
            100% { filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.6)); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
          }
          
          @keyframes particle0 {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
            50% { transform: translateY(-15px) translateX(10px); opacity: 1; }
          }
          
          @keyframes particle1 {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
            50% { transform: translateY(-20px) translateX(-5px); opacity: 0.8; }
          }
          
          @keyframes particle2 {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
            50% { transform: translateY(-10px) translateX(15px); opacity: 0.9; }
          }
          
          @keyframes particle3 {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.7; }
            50% { transform: translateY(-25px) translateX(-10px); opacity: 0.3; }
          }
          
          @keyframes particle4 {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
            50% { transform: translateY(-12px) translateX(8px); opacity: 0.6; }
          }
        `}</style>
      </div>

      {/* Your existing navbar */}
      <nav className="navbar">
        <ul>
          <li><Link to="/employees">Employees</Link></li>
          <li><Link to="/articles">Articles</Link></li>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;