import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  gender: string;
  dob: string;
  noOfTests: number;
  createdAt: string;
  updatedAt: string;
}

const PatientsList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const authCookie = Cookies.get('auth');
        let token = '';
        if (authCookie) {
          try {
            token = JSON.parse(authCookie).token;
          } catch (e) {
            token = '';
          }
        }

        const response = await api.get<{ success: boolean; data: Patient[] }>('/doctors/all-users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setPatients(response.data.data);
        } else {
          console.error('Failed to fetch patients:', response.data);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handlePatientClick = (id: string) => {
    navigate(`/patients/${id}`);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading patients...</div>;
  }

  return (
    <div className="p-8 bg-[#FAF8FB] min-h-screen font-['Poppins']">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Patient Details</h1>
      <div className="flex items-center justify-between mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search your patients here"
            className="w-full py-3 pl-10 pr-4 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B2D6C]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-3 rounded-full bg-white border border-gray-200 shadow-sm ml-4">
          <SlidersHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => handlePatientClick(patient.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#8B2D6C1A] flex items-center justify-center text-[#8B2D6C] font-semibold text-lg">
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-lg">{patient.name}</p>
                  <p className="text-sm text-gray-500">Treated on {formatDate(patient.updatedAt)}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500" />
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 text-lg mt-10">No patients found.</div>
        )}
      </div>
    </div>
  );
};

export default PatientsList;
