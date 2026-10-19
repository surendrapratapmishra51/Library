import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { mockPlans } from '../../data/mockPlans';
import { RegistrationFormData } from '../../types';
import { Button } from '../common/Button';
import { CheckCircle2, Armchair, Shield, Sparkles, AlertCircle } from 'lucide-react';

export const RegistrationForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { seats, registerApplication, login } = useLibrary();

  const preselectedSeat = searchParams.get('seat') || '';
  const preselectedPlan = searchParams.get('plan') || 'quarterly';

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    mobile: '',
    email: '',
    dob: '',
    address: '',
    planId: preselectedPlan,
    preferredSeat: preselectedSeat,
    startDate: new Date().toISOString().split('T')[0],
    shiftTiming: '24/7 All Day',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResponse, setSuccessResponse] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync if URL query changes
  useEffect(() => {
    if (preselectedSeat) {
      setFormData((prev) => ({ ...prev, preferredSeat: preselectedSeat }));
    }
    if (preselectedPlan) {
      setFormData((prev) => ({ ...prev, planId: preselectedPlan }));
    }
  }, [preselectedSeat, preselectedPlan]);

  const availableSeats = seats.filter((s) => s.status === 'available');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form basic validation
    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.mobile.trim() || formData.mobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!formData.planId) {
      setErrorMsg('Please select a membership plan.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await registerApplication(formData);
      setIsSubmitting(false);
      setSuccessResponse(res.message);
      // Automatically authenticate as demo student
      login('student');
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Failed to process registration. Please try again.');
    }
  };

  if (successResponse) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 p-8 sm:p-10 shadow-lg text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 font-display">
            Application Registered Successfully!
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {successResponse}
          </p>
        </div>

        {/* Admission Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left text-xs space-y-2.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Candidate Name:</span>
            <span className="font-semibold text-slate-900">{formData.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Contact Mobile:</span>
            <span className="font-semibold text-slate-900">{formData.mobile}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Selected Plan:</span>
            <span className="font-semibold text-emerald-800">
              {mockPlans.find((p) => p.id === formData.planId)?.name || 'Custom Plan'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Reserved Desk:</span>
            <span className="font-mono font-bold text-slate-900">
              {formData.preferredSeat ? `Seat ${formData.preferredSeat}` : 'Front Desk Assigned'}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-200/70 pt-2">
            <span className="text-slate-500">Commencement Date:</span>
            <span className="font-semibold text-slate-800">{formData.startDate}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          A confirmation SMS & WhatsApp with your Biometric RFID Pass instructions will be sent to <strong>{formData.mobile}</strong>.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
          >
            Go to Student Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSuccessResponse(null);
              setFormData({
                fullName: '',
                mobile: '',
                email: '',
                dob: '',
                address: '',
                planId: 'quarterly',
                preferredSeat: '',
                startDate: new Date().toISOString().split('T')[0],
                shiftTiming: '24/7 All Day',
                notes: ''
              });
            }}
          >
            Submit Another Application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6"
    >
      <div className="border-b border-slate-100 pb-5">
        <h3 className="text-xl font-bold text-slate-900 font-display">
          Candidate Enrollment Form
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Complete the details below to reserve your silent study desk. All fields with an asterisk (*) are required.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Row 1: Full Name & Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            required
            placeholder="e.g. Vikramaditya Sharma"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Mobile Number (WhatsApp) *
          </label>
          <input
            type="tel"
            name="mobile"
            required
            placeholder="10-digit mobile number"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
          />
        </div>
      </div>

      {/* Row 2: Email & Date of Birth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="student@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Date of Birth
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
          />
        </div>
      </div>

      {/* Row 3: Address */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Residential Address / Hostel Name
        </label>
        <input
          type="text"
          name="address"
          placeholder="Locality, sector, or hostel building"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
        />
      </div>

      {/* Row 4: Plan & Preferred Seat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Membership Plan *
          </label>
          <select
            name="planId"
            value={formData.planId}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors font-medium text-slate-800"
          >
            {mockPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} — ₹{plan.price} ({plan.duration})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Preferred Seat</span>
            <span className="text-[10px] text-emerald-700 font-normal lowercase">
              ({availableSeats.length} vacant now)
            </span>
          </label>
          <select
            name="preferredSeat"
            value={formData.preferredSeat}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors font-mono"
          >
            <option value="">-- Let Admin Auto-Assign Best Desk --</option>
            {availableSeats.map((seat) => (
              <option key={seat.id} value={seat.number}>
                Seat {seat.number} ({seat.floorName || (seat.floor ? `Floor ${seat.floor}` : 'No Floor')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 5: Start Date & Shift Timing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Joining Start Date *
          </label>
          <input
            type="date"
            name="startDate"
            required
            value={formData.startDate}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Primary Study Shift
          </label>
          <select
            name="shiftTiming"
            value={formData.shiftTiming}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors text-slate-800"
          >
            <option value="24/7 All Day">Full 24/7 Unlimited Access</option>
            <option value="Morning (6 AM - 2 PM)">Morning Shift (06:00 AM – 02:00 PM)</option>
            <option value="Evening (2 PM - 10 PM)">Evening Shift (02:00 PM – 10:00 PM)</option>
            <option value="Night (10 PM - 6 AM)">Night Owl Shift (10:00 PM – 06:00 AM)</option>
          </select>
        </div>
      </div>

      {/* Terms Notice */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          By submitting this application, you agree to abide by the Library Silence Policy (whisper-free zones, no mobile talking, and clean hygiene standards).
        </span>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
        >
          Submit Application & Reserve Seat
        </Button>
      </div>
    </form>
  );
};
