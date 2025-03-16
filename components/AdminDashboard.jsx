import Link from 'next/link';

const AdminDashboard = ({ user }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Admin Dashboard
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Manage your multi-tenant inventory system
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">System Admin</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {user.name} ({user.email})
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Last Login</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
            </dd>
          </div>
        </dl>
      </div>
      
      <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Link href="/admin/companies" className="rounded-lg p-4 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center text-center transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-medium">Manage Companies</span>
            <span className="text-sm text-gray-500 mt-1">Create and manage tenant companies</span>
          </Link>
          
          <Link href="/admin/users" className="rounded-lg p-4 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center text-center transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-medium">Manage Users</span>
            <span className="text-sm text-gray-500 mt-1">Create and manage users across companies</span>
          </Link>
          
          <Link href="/admin/reports" className="rounded-lg p-4 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center text-center transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-medium">System Reports</span>
            <span className="text-sm text-gray-500 mt-1">View system-wide analytics and reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 