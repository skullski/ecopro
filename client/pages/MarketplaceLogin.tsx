import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function MarketplaceLogin() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: Call backend to send OTP
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
    }, 1000);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: Call backend to verify OTP and log in
    setTimeout(() => {
      setLoading(false);
      navigate("/marketplace");
    }, 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-purple-100 dark:from-[#0f1021] dark:via-[#181a2a] dark:to-[#1a1a2e]">
      <form className="bg-white dark:bg-[#181a2a] p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-6" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
        <h2 className="text-2xl font-bold text-center">Marketplace Seller Login</h2>
        <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required disabled={otpSent} />
        {otpSent && (
          <Input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required />
        )}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Loading..." : otpSent ? "Verify OTP" : "Send OTP"}</Button>
      </form>
    </div>
  );
}
