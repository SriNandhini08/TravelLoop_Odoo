import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, where, doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { Send, User as UserIcon, MessageSquare, Shield, Users as UsersIcon, Plus, X, Search, Navigation, Mail } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  text: string;
  createdAt: any;
}

interface CommunityChatProps {
  tripId: string;
  tripOwnerId: string;
}

export default function CommunityChat({ tripId, tripOwnerId }: CommunityChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, "trips", tripId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [tripId]);

  useEffect(() => {
    // In a real app, we'd fetch actual member details from the trip.members list
    const fetchMembers = async () => {
      const tripDoc = await getDoc(doc(db, "trips", tripId));
      if (tripDoc.exists()) {
        const memberUids = tripDoc.data().members || [];
        const uniqueUids = Array.from(new Set([tripOwnerId, ...memberUids]));
        
        const memberData = [];
        for (const uid of uniqueUids) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            memberData.push({ id: uid, ...userDoc.data() });
          }
        }
        setInvitedUsers(memberData);
      }
    };
    fetchMembers();
  }, [tripId, tripOwnerId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "trips", tripId, "messages"), {
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || "Unknown Explorer",
        senderPhoto: auth.currentUser.photoURL || "",
        text: newMessage,
        createdAt: serverTimestamp(),
        tripId
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[700px]">
      {/* Sidebar - Members */}
      <div className="md:col-span-4 flex flex-col h-full bg-slate-50/50 rounded-[3rem] p-8 border border-slate-100">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <UsersIcon className="w-5 h-5 text-teal-primary" />
              <span className="text-[10px] font-bold text-teal-dark uppercase tracking-widest italic">Expedition Circle</span>
           </div>
           {auth.currentUser?.uid === tripOwnerId && (
              <button 
                onClick={() => setShowInvite(true)}
                className="w-10 h-10 bg-teal-primary text-white rounded-full flex items-center justify-center hover:bg-teal-dark transition-all luxury-shadow"
              >
                <Plus className="w-5 h-5" />
              </button>
           )}
        </div>

        <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 pr-2">
           {invitedUsers.map(member => (
              <div key={member.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 group hover:border-teal-primary transition-all">
                 <div className="relative">
                    <img src={member.photoURL} alt={member.firstName} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full" />
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <div className="text-[10px] font-bold text-teal-dark truncate">{member.firstName} {member.lastName}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                       {member.id === tripOwnerId ? 'Orchestrator' : 'Explorer'}
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="md:col-span-8 flex flex-col h-full bg-white rounded-[3rem] p-8 border border-slate-100 luxury-shadow relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-teal-primary/5 rounded-bl-full -z-10" />
         
         <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-50">
            <div className="w-12 h-12 bg-teal-light rounded-2xl flex items-center justify-center">
               <MessageSquare className="w-6 h-6 text-teal-primary" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-teal-dark tracking-tight">Sync Intelligence</h3>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">Real-time collaboration frequency</p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto pr-4 no-scrollbar space-y-8 py-4">
            {messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-40 italic space-y-4">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-teal-primary flex items-center justify-center">
                    <Navigation className="w-8 h-8 text-teal-primary" />
                  </div>
                  <p className="text-sm">Initiate the conversation protocol...</p>
               </div>
            ) : (
               messages.map((msg, i) => {
                  const isMe = msg.senderId === auth.currentUser?.uid;
                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-4`}
                    >
                       {!isMe && <img src={msg.senderPhoto} className="w-10 h-10 rounded-full object-cover mt-2 shadow-sm" alt={msg.senderName} />}
                       <div className={`max-w-[70%] space-y-2`}>
                          {!isMe && <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">{msg.senderName}</div>}
                          <div className={`p-6 rounded-[2rem] text-sm leading-relaxed ${isMe ? 'bg-teal-dark text-white rounded-tr-none' : 'bg-slate-50 text-teal-dark rounded-tl-none font-light'}`}>
                             {msg.text}
                          </div>
                          <div className={`text-[8px] font-bold text-slate-300 uppercase tracking-tighter ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                             {msg.createdAt ? format(msg.createdAt.toDate(), 'HH:mm') : 'Syncing...'}
                          </div>
                       </div>
                       {isMe && <img src={msg.senderPhoto} className="w-10 h-10 rounded-full object-cover mt-2 shadow-sm" alt="Me" />}
                    </motion.div>
                  );
               })
            )}
            <div ref={scrollRef} />
         </div>

         <form onSubmit={handleSendMessage} className="mt-8 pt-6 border-t border-slate-50 flex gap-4">
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Transmit your thoughts..."
              className="flex-1 bg-slate-50 border border-slate-100 rounded-full h-16 px-8 outline-none focus:bg-white focus:border-teal-primary/30 transition-all font-display italic text-teal-dark"
            />
            <button 
              type="submit"
              className="w-16 h-16 bg-teal-dark text-white rounded-full flex items-center justify-center hover:bg-teal-primary transition-all luxury-shadow group disabled:opacity-30"
              disabled={!newMessage.trim()}
            >
               <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
         </form>

         {/* Invite Modal Overlay */}
         <AnimatePresence>
           {showInvite && (
             <div className="absolute inset-0 z-50 bg-white p-12 flex flex-col items-center justify-center">
                <button onClick={() => setShowInvite(false)} className="absolute top-8 right-8 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors">
                   <X className="w-6 h-6" />
                </button>
                <div className="max-w-md w-full text-center space-y-10">
                   <div className="w-24 h-24 bg-teal-light rounded-[2rem] flex items-center justify-center mx-auto">
                      <UsersIcon className="w-10 h-10 text-teal-primary" />
                   </div>
                   <h4 className="text-4xl font-serif text-teal-dark">Enlist Explorers</h4>
                   <p className="text-slate-400 font-light italic">Invite your associates by their unique liaison email to join this curated journey.</p>
                   
                   <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-primary/30" />
                      <input 
                        type="email" 
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="associate@liaison.com"
                        className="w-full h-20 bg-slate-50 border border-slate-100 rounded-[2rem] pl-16 pr-8 outline-none focus:bg-white focus:border-teal-primary/40 transition-all font-display text-lg"
                      />
                   </div>

                   <button 
                    onClick={async () => {
                      if (!inviteEmail) return;
                      // Logic to search for user and add to trip members
                      const q = query(collection(db, "users"), where("email", "==", inviteEmail));
                      const snap = await getDocs(q);
                      if (!snap.empty) {
                        const targetUser = snap.docs[0].data();
                        const tripRef = doc(db, "trips", tripId);
                        const tripSnap = await getDoc(tripRef);
                        const currentMembers = tripSnap.data()?.members || [];
                        if (!currentMembers.includes(targetUser.uid)) {
                           await setDoc(tripRef, { members: [...currentMembers, targetUser.uid] }, { merge: true });
                           setInvitedUsers([...invitedUsers, targetUser]);
                        }
                        setShowInvite(false);
                      } else {
                        alert("Explorer not found in the Traveloop registry.");
                      }
                    }}
                    className="w-full h-20 bg-teal-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-teal-primary transition-all luxury-shadow"
                   >
                     Authorize Access
                   </button>
                </div>
             </div>
           )}
         </AnimatePresence>
      </div>
    </div>
  );
}
