import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

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

export default function Profile() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      const response = await api.get('/doctors/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data.data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Cookies.remove('auth');
    navigate('/login');
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

  return (
    <div className="flex flex-col md:flex-row gap-8 p-8 bg-[#FAF8FB] min-h-screen font-['Poppins']">
      {/* Logout Button */}
    
      {/* Profile Picture */}
      <div className="flex flex-col items-center bg-white rounded-2xl shadow-md p-6 min-w-[300px]">
        <img
          src={profile.profilePicture}
          alt={profile.name}
          className="w-40 h-40 rounded-full object-cover border-4 border-[#8B2D6C] mb-4"
        />
        <h2 className="text-2xl font-bold text-[#1A2343] mb-1">{profile.name}</h2>
        <span className="text-[#8B2D6C] font-semibold">{profile.specialization}</span>
        <span className="text-gray-500">{profile.workLocation}</span>
        <span className="mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
          {profile.profileStatus}
        </span>
      </div>

      {/* Profile Details */}
      <div className="flex-1 bg-white rounded-2xl shadow-md p-8">
      
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Profile Details</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-2">
              <span className="font-semibold">Email:</span> {profile.email}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Phone:</span> {profile.countryCode} {profile.phoneNumber}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Gender:</span> {profile.gender}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Experience:</span> {profile.experience} years
            </div>
            <div className="mb-2">
              <span className="font-semibold">Consultation Fee:</span> ₹{profile.consultationFee}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Medical License #:</span> {profile.medicalLicenseNumber}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Referrals Generated:</span> {profile.freeReferralsGenerated}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Joined:</span> {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="mb-2">
              <span className="font-semibold">Qualification:</span> {profile.qualification}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Additional Qualifications:</span>
              <ul className="list-disc ml-6">
                {profile.additionalQualifications.filter(Boolean).map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Photo:</span>{' '}
              <a href={profile.photoUrl} target="_blank" rel="noopener noreferrer" className="text-[#8B2D6C] underline">
                View
              </a>
            </div>
            <div className="mb-2">
              <span className="font-semibold">License:</span>{' '}
              <a href={profile.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-[#8B2D6C] underline">
                View
              </a>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Govt ID:</span>{' '}
              <a href={profile.govtIdUrl} target="_blank" rel="noopener noreferrer" className="text-[#8B2D6C] underline">
                View
              </a>
            </div>
          </div>
        </div>
          <button
        onClick={handleLogout}
        className="px-4 py-2 bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white rounded-full font-semibold shadow"
      >
        Logout
      </button>
      </div>
    </div>
  );
}