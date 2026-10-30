import { Link } from 'react-router';
import { KindKartLogo } from './KindKartLogo';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50/30 via-white to-emerald-50/30">
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
                className="text-emerald-200 font-medium border-b-2 border-emerald-200"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-8 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Contact Us
              </h1>
              <p className="text-gray-600 mb-6">
                Have questions or want to collaborate with us?<br />
                We'd love to hear from you.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Your full name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Right: Contact Information */}
            <div className="space-y-6">
              {/* Contact Info Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Get In Touch
                </h2>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-100 rounded-full p-3 mt-1">
                      <Mail className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <a 
                        href="mailto:support@kindkart.org" 
                        className="text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        support@kindkart.org
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 mt-1">
                      <Phone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                      <a 
                        href="tel:+919548594049" 
                        className="text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        +91-9548594049
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 rounded-full p-3 mt-1">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                      <p className="text-gray-600">
                        Serving communities across India
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl shadow-xl p-8 text-white">
                <h3 className="text-xl font-bold mb-3">Why Contact Us?</h3>
                <ul className="space-y-2 text-emerald-50">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-200 mt-1">•</span>
                    <span>Partnership opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-200 mt-1">•</span>
                    <span>Technical support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-200 mt-1">•</span>
                    <span>NGO verification inquiries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-200 mt-1">•</span>
                    <span>General questions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
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
