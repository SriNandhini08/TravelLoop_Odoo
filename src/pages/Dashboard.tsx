import { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs, addDoc, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db, auth, handleFirestoreError } from "../lib/firebase";
import { Trip, OperationType } from "../types";
import { Plus, Calendar, MapPin, Trash2, ArrowRight, Search, Compass, ChevronRight, Loader2, EyeOff, Share2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { INTERNATIONAL_DESTINATIONS } from "../constants";

export default function Dashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchTrips = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const path = "trips";
    try {
      const q = query(
        collection(db, path),
        where("userId", "==", user.uid),
        orderBy("startDate", "desc")
      );
      const snap = await getDocs(q);
      setTrips(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trip.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (filter === "all") return matchesSearch;
      if (filter === "public") return matchesSearch && trip.isPublic;
      if (filter === "private") return matchesSearch && !trip.isPublic;
      return matchesSearch;
    });
  }, [trips, searchQuery, filter]);

  const filteredDestinations = useMemo(() => {
    if (!searchQuery) return INTERNATIONAL_DESTINATIONS;
    return INTERNATIONAL_DESTINATIONS.filter(dest => 
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white selection:bg-teal-primary selection:text-white">
      {/* Hero Banner Section */}
      <div className="relative h-[65vh] w-full overflow-hidden bg-teal-dark">
        <motion.img 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2070" 
          className="absolute inset-0 w-full h-full object-cover"
          alt="International Travel"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
        
        <div className="absolute inset-x-0 bottom-12 px-8 md:px-16 container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.5em] mb-6">Concierge Dashboard</div>
            <h1 className="text-5xl md:text-8xl font-serif text-teal-dark tracking-tighter leading-[0.9] mb-8 italic">
              Your Worldwide <br/>Curations
            </h1>
            <p className="text-teal-dark/60 text-sm md:text-base font-light italic tracking-tight max-w-lg mb-12">
              Welcome back. Your next odyssey awaits discovery. Manage your international itineraries and explore new horizons.
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center gap-6 mt-12">
             <div className="h-20 px-8 bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl luxury-shadow flex items-center gap-6 group hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-teal-primary/10 flex items-center justify-center">
                   <Compass className="w-5 h-5 text-teal-primary" />
                </div>
                <div>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Voyages</p>
                   <p className="text-lg font-display font-medium text-teal-dark">{trips.length}</p>
                </div>
             </div>
             <button 
              onClick={() => navigate('/create')}
              className="h-20 px-10 bg-teal-dark text-white rounded-[2.5rem] luxury-shadow flex items-center gap-4 hover:bg-teal-primary transition-all group scale-100 active:scale-95"
             >
                <Plus className="w-5 h-5 text-luxury-gold group-hover:rotate-90 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Initialize Trip</span>
             </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 md:px-16 py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-24">
           <div className="relative w-full max-w-xl group">
             <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-primary/20 group-focus-within:text-teal-primary transition-colors" />
             <input 
              type="text" 
              placeholder="Locate a specific manifest..."
              className="w-full bg-slate-50 border-none rounded-[2rem] h-20 pl-20 pr-8 outline-none focus:bg-white focus:luxury-shadow transition-all font-display text-xl text-teal-dark"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
             />
           </div>
           
           <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-[2rem]">
              {['all', 'public', 'private'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`h-14 px-8 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    filter === t ? 'bg-white text-teal-dark luxury-shadow' : 'text-slate-300 hover:text-teal-dark'
                  }`}
                >
                  {t === 'all' ? 'Archives' : t}
                </button>
              ))}
           </div>
        </div>

        <div className="mb-32">
           <div className="flex items-end justify-between gap-8 mb-16 px-4">
              <div>
                 <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.4em] mb-4">Inspiration</div>
                 <h2 className="text-4xl md:text-5xl font-display font-medium text-teal-dark tracking-tight">
                    {searchQuery ? `Discovered Horizons (${filteredDestinations.length})` : 'Worldwide Vales'}
                 </h2>
              </div>
              <div className="hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                 Shifted per season &bull; Global
              </div>
           </div>
           
           {filteredDestinations.length === 0 ? (
             <div className="py-24 bg-slate-50 rounded-[4rem] flex flex-col items-center justify-center text-center">
                <Compass className="w-12 h-12 text-slate-200 mb-6 animate-pulse" />
                <h4 className="text-2xl font-serif text-teal-dark italic">No destinations found in current records.</h4>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-4">Try a different search query</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {filteredDestinations.slice(0, 6).map((dest, i) => (
                  <motion.div 
                    key={dest.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative h-[600px] rounded-[3.5rem] overflow-hidden luxury-shadow cursor-pointer"
                  >
                     <img 
                      src={dest.image} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      alt={dest.name} 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                     <div className="absolute inset-x-12 bottom-12 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4 opacity-100">{dest.region}</p>
                        <h3 className="text-4xl font-display font-medium mb-6 tracking-tight line-clamp-1">{dest.name}</h3>
                        <p className="text-sm font-light italic text-white/60 mb-8 line-clamp-2">{dest.description}</p>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-luxury-gold transition-all">
                           <ChevronRight className="w-6 h-6" />
                        </div>
                     </div>
                  </motion.div>
               ))}
             </div>
           )}
        </div>

        <div>
           <div className="flex items-center justify-between mb-16 px-4">
              <h2 className="text-3xl font-display font-medium text-teal-dark flex items-center gap-6">
                Your Manifests
                <span className="text-sm font-bold text-slate-200 uppercase tracking-[0.4em] pt-1">({filteredTrips.length})</span>
              </h2>
           </div>

           {loading ? (
             <div className="py-24 flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-8 h-8 text-teal-primary animate-spin" />
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Retrieving manifests...</p>
             </div>
           ) : filteredTrips.length === 0 ? (
             <div className="bg-slate-50 rounded-[4rem] py-32 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-10 rotate-12 luxury-shadow">
                   <MapPin className="w-10 h-10 text-slate-100" />
                </div>
                <h4 className="text-3xl font-display font-medium text-teal-dark mb-4 tracking-tight">The Library is Hollow</h4>
                <p className="text-slate-400 font-light italic max-w-sm mb-12">Initialize your first international itinerary to begin documenting your global discovery.</p>
                <Link to="/create" className="h-16 px-12 bg-teal-dark text-white rounded-full flex items-center gap-4 hover:shadow-2xl hover:-translate-y-1 transition-all text-[10px] font-bold uppercase tracking-[0.3em]">
                   Initialize Curation
                </Link>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {filteredTrips.map((trip) => (
                  <Link 
                    key={trip.id} 
                    to={`/trip/${trip.id}`}
                    className="group bg-white border border-slate-50 flex flex-col sm:flex-row h-auto sm:h-64 rounded-[3rem] overflow-hidden luxury-shadow transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]"
                  >
                    <div className="w-full sm:w-64 h-48 sm:h-full relative overflow-hidden">
                       <img 
                        src="https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=2000" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt="Trip" 
                       />
                       <div className="absolute inset-0 bg-teal-dark/10" />
                       <div className="absolute top-6 left-6 h-10 px-4 bg-white/90 backdrop-blur-md rounded-full flex items-center gap-2 text-[8px] font-bold tracking-widest text-teal-dark">
                          {trip.isPublic ? <Share2 className="w-3 h-3 text-luxury-gold" /> : <EyeOff className="w-3 h-3 text-slate-300" />}
                          {trip.isPublic ? 'Live Access' : 'Private'}
                       </div>
                    </div>
                    <div className="flex-1 p-10 flex flex-col justify-between">
                       <div>
                          <div className="flex items-center gap-3 text-luxury-gold font-bold text-[8px] uppercase tracking-[0.3em] mb-4">
                             <Calendar className="w-3 h-3" />
                             {format(new Date(trip.startDate), 'MMM yyyy')}
                          </div>
                          <h4 className="text-2xl font-display font-medium text-teal-dark tracking-tight mb-2 group-hover:text-teal-primary transition-colors">{trip.name}</h4>
                          <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                             <MapPin className="w-3 h-3" />
                             International Manifest
                          </div>
                       </div>
                       <div className="flex items-center justify-end">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-teal-primary group-hover:text-white transition-all">
                             <ChevronRight className="w-5 h-5" />
                          </div>
                       </div>
                    </div>
                  </Link>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
