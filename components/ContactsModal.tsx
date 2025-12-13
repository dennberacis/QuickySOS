import React, { useState } from 'react';
import { Contact } from '../types';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onRemoveContact: (id: string) => void;
}

const ContactsModal: React.FC<ContactsModalProps> = ({ 
  isOpen, onClose, contacts, onAddContact, onRemoveContact 
}) => {
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newPhone) {
      onAddContact({
        id: Date.now().toString(),
        name: newName,
        phone: newPhone
      });
      setNewName('');
      setNewPhone('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Emergency Contacts</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar">
          {contacts.map(contact => (
            <div key={contact.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div>
                <p className="font-semibold text-white">{contact.name}</p>
                <p className="text-sm text-slate-400">{contact.phone}</p>
              </div>
              <button 
                onClick={() => onRemoveContact(contact.id)}
                className="text-red-400 hover:text-red-300 p-2"
                title="Remove Contact"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Add New Contact</p>
          <input 
            type="text" 
            placeholder="Name (e.g. Dad)" 
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
          />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            value={newPhone}
            onChange={e => setNewPhone(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
          />
          <button 
            type="submit"
            disabled={!newName || !newPhone}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg transition text-sm"
          >
            Add Contact
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactsModal;