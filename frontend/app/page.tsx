'use client';

import { useAuth } from './context/AuthContext';
import { UserRole } from './types/auth';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  // Determine user role for conditional rendering
  const isDoctor = isAuthenticated && user?.role === UserRole.DOCTOR;
  const isPatient = isAuthenticated && user?.role === UserRole.PATIENT;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-cyan-950/30 rounded-3xl overflow-hidden mb-20 shadow-2xl border border-slate-200/60 dark:border-slate-700/60">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-slate-100/[0.02] bg-[size:32px_32px]"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-16 mb-12 md:mb-0 text-center md:text-left">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 dark:from-cyan-900/30 dark:to-blue-900/30 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-700/60 backdrop-blur-sm">
                ✨ Modern Healthcare Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-cyan-200 dark:to-white bg-clip-text text-transparent">
                {isDoctor ? 'Welcome back,' : 'Schedula'}
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {isDoctor ? 'Doctor!' : 'Healthcare'}
              </span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-lg">
              {isDoctor
                ? 'Manage your appointments, view your schedule, and connect with your patients efficiently through your personalized dashboard.'
                : isPatient
                ? 'Welcome back! Find doctors, book appointments, and manage your healthcare journey with ease.'
                : 'Smart appointment scheduling platform connecting doctors and patients seamlessly with cutting-edge technology.'
              }
            </p>
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              {isDoctor ? (
                <>
                  <a
                    href="/dashboard"
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                        <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                      </svg>
                      View Dashboard
                    </span>
                  </a>
                  <a
                    href="/appointments"
                    className="group relative inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-800 font-semibold rounded-2xl border-2 border-slate-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 hover:bg-white hover:border-cyan-400"
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-cyan-600">
                        <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                      </svg>
                      My Appointments
                    </span>
                  </a>
                </>
              ) : isPatient ? (
                <>
                  <a
                    href="/doctors"
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                      </svg>
                      Find Doctors
                    </span>
                  </a>
                  <a
                    href="/dashboard"
                    className="group relative inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-800 font-semibold rounded-2xl border-2 border-slate-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 hover:bg-white hover:border-cyan-400"
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-cyan-600">
                        <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                      </svg>
                      My Dashboard
                    </span>
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                        <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
                      </svg>
                      Get Started
                    </span>
                  </a>
                  <a
                    href="/doctors"
                    className="group relative inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-800 font-semibold rounded-2xl border-2 border-slate-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 hover:bg-white hover:border-cyan-400"
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-cyan-600">
                        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                      </svg>
                      Browse Doctors
                    </span>
                  </a>
                </>
              )}
            </div>
          </div>
          <div className="md:w-1/2 relative">
            {/* Main Hero Card */}
            <div className="relative w-full h-80 md:h-96 bg-gradient-to-br from-white via-slate-50 to-cyan-50/50 dark:from-slate-800 dark:via-slate-700 dark:to-cyan-900/30 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.15),transparent_50%)]"></div>
              <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-slate-100/[0.02] bg-[size:20px_20px]"></div>

              {/* Floating Elements */}
              <div className="absolute top-6 right-6 w-16 h-16 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-lg animate-pulse"></div>
              <div className="absolute bottom-8 left-8 w-12 h-12 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-lg animate-pulse delay-700"></div>

              {/* Main Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  {isDoctor ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="relative w-40 h-40 text-slate-600/40 dark:text-slate-400/40">
                      <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="relative w-40 h-40 text-slate-600/40 dark:text-slate-400/40">
                      <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 left-4 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-ping delay-1000"></div>
            </div>

            {/* Floating Action Button */}
            <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-110 cursor-pointer group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isDoctor ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="relative w-14 h-14 text-white group-hover:scale-110 transition-transform duration-300">
                  <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="relative w-14 h-14 text-white group-hover:scale-110 transition-transform duration-300">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 dark:from-cyan-900/30 dark:to-blue-900/30 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-700/60 backdrop-blur-sm mb-6">
            🚀 Powerful Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-cyan-200 dark:to-white bg-clip-text text-transparent">
            Key Features
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Schedula provides tailored experiences for both doctors and patients with smart scheduling and management tools designed for modern healthcare.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group relative bg-gradient-to-br from-white via-slate-50 to-cyan-50/30 dark:from-slate-800 dark:via-slate-700 dark:to-cyan-900/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                  <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">For Patients</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Browse doctors, view their profiles and specializations, and book appointments easily with our intuitive interface.
              </p>
              <a href="/doctors" className="inline-flex items-center text-cyan-600 dark:text-cyan-400 font-semibold hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors duration-200 group-hover:translate-x-1">
                Browse Doctors
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-800 dark:via-slate-700 dark:to-blue-900/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                  <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">For Doctors</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Manage your schedule, view appointments, update your profile, and track your patients efficiently.
              </p>
              <a href="/login" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 group-hover:translate-x-1">
                Doctor Login
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-white via-slate-50 to-purple-50/30 dark:from-slate-800 dark:via-slate-700 dark:to-purple-900/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                  <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Smart Scheduling</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Intelligent appointment scheduling with real-time availability, automated reminders, and seamless booking.
              </p>
              <a href="/register/patient" className="inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200 group-hover:translate-x-1">
                Join as Patient
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-cyan-950/30 rounded-3xl p-12 md:p-16 mb-20 shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(6,182,212,0.1),transparent_50%)]"></div>
        <div className="absolute top-10 right-10 w-24 h-24 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 dark:from-cyan-900/30 dark:to-blue-900/30 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-700/60 backdrop-blur-sm mb-6">
              📋 Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-cyan-200 dark:to-white bg-clip-text text-transparent">
              Getting Started
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Join thousands of healthcare professionals and patients using Schedula for seamless appointment management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 dark:border-slate-600/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">Sign Up</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Create your account as either a patient or doctor to access personalized features and start your healthcare journey.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 dark:border-slate-600/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">Browse & Book</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Patients can browse doctors and book appointments. Doctors can manage their schedules and patients efficiently.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 dark:border-slate-600/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">Smart Notifications</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Receive automated reminders and notifications for upcoming appointments and schedule changes.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 dark:border-slate-600/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">Manage Everything</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Access your personalized dashboard to manage appointments, profiles, and all your healthcare needs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/login"
              className="group relative inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center">
                Get Started Now
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
