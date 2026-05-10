import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth, handleFirestoreError } from "../lib/firebase";
import { OperationType } from "../types";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Plane } from "lucide-react";

export default function CreateTrip() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: ""
  });

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    const path = "trips";
    try {
      const tripData = {
        ...newTrip,
        userId: user.uid,
        shareId: Math.random().toString(36).substring(2, 9),
        isPublic: false,
        members: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, path), tripData);
      navigate(`/trip/${docRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-teal-dark transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Archives
        </button>

        <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-20">
          <div>
            <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.4em] mb-4">Phase 01</div>
            <h1 className="text-5xl md:text-7xl font-serif text-teal-dark tracking-tighter leading-none italic">
              Initialize your <br />Manifest
            </h1>
          </div>
          <div className="bg-slate-50 p-8 rounded-[2.5rem] luxury-shadow border border-slate-100 max-w-xs">
            <p className="text-xs text-slate-500 font-light italic leading-relaxed">
              Step into the curation process. Define your boundaries, set your timeframe, and begin the architectural journey of your next voyage.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateTrip} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-2">Shipment / Voyage Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Amalfi Coast Expedition"
                className="w-full bg-slate-50 border-none rounded-3xl h-20 px-8 outline-none focus:bg-white focus:luxury-shadow transition-all font-display text-xl text-teal-dark"
                value={newTrip.name}
                onChange={e => setNewTrip({...newTrip, name: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-2">Description (Optional)</label>
              <input 
                type="text" 
                placeholder="The objective of this journey..."
                className="w-full bg-slate-50 border-none rounded-3xl h-20 px-8 outline-none focus:bg-white focus:luxury-shadow transition-all font-display text-lg text-teal-dark italic"
                value={newTrip.description}
                onChange={e => setNewTrip({...newTrip, description: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-2">Departure Date</label>
              <input 
                required
                type="date" 
                className="w-full bg-slate-50 border-none rounded-3xl h-20 px-8 outline-none focus:bg-white focus:luxury-shadow transition-all font-display text-lg text-teal-dark"
                value={newTrip.startDate}
                onChange={e => setNewTrip({...newTrip, startDate: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-2">Return Date</label>
              <input 
                required
                type="date" 
                className="w-full bg-slate-50 border-none rounded-3xl h-20 px-8 outline-none focus:bg-white focus:luxury-shadow transition-all font-display text-lg text-teal-dark"
                value={newTrip.endDate}
                onChange={e => setNewTrip({...newTrip, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-12 flex justify-center">
            <button 
              disabled={loading}
              type="submit"
              className="h-24 px-16 bg-teal-dark text-white rounded-[2.5rem] luxury-shadow flex items-center gap-6 hover:bg-teal-primary transition-all group disabled:opacity-50"
            >
              <Plane className={`w-6 h-6 text-luxury-gold group-hover:-rotate-45 transition-transform ${loading ? 'animate-pulse' : ''}`} />
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Finalize Manifest</p>
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Entry to archives</p>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
