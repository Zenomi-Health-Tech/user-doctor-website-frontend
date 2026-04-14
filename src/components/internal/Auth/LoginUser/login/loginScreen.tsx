import { Card, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import LoginForm from "./loginForm";

const Component = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen relative px-4"
      style={{
        background: 'linear-gradient(135deg, #704180 0%, #8B2D6C 100%)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/5 blur-xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-white/5 blur-xl" />

      <div className="w-full max-w-[420px] z-10">
        {/* Header area */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧘</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Urbanist']">
            Welcome Back
          </h1>
          <p className="text-white/70 text-sm mt-2 font-['Urbanist']">
            Sign in with your Google account
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border-0">
          <div className="w-full flex flex-col items-center">
            <LoginForm />
            <CardFooter className="mt-4 font-light text-gray-700 text-sm">
              Don't have an account?
              <Link to="/user/register">
                <span className="text-[#8B2D6C] ml-1 hover:text-[#704180] transition-colors font-medium">
                  Create one
                </span>
              </Link>
            </CardFooter>
          </div>
        </Card>

        <p className="text-center text-white/50 text-xs mt-6 font-['Urbanist']">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Component;
