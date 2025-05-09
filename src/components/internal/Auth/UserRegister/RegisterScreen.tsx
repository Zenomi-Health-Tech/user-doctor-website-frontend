import { Card } from "@/components/ui/card";
import Logo from "@/assets/registerLily.gif";
import UserRegistrationForm from "./UserRegistrationForm";
import BackGroundLogo from "@/assets/BackgroundImage.svg";

function RegisterComponent() {
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
            <div className="absolute inset-0" style={{ background: 'linear-gradient(89.79deg, #704180 5.07%, #8B2D6C 95.83%)', opacity: 0.9 }} />
            
            <div className="container mx-auto px-4 z-10">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                    {/* Left Section with Welcome Message */}
                    <div className="w-full lg:w-1/2 text-white p-8 rounded-3xl" 
                        style={{ background: 'linear-gradient(89.79deg, #704180 5.07%, #8B2D6C 95.83%)' }}>
                        <div className="flex flex-col items-center text-center">
                            <img
                                src={Logo}
                                alt="Logo"
                                className="w-[160px] h-[163px] mb-8"
                                loading="lazy"
                            />
                            <h1 className="text-4xl font-semibold mb-4">Welcome, Lily!</h1>
                            <p className="text-lg opacity-90">
                                Let's take your first step toward better mental and physical wellness.
                            </p>
                        </div>
                    </div>

                    {/* Right Section with Form */}
                    <div className="w-full lg:w-1/2">
                        <Card className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                            <div className="flex flex-col items-center">
                                <h2 className="text-2xl font-semibold mb-2">
                                    Register as <span style={{ color: '#704180' }}>User</span>
                                </h2>
                                <div className="w-full mt-6">
                                    <UserRegistrationForm />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterComponent;
