import { useState, useEffect } from "react";
import { collection, query, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError } from "../../lib/firebase";
import { ChecklistItem, OperationType } from "../../types";
import { Plus, Trash2, CheckCircle2, Circle, Loader2, ClipboardCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChecklistSectionProps {
  tripId: string;
}

export default function ChecklistSection({ tripId }: ChecklistSectionProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    const path = `trips/${tripId}/checklist`;
    try {
      const snap = await getDocs(collection(db, path));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChecklistItem));
      
      if (data.length === 0) {
        // Add default international checklist for prototype
        const defaults = [
          "Secure International Passport & Visa",
          "Finalize Travel Insurance manifest",
          "Currency Exchange & Global Card activation",
          "Digital storage for E-Tickets & Manifests",
          "International roaming & Data Curation",
          "Bespoke wardrobe for regional climate",
          "Medical certifications & Travel health kit"
        ];
        // For prototype, we show them locally without writing to DB to avoid permissions check on first load
        setItems(defaults.map((it, i) => ({ id: `default-${i}`, tripId, item: it, completed: i < 2 })));
      } else {
        setItems(data);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [tripId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const path = `trips/${tripId}/checklist`;
    try {
      const itemData = { tripId, item: newItem, completed: false };
      const docRef = await addDoc(collection(db, path), itemData);
      setItems([...items, { id: docRef.id, ...itemData }]);
      setNewItem("");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    const path = `trips/${tripId}/checklist/${id}`;
    try {
      await updateDoc(doc(db, `trips/${tripId}/checklist`, id), { completed: !completed });
      setItems(items.map(i => i.id === id ? { ...i, completed: !completed } : i));
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleDelete = async (id: string) => {
    const path = `trips/${tripId}/checklist/${id}`;
    try {
      await deleteDoc(doc(db, `trips/${tripId}/checklist`, id));
      setItems(items.filter(i => i.id !== id));
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (loading) return (
    <div className="py-24 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-teal-primary animate-spin" />
      <p className="text-xs font-bold text-teal-primary/40 uppercase tracking-widest">Organizing essentials...</p>
    </div>
  );

  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-24">
      <div className="bg-white border border-slate-50 p-16 rounded-[4rem] luxury-shadow relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-light/30 rounded-bl-[12rem] -mr-16 -mt-16" />
        <div className="relative z-10">
           <div className="w-24 h-24 bg-white luxury-shadow rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 rotate-6 transition-transform hover:rotate-0">
              <ClipboardCheck className="w-10 h-10 text-teal-primary" />
           </div>
           <h2 className="text-5xl font-display font-medium text-teal-dark mb-6 tracking-tight">Essential Precepts</h2>
           <div className="flex items-center justify-center gap-12 text-[10px] uppercase tracking-[0.4em] font-bold text-slate-300">
              <div className="flex flex-col gap-2">
                 <span>Provisioned</span>
                 <span className="text-teal-dark text-lg">{items.length}</span>
              </div>
              <div className="w-px h-12 bg-slate-100" />
              <div className="flex flex-col gap-2">
                 <span>Readied</span>
                 <span className={`${progress === 100 && items.length > 0 ? 'text-teal-primary' : 'text-teal-dark'} text-lg`}>{completedCount}</span>
              </div>
           </div>
           
           <div className="mt-16 max-w-md mx-auto">
              <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-4">
                 <span>Preparation Progress</span>
                 <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   className="h-full bg-teal-primary shadow-[0_0_20px_rgba(19,122,127,0.4)]"
                 />
              </div>
           </div>
        </div>
      </div>

      <form onSubmit={handleAdd} className="relative group">
         <input 
           type="text" 
           placeholder="Entry point for essentials..."
           className="w-full bg-white border border-slate-50 rounded-[2.5rem] h-24 px-12 pr-32 outline-none focus:bg-white focus:luxury-shadow transition-all font-display text-2xl text-teal-dark placeholder:text-slate-100 shadow-sm"
           value={newItem}
           onChange={e => setNewItem(e.target.value)}
         />
         <button 
           type="submit"
           className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-teal-dark text-white rounded-3xl flex items-center justify-center hover:bg-teal-primary transition-all luxury-shadow active:scale-95"
         >
           <Plus className="w-8 h-8 text-luxury-gold" />
         </button>
      </form>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center justify-between p-8 rounded-[2.5rem] border transition-all luxury-shadow group ${
                item.completed ? 'bg-slate-50/50 border-transparent opacity-60' : 'bg-white border-slate-50'
              }`}
            >
              <div 
                className="flex items-center gap-8 cursor-pointer flex-1"
                onClick={() => handleToggle(item.id, item.completed)}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                   item.completed ? 'bg-teal-primary luxury-shadow scale-90' : 'bg-slate-50 border border-slate-100'
                }`}>
                   {item.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                   ) : (
                      <div className="w-2 h-2 rounded-full bg-teal-dark/10" />
                   )}
                </div>
                <span className={`text-xl font-display font-medium tracking-tight transition-all ${
                   item.completed ? 'text-teal-dark/40 line-through' : 'text-teal-dark'
                }`}>
                  {item.item}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                className="w-12 h-12 rounded-full flex items-center justify-center text-slate-100 hover:text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
