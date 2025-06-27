import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { useToast } from '@/hooks/use-toast';

interface ScoreData {
  [key: string]: number;
}

interface TestReport {
  id: string;
  cycle: string;
  updatedAt: string;
  createdAt: string;
  testsCompleted: number;
  rawScores: ScoreData;
  normalizedScores: ScoreData;
  reportView: string | null;
  reportDownload: string | null;
  detailedReportView: string | null;
  detailedReportDownload: string | null;
}

interface PatientDetail {
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
  profilePicture: string | null;
  tests: TestReport[];
  isCourseAssigned: boolean;
}


const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [openTestId, setOpenTestId] = useState<string | null>(null);
  const { toast } = useToast();
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchPatientDetails = async () => {
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

        if (!id) {
          console.error('Patient ID is missing.');
          setLoading(false);
          return;
        }

        const response = await api.get<{ success: boolean; data: PatientDetail }>(`/doctors/user?userId=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setPatient(response.data.data);
        } else {
          console.error('Failed to fetch patient details:', response.data);
          setPatient(null);
        }
      } catch (error) {
        console.error('Error fetching patient details:', error);
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleAssignCourse = async () => {
    if (!patient) return;
    setAssigning(true);
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
      const res = await api.post(`/doctors/assign-course?userId=${patient.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.success) {
        toast({
          title: 'Success',
          description: 'Course assigned successfully!',
          variant: 'default',
          className: 'bg-green-500 text-white',
        });
        setPatient({ ...patient, isCourseAssigned: true });
      } else {
        toast({
          title: 'Error',
          description: res.data?.message || 'Failed to assign course.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to assign course.',
        variant: 'destructive',
      });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading patient details...</div>;
  }

  if (!patient) {
    return <div className="flex justify-center items-center h-screen text-xl text-red-600">Patient not found or an error occurred.</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-[#FAF8FB] min-h-screen font-['Poppins']">
      {/* Patient Info Card */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow flex flex-col md:flex-row items-center md:items-start gap-6 border border-gray-100">
        <div className="w-28 h-28 rounded-full bg-[#8B2D6C1A] flex items-center justify-center text-[#8B2D6C] font-semibold text-4xl overflow-hidden border-4 border-[#8B2D6C]">
          {patient.profilePicture ? (
            <img src={patient.profilePicture} alt={patient.name} className="w-full h-full object-cover" />
          ) : (
            patient.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A2343] mb-1">{patient.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-gray-700 text-base">
            <span><span className="font-semibold">Email:</span> {patient.email}</span>
            <span><span className="font-semibold">Phone:</span> {patient.countryCode} {patient.phoneNumber}</span>
            <span><span className="font-semibold">Gender:</span> {patient.gender}</span>
            <span><span className="font-semibold">DOB:</span> {formatDate(patient.dob)}</span>
            <span><span className="font-semibold">Created:</span> {formatDate(patient.createdAt)}</span>
            <span><span className="font-semibold">Updated:</span> {formatDate(patient.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Tests Done Section as Dropdown/Accordion */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Total Assessments Cycles done <span className="text-[#8B2D6C]">({patient.tests.length})</span></h2>
        </div>
        <div className="grid gap-4 md:grid-cols-1">
          {patient.tests.length === 0 && (
            <div className="text-gray-500">No tests available.</div>
          )}
          {patient.tests.map((test) => {
            const isOpen = openTestId === test.id;
            return (
              <div key={test.id} className="bg-[#FBF9FF] rounded-xl shadow-sm border border-[#E9D8F4]">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 focus:outline-none"
                  onClick={() => setOpenTestId(isOpen ? null : test.id)}
                  aria-expanded={isOpen}
                  aria-controls={`test-details-${test.id}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-[#8B2D6C] text-lg">Cycle: {test.cycle}</span>
                    <span className="text-sm text-gray-500">Tests Completed: {test.testsCompleted}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[#8B2D6C] transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div id={`test-details-${test.id}`} className="px-5 pb-5 pt-2 animate-fade-in">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                      <div className="mb-2 md:mb-0">
                        <p className="text-sm text-gray-500">Created: {formatDate(test.createdAt)}</p>
                        <p className="text-sm text-gray-500">Updated: {formatDate(test.updatedAt)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {test.reportView && (
                          <a href={test.reportView} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white text-sm font-semibold shadow hover:opacity-90 transition">View Report</a>
                        )}
                        {test.detailedReportView && (
                          <a href={test.detailedReportView} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white text-sm font-semibold shadow hover:opacity-90 transition">View Detailed</a>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 mt-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-700 mb-1">Test Scores:</p>
                        <ul className="list-disc ml-6 text-sm text-gray-800">
                          {Object.entries(test.rawScores).map(([key, value]) => (
                            <li key={key}>{key}: {value}</li>
                          ))}
                        </ul>
                      </div>
                      
                    </div>
                    {/* Retake the Test Button */}
                    <div className="mt-4">
                      <button
                        onClick={async () => {
                          setAssigning(true);
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
                            const res = await api.post(`/doctors/reassign-tests?userId=${patient.id}`, {}, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (res.data && res.data.success) {
                              toast({
                                title: 'Success',
                                description: 'Test cycle reassigned successfully!',
                                variant: 'default',
                                className: 'bg-green-500 text-white',
                              });
                              // Optionally, refetch patient details here
                            } else {
                              toast({
                                title: 'Error',
                                description: res.data?.message || 'Failed to reassign test cycle.',
                                variant: 'destructive',
                              });
                            }
                          } catch (err) {
                            toast({
                              title: 'Error',
                              description: 'Failed to reassign test cycle.',
                              variant: 'destructive',
                            });
                          } finally {
                            setAssigning(false);
                          }
                        }}
                        disabled={assigning}
                        className="px-5 py-2 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white font-semibold shadow hover:opacity-90 transition disabled:opacity-60"
                      >
                        {assigning ? 'Reassigning...' : 'Retake the Test'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Assignment Section */}
      {patient.isCourseAssigned && (
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Course Assigned</h2>
          <p className="text-gray-700">A course has been assigned to this patient.</p>
        </div>
      )}
      {!patient.isCourseAssigned && (
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 mt-4">
          <button
            onClick={handleAssignCourse}
            disabled={assigning}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white font-semibold text-lg shadow hover:opacity-90 transition disabled:opacity-60"
          >
            {assigning ? 'Assigning...' : 'Assign Course'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientDetails; 