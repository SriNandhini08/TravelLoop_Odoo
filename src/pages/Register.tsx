import { useState, useMemo } from "react";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { Mail, Lock, User, Globe, MapPin, Loader2, ArrowRight, Compass } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";

const COUNTRY_DATA: Record<string, string[]> = {
  "United States": ["New York", "Los Angeles", "Chicago", "San Francisco", "Miami"],
  "United Kingdom": ["London", "Manchester", "Edinburgh", "Birmingham", "Bristol"],
  "France": ["Paris", "Lyon", "Marseille", "Nice", "Bordeaux"],
  "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Sapporo", "Fukuoka"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  "Italy": ["Rome", "Milan", "Venice", "Florence", "Naples"],
  "Spain": ["Madrid", "Barcelona", "Seville", "Valencia", "Malaga"]
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [nation, setNation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const countries = useMemo(() => Object.keys(COUNTRY_DATA), []);
  const cities = useMemo(() => nation ? COUNTRY_DATA[nation] : [], [nation]);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user already exists
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (!userDoc.exists()) {
        const [fName, ...lNames] = (userCredential.user.displayName || "").split(" ");
        await setDoc(doc(db, "users", userCredential.user.uid), {
          firstName: fName || "Explorer",
          lastName: lNames.join(" ") || "",
          email: userCredential.user.email,
          city: "Global",
          nation: "World",
          uid: userCredential.user.uid,
          createdAt: new Date().toISOString()
        });
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName,
        lastName,
        email,
        city,
        nation,
        uid: userCredential.user.uid,
        createdAt: new Date().toISOString()
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[#0c1c20]">
      {/* Immersive Background */}
      <div 
        className="absolute inset-0 z-0 opacity-50 scale-110"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?auto=format&fit=crop&q=80&w=2070")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-teal-dark via-teal-dark/60 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl bg-teal-dark/20 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div 
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center mb-6 border border-white/20"
          >
            <Compass className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 tracking-tight italic">Global Membership</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Secure Registration Portal</p>
        </div>

        <div className="space-y-6 mb-8">
          <button 
            onClick={handleGoogleSignUp}
            className="w-full h-16 bg-white/5 border border-white/10 text-white rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 hover:bg-white/10 transition-all shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Continue with Google
          </button>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <span className="relative px-4 bg-transparent text-[10px] font-bold text-white/20 uppercase tracking-widest">Or Register Manually</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 transition-all text-sm text-white placeholder:text-white/20"
                  placeholder="Alexander"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 transition-all text-sm text-white placeholder:text-white/20"
                  placeholder="Hamilton"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 transition-all text-sm text-white placeholder:text-white/20"
                placeholder="voyager@international.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 transition-all text-sm text-white placeholder:text-white/20"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">Nation</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <select 
                  value={nation}
                  onChange={(e) => {
                    setNation(e.target.value);
                    setCity("");
                  }}
                  className="w-full h-14 pl-12 pr-4 bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 transition-all text-sm text-white appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-teal-dark">Select Nation</option>
                  {countries.map(c => <option key={c} value={c} className="bg-teal-dark">{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">Current City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <select 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 transition-all text-sm text-white appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  required
                  disabled={!nation}
                >
                  <option value="" className="bg-teal-dark">Select City</option>
                  {cities.map(c => <option key={c} value={c} className="bg-teal-dark">{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-400 font-medium italic text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 bg-white text-teal-dark rounded-full font-bold uppercase tracking-widest text-[10px] shadow-2xl hover:bg-teal-light transition-all disabled:opacity-50 flex items-center justify-center gap-3 relative top-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Enrollment"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-10 text-center">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
              Already a Member? <Link to="/login" className="text-white hover:text-luxury-gold transition-colors ml-2 underline decoration-white/20 underline-offset-4">Access Portal</Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
}
