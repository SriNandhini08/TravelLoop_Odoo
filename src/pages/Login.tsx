import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Compass, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
          backgroundImage: 'url("https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=2070")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-teal-dark via-teal-dark/40 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg bg-teal-dark/30 backdrop-blur-2xl p-8 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center mb-6 border border-white/20"
          >
            <Compass className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-serif text-white mb-2 italic">Welcome Back</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Secure Access Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-16 pl-12 pr-4 bg-white/5 rounded-3xl border border-white/10 outline-none focus:border-white/30 transition-all text-sm text-white placeholder:text-white/20"
                placeholder="user@traveloop.com"
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
                className="w-full h-16 pl-12 pr-4 bg-white/5 rounded-3xl border border-white/10 outline-none focus:border-white/30 transition-all text-sm text-white placeholder:text-white/20"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-400 font-medium italic text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 bg-white text-teal-dark rounded-full font-bold uppercase tracking-widest text-[10px] shadow-2xl hover:bg-teal-light transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access Account"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-12 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <span className="relative px-4 bg-transparent text-[10px] font-bold text-white/20 uppercase tracking-widest">Collaborative Entry</span>
            </div>
            
            <button 
              onClick={handleGoogleSignIn}
              className="w-full h-16 bg-white/5 border border-white/10 text-white rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 hover:bg-white/10 transition-all shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              Sign in with Google
            </button>
        </div>

        <div className="mt-12 text-center">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
              New Explorer? <Link to="/register" className="text-white hover:text-luxury-gold transition-colors ml-2">Open Account</Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
}

