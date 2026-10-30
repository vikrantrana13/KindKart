import { Package, Users, Truck, Database, Zap, Shield, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { KindKartLogo } from './KindKartLogo';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';

export function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  
  const backgroundImages = [
    "https://images.unsplash.com/photo-1710092784814-4a6f158913b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFyaXR5JTIwdm9sdW50ZWVycyUyMGNvbW11bml0eSUyMGhlbHBpbmd8ZW58MXx8fHwxNzY5NzA4MDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1593113630400-ea4288922497?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZG9uYXRpb24lMjBjaGFyaXR5fGVufDF8fHx8MTc2OTcwODIxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1617080090911-91409e3496ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWxwaW5nJTIwaGFuZHMlMjBjb21tdW5pdHl8ZW58MXx8fHwxNzY5NzA4MjE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1752584157962-8821ce8b732b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub25wcm9maXQlMjB2b2x1bnRlZXJzJTIwc29ydGluZyUyMGRvbmF0aW9uc3xlbnwxfHx8fDE3Njk3MDg0OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1705592579405-0d59931c8e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFyaXR5JTIwZm9vZCUyMGJhbmslMjBwYWNrYWdpbmd8ZW58MXx8fHwxNzY5NzA4NDkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1591718913854-66196fb4d096?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBjYXJlJTIwc2hhcmluZyUyMGtpbmRuZXNzfGVufDF8fHx8MTc2OTcwODQ5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 7000); // Change image every 7 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
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
                className="text-white hover:text-emerald-200 transition-colors font-medium"
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

      {/* Hero Section with Background */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Background Image Carousel with Overlay */}
          <div className="absolute inset-0 z-0">
            {backgroundImages.map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <ImageWithFallback
                  src={img}
                  alt="Community helping"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/75 via-emerald-800/65 to-white"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 drop-shadow-2xl animate-fade-in">
              Welcome to <span className="text-emerald-300">KindKart</span>
            </h1>
            <p className="text-2xl text-white/95 mb-4 max-w-2xl mx-auto drop-shadow-lg font-light">
              Connecting surplus into support through technology
            </p>
            <p className="text-base text-white/90 mb-16 max-w-3xl mx-auto drop-shadow-md">
              A scalable donation management platform connecting donors and NGOs through reliable, technology-driven coordination.
            </p>

            {/* Enhanced CTA Buttons - Only 2 Buttons Now */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
              {/* Donate Items Button - Green */}
              <button 
                onClick={() => navigate('/auth/donor')}
                className="relative group bg-white text-emerald-700 px-8 py-6 rounded-2xl text-lg font-bold shadow-2xl hover:shadow-emerald-500/60 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex flex-col items-center justify-center gap-3 group-hover:text-white transition-colors">
                  <div className="bg-emerald-100 group-hover:bg-white/20 rounded-full p-4 transition-all group-hover:scale-110">
                    <Package className="w-8 h-8 transition-transform group-hover:rotate-12" />
                  </div>
                  <span className="text-xl">Donate Items</span>
                  <span className="text-xs opacity-70 group-hover:opacity-100">Share your surplus</span>
                </div>
                <div className="absolute inset-0 ring-4 ring-white/40 rounded-2xl group-hover:ring-emerald-300/60 transition-all"></div>
              </button>
              
              {/* NGO/Volunteer Login Button - Blue */}
              <button 
                onClick={() => navigate('/auth/ngo')}
                className="relative group bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-2xl hover:shadow-blue-400/60 transition-all overflow-hidden border-2 border-white/30"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-0 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative flex flex-col items-center justify-center gap-3 group-hover:scale-105 transition-transform">
                  <div className="bg-white/20 rounded-full p-4 transition-all group-hover:bg-white/30 group-hover:scale-110">
                    <Users className="w-8 h-8 transition-transform group-hover:-rotate-12" />
                  </div>
                  <span className="text-xl">NGO / Volunteer</span>
                  <span className="text-xs opacity-90">Collect donations</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* How It Works Section - with subtle background */}
        <section className="bg-gradient-to-b from-white via-emerald-50/30 to-emerald-50 py-16 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(16, 185, 129) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="bg-emerald-100 rounded-full p-6 mb-4 group-hover:bg-emerald-600 transition-all duration-300 group-hover:scale-110 transform">
                    <Package className="w-12 h-12 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Submit Donation
                  </h3>
                  <p className="text-gray-600">
                    List your surplus items and schedule a pickup time
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="bg-emerald-100 rounded-full p-6 mb-4 group-hover:bg-emerald-600 transition-all duration-300 group-hover:scale-110 transform">
                    <Truck className="w-12 h-12 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    NGO Picks It Up
                  </h3>
                  <p className="text-gray-600">
                    Local NGOs collect items directly from your location
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="bg-emerald-100 rounded-full p-6 mb-4 group-hover:bg-emerald-600 transition-all duration-300 group-hover:scale-110 transform">
                    <Users className="w-12 h-12 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Items Redistributed
                  </h3>
                  <p className="text-gray-600">
                    Donations reach those in need through verified organizations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why KindKart Section */}
        <section className="bg-gradient-to-b from-emerald-50 to-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
              Why Choose KindKart?
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Our platform is built with modern technology and best practices to ensure reliable, scalable donation management
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 border-t-4 border-emerald-500">
                <div className="bg-emerald-100 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Reliable Coordination
                </h3>
                <p className="text-gray-600 text-sm">
                  Designed to handle high donation volumes without system failure.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 border-t-4 border-blue-500">
                <div className="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Scalable Architecture
                </h3>
                <p className="text-gray-600 text-sm">
                  Built using containerized microservices and load balancing.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 border-t-4 border-orange-500">
                <div className="bg-orange-100 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Priority-Based Processing
                </h3>
                <p className="text-gray-600 text-sm">
                  Urgent donations are handled first to reduce wastage.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 border-t-4 border-purple-500">
                <div className="bg-purple-100 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Secure NGO Access
                </h3>
                <p className="text-gray-600 text-sm">
                  Verified NGO onboarding ensures platform integrity.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Left: Logo and tagline */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <KindKartLogo size={40} className="text-emerald-400" />
                <span className="text-2xl font-bold">KindKart</span>
              </div>
              <p className="text-gray-400 text-sm">
                A DevOps-driven donation logistics platform.
              </p>
            </div>

            {/* Middle: Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <Link to="/about" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                  About
                </Link>
                <button 
                  onClick={() => navigate('/auth/donor')}
                  className="text-gray-400 hover:text-emerald-400 transition-colors text-sm text-left"
                >
                  Donate
                </button>
                <button 
                  onClick={() => navigate('/auth/ngo')}
                  className="text-gray-400 hover:text-emerald-400 transition-colors text-sm text-left"
                >
                  NGO Login
                </button>
              </div>
            </div>

            {/* Right: Contact Information */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
              <div className="flex flex-col gap-2 text-sm">
                <p className="text-gray-400">
                  <span className="font-medium text-white">Email:</span> support@kindkart.org
                </p>
                <p className="text-gray-400">
                  <span className="font-medium text-white">Phone:</span> +91-9548594049
                </p>
              </div>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2026 KindKart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
