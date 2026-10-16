import React from 'react';
import { ContactForm } from '../../components/ContactForm/ContactForm';
import { LocationSection } from '../../components/LocationSection/LocationSection';
import { MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="py-10 space-y-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
          Get In Touch & Visit
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-display">
          Contact FocusZone Library
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          We welcome students and parents to visit our reading hall in person. Reach out via WhatsApp, phone, or fill out the enquiry form below.
        </p>
      </div>

      {/* Main Grid: Info + Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Direct Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs space-y-6">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Front Desk Contact Details
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-xs">Physical Address</strong>
                    <p className="text-slate-600 mt-0.5 leading-snug">
                      2nd Floor, Apex Commercial Complex, Opp. Central Park, Near Metro Gate 3, Civil Lines
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-xs">Direct Telephone</strong>
                    <p className="text-slate-600 font-mono mt-0.5">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-xs">WhatsApp Helpline</strong>
                    <p className="text-slate-600 font-mono mt-0.5">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-xs">Email Desk</strong>
                    <p className="text-slate-600 mt-0.5">admissions@focuszonelibrary.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-xs">Visiting Hours for Inquiries</strong>
                    <p className="text-slate-600 mt-0.5">Monday to Sunday: 08:00 AM – 09:00 PM</p>
                    <p className="text-emerald-700 mt-0.5 font-medium">(Library remains open 24/7 for enrolled members)</p>
                  </div>
                </div>
              </div>

              {/* Quick WhatsApp Action */}
              <div className="pt-2">
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp Directly</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Side: Enquiry Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

        </div>
      </div>

      {/* Embedded Location Map Section */}
      <LocationSection />
    </div>
  );
};
