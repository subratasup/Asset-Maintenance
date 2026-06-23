/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Key, User as UserIcon, LogOut, Eye, EyeOff, Check, Construction, HelpCircle } from 'lucide-react';
import { User } from '../types';

interface LoginPortalProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export default function LoginPortal({ users, onLoginSuccess }: LoginPortalProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUserForQuickFill, setSelectedUserForQuickFill] = useState<User | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter default users to display as quick access tokens 
  // ensuring we represent both Admin and regular users
  const adminUsers = users.filter(u => u.role === 'ADMIN');
  const regularUsers = users.filter(u => u.role !== 'ADMIN');

  const handleQuickSelect = (user: User) => {
    setSelectedUserForQuickFill(user);
    setUsernameInput(user.username);
    // Auto-fill password with a standard default for convenience, or they can type it in
    setPasswordInput(user.role === 'ADMIN' ? 'admin123' : 'password123');
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setErrorMsg('Please input a valid username or email address.');
      return;
    }
    if (!passwordInput.trim()) {
      setErrorMsg('Please input your security login password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // Simulate database lookup latency for a premium native corporate system look
    setTimeout(() => {
      const match = users.find(
        u => u.username.toLowerCase() === usernameInput.trim().toLowerCase() ||
             u.email.toLowerCase() === usernameInput.trim().toLowerCase()
      );

      if (match) {
        // Validation logic:
        const requiredPass = match.role === 'ADMIN' ? 'admin123' : 'password123';
        if (passwordInput !== requiredPass && passwordInput !== 'admin123' && passwordInput !== 'password123') {
          setErrorMsg(`Invalid security credential token. Hint: Use "${requiredPass}" for this role.`);
          setIsSubmitting(false);
        } else {
          onLoginSuccess(match);
        }
      } else {
        setErrorMsg('Security account handle not found in the corporate Transit registry.');
        setIsSubmitting(false);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none" id="login-portal-screen">
      
      {/* Decorative Blueprint Background Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25"></div>
      
      {/* Absolute top badge */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500 bg-slate-950/40 border border-slate-800 px-3 py-1.5 rounded-full backdrop-blur-xs">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        ESTEEM CORE DISPATCH V3.4L
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 my-10">
        
        {/* Left column: Branding, instructions and overview */}
        <div className="lg:col-span-5 text-left space-y-6 lg:pr-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded text-xs font-mono font-semibold uppercase">
              <Construction size={14} className="animate-spin duration-3000" /> Transit Infrastructure System
            </div>
            
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              ESTEEM METRO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-light">SYSTEM PORTAL</span>
            </h1>

            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Secure single-sign-on node interface to handle and inspect landed materials ledger, physical serialized asset tagging, andStraight-Line depreciation audit matrices across our multi-subsidiary company registers.
            </p>
          </motion.div>

          {/* Quick Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3 bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 backdrop-blur-xs text-[11px] text-slate-400 max-w-md"
          >
            <h4 className="font-bold text-slate-300 font-mono uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" /> Security Access Rulesets:
            </h4>
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="space-y-1">
                <span className="text-slate-200 font-bold block">🛡️ ADMIN ACCOUNT</span>
                <span className="block text-[10px] leading-relaxed">Full read/write master operations, category overrides, user delegation.</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-200 font-bold block">👷 USERS ACCOUNTS</span>
                <span className="block text-[10px] leading-relaxed">Role-specific logs (Auditor, Data Entry, and Management summaries).</span>
              </div>
            </div>
          </motion.div>

          {/* Prompt warning */}
          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 pl-1.5">
            <HelpCircle size={12} /> Registered subsidiary domains are managed via offline DB synchronization keys.
          </div>
        </div>

        {/* Right column: Login forms */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-md relative"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
          >
            <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">Access Credentials Gateway</h2>
              <p className="text-xs text-slate-400 mt-1">Please select an profile below, or sign in using registered handles.</p>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-3 text-xs text-rose-300 mb-5 font-medium leading-relaxed" id="login-error-alert">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" id="login-credentials-form">
              {/* Username/Email Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Username / Email Handle</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 text-slate-500" size={15} />
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="e.g. vicky_admin or email"
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-10 py-2.5 text-xs text-slate-100 font-mono focus:outline-none transition-all duration-250"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Security Code Credentials</label>
                  <span className="text-[9px] text-slate-500 font-mono">Base authentication required</span>
                </div>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 text-slate-500" size={15} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-10 py-2.5 text-xs text-slate-100 font-mono focus:outline-none transition-all duration-250"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 font-bold text-white rounded-xl py-2.5 text-xs transition duration-200 shadow-lg shadow-indigo-950/60 mt-3 flex items-center justify-center gap-1.5"
                id="login-submit-button"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3 w-3 border-2 border-slate-300 border-t-white rounded-full animate-spin"></span>
                    Authenticating Register...
                  </>
                ) : (
                  <>
                    Decrypt Systems Gate <LogOut size={13} className="rotate-180" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Profile Selection Cards */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-3">Quick Identity Matrix (Click to Auto-fill)</span>
              
              <div className="space-y-4">
                {/* Admin Accounts Row */}
                <div>
                  <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-1.5 font-mono">Pre-linked Administrators</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {adminUsers.map(u => {
                      const isSelected = selectedUserForQuickFill?.id === u.id;
                      return (
                        <div
                          key={u.id}
                          onClick={() => handleQuickSelect(u)}
                          className={`flex items-center gap-2.5 p-2 rounded-xl text-left border cursor-pointer transition-all duration-200 ${isSelected ? 'bg-indigo-950/50 border-indigo-500 shadow-sm' : 'bg-slate-900 border-slate-800 hover:bg-slate-850'}`}
                        >
                          <img src={u.profilePic} alt={u.fullName} className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-800" />
                          <div className="leading-tight truncate flex-1">
                            <span className="text-[11px] font-bold text-slate-100 block truncate">{u.fullName}</span>
                            <span className="text-[8px] font-semibold text-indigo-400 font-mono tracking-wider block uppercase">{u.role}</span>
                          </div>
                          {isSelected && <Check size={12} className="text-indigo-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Regular User Accounts Row */}
                <div>
                  <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5 font-mono">Corporate Division Users</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {regularUsers.map(u => {
                      const isSelected = selectedUserForQuickFill?.id === u.id;
                      const roleColorClass = u.role === 'AUDITOR' ? 'text-amber-400' : u.role === 'DATA_ENTRY' ? 'text-emerald-400' : u.role === 'MOBILE_SCANNER' ? 'text-fuchsia-400' : 'text-slate-400';
                      return (
                        <div
                          key={u.id}
                          onClick={() => handleQuickSelect(u)}
                          className={`flex items-center gap-2 p-2 rounded-xl text-left border cursor-pointer transition-all duration-200 ${isSelected ? 'bg-cyan-950/40 border-cyan-500 shadow-sm' : 'bg-slate-900 border-slate-800 hover:bg-slate-850'}`}
                        >
                          <img src={u.profilePic} alt={u.fullName} className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-800" />
                          <div className="leading-tight truncate flex-1">
                            <span className="text-[10px] font-bold text-slate-100 block truncate">{u.fullName}</span>
                            <span className={`text-[7px] font-bold ${roleColorClass} font-mono block`}>{u.role}</span>
                          </div>
                          {isSelected && <Check size={10} className="text-cyan-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

          </motion.div>
        </div>

      </div>

      {/* Corporate Copy line */}
      <footer className="text-[10px] text-slate-600 font-mono uppercase tracking-widest mt-auto pt-8">
        © 2026 ESTEEM METROTRANSIT INFRASTRUCTURE SERVICES PVT LTD • CLOUD SECURE
      </footer>

    </div>
  );
}
