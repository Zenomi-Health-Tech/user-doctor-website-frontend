import { useEffect, useState } from "react";
import api from "@/utils/api";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, User, Calendar, FileText, Info, Shield, AlertTriangle, LogOut } from "lucide-react";
import LottieLoader from "@/components/shared/LottieLoader";

const TERMS = `Zenomi Health - Terms and Conditions\n\nEffective Date: June 1st, 2025\n\nThese Terms govern your use of the Zenomi Health website and mobile application. By using the Service, you agree to these Terms.\n\n1. Use of Service — You must be at least 18 years old (India) or 13 years old (USA).\n2. Acceptable Use — Do not copy, modify, or reverse-engineer any part of the Service.\n3. Intellectual Property — All content is property of Zenomi Health.\n4. Data Handling — We do not sell or share your data with third parties.\n5. Termination — We may suspend your account if you violate these Terms.\n6. Disclaimer — The Service is provided "as is" without warranties.\n7. Contact — support@zenomihealth.com`;
const PRIVACY = `Zenomi Health - Privacy Policy\n\nEffective Date: June 1st, 2025\n\n1. We collect Personal Information and Health/Wellness Information.\n2. We use your information to provide and personalize services.\n3. We employ industry-standard encryption.\n4. We do not share, sell, or rent your data.\n5. You may request access to, correction of, or deletion of your data.\n6. Contact: privacy@zenomihealth.com`;

