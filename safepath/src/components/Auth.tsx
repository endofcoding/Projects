import React from 'react';
import { signInWithGoogle, logout, auth } from '../lib/firebase';
import { Button } from './ui/button';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Auth() {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return (
      <Button variant="outline" size="icon" className="rounded-full h-12 w-12 animate-pulse bg-white/80 backdrop-blur-sm">
        <UserIcon className="w-5 h-5 text-slate-400" />
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-bold truncate max-w-[100px]">{user.displayName}</span>
          <button onClick={logout} className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-tighter">Logout</button>
        </div>
        <div className="relative group">
          <img 
            src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
            alt="Profile" 
            className="w-12 h-12 rounded-full border-2 border-white shadow-lg cursor-pointer"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={logout}
            className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity md:hidden"
          >
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <Button 
      variant="outline" 
      className="rounded-full bg-white/80 backdrop-blur-sm shadow-lg h-12 px-6 font-bold gap-2 border-2 border-white hover:bg-white transition-all"
      onClick={signInWithGoogle}
    >
      <LogIn className="w-5 h-5" />
      <span>Sign In</span>
    </Button>
  );
}
