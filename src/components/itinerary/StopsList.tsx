import { useState, useEffect } from "react";
import { collection, query, getDocs, addDoc, deleteDoc, doc, orderBy } from "firebase/firestore";
import { db, handleFirestoreError } from "../../lib/firebase";
import { Stop, Activity, OperationType } from "../../types";
import { Plus, MapPin, Trash2, Search, Loader2, Sparkles, PlusCircle, Calendar, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";

interface StopsListProps {
  tripId: string;
}

export default function StopsList({ tripId }: StopsListProps) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStop, setShowAddStop] = useState(false);
  const [newStop, setNewStop] = useState({ city: "", startDate: "", endDate: "" });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const stopsPath = `trips/${tripId}/stops`;
    const activitiesPath = `trips/${tripId}/activities`;
    try {
      const stopsSnap = await getDocs(query(collection(db, stopsPath), orderBy("startDate", "asc")));
      const fetchedStops = stopsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Stop));
      
      const activitiesSnap = await getDocs(collection(db, activitiesPath));
      const fetchedActivities = activitiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Activity));
      
      if (fetchedStops.length === 0) {
        // Provide dummy data if empty
        const dummyStops: Stop[] = [
          { id: "ds1", city: "New Delhi", startDate: "2026-11-05", endDate: "2026-11-07", tripId },
          { id: "ds2", city: "Agra", startDate: "2026-11-08", endDate: "2026-11-09", tripId },
          { id: "ds3", city: "Jaipur", startDate: "2026-11-10", endDate: "2026-11-13", tripId }
        ];
        const dummyActivities: Activity[] = [
          { id: "da1", stopId: "ds1", tripId, title: "Red Fort Visit", cost: 15, category: "Sights", time: "10:00", date: "2026-11-05" },
          { id: "da2", stopId: "ds1", tripId, title: "Chandni Chowk Food Tour", cost: 25, category: "Food", time: "18:00", date: "2026-11-06" },
          { id: "da3", stopId: "ds2", tripId, title: "Taj Mahal Sunrise", cost: 40, category: "Sights", time: "06:00", date: "2026-11-08" },
          { id: "da4", stopId: "ds3", tripId, title: "Amer Fort Elephant Ride", cost: 35, category: "Adventure", time: "09:00", date: "2026-11-10" },
          { id: "da5", stopId: "ds3", tripId, title: "Chokhi Dhani Dinner", cost: 30, category: "Culture", time: "19:00", date: "2026-11-12" }
        ];
        setStops(dummyStops);
        setActivities(dummyActivities);
      } else {
        setStops(fetchedStops);
        setActivities(fetchedActivities);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, stopsPath);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const searchCities = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setCityResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search/cities`);
      const data = await res.json();
      setCityResults(data.filter((c: any) => c.name.toLowerCase().includes(q.toLowerCase())));
    } finally {
      setIsSearching(false);
    }
  };

  const addStop = async (city: string) => {
    const path = `trips/${tripId}/stops`;
    try {
      const stopData = { city, startDate: newStop.startDate, endDate: newStop.endDate, tripId };
      const docRef = await addDoc(collection(db, path), stopData);
      setStops([...stops, { id: docRef.id, ...stopData }].sort((a,b) => a.startDate.localeCompare(b.startDate)));
      setShowAddStop(false);
      setNewStop({ city: "", startDate: "", endDate: "" });
      setSearchQuery("");
      setCityResults([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteStop = async (id: string) => {
    if (!confirm("Delete this city and all its activities?")) return;
    const path = `trips/${tripId}/stops/${id}`;
    try {
      await deleteDoc(doc(db, `trips/${tripId}/stops`, id));
      setStops(stops.filter(s => s.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addActivity = async (stopId: string, title: string, cost: number, category: string, time?: string, date?: string) => {
    const path = `trips/${tripId}/activities`;
    try {
      const activityData = { stopId, tripId, title, cost, category, time, date };
      const docRef = await addDoc(collection(db, path), activityData);
      setActivities([...activities, { id: docRef.id, ...activityData }]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteActivity = async (id: string) => {
    const path = `trips/${tripId}/activities/${id}`;
    try {
      await deleteDoc(doc(db, `trips/${tripId}/activities`, id));
      setActivities(activities.filter(a => a.id !== id));
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (loading) return (
    <div className="py-12 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-teal-primary animate-spin" />
      <p className="text-xs font-bold text-teal-primary/40 uppercase tracking-widest">Building timeline...</p>
    </div>
  );

  return (
    <div className="space-y-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.4em] mb-4">Itinerary</div>
           <h3 className="text-5xl font-display font-medium text-teal-dark tracking-tight">
             Voyage Timeline
           </h3>
        </div>
        <button 
          onClick={() => setShowAddStop(true)}
          className="h-16 px-10 border border-teal-primary text-teal-primary rounded-full flex items-center gap-3 hover:bg-teal-primary hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest luxury-shadow"
        >
          <Plus className="w-5 h-5" />
          Visit New City
        </button>
      </div>

      <div className="relative pl-24 space-y-32">
        {/* Elegant Timeline Line */}
        <div className="absolute left-[31px] top-8 bottom-8 w-px bg-teal-dark/10" />
        
        {stops.map((stop, i) => (
          <motion.div 
            key={stop.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Minimalist Timeline Indicator */}
            <div className="absolute -left-[108px] top-0 flex flex-col items-center gap-4">
              <span className="text-[10px] font-bold text-teal-dark/20">{String(i + 1).padStart(2, '0')}</span>
              <div className="w-16 h-16 rounded-full bg-white border border-teal-dark/5 luxury-shadow flex items-center justify-center relative z-10">
                 <div className="w-2 h-2 rounded-full bg-teal-primary" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
               <div className="lg:col-span-4">
                  <div className="sticky top-40">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-5xl font-display font-medium text-teal-dark mb-4 tracking-tight leading-none">{stop.city}</h4>
                        <div className="flex items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                           <Calendar className="w-4 h-4 text-luxury-gold" />
                           {format(new Date(stop.startDate), 'MMM dd')} &mdash; {format(new Date(stop.endDate), 'MMM dd')}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => deleteStop(stop.id)}
                           className="text-[8px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors flex items-center gap-2"
                         >
                           <Trash2 className="w-4 h-4" />
                           Terminate Stop
                         </button>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="lg:col-span-8">
                  <div className="bg-white border border-slate-50 luxury-shadow rounded-[3rem] p-12 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-light/50 rounded-bl-[8rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    
                    <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-50 relative z-10">
                       <h5 className="text-[10px] uppercase tracking-[0.4em] font-bold text-teal-dark/30">Curated Experiences</h5>
                       <ActivitySelector stopId={stop.id} cityName={stop.city} onAdd={addActivity} stopStart={stop.startDate} stopEnd={stop.endDate} />
                    </div>
                    
                    <div className="grid gap-6 relative z-10">
                      {activities.filter(a => a.stopId === stop.id).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-50 rounded-[2rem]">
                           <Sparkles className="w-10 h-10 text-teal-primary/10 mb-6" />
                           <p className="text-slate-400 text-sm font-light italic">Your itinerary is silent. Discover local gems.</p>
                        </div>
                      ) : (
                        activities
                          .filter(a => a.stopId === stop.id)
                          .sort((a, b) => {
                            if (a.date && b.date) return a.date.localeCompare(b.date);
                            if (a.time && b.time) return a.time.localeCompare(b.time);
                            return 0;
                          })
                          .map((activity, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={activity.id} 
                            className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-teal-primary/10 hover:bg-white hover:luxury-shadow transition-all group"
                          >
                            <div className="flex items-center gap-8">
                              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center luxury-shadow group-hover:scale-110 transition-transform flex-shrink-0">
                                 <PlusCircle className="w-6 h-6 text-teal-primary" />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[8px] uppercase tracking-[0.3em] text-luxury-gold font-bold">{activity.category} {activity.time && `• ${activity.time}`}</span>
                                <div className="flex flex-col">
                                   <span className="text-xl font-display font-medium text-teal-dark block">{activity.title}</span>
                                   {activity.date && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(activity.date), 'MMM dd')}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-8">
                              <span className="font-bold text-teal-dark/40 font-mono text-sm tracking-tighter">${activity.cost}</span>
                              <button 
                                onClick={() => deleteActivity(activity.id)}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-200 hover:text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Stop Modal - Styled with Luxury Aesthetic */}
      <AnimatePresence>
        {showAddStop && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-teal-dark/40 backdrop-blur-md" 
               onClick={() => setShowAddStop(false)}
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 40 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 40 }}
               className="bg-white w-full max-w-2xl p-16 rounded-[4rem] relative z-10 luxury-shadow border border-slate-50"
            >
              <div className="text-center mb-16">
                 <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.4em] mb-6">Discovery</div>
                 <h4 className="text-5xl font-display font-medium text-teal-dark tracking-tight">New Horizon</h4>
              </div>
              
              <div className="space-y-12">
                <div className="relative">
                   <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-teal-dark/30 ml-2 block mb-4">Location Search</label>
                   <div className="relative">
                      <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-teal-primary/20" />
                      <input 
                        type="text" 
                        placeholder="Search cities across the globe..."
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] h-20 pl-20 pr-8 outline-none focus:border-teal-primary/40 focus:bg-white transition-all font-display text-xl text-teal-dark"
                        value={searchQuery}
                        onChange={(e) => searchCities(e.target.value)}
                      />
                      {isSearching && <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 animate-spin text-teal-primary" />}
                   </div>
                   
                   {cityResults.length > 0 && (
                     <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-50 rounded-[2.5rem] overflow-hidden luxury-shadow z-20">
                        {cityResults.map(city => (
                          <button 
                            key={city.name}
                            onClick={() => setNewStop({ ...newStop, city: city.name })}
                            className="w-full px-8 py-6 text-left hover:bg-teal-light/30 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-0"
                          >
                            <div className="flex flex-col">
                               <span className="text-lg font-display font-medium text-teal-dark">{city.name}</span>
                               <span className="text-[10px] font-bold text-teal-dark/30 uppercase tracking-widest">{city.country}</span>
                            </div>
                            <Sparkles className="w-5 h-5 opacity-0 group-hover:opacity-100 text-teal-primary transition-opacity" />
                          </button>
                        ))}
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-4">
                     <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-teal-dark/30 ml-2">Check-in</label>
                     <input 
                       type="date"
                       className="w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] h-20 px-8 outline-none focus:border-teal-primary/40 focus:bg-white transition-all text-sm font-bold uppercase tracking-widest"
                       value={newStop.startDate}
                       onChange={e => setNewStop({...newStop, startDate: e.target.value})}
                     />
                   </div>
                   <div className="space-y-4">
                     <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-teal-dark/30 ml-2">Check-out</label>
                     <input 
                       type="date"
                       className="w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] h-20 px-8 outline-none focus:border-teal-primary/40 focus:bg-white transition-all text-sm font-bold uppercase tracking-widest"
                       value={newStop.endDate}
                       onChange={e => setNewStop({...newStop, endDate: e.target.value})}
                     />
                   </div>
                </div>

                <div className="flex gap-4 pt-8">
                   <button 
                    disabled={!newStop.city || !newStop.startDate || !newStop.endDate}
                    onClick={() => addStop(newStop.city)}
                    className="w-full h-24 bg-teal-dark text-white rounded-[2rem] font-bold uppercase tracking-[0.4em] text-[10px] disabled:opacity-30 luxury-shadow transition-all hover:bg-teal-primary flex items-center justify-center gap-4"
                   >
                     Confirm Destination
                     <ArrowRight className="w-5 h-5" />
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActivitySelector({ stopId, cityName, onAdd, stopStart, stopEnd }: { stopId: string, cityName: string, onAdd: any, stopStart: string, stopEnd: string }) {
  const [show, setShow] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [customTime, setCustomTime] = useState("10:00");
  const [customDate, setCustomDate] = useState(stopStart);

  useEffect(() => {
    if (show) {
      fetch(`/api/search/activities?city=${cityName}`).then(r => r.json()).then(setOptions);
    }
  }, [show, cityName]);

  return (
    <div className="relative">
      <button 
        onClick={() => setShow(!show)}
        className="text-[10px] font-bold uppercase tracking-widest text-teal-primary flex items-center gap-2 hover:scale-105 transition-transform bg-teal-light px-4 py-2 rounded-full"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        Curate Experiences
      </button>

      <AnimatePresence>
        {show && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
            <motion.div 
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 10, scale: 0.95 }}
               className="absolute right-0 top-full mt-3 w-80 bg-white border border-slate-100 rounded-[2rem] p-6 z-50 shadow-2xl"
            >
               <div className="mb-6 space-y-4">
                  <div className="flex gap-4">
                     <div className="flex-1">
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Time</label>
                        <input type="time" value={customTime} onChange={e => setCustomTime(e.target.value)} className="w-full text-xs font-bold border border-slate-100 rounded-lg p-2" />
                     </div>
                     <div className="flex-1">
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date</label>
                        <input type="date" value={customDate} min={stopStart} max={stopEnd} onChange={e => setCustomDate(e.target.value)} className="w-full text-xs font-bold border border-slate-100 rounded-lg p-2" />
                     </div>
                  </div>
               </div>

               {options.length === 0 ? (
                 <p className="p-6 text-xs text-slate-400 italic font-medium text-center">Identifying local spots...</p>
               ) : (
                 <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
                    {options.map((opt, i) => (
                       <button 
                        key={i}
                        onClick={() => {
                          onAdd(stopId, opt.title, opt.cost, opt.category, customTime, customDate);
                          setShow(false);
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-teal-light rounded-2xl text-left group transition-colors"
                       >
                         <div className="flex flex-col">
                            <span className="text-[8px] uppercase tracking-[0.1em] text-teal-primary/40 font-bold">{opt.category}</span>
                            <span className="text-sm font-bold text-teal-dark">{opt.title}</span>
                         </div>
                         <span className="text-xs font-bold text-teal-primary/60">${opt.cost}</span>
                       </button>
                    ))}
                 </div>
               )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
