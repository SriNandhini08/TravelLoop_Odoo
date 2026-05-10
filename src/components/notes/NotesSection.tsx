import { useState, useEffect } from "react";
import { collection, query, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError } from "../../lib/firebase";
import { Note, OperationType } from "../../types";
import { Plus, Trash2, FileText, Save, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

interface NotesSectionProps {
  tripId: string;
}

export default function NotesSection({ tripId }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    const path = `trips/${tripId}/notes`;
    try {
      const snap = await getDocs(collection(db, path));
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Note)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [tripId]);

  const handleAdd = async () => {
    if (!newContent.trim()) return;
    setSaving(true);
    const path = `trips/${tripId}/notes`;
    try {
      const docRef = await addDoc(collection(db, path), { tripId, content: newContent });
      setNotes([...notes, { id: docRef.id, tripId, content: newContent }]);
      setNewContent("");
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const path = `trips/${tripId}/notes/${id}`;
    try {
      await deleteDoc(doc(db, `trips/${tripId}/notes`, id));
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (loading) return (
    <div className="py-24 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-teal-primary animate-spin" />
      <p className="text-xs font-bold text-teal-primary/40 uppercase tracking-widest">Opening travel journals...</p>
    </div>
  );

  return (
    <div className="space-y-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
           <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.4em] mb-4">Journal</div>
           <h3 className="text-5xl font-display font-medium text-teal-dark tracking-tight">
             Voyage Archive
           </h3>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="h-16 px-10 bg-teal-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-teal-primary transition-all luxury-shadow"
        >
          <Plus className="w-5 h-5 text-luxury-gold" />
          Document Discovery
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-50 rounded-[3rem] p-12 luxury-shadow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-light/30 rounded-bl-[8rem] -mr-8 -mt-8" />
              <textarea 
                autoFocus
                placeholder="Transcribe your observations... (Markdown supported)"
                className="w-full h-64 bg-transparent text-teal-dark outline-none resize-none font-display text-xl leading-relaxed placeholder:text-slate-200 relative z-10"
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
              />
              <div className="flex items-center justify-between pt-8 mt-12 border-t border-slate-50 relative z-10">
                 <button onClick={() => setIsAdding(false)} className="text-[8px] uppercase tracking-widest font-bold text-slate-300 hover:text-teal-dark transition-colors">Discard</button>
                 <button 
                   onClick={handleAdd} 
                   disabled={saving || !newContent.trim()}
                   className="bg-teal-dark text-white px-10 h-16 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 disabled:opacity-30 luxury-shadow hover:bg-teal-primary transition-all"
                 >
                   {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-luxury-gold" />}
                   Preserve Discovery
                 </button>
              </div>
            </motion.div>
          )}

          {notes.map((note, i) => (
            <motion.div 
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-50 rounded-[3rem] p-12 luxury-shadow group transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-primary/5" />
              <div className="markdown-body prose prose-sm max-w-none mb-12 text-teal-dark/70 leading-relaxed font-light italic text-lg">
                <ReactMarkdown>{note.content}</ReactMarkdown>
              </div>
              <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                       <FileText className="w-5 h-5 text-teal-primary/40" />
                    </div>
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Archive Reference {note.id.slice(0,4).toUpperCase()}</span>
                 </div>
                 <button 
                   onClick={() => handleDelete(note.id)}
                   className="opacity-0 group-hover:opacity-100 w-12 h-12 rounded-full flex items-center justify-center text-slate-200 hover:text-white hover:bg-red-500 transition-all"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
