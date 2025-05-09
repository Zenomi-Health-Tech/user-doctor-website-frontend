import { Card, CardFooter } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import Logo from "@/assets/zenomiLogo.png";
import LoginForm from "./loginForm";
import BackGroundLogo from "@/assets/bgLogo.png";

const Component = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    console.log("OTP sent successfully!");
    navigate("/login/otp"); // Redirect to the OTP verification page
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen relative"
      style={{
        backgroundImage: `url(${BackGroundLogo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0" />
      <Card className="bg-white/95 backdrop-blur-sm rounded-3xl w-[539px] h-[500px] shadow-xl z-10">
        <div className="w-96 mt-10 mx-auto flex flex-col items-center">
          <img
            src={Logo}
            alt="logo"
            loading="lazy"
          />
          <div>
            {/* <h1 className="block font-Inter text-xl font-medium text-[#013DC0] mb-4">Login</h1> */}
            <LoginForm onSuccess={handleSuccess} />
          </div>
          <CardFooter className="mt-4 font-light text-gray-700">
            Don't have an account?
            <Link to="/doctor/register">
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




// import { Card, CardHeader } from "@/components/ui/card";
// import Logo from "@/assets/Liv PrivateLimited Transprent 1.svg";
// import BackGroundLogo from "@/assets/BackgroundImage.svg";
// import LoginForm from "./loginForm";

// const LoginComponent = () => {
//   return (
//     <div
//       className="flex items-center justify-center h-screen bg-cover bg-center"
//       style={{ backgroundImage: `url(${BackGroundLogo})` }}
//     >
//       <Card className="bg-white rounded-sm md:rounded-2xl lg:rounded-3xl dark:bg-background w-[539px] h-[564px] shadow-lg">
//         <div className="mx-auto flex flex-col items-center">
//           <img
//             src={Logo}
//             alt="logo"
//             className="w-[260px] h-[200px]"
//             loading="lazy"
//           />
//           <div className="-mt-8">
//             <CardHeader className="block font-Inter text-xl font-medium text-[#013DC0]">
//               Login
//             </CardHeader>
//             <LoginForm />
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default LoginComponent;
