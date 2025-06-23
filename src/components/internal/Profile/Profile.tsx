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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white rounded-full font-semibold shadow"
        >
          Logout
        </button>
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
      <div className="flex flex-col items-center p-8 bg-[#FAF8FB] min-h-screen font-['Poppins']">
        <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-md p-8">
          <button
            onClick={handleLogout}
            className="absolute top-6 right-6 px-4 py-2 bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white rounded-full font-semibold shadow"
          >
            Logout
          </button>
          <div className="flex items-center mb-8">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] flex items-center justify-center text-white text-2xl font-bold mr-4">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-2xl font-bold text-[#1A2343]">{user.name}</div>
              <div className="text-gray-500">{user.countryCode} {user.phoneNumber}</div>
            </div>
          </div>
          <form className="space-y-4">
            {editMode ? (
              <>
                <input
                  className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3"
                  name="name"
                  value={form?.name || ''}
                  onChange={handleChange}
                  placeholder="Name*"
                />
                <input
                  className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3"
                  name="email"
                  value={form?.email || ''}
                  onChange={handleChange}
                  placeholder="Email Address*"
                />
                <input
                  className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3"
                  name="gender"
                  value={form?.gender || ''}
                  onChange={handleChange}
                  placeholder="Gender"
                />
                <input
                  className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3"
                  name="phoneNumber"
                  value={form?.phoneNumber || ''}
                  onChange={handleChange}
                  placeholder="Phone Number*"
                />
                <input
                  className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3"
                  name="dob"
                  type="date"
                  value={form?.dob ? (typeof form.dob === 'string' ? form.dob : new Date(form.dob).toISOString().split('T')[0]) : ''}
                  onChange={handleChange}
                  placeholder="Date of Birth*"
                />
              </>
            ) : (
              <>
                <input className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3" value={user.name} readOnly placeholder="Name*" />
                <input className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3" value={user.email} readOnly placeholder="Email Address*" />
                <input className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3" value={user.gender} readOnly placeholder="Gender" />
                <input className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3" value={user.phoneNumber} readOnly placeholder="Phone Number*" />
                <input
                  className="w-full bg-[#FAF8FB] rounded-lg px-4 py-3"
                  name="dob"
                  type="date"
                  value={user.dob ? (typeof user.dob === 'string' ? user.dob : new Date(user.dob).toISOString().split('T')[0]) : ''}
                  readOnly
                  placeholder="Date of Birth*"
                />
              </>
            )}
          </form>
          {!editMode ? (
            <button
              onClick={handleEdit}
              className="w-full mt-8 py-3 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white font-semibold text-lg"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white font-semibold text-lg"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-full bg-gray-300 text-gray-700 font-semibold text-lg"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}