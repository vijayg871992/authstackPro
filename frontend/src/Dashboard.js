import React from 'react';

function Dashboard({ user, onLogout }) {
  console.log('🏠 [DASHBOARD] Component rendered for user:', user?.email);

  const handleLogout = () => {
    console.log('👋 [DASHBOARD] Logout initiated');
    onLogout();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ 
              margin: '0 0 8px 0',
              fontSize: '28px',
              fontWeight: '700'
            }}>
              Welcome Back!
            </h1>
            <p style={{ 
              margin: 0,
              fontSize: '16px',
              opacity: 0.9
            }}>
              You're successfully authenticated
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
              e.target.style.borderColor = 'rgba(255,255,255,0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
          >
            Sign Out
          </button>
        </div>

        {/* User Details */}
        <div style={{ padding: '40px' }}>
          <h2 style={{
            margin: '0 0 24px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#1a202c'
          }}>
            Account Information
          </h2>

          <div style={{
            display: 'grid',
            gap: '20px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
          }}>
            
            {/* User ID */}
            <div style={{
              background: '#f7fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: '500',
                color: '#718096',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                User ID
              </h3>
              <p style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a202c',
                fontFamily: 'monospace'
              }}>
                {user?.id || 'N/A'}
              </p>
            </div>

            {/* Full Name */}
            <div style={{
              background: '#f7fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: '500',
                color: '#718096',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Full Name
              </h3>
              <p style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a202c'
              }}>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.name || 'N/A'
                }
              </p>
            </div>

            {/* Email */}
            <div style={{
              background: '#f7fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: '500',
                color: '#718096',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Email Address
              </h3>
              <p style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a202c'
              }}>
                {user?.email || 'N/A'}
              </p>
            </div>

            {/* Account Type */}
            <div style={{
              background: '#f7fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: '500',
                color: '#718096',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Account Type
              </h3>
              <p style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a202c'
              }}>
                {user?.provider ? `${user.provider} OAuth` : 'Email/Password'}
              </p>
            </div>

            {/* Created Date */}
            <div style={{
              background: '#f7fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: '500',
                color: '#718096',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Member Since
              </h3>
              <p style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a202c'
              }}>
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'Today'
                }
              </p>
            </div>

            {/* Last Login */}
            <div style={{
              background: '#f7fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: '500',
                color: '#718096',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Last Login
              </h3>
              <p style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a202c'
              }}>
                Just now
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;