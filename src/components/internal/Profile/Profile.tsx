import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Import useAuth from the new context


interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  gender: string;
  qualification: string;
  additionalQualifications: string[];
  workLocation: string;
  specialization: string;
  medicalLicenseNumber: string;
  consultationFee: number;
  profilePicture: string;
  experience: number;
  photoUrl: string;
  licenseUrl: string;
  govtIdUrl: string;
  profileStatus: string;
  freeReferralsGenerated: number;
  createdAt: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  gender: string;
  dob: string;
  profilePicture: string | null;
  createdAt: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<DoctorProfile | UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDoctor } = useAuth();

  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
    
      const authCookie = Cookies.get('auth');
      let token = '';
      if (authCookie) {
        try {
          token = JSON.parse(authCookie).token;
        } catch (e) {
          token = '';
        }
      }
      
      if (isDoctor) {
        const response = await api.get('/doctors/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data.data);
      } else {
        const response = await api.get('/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data.data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile && !isDoctor) setForm(profile as UserProfile);
  }, [profile, isDoctor]);

  const handleLogout = () => {
    Cookies.remove('auth');
    navigate('/login');
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => prev ? { ...prev, [e.target.name]: e.target.value } : prev);
  };

  const handleSave = async () => {
    try {
      let payload = form;
      // Ensure dob is a string (ISO format)
      if (form && form.dob) {
        // If dob is already a string, keep as is; if it's a Date, convert to string
        if (typeof form.dob !== 'string') {
          payload = { ...form, dob: new Date(form.dob).toISOString().split('T')[0] };
        }
      }
      await api.put('/users/profile', payload);
      setProfile(payload);
      setEditMode(false);
    } catch (err) {
      // handle error
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAF8FB]">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAF8FB]">
        <div className="text-xl text-red-500">Profile not found.</div>
      </div>
    );
  }

  if (isDoctor) {
    const doctor = profile as DoctorProfile;
    return (
      <div className="flex flex-col md:flex-row gap-8 p-8 bg-[#FAF8FB] min-h-screen font-['Poppins']">
        {/* Logout Button */}
       
        {/* Profile Picture */}
        <div className="flex flex-col items-center bg-white rounded-2xl shadow-md p-6 min-w-[300px]">
          <img
            src={doctor.profilePicture}
            alt={doctor.name}
            className="w-40 h-40 rounded-full object-cover border-4 border-[#8B2D6C] mb-4"
          />
          <h2 className="text-2xl font-bold text-[#1A2343] mb-1">{doctor.name}</h2>
          <span className="text-[#8B2D6C] font-semibold">{doctor.specialization}</span>
          <span className="text-gray-500">{doctor.workLocation}</span>
          <span className="mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            {doctor.profileStatus}
          </span>
           <button
          onClick={handleLogout}
          className="px-4 py-2 mt-10 bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white rounded-full font-semibold shadow"
        >
          Logout
        </button>
        </div>
        {/* Profile Details */}
        <div className="flex-1 bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-3xl font-semibold mb-6 text-gray-800">Profile Details</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-2">
                <span className="font-semibold">Email:</span> {doctor.email}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Phone:</span> {doctor.countryCode} {doctor.phoneNumber}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Gender:</span> {doctor.gender}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Experience:</span> {doctor.experience} years
              </div>
              <div className="mb-2">
                <span className="font-semibold">Consultation Fee:</span> ₹{doctor.consultationFee}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Medical License #:</span> {doctor.medicalLicenseNumber}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Referrals Generated:</span> {doctor.freeReferralsGenerated}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Joined:</span> {new Date(doctor.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="mb-2">
                <span className="font-semibold">Qualification:</span> {doctor.qualification}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Additional Qualifications:</span>
                <ul className="list-disc ml-6">
                  {doctor.additionalQualifications.filter(Boolean).map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Photo:</span>{' '}
                <a href={doctor.photoUrl} target="_blank" rel="noopener noreferrer" className="text-[#8B2D6C] underline">
                  View
                </a>
              </div>
              <div className="mb-2">
                <span className="font-semibold">License:</span>{' '}
                <a href={doctor.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-[#8B2D6C] underline">
                  View
                </a>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Govt ID:</span>{' '}
                <a href={doctor.govtIdUrl} target="_blank" rel="noopener noreferrer" className="text-[#8B2D6C] underline">
                  View
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (!isDoctor) {
    const user = profile as UserProfile;
    return (
      <div className="min-h-screen bg-[#FAF8FB] flex items-center justify-center font-['Poppins']">
        <div className="w-full max-w-5xl min-h-[80vh] bg-white rounded-2xl shadow-lg flex overflow-hidden border border-[#F2EAF6]">
          {/* Sidebar */}
          <aside className="w-72 bg-[#FAF8FB] border-r border-[#F2EAF6] flex flex-col py-8 px-6">
            <div className="text-xl font-semibold mb-8">My profile</div>
            <nav className="flex-1 flex flex-col gap-2">
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#F8F2F9] text-[#8B2D6C] font-medium border-l-4 border-[#8B2D6C]">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
                Personal Information
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><rect x="4" y="4" width="12" height="12" rx="2" /></svg>
                About Us
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><rect x="4" y="4" width="12" height="12" rx="2" /></svg>
                Terms & Conditions
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><rect x="4" y="4" width="12" height="12" rx="2" /></svg>
                Previous appointments
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><rect x="4" y="4" width="12" height="12" rx="2" /></svg>
                Privacy Policy
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
                Report an issue
              </button>
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 mt-8 text-[#E11D48] font-medium hover:underline"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className=""><path d="M15 12l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
              Logout
            </button>
          </aside>
          {/* Main Card */}
          <main className="flex-1 flex flex-col items-center justify-center py-12 px-8">
            <div className="flex flex-col items-center mb-8">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover bg-[#F8F2F9] mb-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] flex items-center justify-center text-white text-3xl font-bold mb-2">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="text-2xl font-bold text-[#1A2343]">{user.name}</div>
              <div className="text-gray-500 text-base">{user.countryCode} {user.phoneNumber}</div>
            </div>
            <form className="w-full max-w-lg flex flex-col gap-5">
              <input
                className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3 text-gray-700 placeholder-gray-400 border-0 focus:ring-2 focus:ring-[#8B2D6C] focus:outline-none"
                name="name"
                value={form?.name || ''}
                onChange={handleChange}
                placeholder="Name*"
                readOnly={!editMode}
              />
              <input
                className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3 text-gray-700 placeholder-gray-400 border-0 focus:ring-2 focus:ring-[#8B2D6C] focus:outline-none"
                name="email"
                value={form?.email || ''}
                onChange={handleChange}
                placeholder="Email Address*"
                readOnly={!editMode}
              />
              <select
                className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3 text-gray-700 placeholder-gray-400 border-0 focus:ring-2 focus:ring-[#8B2D6C] focus:outline-none appearance-none"
                name="gender"
                value={form?.gender || ''}
                onChange={handleChange}
                disabled={!editMode}
              >
                <option value="">Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              <input
                className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3 text-gray-700 placeholder-gray-400 border-0 focus:ring-2 focus:ring-[#8B2D6C] focus:outline-none"
                name="phoneNumber"
                value={form?.phoneNumber || ''}
                onChange={handleChange}
                placeholder="Phone Number*"
                readOnly={!editMode}
              />
              {/* Doctor referral code field (if needed) */}
              {/* <input
                className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3 text-gray-700 placeholder-gray-400 border-0 focus:ring-2 focus:ring-[#8B2D6C] focus:outline-none"
                name="doctorReferralCode"
                value={form?.doctorReferralCode || ''}
                onChange={handleChange}
                placeholder="Doctor referral code*"
                readOnly={!editMode}
              /> */}
              <div className="relative">
                <input
                  className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3 text-gray-700 placeholder-gray-400 border-0 focus:ring-2 focus:ring-[#8B2D6C] focus:outline-none pr-12"
                  name="dob"
                  type="date"
                  value={form?.dob ? (typeof form.dob === 'string' ? form.dob : new Date(form.dob).toISOString().split('T')[0]) : ''}
                  onChange={handleChange}
                  placeholder="Date of Birth*"
                  readOnly={!editMode}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="14" height="10" rx="2" /><path d="M16 3v4M4 3v4" /></svg>
                </span>
              </div>
              {!editMode ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="w-full mt-4 py-3 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white font-semibold text-lg shadow hover:opacity-90 transition"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white font-semibold text-lg shadow hover:opacity-90 transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-3 rounded-full bg-gray-200 text-gray-700 font-semibold text-lg shadow hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </main>
        </div>
      </div>
    );
  }
}