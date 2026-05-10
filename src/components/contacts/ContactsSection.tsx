import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError } from "../../lib/firebase";
import { Contact, OperationType } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Phone, User, Tag, Loader2, Info } from "lucide-react";

interface ContactsSectionProps {
  tripId: string;
}

export default function ContactsSection({ tripId }: ContactsSectionProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "contacts"),
      where("tripId", "==", tripId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
      
      if (docs.length === 0) {
        // Add dummy contacts for international prototype
        const dummyContacts: Contact[] = [
          { id: "c1", tripId, name: "Global Security Response", phone: "+1 800 555 0199", category: "Emergency", description: "24/7 International emergency hotline for curated voyages." },
          { id: "c2", tripId, name: "Luxury Lifestyle Concierge", phone: "+44 20 7946 0958", category: "Guide", description: "Exclusive access to local events and premium dining reservations." },
          { id: "c3", tripId, name: "Premium Transport Dispatch", phone: "+33 1 42 68 53 00", category: "Transport", description: "Chauffeur and private transfer arrangements." }
        ];
        setContacts(dummyContacts);
      } else {
        setContacts(docs);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "contacts");
    });

    return () => unsubscribe();
  }, [tripId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    setSaving(true);
    const path = "contacts";
    try {
      await addDoc(collection(db, "contacts"), {
        tripId,
        name: newName,
        phone: newPhone,
        category: newCategory,
        description: newDescription
      });
      setNewName("");
      setNewPhone("");
      setNewCategory("General");
      setNewDescription("");
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const path = `contacts/${id}`;
    try {
      await deleteDoc(doc(db, "contacts", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (loading) return (
     <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-teal-primary animate-spin" />
     </div>
  );

  return (
    <div className="space-y-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
           <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.4em] mb-4">Network</div>
           <h3 className="text-5xl font-display font-medium text-teal-dark tracking-tight">
             Helpful Contacts
           </h3>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="h-16 px-10 bg-teal-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-teal-primary transition-all luxury-shadow"
        >
          <Plus className="w-5 h-5 text-luxury-gold" />
          Add Connection
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white border border-slate-50 rounded-[4rem] p-12 luxury-shadow mb-16"
          >
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-teal-dark/30 ml-2 block italic">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-primary/30" />
                    <input 
                      type="text" 
                      placeholder="e.g. Local Guide, Embassy..."
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] h-16 pl-14 pr-6 outline-none focus:bg-white focus:border-teal-primary/40 transition-all font-display text-lg text-teal-dark"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-teal-dark/30 ml-2 block italic">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-primary/30" />
                    <input 
                      type="text" 
                      placeholder="+1 234 567 890"
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] h-16 pl-14 pr-6 outline-none focus:bg-white focus:border-teal-primary/40 transition-all font-mono text-lg text-teal-dark"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-teal-dark/30 ml-2 block italic">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-primary/30" />
                    <select 
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] h-16 pl-14 pr-6 outline-none focus:bg-white focus:border-teal-primary/40 transition-all font-bold text-[10px] uppercase tracking-widest text-teal-dark appearance-none"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                    >
                      <option>General</option>
                      <option>Emergency</option>
                      <option>Transport</option>
                      <option>Lodging</option>
                      <option>Guide</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-teal-dark/30 ml-2 block italic">Notes</label>
                  <div className="relative">
                    <Info className="absolute left-6 top-6 w-5 h-5 text-teal-primary/30" />
                    <textarea 
                      placeholder="Special instructions or context..."
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] h-32 pl-14 pr-6 py-6 outline-none focus:bg-white focus:border-teal-primary/40 transition-all font-light italic text-teal-dark resize-none"
                      value={newDescription}
                      onChange={e => setNewDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-6 pt-8 border-t border-slate-50">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-teal-dark transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="h-16 px-12 bg-teal-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-teal-primary transition-all luxury-shadow disabled:opacity-30"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-luxury-gold" />}
                  Register Contact
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {contacts.length === 0 && !isAdding ? (
          <div className="md:col-span-2 py-32 text-center bg-white rounded-[4rem] border border-slate-50 luxury-shadow flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-8 rotate-12">
               <Phone className="w-8 h-8 text-slate-200" />
            </div>
            <h4 className="text-2xl font-display font-medium text-teal-dark mb-4">No Connections Documented</h4>
            <p className="text-slate-400 font-light max-w-sm italic">Maintain a list of essential contacts for your journey, from emergency services to local guides.</p>
          </div>
        ) : (
          contacts.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-50 rounded-[3rem] p-10 luxury-shadow group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-light/20 rounded-bl-[6rem] -mr-6 -mt-6 transition-transform group-hover:scale-110" />
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="w-14 h-14 bg-teal-light rounded-2xl flex items-center justify-center luxury-shadow">
                  <Phone className="w-6 h-6 text-teal-primary" />
                </div>
                <div className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[8px] font-bold uppercase tracking-widest text-teal-dark/40 group-hover:bg-teal-primary group-hover:text-white group-hover:border-teal-primary transition-all">
                  {contact.category}
                </div>
              </div>
              <div className="relative z-10">
                <h4 className="text-2xl font-display font-medium text-teal-dark mb-2">{contact.name}</h4>
                <p className="text-xl font-mono font-bold text-teal-primary mb-6 tracking-tighter">{contact.phone}</p>
                {contact.description && (
                  <p className="text-sm text-slate-400 font-light italic leading-relaxed line-clamp-2 border-t border-slate-50 pt-4">
                    {contact.description}
                  </p>
                )}
              </div>
              <button 
                onClick={() => handleDelete(contact.id)}
                className="absolute bottom-10 right-10 w-12 h-12 rounded-full flex items-center justify-center text-slate-100 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
