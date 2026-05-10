import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { MapPin, Search, Compass, Shield, Users, PieChart, Sparkles, Navigation, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-luxury-paper min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-8">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-light/30 rounded-bl-[20rem] -z-10" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
             <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.4em] mb-8 animate-pulse">Travel Organizer</div>
             <h1 className="text-5xl lg:text-8xl font-serif font-medium text-teal-dark leading-[0.9] mb-12 tracking-tighter">
               Organize Your <span className="italic block mt-4">Next Journey</span>
             </h1>
             <p className="text-xl text-slate-500 font-light leading-relaxed mb-16 max-w-xl italic">
               Traveloop helps you plan trips with friends. Create itineraries, track your budget, and find great places to visit together.
             </p>
            <div className="flex flex-wrap gap-8">
              <Link 
                to="/register" 
                className="h-20 px-12 bg-teal-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center hover:bg-teal-primary transition-all luxury-shadow group"
              >
                Enroll Now <Navigation className="ml-4 w-4 h-4 text-luxury-gold group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login"
                className="h-20 px-12 border border-teal-dark/10 text-teal-dark rounded-full text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center hover:bg-white transition-all luxury-shadow"
              >
                Existing Account
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="w-full max-w-[500px] aspect-[5/7] bg-slate-200 rounded-[5rem] md:rounded-[10rem] overflow-hidden luxury-shadow border-[0.5rem] md:border-[1rem] border-white relative group">
              <img 
                src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=2073&auto=format&fit=crop" 
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                alt="Kerala Travel"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/60 to-transparent flex flex-col justify-end p-8 md:p-16">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-1 bg-luxury-gold" />
                    <span className="text-white text-[10px] font-bold uppercase tracking-[0.4em]">Incredible India</span>
                 </div>
                 <h3 className="text-2xl md:text-4xl font-serif text-white italic">"From the Himalayas to the backwaters, every mile is a new story."</h3>
              </div>
            </div>
            
            <motion.div 
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -top-12 -right-12 glass-morphism p-8 rounded-[3rem] luxury-shadow border border-white/20 w-64"
            >
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-teal-primary rounded-xl flex items-center justify-center">
                     <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                     <div className="text-[10px] font-bold text-teal-dark uppercase tracking-widest">Active Trippers</div>
                     <div className="text-lg font-display font-bold text-teal-dark">12.4k+</div>
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex gap-1">
                     {[...Array(5)].map((_, i) => <div key={i} className="w-full h-1 bg-teal-primary rounded-full" />)}
                  </div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Synchronized Intelligence</div>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-8 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 px-4">
            <div className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.4em] mb-6">How it works</div>
            <h2 className="text-4xl md:text-6xl font-serif text-teal-dark">The Best Way to <span className="italic">Plan Trips</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { 
                icon: Compass, 
                title: "Local Recommendations", 
                desc: "We suggest interesting places to visit based on where you are staying." 
              },
              { 
                icon: PieChart, 
                title: "Budget Tracking", 
                desc: "Keep track of your spending and estimate your total trip costs easily." 
              },
              { 
                icon: Users, 
                title: "Group Planning", 
                desc: "Invite your friends to chat and help plan the perfect itinerary together." 
              },
              { 
                icon: Search, 
                title: "Smart Search", 
                desc: "Search for destinations and filter them based on your preferences." 
              },
              { 
                icon: Shield, 
                title: "Travel Checklist", 
                desc: "Manage important contacts and phone numbers you might need." 
              },
              { 
                icon: CheckCircle, 
                title: "Simple Checklists", 
                desc: "Stay organized with a built-in list of things to pack and tasks to do." 
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-12 border border-slate-50 rounded-[4rem] hover:luxury-shadow transition-all group"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:bg-teal-primary transition-colors">
                  <feature.icon className="w-8 h-8 text-teal-primary group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-2xl font-display font-medium text-teal-dark mb-6">{feature.title}</h4>
                <p className="text-slate-400 font-light italic leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sharing Section */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto bg-teal-dark rounded-[3rem] md:rounded-[6rem] p-12 md:p-24 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative z-10 space-y-12"
          >
            <Sparkles className="w-12 md:w-16 h-12 md:h-16 text-luxury-gold mx-auto mb-8" />
            <h2 className="text-4xl lg:text-7xl font-serif text-white">Share the <span className="italic text-luxury-gold">Plan</span></h2>
            <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed italic">
              Share your travel plans with friends using simple links. Let everyone see the details of the journey.
            </p>
            <div className="pt-8">
              <Link 
                to="/register"
                className="inline-flex h-20 px-16 bg-white text-teal-dark rounded-full text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-luxury-gold hover:text-white transition-all items-center gap-4"
              >
                Begin Your Journey <Navigation className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-slate-100 px-8">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-dark rounded-full flex items-center justify-center">
                <Compass className="w-6 h-6 text-luxury-gold" />
              </div>
              <span className="text-2xl font-serif text-teal-dark tracking-tighter">Traveloop</span>
            </div>
            <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
               <span className="hover:text-teal-primary cursor-pointer">Protocol</span>
               <span className="hover:text-teal-primary cursor-pointer">Intelligence</span>
               <span className="hover:text-teal-primary cursor-pointer">Security</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300 italic">
               © 2026 Prestige Group
            </div>
         </div>
      </footer>
    </div>
  );
}
