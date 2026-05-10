"use client";

import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savePassword, setSavePassword] = useState(true);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-200/50 sm:p-6 lg:p-8">
      {/* Mobile Frame Container */}
      <div className="relative w-full h-[100dvh] sm:h-auto sm:max-w-[400px] bg-[#FBFDFF] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col justify-between">
        
        {/* Top Content (Header + Graphic + Form) */}
        <div className="relative z-10 flex flex-col items-center pt-[10dvh] sm:pt-12 px-6 pb-20">
          
          {/* Custom Illustration (Lock & User) */}
          <div className="relative w-32 h-24 mb-6 flex justify-center items-end">
            {/* Shadow under graphic */}
            <div className="absolute bottom-0 w-24 h-2 bg-gray-300/60 rounded-[100%] blur-[2px]"></div>
            
            {/* Padlock Body */}
            <div className="relative z-10 w-[60px] h-[45px] bg-[#2E97DD] rounded-[10px] flex items-center justify-center shadow-sm">
               {/* Keyhole */}
               <div className="flex flex-col items-center mt-1">
                 <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                 <div className="w-1.5 h-3 bg-white rounded-b-sm -mt-0.5"></div>
               </div>
            </div>
            
            {/* Padlock Shackle (Unlocked) */}
            <div className="absolute top-1 left-9 z-0 w-[42px] h-[36px] border-[5px] border-[#91C1E6] rounded-t-full border-b-0 hidden" />
            <svg className="absolute top-[2px] left-[42px] z-0 w-[46px] h-[44px]" viewBox="0 0 46 44" fill="none">
               <path d="M 6 44 L 6 23 C 6 12 14 4 23 4 C 32 4 40 12 40 23 L 40 28" stroke="#90C3EA" strokeWidth="6" strokeLinecap="round" />
            </svg>

            {/* User figure (Yellow overlapping) */}
            <div className="absolute -right-2 bottom-0 z-20 w-[42px] h-[46px] flex flex-col items-center">
              {/* Head */}
              <div className="w-[22px] h-[22px] bg-[#EEBA4A] rounded-full shadow-sm z-30"></div>
              {/* Shoulders */}
              <div className="w-[42px] h-[20px] bg-[#EEBA4A] rounded-t-[18px] -mt-1 shadow-sm relative z-20"></div>
            </div>
          </div>

          {/* Titles */}
          <div className="text-center mb-8 px-2">
            <h1 className="text-[28px] leading-tight font-extrabold text-[#0D0D0D] mb-3 font-sans tracking-tight">
              Welcome Back!
            </h1>
            <p className="text-[11px] font-bold text-gray-500 leading-tight max-w-[280px] mx-auto opacity-70">
              Lorem ipsum dolor sit amet, consectetuer adipiscing sed diam nonummy nibh excimed incidiunt.
            </p>
          </div>

          {/* Login Card Wrapper - It visually sits above the background */}
          <div className="w-full bg-[#FAFBFC] rounded-3xl p-6 shadow-[0_12px_44px_-12px_rgba(0,0,0,0.15)] relative z-20 mt-2">
            <h2 className="text-[22px] font-bold text-center text-[#1A1A1A] mb-6">
              Login Account
            </h2>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* Email Input */}
              <div className="flex items-center bg-white border border-gray-100 rounded-xl px-4 py-3.5 shadow-sm focus-within:shadow-md transition-shadow">
                <Mail size={16} className="text-[#0D0D0D] mr-3 font-bold" strokeWidth={3} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold text-gray-800 placeholder:text-gray-800"
                />
              </div>

              {/* Password Input */}
              <div className="flex items-center bg-white border border-gray-100 rounded-xl px-4 py-3.5 shadow-sm focus-within:shadow-md transition-shadow">
                <Lock size={16} className="text-[#0D0D0D] mr-3 font-bold" strokeWidth={3} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold text-gray-800 placeholder:text-gray-800"
                />
              </div>

              {/* Actions Row */}
              <div className="flex items-center justify-between pt-1 pb-1">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4 mr-2">
                    <input
                      type="checkbox"
                      checked={savePassword}
                      onChange={(e) => setSavePassword(e.target.checked)}
                      className="peer appearance-none w-4 h-4 rounded bg-[#4FA0DD] checked:bg-[#2A89CD] outline-none cursor-pointer"
                    />
                    <svg
                      className="absolute w-2.5 h-2.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-[#1A1A1A] select-none">
                    Save Password
                  </span>
                </label>
                
                <button type="button" className="text-[11px] font-bold text-[#1A1A1A] hover:underline">
                  Forgot Password
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-[#4DA5E5] hover:bg-[#3d94d4] transition-colors text-white text-[15px] font-bold py-4 rounded-xl shadow-[0_8px_20px_-8px_#4DA5E5] mt-2 mb-2"
              >
                Login Account
              </button>
            </form>

            <div className="text-center mt-6 mb-3">
              <span className="text-[11px] font-bold text-gray-800/80">
                Or. Login with
              </span>
            </div>

            {/* Social Accounts */}
            <div className="flex justify-center items-center gap-3 mt-4 mb-2">
              <button type="button" className="w-12 h-12 bg-[#F9B94F] flex items-center justify-center rounded-full text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-sm">
                A
              </button>
              <button type="button" className="w-12 h-12 bg-[#4FA0DD] flex items-center justify-center rounded-full text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-sm">
                B
              </button>
              <button type="button" className="w-12 h-12 bg-[#89C34C] flex items-center justify-center rounded-full text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-sm">
                C
              </button>
            </div>
          </div>
        </div>

        {/* Background Wave - Positioned absolutely at the bottom of the frame */}
        <div className="absolute bottom-0 left-0 right-0 h-[50%] z-0 overflow-hidden pointer-events-none">
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            className="absolute -top-10 left-0 w-[150%] h-[150%] text-[#2594DF] transform -translate-x-10"
          >
            {/* The distinctive wave shape: starts mid-left, dips a bit, then covers the bottom */}
            <path d="M0,40 C30,30 50,60 100,20 L100,100 L0,100 Z" fill="currentColor" />
          </svg>
          
          {/* Add a secondary subtle layer to match the image fully if needed, or make it exactly one solid blue */}
        </div>

        {/* Bottom Footer Content */}
        <div className="relative z-10 w-full flex flex-col items-center pb-8 sm:pb-8 pt-6">
          <p className="text-white/80 text-[11px] font-medium mb-1">
            Don't Have an Account?
          </p>
          <button type="button" className="text-white text-[13px] font-bold hover:underline">
            Create Account
          </button>
        </div>

      </div>
    </main>
  );
}
