import { useEffect, useState } from "react";
import api from "@/utils/api";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Import useAuth from the new context
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

const TERMS_AND_CONDITIONS = `Zenomi Health - Terms and Conditions\n\nEffective Date: June 1st, 2025\n\nThese Terms and Conditions ("Terms") govern your use of the Zenomi Health website and mobile application (collectively, the "Service") provided by Zenomi Health ("we," "our," or "us"). By using the Service, you agree to these Terms. If you do not agree, please do not use the Service.\n\n1. Use of Service\nYou must be at least 18 years old (India) or 13 years old (USA) to use the Service. You are responsible for any activity that occurs under your account.\n\n2. Acceptable Use\nBy using the Service, you agree not to:\n- Copy, modify, or reverse-engineer any part of the Service;\n- Use the Service for illegal or harmful purposes;\n- Upload harmful or unlawful content;\n- Violate the rights of others, including privacy or intellectual property rights.\n\n3. Intellectual Property\nAll content in the Service is the property of Zenomi Health or its licensors and is protected by copyright and other laws. You may use the content only for your personal, non-commercial use.\n\n4. Data Handling and Security\nWe do not sell or share your data with third parties. All data you provide is encrypted and stored securely in compliance with applicable privacy laws. See our Privacy Policy for more details.\n\n5. User-Generated Content\nYou retain ownership of content you upload. By submitting content, you grant Zenomi Health a worldwide, non-exclusive license to use it in connection with the Service.\n\n6. Termination\nWe may suspend or terminate your account if you violate these Terms. You may also delete your account at any time.\n\n7. Disclaimer of Warranties\nThe Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee the Service will always be secure or error-free.\n\n8. Limitation of Liability\nTo the fullest extent permitted by law, Zenomi Health will not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.\n\n9. Governing Law\nUSA Users: Governed by the laws of the United States and the state of incorporation.\nIndia Users: Governed by the laws of India, with disputes subject to the courts of Ntew Delhi.\n\n10. Changes to Terms\nWe may update these Terms from time to time. Continued use of the Service after changes means you accept the revised Terms.\n\n11. Contact Us\nFor questions about these Terms, contact us at: support@zenomihealth.com`;
const PRIVACY_POLICY = `Zenomi Health - Privacy Policy\n\nEffective Date: June 1st, 2025\n\nAt Zenomi Health, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our website and mobile application (together, the "Service").\n\n1. Information We Collect\nWe may collect the following types of information:\nPersonal Information (e.g., name, email address) provided during account creation or contact with support.\nHealth and Wellness Information submitted by you for use within the Service.\nUsage Data such as app interactions, session length, and device details (used solely for internal improvement).\nWe do not collect or share your data with third parties. Your data is securely stored and encrypted in compliance with applicable laws.\n\n2. How We Use Your Information\nWe use your information to:\n- Provide and personalize our services;\n- Respond to support inquiries;\n- Improve app functionality and user experience;\n- Ensure security and integrity of our systems.\n\n3. Data Security\nWe employ industry-standard encryption and secure storage methods to protect your personal and health data. Access is strictly limited to authorized personnel only.\n\n4. No Third-Party Sharing\nWe do not share, sell, or rent your data to third parties. We do not use advertising or analytics services that access your personal data.\n\n5. Your Rights\nDepending on your jurisdiction:\nUSA (CCPA/other): You may request access to, correction of, or deletion of your data.\nIndia (DPDP Act 2023): You have the right to access, update, correct, or withdraw consent for data use.\nTo make a request, contact: privacy@zenomihealth.com\n\n6. Data Retention\nWe retain personal and health data only as long as necessary for your use of the Service, or as required by law. You may request deletion of your data at any time.\n\n7. International Users\nYour data may be stored in secure servers located in the United States. By using our Service, you consent to such transfer and storage in accordance with this policy.\n\n8. Children’s Privacy\nOur services are not directed to individuals under the age of 13 (USA) or under 18 (India). We do not knowingly collect data from minors.\n\n9. Changes to This Policy\nWe may update this policy from time to time. When we do, we will revise the "Effective Date" and notify users through the app or website.\n\n10. Contact Us\nFor any questions or concerns about your privacy, contact us at: privacy@zenomihealth.com`;

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
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const authCookie = Cookies.get("auth");
      let token = "";
      if (authCookie) {
        try {
          token = JSON.parse(authCookie).token;
        } catch (e) {
          token = "";
        }
      }

      if (isDoctor) {
        const response = await api.get("/doctors/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctorForm(response.data.data);
      } else {
        const response = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (
          response.data.data.dob &&
          typeof response.data.data.dob === "string"
        ) {
          response.data.data.dob = response.data.data.dob.split("T")[0];
        }
        setUserForm(response.data.data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Cookies.remove("auth");
    navigate("/chooserole");
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);

  const handleDoctorChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDoctorForm(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as DoctorProfile)
    );
  };

  const handleDoctorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setDoctorForm(
        (prev) =>
          ({
            ...prev,
            [name]: files[0],
          } as DoctorProfile)
      );
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
          if (key === "dob") {
            if (typeof value === "string") {
              formData.append("dob", value.split("T")[0]);
            } else if (value instanceof Date) {
              formData.append("dob", value.toISOString().split("T")[0]);
            } else {
              formData.append("dob", "");
            }
          } else {
            formData.append(key, value as string);
          }
        }
      });
      const res = await api.put("/doctors/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data && res.data.success) {
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

  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserForm((prev) => (prev ? { ...prev, [name]: value } : prev));
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
        if (key === "dob") return;
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });
      const authCookie = Cookies.get("auth");
      let token = "";
      if (authCookie) {
        try {
          token = JSON.parse(authCookie).token;
        } catch (e) {
          token = "";
        }
      }
      const res = await api.put("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
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
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2"
                >
                  <circle cx="10" cy="10" r="8" />
                </svg>
                Personal Information
              </button>
              <button
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition"
                onClick={() => setShowAbout(true)}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2"
                >
                  <circle cx="10" cy="10" r="8" />
                </svg>
                About Us
              </button>
              <button
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition"
                onClick={() => setShowTerms(true)}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2"
                >
                  <circle cx="10" cy="10" r="8" />
                </svg>
                Terms & Conditions
              </button>
              <button
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition"
                onClick={() => setShowPlans(true)}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2"
                >
                  <circle cx="10" cy="10" r="8" />
                </svg>
                My plans
              </button>
              <button
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition"
                onClick={() => setShowPrivacy(true)}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2"
                >
                  <circle cx="10" cy="10" r="8" />
                </svg>
                Privacy Policy
              </button>
              {/* <button
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition"
                onClick={() => setShowReport(true)}
              >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
              Report an issue
              </button> */}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 mt-8 text-[#E11D48] font-medium hover:underline"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className=""
              >
                <path d="M15 12l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
              Logout
            </button>
          </aside>
          {/* Main Card */}
          <main className="flex-1 flex flex-col items-center justify-center py-12 px-8">
            <div className="flex flex-col items-center mb-8">
              {doctor.profilePicture ? (
                <img
                  src={
                    typeof doctor.profilePicture === "string"
                      ? doctor.profilePicture
                      : URL.createObjectURL(doctor.profilePicture)
                  }
                  alt={doctor.name}
                  className="w-20 h-20 rounded-full object-cover bg-[#F8F2F9] mb-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] flex items-center justify-center text-white text-3xl font-bold mb-2">
                  {doctor.name.charAt(0)}
                </div>
              )}
              <div className="text-2xl font-bold text-[#1A2343] mt-2">
                Dr.{doctor.name}
              </div>
              <div className="text-gray-500 text-base">
                {doctor.countryCode} {doctor.phoneNumber}
              </div>
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
                    value={
                      doctor.createdAt ? doctor.createdAt.split("T")[0] : ""
                    }
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
                    style={{
                      background:
                        "linear-gradient(89.79deg, #704180 5.07%, #8B2D6C 95.83%)",
                    }}
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
        {/* Terms Modal */}
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-lg relative overflow-y-auto max-h-[80vh]">
              <button
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
                onClick={() => setShowTerms(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Zenomi Health - Terms and Conditions
              </h2>
              <pre className="whitespace-pre-wrap text-gray-700 text-sm max-h-[60vh] overflow-y-auto">
                {TERMS_AND_CONDITIONS}
              </pre>
            </div>
          </div>
        )}
        {/* Privacy Policy Modal */}
        {showPrivacy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-lg relative overflow-y-auto max-h-[80vh]">
              <button
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
                onClick={() => setShowPrivacy(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Zenomi Health - Privacy Policy
              </h2>
              <pre className="whitespace-pre-wrap text-gray-700 text-sm max-h-[60vh] overflow-y-auto">
                {PRIVACY_POLICY}
              </pre>
            </div>
          </div>
        )}
        {/* About Us Modal */}
        {showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-lg relative overflow-y-auto max-h-[80vh]">
              <button
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
                onClick={() => setShowAbout(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center font-['Poppins']">About Us</h2>
              <div className="text-gray-700 text-base max-h-[60vh] overflow-y-auto whitespace-pre-line font-['Poppins']">
                {`
We empower young minds by combining neuroscience-informed assessments with personalized wellness strategies. Our platform evaluates key domains—emotional regulation, nutrition, and sleep—using validated tools to understand each individual's unique profile.

Based on these insights, we craft tailored plans that support cognitive performance, emotional resilience, and overall mental well-being. By addressing foundational pillars of youth development, we help them to build habits that enhance focus, mood stability, and long-term brain health.

01.
How does Zenomi Health help you?
At Zenomi, our mission is to equip young minds with the tools they need to thrive—emotionally, cognitively, and socially. We offer systematic assessments that inform evidence-based recommendations and personalized content that enable emotional regulation, resilience, focus, and self-awareness. By nurturing these foundational skills, we aim to transform mental wellness into a lifelong strength. Our commitment is to help individuals excel in school, flourish in their careers, and form deeper, healthier relationships. Zenomi is paving the way for a generation empowered to lead lives of purpose, balance, and lasting well-being.

02.
Assessments
At Zenomi Health, we provide structured assessments that evaluate key aspects of a student's overall well-being, including sleep patterns, nutritional habits, and emotional resilience. These assessments are thoughtfully designed to capture a holistic view of a young individual's mental and physical wellness. By identifying areas of strength and concern, our platform enables early support, informed guidance, and personalized course recommendations tailored to each student's unique needs. This approach empowers students to better understand themselves and take proactive steps toward healthier habits, improved focus, and long-term emotional stability—both in and outside the classroom.

03.
AI Recommendations
Zenomi Health uses AI-driven insights to translate assessment results into personalized learning pathways. Based on each student's scores across domains like sleep, nutrition, and emotional wellness, our system recommends targeted courses and modules designed to address their specific needs. This intelligent matching ensures that students receive support that is timely, relevant, and impactful—helping them build healthier habits, improve self-regulation, and strengthen their overall well-being. By aligning evidence-based content with individual profiles, Zenomi creates a truly customized wellness journey for every learner.

04.
Workshops
Zenomi Health also partners with schools and healthcare institutions to offer specialized workshops. For educators, our training focuses on understanding student behavior through the lens of mental wellness—equipping teachers with practical tools to support emotional development, manage classroom stress, and foster positive student-teacher relationships. For clinicians, our workshops emphasize developmentally informed, compassionate approaches to working with young patients, integrating mental health best practices into everyday care. These programs aim to equip teachers and clinicians with practical tools to better understand and support young individuals. They strengthen the network of care by aligning efforts across schools, families, and healthcare providers. This creates safe, supportive environments where children and adolescents can grow emotionally, mentally, and socially.
        `}
              </div>
            </div>
          </div>
        )}
        {/* My Plans Modal */}
        {showPlans && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-lg relative overflow-y-auto max-h-[80vh]">
              <button
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
                onClick={() => setShowPlans(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">My Plans</h2>
              <div className="text-gray-700 text-base max-h-[60vh] overflow-y-auto">
                <p>
                  Coming soon: View and manage your Zenomi Health subscription
                  plans here.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Report an Issue Modal */}
        {showReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-lg relative overflow-y-auto max-h-[80vh]">
              <button
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
                onClick={() => setShowReport(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Report an Issue
              </h2>
              <div className="text-gray-700 text-base max-h-[60vh] overflow-y-auto">
                <p>
                  If you encounter any issues or have feedback, please contact
                  us at{" "}
                  <a
                    href="mailto:support@zenomihealth.com"
                    className="text-[#8B2D6C] underline"
                  >
                    support@zenomihealth.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } else if (!isDoctor) {
    const user = userForm as UserProfile;
    return (
      <div className="min-h-screen flex flex-col md:flex-row items-center md:items-start justify-center font-['Poppins'] p-2 sm:p-4">
        <div className="w-full max-w-5xl min-h-[80vh] bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden border border-[#F2EAF6]">
          {/* Sidebar */}
          <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-[#F2EAF6] flex flex-row md:flex-col py-4 md:py-8 px-4 md:px-6 gap-2 md:gap-0 overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal max-w-full min-w-0">
            <div className="text-lg md:text-xl font-semibold mb-4 md:mb-8 w-full">
              My profile
            </div>
            <nav className="flex-1 flex flex-row md:flex-col gap-2 w-full overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal">
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#F8F2F9] text-[#8B2D6C] font-medium border-l-4 border-[#8B2D6C]">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2"
                >
                  <circle cx="10" cy="10" r="8" />
                </svg>
                Personal Information
              </button>
              <button
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition"
                onClick={() => setShowAbout(true)}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2"
                >
                  <circle cx="10" cy="10" r="8" />
                </svg>
                About Us
              </button>
              <button
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition"
                onClick={() => setShowTerms(true)}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2"
                >
                  <circle cx="10" cy="10" r="8" />
                </svg>
                Terms & Conditions
              </button>
              {/* <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
              My plans
              </button> */}
              <button
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition"
                onClick={() => setShowPrivacy(true)}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2"
                >
                  <circle cx="10" cy="10" r="8" />
                </svg>
                Privacy Policy
              </button>
              {/* <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#F8F2F9] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="10" cy="10" r="8" /></svg>
              Report an issue
              </button> */}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 mt-4 md:mt-8 text-[#E11D48] font-medium hover:underline"
            >
              <LogOut />
              Logout
            </button>
          </aside>
          {/* Main Card */}
          <main className="flex-1 flex flex-col items-center justify-center py-6 sm:py-10 md:py-12 px-2 sm:px-4 md:px-8">
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              {user.profilePicture ? (
                <img
                  src={
                    typeof user.profilePicture === "string"
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
              <div className="text-lg sm:text-2xl font-bold text-[#1A2343]">
                {user.name}
              </div>
              <div className="text-gray-500 text-sm sm:text-base">
                {user.countryCode} {user.phoneNumber}
              </div>
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
        {/* Terms Modal */}
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-lg relative overflow-y-auto max-h-[80vh]">
              <button
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
                onClick={() => setShowTerms(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Zenomi Health - Terms and Conditions
              </h2>
              <pre className="whitespace-pre-wrap text-gray-700 text-sm max-h-[60vh] overflow-y-auto">
                {TERMS_AND_CONDITIONS}
              </pre>
            </div>
          </div>
        )}
          {showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-lg relative overflow-y-auto max-h-[80vh]">
              <button
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
                onClick={() => setShowAbout(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center font-['Poppins']">About Us</h2>
              <div className="text-gray-700 text-base max-h-[60vh] overflow-y-auto whitespace-pre-line font-['Poppins']">
                {`
We empower young minds by combining neuroscience-informed assessments with personalized wellness strategies. Our platform evaluates key domains—emotional regulation, nutrition, and sleep—using validated tools to understand each individual's unique profile.

Based on these insights, we craft tailored plans that support cognitive performance, emotional resilience, and overall mental well-being. By addressing foundational pillars of youth development, we help them to build habits that enhance focus, mood stability, and long-term brain health.

01.
How does Zenomi Health help you?
At Zenomi, our mission is to equip young minds with the tools they need to thrive—emotionally, cognitively, and socially. We offer systematic assessments that inform evidence-based recommendations and personalized content that enable emotional regulation, resilience, focus, and self-awareness. By nurturing these foundational skills, we aim to transform mental wellness into a lifelong strength. Our commitment is to help individuals excel in school, flourish in their careers, and form deeper, healthier relationships. Zenomi is paving the way for a generation empowered to lead lives of purpose, balance, and lasting well-being.

02.
Assessments
At Zenomi Health, we provide structured assessments that evaluate key aspects of a student's overall well-being, including sleep patterns, nutritional habits, and emotional resilience. These assessments are thoughtfully designed to capture a holistic view of a young individual's mental and physical wellness. By identifying areas of strength and concern, our platform enables early support, informed guidance, and personalized course recommendations tailored to each student's unique needs. This approach empowers students to better understand themselves and take proactive steps toward healthier habits, improved focus, and long-term emotional stability—both in and outside the classroom.

03.
AI Recommendations
Zenomi Health uses AI-driven insights to translate assessment results into personalized learning pathways. Based on each student's scores across domains like sleep, nutrition, and emotional wellness, our system recommends targeted courses and modules designed to address their specific needs. This intelligent matching ensures that students receive support that is timely, relevant, and impactful—helping them build healthier habits, improve self-regulation, and strengthen their overall well-being. By aligning evidence-based content with individual profiles, Zenomi creates a truly customized wellness journey for every learner.

04.
Workshops
Zenomi Health also partners with schools and healthcare institutions to offer specialized workshops. For educators, our training focuses on understanding student behavior through the lens of mental wellness—equipping teachers with practical tools to support emotional development, manage classroom stress, and foster positive student-teacher relationships. For clinicians, our workshops emphasize developmentally informed, compassionate approaches to working with young patients, integrating mental health best practices into everyday care. These programs aim to equip teachers and clinicians with practical tools to better understand and support young individuals. They strengthen the network of care by aligning efforts across schools, families, and healthcare providers. This creates safe, supportive environments where children and adolescents can grow emotionally, mentally, and socially.
        `}
              </div>
            </div>
          </div>
        )}
        {/* Privacy Policy Modal */}
        {showPrivacy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-lg relative overflow-y-auto max-h-[80vh]">
              <button
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
                onClick={() => setShowPrivacy(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Zenomi Health - Privacy Policy
              </h2>
              <pre className="whitespace-pre-wrap text-gray-700 text-sm max-h-[60vh] overflow-y-auto">
                {PRIVACY_POLICY}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  }
}
