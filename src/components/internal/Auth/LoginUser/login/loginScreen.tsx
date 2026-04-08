import { Card, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import LoginForm from "./loginForm";
import BackGroundLogo from "@/assets/bgLogo.png";

const Component = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${BackGroundLogo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0" />
      <Card className="bg-white/95 backdrop-blur-sm rounded-3xl w-[439px] shadow-xl z-10 p-8">
        <div className="w-full flex flex-col items-center">
          <LoginForm />
          <CardFooter className="mt-4 font-light text-gray-700">
            Don't have an account?
            <Link to="/user/register">
              <span className="text-[#8B2D6C] ml-1 hover:text-purple-700 transition-colors">
                Create one
              </span>
            </Link>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default Component;
