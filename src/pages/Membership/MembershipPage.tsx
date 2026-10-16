import React, { useState } from 'react';
import { MembershipSection } from '../../components/MembershipSection/MembershipSection';
import { mockPlans } from '../../data/mockPlans';
import { Link } from 'react-router-dom';
import { Check, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const MembershipPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Will I get the same seat reserved every single day?',
      a: 'Yes, absolutely. Unlike public libraries where seats are first-come first-served, FocusZone assigns you a fixed private cubicle. Your seat number remains reserved exclusively in your name for your entire membership duration.'
    },
    {
      q: 'Can I leave my books and notes at my desk overnight?',
      a: 'Yes. Our premises are under 24/7 CCTV surveillance and secured with biometric RFID access. Most students safely leave heavy reference books, notebooks, and study stands at their personal desk.'
    },
    {
      q: 'What if I need to travel home or have exam leaves during my plan?',
      a: 'For 6 Months and Yearly plans, we offer a complimentary membership freeze (up to 2 weeks for 6M, and 1 full month for Yearly) so your validity does not lapse while you are away.'
    },
    {
      q: 'Are there any security deposits or hidden admission fees?',
      a: 'None at all. The price listed is completely all-inclusive with AC, power backup, high-speed fiber Wi-Fi, and drinking water. No surprise maintenance or registration fees.'
    }
  ];

  return (
    <div className="py-10 space-y-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
          Guaranteed Desk Allocations
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-display">
          Membership Plans & Pricing
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          Choose a plan that fits your examination timeline. All memberships guarantee full access to all silent reading halls and amenities.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <MembershipSection showTitle={false} />

      {/* Feature Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Membership Benefits Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Detailed comparison between monthly, quarterly, and long-term plans
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="p-4 font-semibold text-slate-700">Feature / Amenity</th>
                  <th className="p-4 font-semibold text-slate-900 text-center">Monthly</th>
                  <th className="p-4 font-bold text-emerald-800 bg-emerald-50/50 text-center">Quarterly (Popular)</th>
                  <th className="p-4 font-semibold text-slate-900 text-center">6 Months</th>
                  <th className="p-4 font-semibold text-slate-900 text-center">Yearly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-4 font-medium text-slate-900">Fixed Reserved Desk & Ergonomic Chair</td>
                  <td className="p-4 text-center">Included</td>
                  <td className="p-4 text-center bg-emerald-50/30 font-semibold text-emerald-900">Included</td>
                  <td className="p-4 text-center">Prime Choice</td>
                  <td className="p-4 text-center font-bold">Executive Desk</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">300 Mbps Fiber Internet & AC</td>
                  <td className="p-4 text-center">Included</td>
                  <td className="p-4 text-center bg-emerald-50/30">Included</td>
                  <td className="p-4 text-center">High Priority</td>
                  <td className="p-4 text-center">Dedicated Speed</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Personal Storage Locker</td>
                  <td className="p-4 text-center text-slate-400">₹200/mo extra</td>
                  <td className="p-4 text-center bg-emerald-50/30 text-emerald-700 font-semibold">Free Included</td>
                  <td className="p-4 text-center text-emerald-700 font-semibold">Free Included</td>
                  <td className="p-4 text-center text-emerald-700 font-semibold">Free Large Locker</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Plan Pause / Vacation Freeze</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center bg-emerald-50/30 text-slate-400">—</td>
                  <td className="p-4 text-center font-medium">Up to 2 Weeks</td>
                  <td className="p-4 text-center font-medium">Up to 1 Month</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Biometric RFID Turnstile Gate Access</td>
                  <td className="p-4 text-center">24/7 Active</td>
                  <td className="p-4 text-center bg-emerald-50/30 font-semibold text-emerald-900">24/7 Active</td>
                  <td className="p-4 text-center">24/7 Active</td>
                  <td className="p-4 text-center">24/7 Active</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900">Monthly Effective Cost</td>
                  <td className="p-4 text-center font-mono font-bold">₹1,200/mo</td>
                  <td className="p-4 text-center font-mono font-bold text-emerald-700 bg-emerald-50">₹1,066/mo</td>
                  <td className="p-4 text-center font-mono font-bold">₹983/mo</td>
                  <td className="p-4 text-center font-mono font-bold text-emerald-800">₹875/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 mt-1">Common queries regarding our physical reading space and plans</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-semibold text-sm text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 font-mono text-base">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
