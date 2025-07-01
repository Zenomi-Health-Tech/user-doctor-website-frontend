import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Import useAuth from the new context
import { useToast } from '@/hooks/use-toast';

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
  bloodGroup?: string;
  profilePicture: string | File | null;
}

export default function Profile() {
  const [doctorForm, setDoctorForm] = useState<DoctorProfile>(/* ... */);
  const [userForm, setUserForm] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDoctor } = useAuth();
  const { toast } = useToast();

  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [step, setStep] = useState(1);

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
        setDoctorForm(response.data.data);
      } else {
        const response = await api.get('/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.data.dob && typeof response.data.data.dob === 'string') {
          response.data.data.dob = response.data.data.dob.split('T')[0];
        }
        setUserForm(response.data.data);
        
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Cookies.remove('auth');
    navigate('/chooserole');
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);

  const handleDoctorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDoctorForm((prev) => ({
      ...prev,
      [name]: value,
    }) as DoctorProfile);
  };

  const handleDoctorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setDoctorForm((prev) => ({
        ...prev,
        [name]: files[0],
      }) as DoctorProfile);
    }
  };

  const handleDoctorSave = async () => {
    try {
      const formData = new FormData();
      Object.entries(doctorForm as DoctorProfile).forEach(([key, value]) => {
        // Handle arrays and files
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          if (key === 'dob') {
            if (typeof value === 'string') {
              formData.append('dob', value.split('T')[0]);
            } else if (value instanceof Date) {
              formData.append('dob', value.toISOString().split('T')[0]);
            } else {
              formData.append('dob', '');
            }
          } else {
            formData.append(key, value as string);
          }
        }
      });
      const res = await api.put('/doctors/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if(res.data && res.data.success){
        toast({
          title: "Success",
          description: "Doctor Profile Editted!",
          variant: "default",
          className: "bg-green-500 text-white",
      });
      window.location.reload();
      }
      setEditMode(false);
    } catch (err) {
      // handle error
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserForm((prev) => prev ? { ...prev, [name]: value } : prev);
  };

  // const handleUserFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, files } = e.target;
  //   if (files && files[0]) {
  //     setUserForm((prev) => prev ? { ...prev, [name]: files[0] } : prev);
  //   }
  // };

  const handleUserSave = async () => {
    if (!userForm) return;
    try {
      const formData = new FormData();
      Object.entries(userForm as UserProfile).forEach(([key, value]) => {
        if (key === 'dob') return;
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });
      const authCookie = Cookies.get('auth');
      let token = '';
      if (authCookie) {
        try {
          token = JSON.parse(authCookie).token;
        } catch (e) {
          token = '';
        }
      }
      const res = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data && res.data.success) {
        toast({
          title: "Success",
          description: "User Profile Edited!",
          variant: "default",
          className: "bg-green-500 text-white",
        });
        window.location.reload();
      }
      setEditMode(false);
    } catch (err) {
      // handle error
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!doctorForm && !userForm) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <div className="text-xl text-red-500">Profile not found.</div>
      </div>
    );
  }

  if (isDoctor) {
    const doctor = doctorForm as DoctorProfile;
    return (
      <div className="min-h-screen flex items-center justify-center font-['Poppins']">
        <div className="w-full max-w-5xl min-h-[80vh] bg-white rounded-2xl shadow-lg flex overflow-hidden border border-[#F2EAF6]">
          {/* Sidebar */}
          <aside className="w-72 border-r border-[#F2EAF6] flex flex-col py-8 px-6">
            <div className="text-xl font-semibold mb-8">My profile</div>
            <nav className="flex-1 flex flex-col gap-2">
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#F8F2F9] text-[#8B2D6C] font-medium border-l-4 border-[#8B2D6C]">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
                Personal Information
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
              About Us
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
              Terms & Conditions
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
              My plans
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
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
              {doctor.profilePicture ? (
          <img
                  src={typeof doctor.profilePicture === 'string'
                    ? doctor.profilePicture
                    : URL.createObjectURL(doctor.profilePicture)}
            alt={doctor.name}
                  className="w-20 h-20 rounded-full object-cover bg-[#F8F2F9] mb-2"
          />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] flex items-center justify-center text-white text-3xl font-bold mb-2">
                  {doctor.name.charAt(0)}
        </div>
              )}
              <div className="text-2xl font-bold text-[#1A2343] mt-2">Dr.{doctor.name}</div>
              <div className="text-gray-500 text-base">{doctor.countryCode} {doctor.phoneNumber}</div>
            </div>
            <form className="w-full max-w-lg flex flex-col gap-5">
              {step === 1 && (
                <>
                  <input
                    className="rounded-lg px-4 py-3 bg-[#F8F2F9] text-gray-700 placeholder-gray-400 border-0"
                    name="name"
                    value={doctor.name}
                    onChange={handleDoctorChange}
                    placeholder="Name*"
                  />
                  <input
                    className="rounded-lg px-4 py-3 bg-[#F8F2F9] text-gray-700 placeholder-gray-400 border-0"
                    name="email"
                    value={doctor.email}
                    onChange={handleDoctorChange}
                    placeholder="Email Address*"
                  />
                  <select
                    className="rounded-lg px-4 py-3 bg-[#F8F2F9] text-gray-700 border-0"
                    name="gender"
                    value={doctor.gender}
                    onChange={handleDoctorChange}
                  >
                    <option value="">Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <input
                    className="rounded-lg px-4 py-3 bg-[#F8F2F9] text-gray-700 placeholder-gray-400 border-0"
                    name="phoneNumber"
                    value={doctor.phoneNumber}
                    onChange={handleDoctorChange}
                    placeholder="Phone Number*"
                  />
                  <input
                    className="rounded-lg px-4 py-3 bg-[#F8F2F9] text-gray-700 placeholder-gray-400 border-0"
                    name="dob"
                    type="date"
                    value={doctor.createdAt ? doctor.createdAt.split('T')[0] : ''}
                    onChange={handleDoctorChange}
                    placeholder="Date of Birth*"
                  />
                  <input
                    className="rounded-lg px-4 py-3 bg-[#F8F2F9] text-gray-700 placeholder-gray-400 border-0"
                    name="govtIdUrl"
                    type="file"
                    onChange={handleDoctorFileChange}
                    placeholder="Government ID"
                  />
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full mt-4 py-3 rounded-full text-white font-semibold text-lg shadow"
                    style={{ background: 'linear-gradient(89.79deg, #704180 5.07%, #8B2D6C 95.83%)' }}
                  >
                    Next
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <input
                    className="rounded-lg px-4 py-3 bg-[#F8F2F9] text-gray-700 placeholder-gray-400 border-0"
                    name="qualification"
                    value={doctor.qualification}
                    onChange={handleDoctorChange}
                    placeholder="Qualification*"
                  />
                  <input
                    className="rounded-lg px-4 py-3 bg-[#F8F2F9] text-gray-700 placeholder-gray-400 border-0"
                    name="specialization"
                    value={doctor.specialization}
                    onChange={handleDoctorChange}
                    placeholder="Specialization*"
                  />
                  <input
                    className="rounded-lg px-4 py-3 bg-[#F8F2F9] text-gray-700 placeholder-gray-400 border-0"
                    name="medicalLicenseNumber"
                    value={doctor.medicalLicenseNumber}
                    onChange={handleDoctorChange}
                    placeholder="Medical License Number*"
                  />
                  <input
                    className="rounded-lg px-4 py-3 bg-[#F8F2F9] text-gray-700 placeholder-gray-400 border-0"
                    name="experience"
                    value={doctor.experience.toString()}
                    onChange={handleDoctorChange}
                    placeholder="Experience*"
                  />
                  <input
                    className="rounded-lg px-4 py-3 bg-[#F8F2F9] text-gray-700 placeholder-gray-400 border-0"
                    name="consultationFee"
                    value={doctor.consultationFee.toString()}
                    onChange={handleDoctorChange}
                    placeholder="Consultation Fee*"
                  />
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleDoctorSave}
                      className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white font-semibold text-lg shadow hover:opacity-90 transition"
                    >
                      Edit Profile
                    </button>
              </div>
                </>
              )}
            </form>
          </main>
        </div>
      </div>
    );
  } else if (!isDoctor) {
    const user = userForm as UserProfile;
    return (
      <div className="min-h-screen flex flex-col md:flex-row items-center md:items-start justify-center font-['Poppins'] p-2 sm:p-4">
        <div className="w-full max-w-5xl min-h-[80vh] bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden border border-[#F2EAF6]">
          {/* Sidebar */}
          <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-[#F2EAF6] flex flex-row md:flex-col py-4 md:py-8 px-4 md:px-6 gap-2 md:gap-0 overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal max-w-full min-w-0">
            <div className="text-lg md:text-xl font-semibold mb-4 md:mb-8 w-full">My profile</div>
            <nav className="flex-1 flex flex-row md:flex-col gap-2 w-full overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal">
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#F8F2F9] text-[#8B2D6C] font-medium border-l-4 border-[#8B2D6C]">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
                Personal Information
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
              About Us
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
              Terms & Conditions
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
              My plans
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
              Privacy Policy
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
              Report an issue
              </button>
            </nav>
          <button
            onClick={handleLogout}
              className="flex items-center gap-2 mt-4 md:mt-8 text-[#E11D48] font-medium hover:underline"
          >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className=""><path d="M15 12l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
            Logout
          </button>
          </aside>
          {/* Main Card */}
          <main className="flex-1 flex flex-col items-center justify-center py-6 sm:py-10 md:py-12 px-2 sm:px-4 md:px-8">
            <div className="flex flex-col items-center mb-6 sm:mb-8">
            {user.profilePicture ? (
              <img
                  src={
                    typeof user.profilePicture === 'string'
                      ? user.profilePicture
                      : user.profilePicture
                      ? URL.createObjectURL(user.profilePicture)
                      : undefined
                  }
                alt={user.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover bg-[#F8F2F9] mb-2"
              />
            ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mb-2">
                {user.name.charAt(0)}
              </div>
            )}
              <div className="text-lg sm:text-2xl font-bold text-[#1A2343]">{user.name}</div>
              <div className="text-gray-500 text-sm sm:text-base">{user.countryCode} {user.phoneNumber}</div>
            </div>
            <form className="w-full max-w-full sm:max-w-lg flex flex-col gap-4 sm:gap-5">
              <input
                className="w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 placeholder-gray-400 border-0 focus:ring-2 focus:ring-[#8B2D6C] focus:outline-none text-sm sm:text-base"
                name="name"
                value={user.name}
                onChange={handleUserChange}
                placeholder="Name*"
                readOnly={!editMode}
              />
              <input
                className="w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 placeholder-gray-400 border-0 focus:ring-2 focus:ring-[#8B2D6C] focus:outline-none text-sm sm:text-base"
                name="email"
                value={user.email}
                onChange={handleUserChange}
                placeholder="Email Address*"
                readOnly={!editMode}
              />
              <select
                className="w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 placeholder-gray-400 border-0 focus:ring-2 focus:ring-[#8B2D6C] focus:outline-none appearance-none text-sm sm:text-base"
                name="gender"
                value={user.gender}
                onChange={handleUserChange}
                disabled={!editMode}
              >
                <option value="">Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              <input
                className="w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 placeholder-gray-400 border-0 focus:ring-2 focus:ring-[#8B2D6C] focus:outline-none text-sm sm:text-base"
                name="phoneNumber"
                value={user.phoneNumber}
                onChange={handleUserChange}
                placeholder="Phone Number*"
                readOnly={!editMode}
              />
           
              {!editMode ? (
          <button
                  type="button"
                  onClick={handleEdit}
                  className="w-full mt-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white font-semibold text-base sm:text-lg shadow hover:opacity-90 transition"
          >
            Edit Profile
          </button>
              ) : (
                <div className="flex gap-3 sm:gap-4 mt-4">
                  <button
                    type="button"
                    onClick={handleUserSave}
                    className="flex-1 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white font-semibold text-base sm:text-lg shadow hover:opacity-90 transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-2.5 sm:py-3 rounded-full bg-gray-200 text-gray-700 font-semibold text-base sm:text-lg shadow hover:bg-gray-300 transition"
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