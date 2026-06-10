import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import zenomiLogo from "@/assets/zenomiLogo.png";

interface Props {
  email: string;
  role: "DOCTOR" | "USER";
  onVerified: () => void;
  accentColor?: string;
}

export default function MFAVerify({ email, role, onVerified, accentColor = "#704180" }: Props) {
  const { toast } = useToast();
  const [code, setCode] = useState(["", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const sendCode = async () => {
    setSending(true);
    try {
      await axios.post("https://zenomi.elitceler.com/api/v1/mfa/send", { email, role });
      setCodeSent(true);
      setCode(["", "", "", ""]);
      setTimeout(() => refs[0].current?.focus(), 100);
      toast({
        title: "Code Sent",
        description: `A 4-digit code was sent to ${email}`,
        className: "bg-green-500 text-white",
      });
    } catch {
      toast({ title: "Error", description: "Failed to send code. Try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 3) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setCode(pasted.split(""));
      refs[3].current?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length < 4) {
      toast({ title: "Error", description: "Please enter the 4-digit code.", variant: "destructive" });
      return;
    }
    setVerifying(true);
    try {
      await axios.post("https://zenomi.elitceler.com/api/v1/mfa/verify", { email, code: fullCode, role });
      onVerified();
    } catch (err: any) {
      toast({
        title: "Invalid Code",
        description: err.response?.data?.message || "The code is incorrect or expired.",
        variant: "destructive",
      });
      setCode(["", "", "", ""]);
      refs[0].current?.focus();
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f8f6fa] to-[#ede7f3] px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 sm:p-10 flex flex-col items-center">
        <img src={zenomiLogo} alt="Zenomi" className="h-10 mb-6" />

        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{ background: "linear-gradient(135deg, #e8eaf6, #ede7f6)" }}
        >
          <svg className="w-7 h-7" style={{ color: accentColor }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1 font-['Poppins']">2-Factor Authentication</h1>
        <p className="text-sm text-gray-500 mb-1 font-['Poppins'] text-center">
          {codeSent
            ? `Enter the 4-digit code sent to`
            : "Verify your identity to continue"}
        </p>
        {codeSent && (
          <p className="text-sm font-semibold mb-6 font-['Poppins'] text-center" style={{ color: accentColor }}>
            {email}
          </p>
        )}
        {!codeSent && <div className="mb-6" />}

        {!codeSent ? (
          <button
            onClick={sendCode}
            disabled={sending}
            className="w-full h-12 rounded-full text-white font-semibold text-sm font-['Poppins'] flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: `linear-gradient(90deg, #704180, ${accentColor})` }}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              "Send Verification Code"
            )}
          </button>
        ) : (
          <>
            <div className="flex gap-3 mb-6" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={refs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 outline-none transition-all font-['Poppins']"
                  style={{
                    borderColor: digit ? accentColor : "#e5e7eb",
                    color: accentColor,
                    boxShadow: digit ? `0 0 0 3px ${accentColor}20` : "none",
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={verifying || code.join("").length < 4}
              className="w-full h-12 rounded-full text-white font-semibold text-sm font-['Poppins'] flex items-center justify-center gap-2 disabled:opacity-60 mb-4"
              style={{ background: `linear-gradient(90deg, #704180, ${accentColor})` }}
            >
              {verifying ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Verify & Continue"
              )}
            </button>

            <div className="text-center">
              <span className="text-xs text-gray-400 font-['Poppins']">Didn't receive it? </span>
              <button
                onClick={sendCode}
                disabled={sending}
                className="text-xs font-semibold font-['Poppins'] hover:underline disabled:opacity-50"
                style={{ color: accentColor }}
              >
                Resend Code
              </button>
            </div>
          </>
        )}

        <p className="text-xs text-gray-400 mt-6 text-center font-['Poppins']">
          The code expires in 10 minutes.
        </p>
      </div>
    </div>
  );
}
