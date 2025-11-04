import React from 'react';

function Dashboard({ user, onLogout }) {
  console.log('🏠 [DASHBOARD] Component rendered for user:', user?.email);

  const handleLogout = () => {
    console.log('👋 [DASHBOARD] Logout initiated');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 p-5">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white py-8 px-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome Back!
            </h1>
            <p className="text-base opacity-90">
              You're successfully authenticated
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white bg-opacity-20 border-2 border-white border-opacity-30 text-white py-2.5 px-5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-opacity-30 hover:border-opacity-50"
          >
            Sign Out
          </button>
        </div>

        {/* User Details */}
        <div className="p-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Account Information
          </h2>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* User ID */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                User ID
              </h3>
              <p className="text-base font-semibold text-gray-900 font-mono">
                {user?.id || 'N/A'}
              </p>
            </div>

            {/* Full Name */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Full Name
              </h3>
              <p className="text-base font-semibold text-gray-900">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.name || 'N/A'
                }
              </p>
            </div>

            {/* Email */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Email Address
              </h3>
              <p className="text-base font-semibold text-gray-900">
                {user?.email || 'N/A'}
              </p>
            </div>

            {/* Account Type */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Account Type
              </h3>
              <p className="text-base font-semibold text-gray-900">
                {user?.provider ? `${user.provider} OAuth` : 'Email/Password'}
              </p>
            </div>

            {/* Created Date */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Member Since
              </h3>
              <p className="text-base font-semibold text-gray-900">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'Today'
                }
              </p>
            </div>

            {/* Last Login */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Last Login
              </h3>
              <p className="text-base font-semibold text-gray-900">
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