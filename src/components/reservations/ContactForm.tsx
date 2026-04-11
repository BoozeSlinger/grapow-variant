'use client';

import React from 'react';
import { useReservationStore } from '@/store/useReservationStore';

export const ContactForm: React.FC = () => {
  const { firstName, lastName, email, phone, notes, setContactInfo } = useReservationStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactInfo({ [name]: value });
  };

  const inputClasses = "w-full h-12 bg-white/5 border border-white/10 rounded-none px-4 text-sm text-white focus:outline-none focus:border-gold transition-all duration-300 hover:bg-white/10";
  const labelClasses = "text-[10px] font-bold tracking-[0.2em] text-gold uppercase mb-2 block";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>First Name</label>
          <input
            type="text"
            name="firstName"
            value={firstName}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="John"
          />
        </div>
        <div>
          <label className={labelClasses}>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={lastName}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Email Address</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className={labelClasses}>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <div>
        <label className={labelClasses}>Special Requests (Optional)</label>
        <textarea
          name="notes"
          value={notes}
          onChange={handleChange}
          rows={4}
          className={`${inputClasses} h-auto py-4 resize-none`}
          placeholder="Birthday, allergy, etc..."
        />
      </div>
    </div>
  );
};
