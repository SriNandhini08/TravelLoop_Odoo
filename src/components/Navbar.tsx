import { User, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Compass, LogOut, Map, User as UserIcon, Settings } from "lucide-react";

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const isDark = location.pathname === "/" && !user;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] px-4 md:px-8 py-4 md:py-6 transition-all pointer-events-none`}>
      <div className={`max-w-7xl mx-auto flex items-center justify-between transition-all pointer-events-auto ${isDark ? 'bg-transparent' : 'bg-white/60 backdrop-blur-xl border border-white/20 px-4 md:px-6 py-2 md:py-3 rounded-full luxury-shadow'}`}>
        <Link to="/" className="flex items-center gap-2 md:gap-4 group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-dark rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
            <Compass className="w-5 h-5 md:w-6 md:h-6 text-luxury-gold" />
          </div>
          <span className={`text-xl md:text-2xl font-serif tracking-tighter text-teal-dark`}>Traveloop</span>
        </Link>

        <div className="flex items-center gap-4 md:gap-8">
          {!user ? (
            <div className="flex items-center gap-4 md:gap-6">
              <Link 
                to="/login"
                className={`text-[10px] font-bold uppercase tracking-[0.4em] transition-colors ${isDark ? 'text-teal-dark/60 hover:text-teal-dark' : 'text-slate-400 hover:text-teal-dark'}`}
              >
                Log In
              </Link>
              <Link 
                to="/register"
                className="h-10 md:h-12 px-6 md:px-8 bg-teal-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center hover:bg-teal-primary transition-all luxury-shadow"
              >
                Enroll
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden md:flex flex-col items-end mr-2">
                 <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-luxury-gold">Member</span>
                 <span className="text-[10px] font-bold text-teal-dark uppercase tracking-[0.2em]">{user.displayName || 'Explorer'}</span>
              </div>
              
              <div className="relative group">
                <button className="w-12 h-12 rounded-full border-2 border-teal-primary/10 overflow-hidden hover:border-teal-primary transition-all luxury-shadow">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "User"} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                </button>
                
                <div className="absolute right-0 top-full mt-4 w-56 bg-white rounded-[2rem] shadow-2xl p-3 border border-slate-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0">
                  <Link 
                    to="/profile"
                    className="w-full h-14 flex items-center gap-4 px-5 rounded-2xl hover:bg-slate-50 text-teal-dark transition-colors font-bold text-[10px] uppercase tracking-widest"
                  >
                    <UserIcon className="w-4 h-4 text-luxury-gold" />
                    My Profile
                  </Link>
                  <div className="my-2 h-px bg-slate-50 mx-2" />
                  <button 
                    onClick={handleLogout}
                    className="w-full h-14 flex items-center gap-4 px-5 rounded-2xl hover:bg-red-50 text-red-600 transition-colors font-bold text-[10px] uppercase tracking-widest"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
