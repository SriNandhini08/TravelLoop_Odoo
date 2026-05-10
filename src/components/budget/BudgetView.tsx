import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, handleFirestoreError } from "../../lib/firebase";
import { OperationType, Stop, Activity } from "../../types";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { DollarSign, Plane, Bed, Sparkles, TrendingUp, Loader2, Plus, ArrowRight, CreditCard, Wallet } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

interface BudgetViewProps {
  tripId: string;
}

export default function BudgetView({ tripId }: BudgetViewProps) {
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [stats, setStats] = useState({
    stay: 0,
    activities: 0,
    transport: 0,
    total: 0,
    dataByCity: [] as any[]
  });

  const COLORS = ["#0F4C5C", "#E36414", "#FB8B24", "#9A031E", "#5F0F40", "#6D597A"];
  const categories = ["Transport", "Accommodation", "Dining", "Activities", "Shopping"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const stopsSnap = await getDocs(collection(db, `trips/${tripId}/stops`));
      const stops = stopsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Stop));
      
      const activitiesSnap = await getDocs(collection(db, `trips/${tripId}/activities`));
      const activities = activitiesSnap.docs.map(d => d.data() as Activity);

      // Enhanced logic with better dummy coefficients if data is sparse
      let stayCost = stops.reduce((sum, s) => {
        const days = Math.max(1, differenceInDays(new Date(s.endDate), new Date(s.startDate)));
        return sum + (days * 250); // Luxury stay coefficient
      }, 0);

      let activityCost = activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
      if (activityCost === 0) activityCost = Math.max(500, stops.length * 400); // Prototype placeholder

      let transportCost = stops.length * 150 + 1200; // International flight placeholder
      
      const total = stayCost + activityCost + transportCost;

      const dataByCity = stops.map(s => {
        const cityActivities = activities.filter(a => a.stopId === s.id);
        const cityActCost = cityActivities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0) || 300;
        const days = Math.max(1, differenceInDays(new Date(s.endDate), new Date(s.startDate)));
        return {
          name: s.city,
          stay: days * 250,
          activities: cityActCost,
          transport: 150
        };
      });

      setStats({ stay: stayCost, activities: activityCost, transport: transportCost, total, dataByCity });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "budget");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const pieData = [
    { name: "Accommodation", value: stats.stay, color: "#0F4C5C" },
    { name: "Experiences", value: stats.activities, color: "#E36414" },
    { name: "Travel", value: stats.transport, color: "#FB8B24" },
  ].filter(d => d.value > 0);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-10 h-10 text-teal-primary animate-spin" />
      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">Synchronizing Financial Manifest</p>
    </div>
  );

  return (
    <div className="space-y-24 p-12">
      {/* Header & Main Stats */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 border-b border-slate-50 pb-16">
         <div>
            <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.4em] mb-4">Capital Curation</div>
            <h3 className="text-5xl font-serif text-teal-dark tracking-tighter italic">Investment Ledger</h3>
            <p className="text-slate-400 font-light italic mt-4">Precision financial planning for global mobility.</p>
         </div>
         <div className="flex items-center gap-12">
            <div className="text-right">
               <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-1">Curation Value</p>
               <p className="text-5xl font-display font-medium text-teal-dark tracking-tighter">${stats.total.toLocaleString()}</p>
            </div>
            <button 
               onClick={() => setShowAdd(true)}
               className="h-20 px-10 bg-teal-dark text-white rounded-[2rem] luxury-shadow flex items-center gap-4 hover:bg-teal-primary transition-all text-[10px] font-bold uppercase tracking-[0.4em] group"
            >
               <Plus className="w-5 h-5 text-luxury-gold group-hover:rotate-90 transition-transform" />
               New Entry
            </button>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
         {[
            { label: "Accommodation", value: stats.stay, icon: Bed, color: "bg-white", iconColor: "text-teal-primary" },
            { label: "Experiences", value: stats.activities, icon: Sparkles, color: "bg-white", iconColor: "text-luxury-gold" },
            { label: "Logistics", value: stats.transport, icon: Plane, color: "bg-teal-dark", iconColor: "text-white" }
         ].map((stat, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className={`${stat.color === 'bg-teal-dark' ? 'bg-teal-dark text-white' : 'bg-white text-teal-dark'} p-12 rounded-[3.5rem] luxury-shadow border border-slate-50 flex flex-col justify-between h-72`}
            >
               <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color === 'bg-teal-dark' ? 'bg-white/10' : 'bg-slate-50'}`}>
                     <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div className={`text-[8px] font-bold uppercase tracking-widest ${stat.color === 'bg-teal-dark' ? 'text-white/40' : 'text-slate-300'}`}>International</div>
               </div>
               <div>
                  <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-2 ${stat.color === 'bg-teal-dark' ? 'text-white/40' : 'text-slate-400'}`}>{stat.label}</p>
                  <p className="text-4xl font-display font-medium tracking-tighter">${stat.value.toLocaleString()}</p>
               </div>
            </motion.div>
         ))}
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
         {/* Allocation Spectrum */}
         <div className="space-y-10">
            <div className="px-4">
               <h4 className="text-2xl font-serif text-teal-dark italic tracking-tight">Allocation Spectrum</h4>
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Resource distribution by manifest item</p>
            </div>
            <div className="bg-slate-50/50 rounded-[4rem] p-12 border border-slate-50 flex flex-col items-center">
               <div className="h-80 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={pieData}
                           innerRadius={90}
                           outerRadius={120}
                           paddingAngle={8}
                           dataKey="value"
                        >
                           {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                           ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' }}
                           itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                        />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-1">Total Liquid</span>
                     <span className="text-3xl font-display font-medium text-teal-dark">${stats.total.toLocaleString()}</span>
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-8 w-full mt-12">
                  {pieData.map((d, i) => (
                     <div key={i} className="flex flex-col items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{d.name}</span>
                        <span className="text-sm font-medium text-teal-dark">{Math.round((d.value/stats.total)*100)}%</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Geographic Variance */}
         <div className="space-y-10">
            <div className="px-4">
               <h4 className="text-2xl font-serif text-teal-dark italic tracking-tight">Geographic Variance</h4>
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Capital density per global destination</p>
            </div>
            <div className="bg-white rounded-[4rem] p-12 border border-slate-50 luxury-shadow">
               <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={stats.dataByCity}>
                        <XAxis 
                           dataKey="name" 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                        />
                        <Tooltip 
                           cursor={{ fill: 'transparent' }}
                           contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' }}
                        />
                        <Bar dataKey="stay" stackId="a" fill="#0F4C5C" radius={[0, 0, 0, 0]} barSize={40} />
                        <Bar dataKey="activities" stackId="a" fill="#E36414" radius={[0, 0, 0, 0]} barSize={40} />
                        <Bar dataKey="transport" stackId="a" fill="#F0FDF4" radius={[20, 20, 0, 0]} barSize={40} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
               <div className="flex justify-center gap-10 mt-12">
                  {[
                     { label: "Lodging", color: "#0F4C5C" },
                     { label: "Experience", color: "#E36414" },
                     { label: "Logistics", color: "#F0FDF4" }
                  ].map((l, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: l.color }} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{l.label}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Quick Access Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="p-12 bg-slate-900 rounded-[4rem] text-white flex items-center justify-between group cursor-pointer hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-8">
               <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-luxury-gold" />
               </div>
               <div>
                  <h5 className="text-xl font-display font-medium tracking-tight">Liquidity Reserve</h5>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Available for uncurated events</p>
               </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white/20 group-hover:translate-x-2 transition-transform" />
         </div>
         <div className="p-12 bg-teal-primary rounded-[4rem] text-white flex items-center justify-between group cursor-pointer hover:bg-teal-dark transition-colors">
            <div className="flex items-center gap-8">
               <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <CreditCard className="w-7 h-7 text-white" />
               </div>
               <div>
                  <h5 className="text-xl font-display font-medium tracking-tight">Active Accounts</h5>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">International billing active</p>
               </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white/20 group-hover:translate-x-2 transition-transform" />
         </div>
      </div>

      <AnimatePresence>
         {showAdd && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAdd(false)}
                  className="absolute inset-0 bg-teal-dark/60 backdrop-blur-md"
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white w-full max-w-lg p-16 rounded-[4rem] relative z-10 luxury-shadow"
               >
                  <h3 className="text-3xl font-serif text-teal-dark italic tracking-tighter mb-10">Declare Manifest Entry</h3>
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-2">Manifest Category</label>
                        <select className="w-full h-16 bg-slate-50 rounded-2xl px-6 border border-slate-100 outline-none focus:border-teal-primary transition-all text-sm font-medium">
                           {categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-2">Investment Amount ($)</label>
                        <input 
                           type="number"
                           placeholder="0.00"
                           className="w-full h-16 bg-slate-50 rounded-2xl px-6 border border-slate-100 outline-none focus:border-teal-primary transition-all text-2xl font-display font-medium"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-2">Manifest Description</label>
                        <input 
                           type="text"
                           placeholder="Describe the transaction..."
                           className="w-full h-16 bg-slate-50 rounded-2xl px-6 border border-slate-100 outline-none focus:border-teal-primary transition-all text-sm font-medium italic"
                        />
                     </div>
                     <button 
                        onClick={() => setShowAdd(false)}
                        className="w-full h-20 bg-teal-dark text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] luxury-shadow hover:bg-teal-primary transition-all"
                     >
                        Finalize Declaration
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
