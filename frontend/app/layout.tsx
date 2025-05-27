import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Schedula",
  description: "Smart appointment scheduling platform for doctors and patients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-b border-slate-700/50 backdrop-blur-sm">
            <div className="container mx-auto py-6 px-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-75"></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="relative w-10 h-10 mr-4 text-cyan-400"
                    >
                      <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                    Schedula
                  </h1>
                </div>
                <Navbar />
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-12 min-h-screen">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          <footer className="bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200/60 mt-16 backdrop-blur-sm">
            <div className="container mx-auto py-12 px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-slate-800 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Schedula
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Smart appointment scheduling platform connecting doctors and patients seamlessly with modern technology.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-800">Quick Links</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li><a href="/" className="hover:text-cyan-600 transition-colors duration-200 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      Home
                    </a></li>
                    <li><a href="/doctors" className="hover:text-cyan-600 transition-colors duration-200 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      Doctors
                    </a></li>
                    <li><a href="/schedules" className="hover:text-cyan-600 transition-colors duration-200 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      Schedules
                    </a></li>
                    <li><a href="/login" className="hover:text-cyan-600 transition-colors duration-200 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      Login
                    </a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-800">Contact</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-center group">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                          <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      +1 (555) 123-4567
                    </li>
                    <li className="flex items-center group">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                          <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                          <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                        </svg>
                      </div>
                      support@schedula.com
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-slate-200/60 mt-12 pt-8 text-center">
                <p className="text-slate-500 font-medium">
                  &copy; {new Date().getFullYear()} Schedula. All rights reserved. Built with ❤️ for healthcare.
                </p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
