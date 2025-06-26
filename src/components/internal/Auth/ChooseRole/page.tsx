import { useNavigate } from "react-router-dom";
import docLog from '@/assets/docLog.png';
import userLog from '@/assets/userLog.png';


const ChooseRole = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white font-['Poppins']">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Choose your role below</h2>
        <p className="text-gray-500">Tailor your experience based on your role.</p>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-xs">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center justify-between px-6 py-4 border-2 border-[#704180] rounded-full text-lg font-medium transition-all hover:bg-gradient-to-r hover:from-[#704180] hover:to-[#8B2D6C] hover:text-white"
        >
          Continue as User
          <img src={userLog} alt="User" className="w-12 h-12 ml-4" />
        </button>
        <button
          onClick={() => navigate("/doctor/login")}
          className="flex items-center justify-between px-6 py-4 border-2 border-[#704180] rounded-full text-lg font-medium transition-all hover:bg-gradient-to-r hover:from-[#704180] hover:to-[#8B2D6C] hover:text-white"
        >
          <img src={docLog} alt="Doctor" className="w-12 h-12 ml-4" />
          Continue as Doctor
        </button>
      </div>
      <div className="absolute bottom-8 w-full text-center text-gray-500">
        Empowering better health choices.
      </div>
    </div>
  );
};

export default ChooseRole;