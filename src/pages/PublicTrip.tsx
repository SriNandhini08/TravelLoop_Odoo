import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, handleFirestoreError } from "../lib/firebase";
import { Trip, Stop, Activity, OperationType } from "../types";
import { Compass, Calendar, MapPin, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "motion/react";

export default function PublicTrip() {
  const { shareId } = useParams();
  const [data, setData] = useState<{trip: Trip, stops: Stop[], activities: Activity[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!shareId) return;
      setLoading(true);
      try {
        const tripQ = query(collection(db, "trips"), where("shareId", "==", shareId), where("isPublic", "==", true));
        const tripSnap = await getDocs(tripQ);
        
        if (tripSnap.empty) {
          setError("Trip not found or private.");
          return;
        }

        const tripDoc = tripSnap.docs[0];
        const trip = { id: tripDoc.id, ...tripDoc.data() } as Trip;

        const stopsSnap = await getDocs(query(collection(db, `trips/${trip.id}/stops`), orderBy("startDate", "asc")));
        const stops = stopsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Stop));

        const activitiesSnap = await getDocs(collection(db, `trips/${trip.id}/activities`));
        const activities = activitiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Activity));

        setData({ trip, stops, activities });
      } catch (err) {
        setError("An error occurred while fetching the trip.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shareId]);

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-teal-light/20">
      <Loader2 className="w-12 h-12 text-teal-primary animate-spin" />
      <p className="mt-6 text-xs font-bold text-teal-primary/40 uppercase tracking-[0.3em]">Connecting to itinerary...</p>
    </div>
  );

  if (error || !data) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center gap-8 bg-white">
      <div className="w-20 h-20 bg-teal-light rounded-[2rem] flex items-center justify-center shadow-lg shadow-teal-primary/10">
        <Compass className="w-10 h-10 text-teal-primary" />
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-teal-dark tracking-tight">{error || "Signal Interrupted"}</h1>
        <p className="text-slate-400 max-w-sm font-medium leading-relaxed">This itinerary has been archived or retracted. Please verify the access link with the original sender.</p>
      </div>
      <button 
        onClick={() => window.location.href = '/'}
        className="px-8 h-14 bg-teal-primary text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-teal-primary/20 transition-all hover:scale-105"
      >
        Return to Traveloop
      </button>
    </div>
  );

  const { trip, stops, activities } = data;

  return (
    <div className="min-h-screen bg-luxury-paper pb-48 selection:bg-teal-primary selection:text-white">
      {/* Immersive Hero */}
      <div className="relative h-screen flex flex-col items-center justify-center text-center px-12 overflow-hidden">
        <motion.img 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt={trip.name}
        />
        <div className="absolute inset-0 bg-teal-dark/30 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-teal-dark/60 via-transparent to-luxury-paper" />
        
        <div className="relative z-10">
           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-white/60 font-bold text-[10px] uppercase tracking-[0.6em] mb-12"
           >
              Trip Reference: {trip.shareId.toUpperCase()}
           </motion.div>
          
          <motion.h1 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1, duration: 1 }}
             className="text-7xl md:text-9xl lg:text-[12rem] font-display font-medium text-white tracking-tight leading-[0.8] mb-16"
          >
             {trip.name}
          </motion.h1>
          
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1.5 }}
             className="flex flex-col items-center gap-12"
          >
             <div className="flex items-center gap-4 text-white font-bold text-[10px] uppercase tracking-[0.4em]">
                <div className="w-12 h-px bg-white/40" />
                {format(new Date(trip.startDate), 'MMMM dd')} &mdash; {format(new Date(trip.endDate), 'MMMM dd, yyyy')}
                <div className="w-12 h-px bg-white/40" />
             </div>
             {trip.description && (
               <p className="max-w-xl text-white/80 text-xl font-serif italic leading-relaxed">
                 &ldquo;{trip.description}&rdquo;
               </p>
             )}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[8px] font-bold text-teal-dark uppercase tracking-widest">Scroll to Journey</span>
          <div className="w-px h-12 bg-teal-dark/20" />
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-12 pt-48">
         <div className="relative pl-24 space-y-48">
            <div className="absolute left-[31px] top-4 bottom-4 w-px bg-teal-dark/10" />
            
            {stops.map((stop, i) => (
              <motion.div 
                key={stop.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-10%" }}
                className="relative"
              >
                 <div className="absolute -left-[108px] top-0 flex flex-col items-center gap-4">
                    <span className="text-[10px] font-bold text-teal-dark/20">{String(i + 1).padStart(2, '0')}</span>
                    <div className="w-16 h-16 rounded-full border border-teal-dark/5 bg-white luxury-shadow flex items-center justify-center">
                       <MapPin className="w-5 h-5 text-teal-primary" />
                    </div>
                 </div>
                 
                 <div className="space-y-12">
                    <div>
                       <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.4em] mb-4 block">Destination</span>
                       <h3 className="text-6xl md:text-8xl font-display font-medium text-teal-dark mb-6 tracking-tight">{stop.city}</h3>
                       <div className="flex items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(stop.startDate), 'MMM dd')} &mdash; {format(new Date(stop.endDate), 'MMM dd')}
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                       {activities.filter(a => a.stopId === stop.id).length === 0 ? (
                         <div className="p-12 border border-teal-dark/5 rounded-[3rem] italic text-slate-300 font-light text-center">No experiences documented for this stop.</div>
                       ) : (
                         activities
                          .filter(a => a.stopId === stop.id)
                          .sort((a,b) => {
                             if(a.date && b.date) return a.date.localeCompare(b.date);
                             if(a.time && b.time) return a.time.localeCompare(b.time);
                             return 0;
                          })
                          .map((activity, idx) => (
                           <motion.div 
                             initial={{ opacity: 0, x: 20 }}
                             whileInView={{ opacity: 1, x: 0 }}
                             transition={{ delay: idx * 0.1 }}
                             key={activity.id} 
                             className="group flex items-center justify-between p-10 bg-white border border-slate-50 rounded-[3rem] luxury-shadow hover:bg-teal-dark hover:text-white transition-all duration-500"
                           >
                              <div className="space-y-2">
                                 <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-luxury-gold group-hover:text-luxury-gold/60">{activity.category} {activity.time && `• ${activity.time}`}</span>
                                 <h4 className="text-2xl font-display font-medium tracking-tight leading-none">{activity.title}</h4>
                                 {activity.date && <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest mt-2">{format(new Date(activity.date), 'MMM dd')}</span>}
                              </div>
                              <div className="w-14 h-14 rounded-2xl bg-teal-light group-hover:bg-white/10 flex items-center justify-center transition-colors">
                                 <Sparkles className="w-6 h-6 text-teal-primary group-hover:text-white" />
                              </div>
                           </motion.div>
                         ))
                       )}
                    </div>
                 </div>
              </motion.div>
            ))}
         </div>

         <footer className="mt-72 border-t border-teal-dark/5 pt-32 text-center">
            <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               className="flex flex-col items-center gap-12"
            >
               <div className="w-24 h-24 bg-white luxury-shadow rounded-full flex items-center justify-center">
                  <Compass className="w-8 h-8 text-teal-primary" />
               </div>
               <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300 mb-6">Designed with Precision</p>
                  <h3 className="text-4xl font-display font-medium text-teal-dark tracking-[0.2em]">TRAVELOOP</h3>
                  <p className="text-[10px] font-bold text-teal-primary mt-8 opacity-40 uppercase tracking-widest">A Modern Curation Platform</p>
               </div>
            </motion.div>
         </footer>
      </div>
    </div>
  );
}
