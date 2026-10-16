import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Testimonial } from '../../types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors">
      <div>
        {/* Rating stars & Quote Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
            ))}
          </div>
          <Quote className="w-6 h-6 text-slate-200" />
        </div>

        {/* Text */}
        <p className="text-sm text-slate-700 italic leading-relaxed mb-6">
          "{testimonial.quote}"
        </p>
      </div>

      {/* Attribution */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 font-display">
            {testimonial.name}
          </h4>
          <p className="text-xs text-emerald-700 font-medium">
            {testimonial.examOrGoal}
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-500">
          <span className="font-mono font-semibold text-slate-700">{testimonial.seatNumber}</span>
          <p>{testimonial.studyDuration}</p>
        </div>
      </div>
    </div>
  );
};