interface UserProfile { id: string; name: string; email: string; countryCode: string; phoneNumber: string; gender: string; profilePicture: string | null; }

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [modal, setModal] = useState<"terms" | "privacy" | "about" | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const { isDoctor } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [allTestsDone, setAllTestsDone] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const endpoint = isDoctor ? "/doctors/profile" : "/users/profile";
        const res = await api.get(endpoint);
        setUser(res.data.data);
      } catch {}
      setLoading(false);
    })();
    if (!isDoctor) {
      const authCookie = Cookies.get("auth");
      let token = "";
      if (authCookie) { try { token = JSON.parse(authCookie).token; } catch { token = ""; } }
      if (token) {
        axios.get("https://zenomiai.elitceler.com/api/testnames", { headers: { Authorization: `Bearer ${token}` } })
          .then(res => { if (Array.isArray(res.data) && res.data.length > 0 && res.data.every((t: any) => t.testStatus === "COMPLETED")) setAllTestsDone(true); }).catch(() => {});
      }
    }
  }, [isDoctor]);

  const handleLogout = () => { Cookies.remove("auth"); navigate("/chooserole"); };

  const handleSave = async () => {
    if (!user) return;
    try {
      const formData = new FormData();
      Object.entries(user).forEach(([k, v]) => { if (v != null && k !== 'profilePicture') formData.append(k, String(v)); });
      if (profileFile) formData.append('profilePicture', profileFile);
      const endpoint = isDoctor ? "/doctors/profile" : "/users/profile";
      const res = await api.put(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data?.success) { toast({ title: "Success", description: "Profile updated!", className: "bg-green-500 text-white" }); window.location.reload(); }
      setEditMode(false);
    } catch {}
  };

  if (loading) return <LottieLoader text="Loading profile..." />;
  if (!user) return <div className="flex justify-center items-center min-h-screen"><p className="text-red-500">Profile not found.</p></div>;

  const initial = user.name?.charAt(0).toUpperCase() || "U";

  const menuGroup1 = [
    { icon: User, title: "Personal Information", action: () => setEditMode(true) },
    { icon: Calendar, title: "Previous Appointments", action: () => navigate("/appointments") },
    { icon: FileText, title: "Reports", action: () => navigate("/results") },
  ];
  const menuGroup2 = [
    { icon: Info, title: "About Us", action: () => setModal("about") },
    { icon: FileText, title: "Terms & Conditions", action: () => setModal("terms") },
    { icon: Shield, title: "Privacy Policy", action: () => setModal("privacy") },
    { icon: AlertTriangle, title: "Report an issue", action: () => {} },
  ];

  return (
    <div className="min-h-screen font-['Poppins'] bg-white">
      <div className="max-w-lg mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-full bg-[#8B2D6C]/20 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-[#8B2D6C]" />
          </button>
          <h1 className="text-xl font-bold text-black">My Profile</h1>
          <div className="w-10" />
        </div>

        {/* Avatar + Name + Phone */}
        <button onClick={() => setEditMode(true)} className="flex items-center gap-5 mb-6 w-full text-left">
          <div className="w-[74px] h-[74px] rounded-full flex-shrink-0 border-2 border-[#8B2D6C] shadow-md overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #704180, #8B2D6C)' }}>
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-medium">{initial}</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[22px] font-bold text-black truncate leading-tight">{user.name}</p>
            <p className="text-sm text-[#696969]">{user.countryCode}  {user.phoneNumber}</p>
          </div>
        </button>

        {/* Menu Group 1 */}
        <MenuCard items={menuGroup1} />
        <div className="h-4" />

        {/* Menu Group 2 */}
        <MenuCard items={menuGroup2} />
        <div className="h-4" />

        {/* View Courses */}
        {!isDoctor && allTestsDone && (
          <a href="https://learn.zenomi.com" target="_blank" rel="noopener noreferrer"
            className="w-full rounded-full py-4 flex items-center justify-center gap-2.5 text-white font-semibold mb-4"
            style={{ background: 'linear-gradient(90deg, #704180, #8B2D6C)' }}>
            <img src="/zenomiLogo.png" alt="Z" className="w-5 h-5 rounded" />
            View Courses
          </a>
        )}

        {/* Logout */}
        <button onClick={handleLogout} className="w-full rounded-[30px] border border-[#EEE] p-5 shadow-sm flex items-center gap-2.5">
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="text-base text-red-500">Logout</span>
        </button>
      </div>

      {/* Edit Modal */}
      {editMode && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="max-w-lg mx-auto px-6 py-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setEditMode(false)}><ChevronLeft className="w-6 h-6 text-black" /></button>
              <h2 className="text-lg font-bold">Personal Information</h2>
            </div>
            <div className="flex justify-center mb-6">
              <label className="cursor-pointer relative group">
                <div className="w-[100px] h-[100px] rounded-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #704180, #8B2D6C)' }}>
                  {profilePreview || user.profilePicture ? <img src={profilePreview || user.profilePicture!} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-3xl font-medium">{initial}</div>}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="text-white text-xs font-medium">Change</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setProfileFile(f); setProfilePreview(URL.createObjectURL(f)); } }} />
              </label>
            </div>
            <div className="space-y-4">
              <Field label="Name" value={user.name} onChange={v => setUser({ ...user, name: v })} />
              <Field label="Email" value={user.email} onChange={v => setUser({ ...user, email: v })} />
              <div className="flex gap-3">
                <div className="w-24">
                  <Field label="Code" value={user.countryCode} onChange={v => setUser({ ...user, countryCode: v })} />
                </div>
                <div className="flex-1">
                  <Field label="Phone Number" value={user.phoneNumber} onChange={v => setUser({ ...user, phoneNumber: v })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#696969] mb-1 block">Gender</label>
                <select value={user.gender} onChange={e => setUser({ ...user, gender: e.target.value })}
                  className="w-full px-4 py-3 rounded-full border border-[#8B2D6C]/30 text-sm outline-none focus:ring-2 focus:ring-[#8B2D6C]">
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <button onClick={handleSave} className="w-full mt-8 py-3.5 rounded-full text-white font-semibold" style={{ background: 'linear-gradient(90deg, #704180, #8B2D6C)' }}>Update</button>
          </div>
        </div>
      )}

      {/* Content Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-2xl text-gray-400" onClick={() => setModal(null)}>&times;</button>
            <h2 className="text-lg font-bold text-center mb-4">{modal === "terms" ? "Terms & Conditions" : modal === "privacy" ? "Privacy Policy" : "About Us"}</h2>
            <pre className="whitespace-pre-wrap text-gray-700 text-sm">{modal === "terms" ? TERMS : modal === "privacy" ? PRIVACY : "We empower young minds by combining neuroscience-informed assessments with personalized wellness strategies."}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuCard({ items }: { items: { icon: any; title: string; action: () => void }[] }) {
  return (
    <div className="rounded-[30px] border border-[#EEE] px-5 py-3 shadow-sm">
      {items.map((item, i) => (
        <div key={item.title}>
          <button onClick={item.action} className="w-full flex items-center gap-3 py-4">
            <item.icon className="w-5 h-5 text-[#8B2D6C]" />
            <span className="flex-1 text-left text-base text-black">{item.title}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          {i < items.length - 1 && <div className="h-px bg-[#EEE]" />}
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-[#696969] mb-1 block">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} className="w-full px-4 py-3 rounded-full border border-[#8B2D6C]/30 text-sm outline-none focus:ring-2 focus:ring-[#8B2D6C]" />
    </div>
  );
}
