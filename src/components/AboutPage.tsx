import { Link } from 'react-router';
import { KindKartLogo } from './KindKartLogo';
import { ArrowLeft, Target, Zap, Shield, Users } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-emerald-700 to-emerald-500 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <KindKartLogo size={48} className="text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-2xl font-bold text-white drop-shadow-lg tracking-tight">
                KindKart
              </span>
            </Link>
            
            {/* Nav Links */}
            <div className="flex items-center gap-8">
              <Link 
                to="/" 
                className="text-white hover:text-emerald-200 transition-colors font-medium"
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-emerald-200 font-medium border-b-2 border-emerald-200"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-white hover:text-emerald-200 transition-colors font-medium"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-8 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          {/* About Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 mb-12">
            <div className="flex items-center justify-center mb-8">
              <KindKartLogo size={80} className="text-emerald-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
              About KindKart
            </h1>
            
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                KindKart is a <span className="font-semibold text-emerald-600">DevOps-driven donation management system</span> designed to reduce resource wastage by enabling structured and scalable coordination between donors and NGOs.
              </p>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                The platform emphasizes <span className="font-semibold text-emerald-600">reliability, automation, and system resilience</span> to ensure that usable items reach communities efficiently.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed">
                By leveraging modern cloud infrastructure, containerized microservices, and intelligent load balancing, KindKart creates a seamless connection between those who have surplus resources and the communities that need them most.
              </p>
            </div>
          </div>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-100 rounded-full p-3">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-gray-600">
                To eliminate resource wastage by creating an efficient bridge between donors and those in need through technology-driven coordination.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Technology First</h3>
              </div>
              <p className="text-gray-600">
                Built with modern DevOps practices, ensuring high availability, scalability, and automated processes for seamless operations.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 rounded-full p-3">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Trust & Security</h3>
              </div>
              <p className="text-gray-600">
                Verified NGO onboarding and secure data handling ensure that every donation reaches legitimate organizations.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 rounded-full p-3">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Community Impact</h3>
              </div>
              <p className="text-gray-600">
                Connecting donors, NGOs, and volunteers in a unified platform to maximize the positive impact on communities.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl shadow-xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
            <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
              Whether you're a donor looking to share surplus resources or an NGO seeking reliable donation coordination, KindKart is here to help.
            </p>
            <Link 
              to="/" 
              className="inline-block bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <KindKartLogo size={32} className="text-emerald-400" />
              <span className="text-xl font-bold">KindKart</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              A DevOps-driven donation logistics platform.
            </p>
            <p className="text-gray-400 text-sm">
              © 2026 KindKart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
