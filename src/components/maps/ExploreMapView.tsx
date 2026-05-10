import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { Loader2, Search, Compass, MapPin, Sparkles, Navigation, Star, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Stop } from "../../types";
import { INTERNATIONAL_DESTINATIONS } from "../../constants";

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

interface ExploreMapViewProps {
  tripId: string;
}

export default function ExploreMapView({ tripId }: ExploreMapViewProps) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const q = query(
          collection(db, "stops"),
          where("tripId", "==", tripId)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stop));
        setStops(docs.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
      } finally {
        setLoading(false);
      }
    };
    fetchStops();
  }, [tripId]);

  return (
    <div className="space-y-24">
      <div className="px-12 pt-12">
         <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.4em] mb-4">Discovery Feed</div>
         <h3 className="text-5xl font-serif text-teal-dark tracking-tighter leading-tight italic">
            Global Curations
         </h3>
         <p className="text-slate-400 font-light italic mt-4 max-w-lg">Bespoke recommendations derived from international travel databases. Explore the hidden gems of your next destination.</p>
      </div>

      <div className="px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
         {INTERNATIONAL_DESTINATIONS.slice(0, 6).map((dest, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               viewport={{ once: true }}
               className="group relative h-[500px] rounded-[3.5rem] overflow-hidden luxury-shadow border border-slate-50 cursor-pointer"
            >
               <img 
                  src={dest.image} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={dest.name} 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/90 via-teal-dark/20 to-transparent" />
               <div className="absolute inset-x-10 bottom-10">
                  <div className="flex items-center gap-3 text-luxury-gold font-bold text-[8px] uppercase tracking-[0.3em] mb-4">
                     <Sparkles className="w-3 h-3" />
                     {dest.region}
                  </div>
                  <h4 className="text-3xl font-display font-medium text-white tracking-tight mb-4 group-hover:text-luxury-gold transition-colors">{dest.name}</h4>
                  <p className="text-white/60 text-xs font-light italic leading-relaxed line-clamp-2 mb-8">
                     {dest.description}
                  </p>
                  <div className="flex items-center gap-4 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                     Discover Entry <ArrowRight className="w-4 h-4 text-luxury-gold" />
                  </div>
               </div>
            </motion.div>
         ))}
      </div>

      <div className="px-12 pb-12">
         <div className="bg-teal-dark rounded-[4rem] p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-[0.03] rounded-full blur-[100px]" />
            <div className="max-w-xl space-y-6">
               <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.5em]">Live Cartography</div>
               <h3 className="text-3xl md:text-5xl font-serif text-white italic tracking-tight leading-none">Interactive Exploration</h3>
               <p className="text-white/40 font-light italic">Visualize your voyage through bespoke interactive maps. Connect keys to unlock live search and discovery.</p>
            </div>
            
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-luxury-gold group-hover:border-luxury-gold transition-all cursor-pointer">
               <Compass className="w-8 h-8 text-white" />
            </div>
         </div>
      </div>
    </div>
  );
}
