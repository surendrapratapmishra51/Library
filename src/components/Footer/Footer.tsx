import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base">
                F
              </span>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                FocusZone Library
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              A modern physical reading hall dedicated to serious aspirants. Individual silent study cubicles, 24/7 air conditioning, uninterrupted power backup, and fast optical WiFi.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="text-emerald-400">● Live</span>
              <span>18 Seats Currently Open</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Explore Space
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/facilities" className="hover:text-white transition-colors">
                  Facilities & Amenities
                </Link>
              </li>
              <li>
                <Link to="/plans" className="hover:text-white transition-colors">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link to="/seats" className="hover:text-white transition-colors">
                  Live Seat Availability (100 Desks)
                </Link>
              </li>
              <li>
                <Link to="/join" className="hover:text-white transition-colors">
                  Student Registration Form
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Our Silent Space
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Visit & Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>2nd Floor, Apex Commercial Complex, Near Metro Gate 3, Civil Lines</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp: +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href="mailto:support@focuszonelibrary.com" className="hover:text-white">
                  support@focuszonelibrary.com
                </a>
              </li>
            </ul>
          </div>

          {/* Operating Hours & Shifts */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Library Shifts
            </h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Open 24 Hours / 7 Days</p>
                  <p className="text-xs text-slate-400">Including Sundays and all holidays</p>
                </div>
              </div>
              <div className="pt-2 text-xs space-y-1.5 border-t border-slate-900">
                <div className="flex justify-between">
                  <span>Morning Shift:</span>
                  <span className="text-slate-300">06:00 AM – 02:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Evening Shift:</span>
                  <span className="text-slate-300">02:00 PM – 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Full 24/7 Access:</span>
                  <span className="text-emerald-400">Round the clock</span>
                </div>
              </div>
              <div className="pt-3">
                <Link
                  to="/admin"
                  className="text-xs text-slate-500 hover:text-slate-300 underline"
                >
                  Staff / Admin Management Access
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Bottom Legal */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} FocusZone Study Library. All rights reserved. Physical reading center.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white transition-colors">
              Library Rules
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Book a Free Trial Shift
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Member Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
