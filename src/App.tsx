import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./lib/firebase";
import Dashboard from "./pages/Dashboard";
import TripDetail from "./pages/TripDetail";
import PublicTrip from "./pages/PublicTrip";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CreateTrip from "./pages/CreateTrip";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-luxury-paper">
        <div className="relative">
          <div className="w-24 h-24 border border-teal-primary/10 rounded-full" />
          <div className="absolute inset-0 w-24 h-24 border-t-2 border-teal-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-1 h-1 bg-luxury-gold rounded-full animate-pulse" />
          </div>
        </div>
        <p className="mt-10 font-bold text-teal-dark/30 uppercase tracking-[0.6em] text-[8px] animate-pulse">Traveloop . Prestige Travels</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-luxury-paper text-teal-dark font-sans selection:bg-teal-primary selection:text-white">
        <Navbar user={user} />
        <main>
          <Routes>
            <Route path="/" element={user ? <Dashboard /> : <Home />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/create" element={user ? <CreateTrip /> : <Navigate to="/login" />} />
            <Route path="/trip/:id" element={user ? <TripDetail /> : <Navigate to="/login" />} />
            <Route path="/public/:shareId" element={<PublicTrip />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
