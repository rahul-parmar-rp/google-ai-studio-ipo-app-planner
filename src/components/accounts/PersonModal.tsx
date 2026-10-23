import React, { useState, useEffect } from 'react';
import { Person } from '../../types';
import { X, Check, User } from 'lucide-react';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPerson?: Person | null;
  onSave: (person: Omit<Person, 'id' | 'createdAt'>) => void;
}

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  onClose,
  initialPerson,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [pan, setPan] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialPerson) {
      setName(initialPerson.name);
      setPan(initialPerson.pan || '');
      setNotes(initialPerson.notes || '');
      setIsActive(initialPerson.isActive);
    } else {
      setName('');
      setPan('');
      setNotes('');
      setIsActive(true);
    }
  }, [initialPerson, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      pan: pan.trim().toUpperCase() || undefined,
      notes: notes.trim() || undefined,
      isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-sm">
              {initialPerson ? 'Edit Applicant / Investor' : 'Add New Applicant / Investor'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Applicant Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Parmar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              PAN Number (Permanent Account Number)
            </label>
            <input
              type="text"
              placeholder="e.g. ABCPR1234F"
              value={pan}
              maxLength={10}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Used to prevent duplicate PAN retail/HNI bid rejections during IPO allocation.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Notes / Family Role
            </label>
            <input
              type="text"
              placeholder="e.g. Primary HNI applicant, tax entity"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="person-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <label htmlFor="person-active" className="text-xs text-slate-300">
              Active Applicant (eligible for bidding)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialPerson ? 'Save Changes' : 'Add Person'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
