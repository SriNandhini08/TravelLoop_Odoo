import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError } from "../lib/firebase";
import { Trip, OperationType } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  MapPin, 
  Share2, 
  ChevronLeft, 
  PieChart as PieChartIcon, 
  ListTodo, 
  Clock,
  Eye,
  EyeOff,
  Users,
  Compass,
  MessageSquare,
  ArrowRight,
  Menu,
  X
} from "lucide-react";
import { format } from "date-fns";
import StopsList from "../components/itinerary/StopsList";
import BudgetView from "../components/budget/BudgetView";
import ChecklistSection from "../components/checklist/ChecklistSection";
import ContactsSection from "../components/contacts/ContactsSection";
import ExploreMapView from "../components/maps/ExploreMapView";
import CommunityChat from "../components/community/CommunityChat";

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'explore' | 'budget' | 'checklist' | 'contacts' | 'community'>('itinerary');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      setLoading(true);
      const path = `trips/${id}`;
      try {
        const docSnap = await getDoc(doc(db, "trips", id));
        if (docSnap.exists()) {
          setTrip({ id: docSnap.id, ...docSnap.data() } as Trip);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const togglePublic = async () => {
    if (!trip) return;
    const path = `trips/${trip.id}`;
    try {
      const newVal = !trip.isPublic;
      await updateDoc(doc(db, "trips", trip.id), { isPublic: newVal });
      setTrip({ ...trip, isPublic: newVal });
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-teal-primary border-t-transparent rounded-[2rem] animate-spin" />
        <p className="font-bold text-teal-dark uppercase tracking-[0.5em] text-[10px]">Assembling Manifest</p>
      </div>
    </div>
  );
  
  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center p-12 text-center text-teal-dark font-bold">
      Manifest not found.
    </div>
  );

  const navigation = [
    { id: 'itinerary', label: 'Step 1: Itinerary', icon: MapPin, desc: 'Daily route & stops' },
    { id: 'explore', label: 'Step 2: Explore', icon: Compass, desc: 'Local discovery' },
    { id: 'budget', label: 'Step 3: Budget', icon: PieChartIcon, desc: 'Financial curation' },
    { id: 'checklist', label: 'Step 4: Checklist', icon: ListTodo, desc: 'Ready for departure' },
    { id: 'contacts', label: 'Step 5: Contacts', icon: Users, desc: 'Local connections' },
    { id: 'community', label: 'Step 6: Chat', icon: MessageSquare, desc: 'Collaborative space' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden selection:bg-teal-primary selection:text-white">
      {/* Immersive Background Illustration */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-primary rounded-full blur-[200px]" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-luxury-gold rounded-full blur-[200px]" />
      </div>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            className="w-96 h-screen bg-white border-r border-slate-100 shrink-0 relative z-50 flex flex-col luxury-shadow"
          >
              <div className="p-12 relative">
                <div className="flex items-center justify-between mb-16">
                   <Link to="/" className="inline-flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-teal-dark transition-all">
                         <ChevronLeft className="w-5 h-5 text-teal-dark group-hover:text-white" />
                      </div>
                      <span className="text-teal-dark text-[10px] font-bold uppercase tracking-widest">Archives</span>
                   </Link>
                </div>

                <div className="mb-20">
                   <div className="text-luxury-gold font-bold text-[8px] uppercase tracking-[0.4em] mb-4">Current Curation</div>
                   <h2 className="text-4xl font-serif text-teal-dark tracking-tighter leading-tight italic">
                      {trip.name}
                   </h2>
                </div>

                <div className="space-y-3">
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-8 pl-2">Curation Flow</p>
                   {navigation.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full group relative flex items-center gap-5 px-6 h-20 rounded-[2rem] transition-all overflow-hidden ${
                          activeTab === item.id 
                            ? 'bg-teal-dark text-white shadow-2xl shadow-teal-dark/20' 
                            : 'text-slate-400 hover:text-teal-dark hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                           activeTab === item.id ? 'bg-white/10 text-luxury-gold' : 'bg-slate-100 text-slate-400 group-hover:bg-white'
                        }`}>
                           <item.icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <p className="text-[10px] font-bold uppercase tracking-widest mb-1">{item.label}</p>
                           <p className={`text-[8px] font-bold uppercase tracking-[0.2em] ${activeTab === item.id ? 'text-white/40' : 'text-slate-300'}`}>{item.desc}</p>
                        </div>
                        {activeTab === item.id && (
                          <motion.div 
                             layoutId="sidebar-indicator"
                             className="absolute right-6 w-1.5 h-1.5 bg-luxury-gold rounded-full"
                          />
                        )}
                      </button>
                   ))}
                </div>
             </div>

             <div className="mt-auto p-12 border-t border-slate-50">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-teal-primary" />
                   </div>
                   <div className="flex-1">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Manifest Integrity</p>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full w-[85%] bg-teal-primary" />
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-y-auto relative no-scrollbar">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-8 left-8 z-[60] w-14 h-14 bg-white rounded-2xl luxury-shadow flex items-center justify-center hover:bg-teal-dark hover:text-white transition-all text-teal-dark group ${isSidebarOpen ? 'translate-x-[360px] bg-teal-dark text-white rounded-full' : ''}`}
        >
           {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           {!isSidebarOpen && (
              <div className="absolute left-full ml-4 whitespace-nowrap bg-teal-dark text-white px-4 py-2 rounded-xl text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 Open Manifest Controls
              </div>
           )}
        </button>

        {/* Hero Section */}
        <div className="relative h-[55vh] w-full overflow-hidden">
           <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2 }}
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2042" 
            className="absolute inset-0 w-full h-full object-cover"
            alt={trip.name}
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/10 to-transparent" />
           <div className="absolute inset-0 bg-teal-dark/20" />
           
           <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12 pt-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.8em] mb-8"
              >
                Manifest curation &bull; {trip.id.substring(0, 8).toUpperCase()}
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-7xl md:text-[10rem] font-serif text-white italic tracking-tighter leading-none mb-12 drop-shadow-2xl"
              >
                {trip.name}
              </motion.h1>
              <div className="flex flex-wrap items-center justify-center gap-10 text-white font-bold text-[10px] uppercase tracking-[0.4em]">
                 <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-luxury-gold" />
                    {format(new Date(trip.startDate), 'MMM dd')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                 </div>
                 <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                 <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-luxury-gold" />
                    Global Manifest
                 </div>
              </div>
           </div>

           {/* Public Access Toggle */}
           <div className="absolute bottom-12 right-12 flex items-center gap-4">
              <button 
                onClick={togglePublic}
                className={`h-16 px-10 rounded-full flex items-center gap-4 font-bold text-[10px] uppercase tracking-widest backdrop-blur-xl transition-all border shadow-2xl ${
                  trip.isPublic 
                    ? 'bg-luxury-gold text-white border-luxury-gold' 
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                {trip.isPublic ? <Share2 className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {trip.isPublic ? 'Live Access Enabled' : 'Private Manifest'}
              </button>
           </div>
        </div>

        {/* Dynamic Content Component */}
        <div className="max-w-6xl mx-auto px-8 pb-32 -mt-24 relative z-10">
           <motion.div
             key={activeTab}
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
             className="bg-white rounded-[4rem] luxury-shadow border border-slate-50 min-h-[70vh] overflow-hidden"
           >
              {/* Internal Tab Content Wrapper */}
              <div className="h-full">
                 {activeTab === 'itinerary' && <StopsList tripId={trip.id} />}
                 {activeTab === 'explore' && <ExploreMapView tripId={trip.id} />}
                 {activeTab === 'budget' && <BudgetView tripId={trip.id} />}
                 {activeTab === 'checklist' && <ChecklistSection tripId={trip.id} />}
                 {activeTab === 'contacts' && <ContactsSection tripId={trip.id} />}
                 {activeTab === 'community' && <CommunityChat tripId={trip.id} tripOwnerId={trip.userId} />}
              </div>
           </motion.div>
        </div>

        <footer className="py-24 text-center border-t border-slate-100 bg-white">
           <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.5em] mb-6 animate-pulse">Traveloop</div>
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              &copy; 2026 Bespoke International manifests &bull; High Precision Journeying
           </p>
        </footer>
      </div>
    </div>
  );
}

