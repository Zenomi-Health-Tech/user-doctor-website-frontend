import { useNavigate } from "react-router-dom";
import OTPForm from "./otpForm";
import { Card } from "@/components/ui/card";
import BackGroundLogo from "@/assets/bgLogo.png";

function OTPComponent() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/doctor/register");
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${BackGroundLogo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0" />
      <Card className="bg-white/95 backdrop-blur-sm rounded-3xl w-[439px] shadow-xl z-10 p-8">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          {/* <img
            src={Logo}
            alt="Logo"
            className="w-[160px] h-[163px] mb-6"
            loading="lazy"
          /> */}
          <OTPForm onSuccess={handleSuccess} />
        </div>
      </Card>
    </div>
  );
}

export default OTPComponent;
