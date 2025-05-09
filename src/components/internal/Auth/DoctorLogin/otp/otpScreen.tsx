import { useNavigate } from "react-router-dom";
import OTPForm from "./otpForm";
import { Card } from "@/components/ui/card";
import Logo from "@/assets/zenomiLogo.png";
import BackGroundLogo from "@/assets/BackgroundImage.svg";

function OTPComponent() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/doctor/register");
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 relative"
      style={{
        backgroundImage: `url(${BackGroundLogo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-purple-500/90 to-purple-800/90" />
      <Card className="bg-white/95 backdrop-blur-sm rounded-3xl w-[539px] shadow-xl z-10 p-8">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <img
            src={Logo}
            alt="Logo"
            className="w-[160px] h-[163px] mb-6"
            loading="lazy"
          />
          <OTPForm onSuccess={handleSuccess} />
        </div>
      </Card>
    </div>
  );
}

export default OTPComponent;
