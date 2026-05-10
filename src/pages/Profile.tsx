import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Trip, UserProfile } from "../types";
import { motion } from "motion/react";
import { User, Mail, Phone, MapPin, Globe, Calendar, Compass, ArrowRight, Loader2, Award, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isFuture, isPast } from "date-fns";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!auth.currentUser) return;
      
      try {
        // Fetch User Profile
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }

        // Fetch User Trips
        const q = query(
          collection(db, "trips"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("startDate", "desc")
        );
        const snapshot = await getDocs(q);
        const fetchedTrips = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Trip));
        setTrips(fetchedTrips);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-paper">
        <Loader2 className="w-12 h-12 text-teal-primary animate-spin" />
      </div>
    );
  }

  const ongoingTrips = trips.filter(t => {
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);
    const now = new Date();
    return now >= start && now <= end;
  });

  const upcomingTrips = trips.filter(t => isFuture(new Date(t.startDate)) && !ongoingTrips.includes(t));
  const previousTrips = trips.filter(t => isPast(new Date(t.endDate)) && !ongoingTrips.includes(t));

  return (
    <div className="min-h-screen bg-luxury-paper pb-32">
      {/* Profile Header */}
      <div className="bg-teal-dark pt-48 pb-32 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-[0.02] rounded-bl-full pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-48 h-48 rounded-full border-4 border-luxury-gold outline outline-offset-8 outline-white/10 overflow-hidden luxury-shadow bg-white"
          >
            <img 
              src={profile?.photoURL || auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <div className="text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-4">
               <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.4em]">Distinguished Member</div>
               <Award className="w-4 h-4 text-luxury-gold" />
            </div>
            <h1 className="text-6xl md:text-7xl font-serif text-white tracking-tighter italic">
              {profile ? `${profile.firstName} ${profile.lastName}` : auth.currentUser?.displayName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-8 pt-4">
               <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-4 h-4 text-teal-primary/60" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{auth.currentUser?.email}</span>
               </div>
               {profile?.phone && (
                 <div className="flex items-center gap-3 text-slate-400">
                    <Phone className="w-4 h-4 text-teal-primary/60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{profile.phone}</span>
                 </div>
               )}
               {profile?.city && (
                 <div className="flex items-center gap-3 text-slate-400">
                    <MapPin className="w-4 h-4 text-teal-primary/60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{profile.city}, {profile.country}</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="max-w-7xl mx-auto px-8 -mt-12 relative z-20">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
               { label: "Total Expeditions", value: trips.length, icon: Compass },
               { label: "Active Journeys", value: ongoingTrips.length, icon: Clock },
               { label: "Future Explorations", value: upcomingTrips.length, icon: Calendar },
               { label: "Archived Memories", value: previousTrips.length, icon: Award },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[3rem] luxury-shadow border border-slate-50 flex flex-col items-center justify-center text-center group hover:bg-teal-primary transition-all duration-500"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/10">
                   <stat.icon className="w-6 h-6 text-teal-primary group-hover:text-white" />
                </div>
                <div className="text-3xl font-display font-medium text-teal-dark group-hover:text-white mb-1 tracking-tighter">{stat.value}</div>
                <div className="text-[8px] font-bold text-slate-400 group-hover:text-white/60 uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
         </div>
      </div>

      {/* Trip Collections */}
      <section className="max-w-7xl mx-auto px-8 mt-24 space-y-32">
        
        {/* Ongoing Trips */}
        {ongoingTrips.length > 0 && (
          <div>
            <div className="flex items-center gap-6 mb-12">
               <div className="w-2 h-2 bg-teal-primary rounded-full animate-ping" />
               <h2 className="text-4xl font-serif text-teal-dark italic">Active Explorations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {ongoingTrips.map(trip => <TripCard key={trip.id} trip={trip} status="Active" />)}
            </div>
          </div>
        )}

        {/* Upcoming Trips */}
        <div>
          <div className="flex items-center justify-between mb-12">
             <h2 className="text-4xl font-serif text-teal-dark tracking-tight">Upcoming Itineraries</h2>
             <button className="text-[10px] font-bold uppercase tracking-widest text-teal-primary">View Calendar</button>
          </div>
          {upcomingTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {upcomingTrips.map(trip => <TripCard key={trip.id} trip={trip} status="Upcoming" />)}
            </div>
          ) : (
            <div className="p-16 border border-slate-100 rounded-[4rem] text-center bg-white flex flex-col items-center group cursor-pointer hover:border-teal-primary transition-colors">
               <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-300 group-hover:bg-teal-light group-hover:text-teal-primary transition-colors">
                  <Calendar className="w-8 h-8" />
               </div>
               <p className="text-slate-400 font-light italic">No future journeys curated. Start your next chapter today.</p>
            </div>
          )}
        </div>

        {/* Previous Trips */}
        <div>
          <div className="flex items-center justify-between mb-12">
             <h2 className="text-4xl font-serif text-teal-dark tracking-tight">Archived Expeditions</h2>
          </div>
          {previousTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {previousTrips.map(trip => <TripCard key={trip.id} trip={trip} status="Archived" />)}
            </div>
          ) : (
             <p className="text-slate-300 font-light italic text-center">Your archives are waiting to be filled with memories.</p>
          )}
        </div>

      </section>
    </div>
  );
}

function TripCard({ trip, status }: { trip: Trip, status: string }) {
  return (
    <motion.div whileHover={{ y: -10 }} className="group">
      <Link to={`/trip/${trip.id}`} className="block h-full">
         <div className="bg-white rounded-[4rem] overflow-hidden luxury-shadow flex flex-col h-full border border-slate-50 transition-all duration-500">
            <div className="h-64 relative overflow-hidden">
               <img 
                 src={trip.bannerUrl || `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800&sig=${trip.id}`} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                 alt={trip.name} 
               />
               <div className="absolute top-6 left-6 px-4 h-8 glass-morphism rounded-full flex items-center justify-center text-[8px] font-bold text-teal-dark uppercase tracking-widest">
                  {status}
               </div>
            </div>
            <div className="p-10 flex-col flex-1">
               <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  {format(new Date(trip.startDate), 'MMMM yyyy')}
               </div>
               <h3 className="text-2xl font-display font-medium text-teal-dark mb-8 group-hover:text-teal-primary transition-colors tracking-tight">{trip.name}</h3>
               <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-teal-primary uppercase tracking-widest group-hover:translate-x-2 transition-transform">Details</span>
                  <ArrowRight className="w-4 h-4 text-teal-primary group-hover:translate-x-2 transition-transform" />
               </div>
            </div>
         </div>
      </Link>
    </motion.div>
  );
}
