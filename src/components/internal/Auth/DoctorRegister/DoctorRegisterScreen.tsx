import { Card } from "@/components/ui/card";
import Logo from "@/assets/registerLily.gif";
import DocRegistrationForm from "./DoctorRegistrationForm";
import BackGroundLogo from "@/assets/BackgroundImage.svg";

function RegisterComponent() {
    return (
        <div
            className="flex items-center justify-center min-h-screen relative px-4 py-8"
            style={{
                backgroundImage: `url(${BackGroundLogo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="absolute inset-0" style={{ background: 'linear-gradient(89.79deg, #704180 5.07%, #8B2D6C 95.83%)', opacity: 0.9 }} />

            <div className="container mx-auto z-10 max-w-6xl px-4">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch justify-center">
                    {/* Left Section with Welcome Message */}
                    <div className="w-full lg:w-1/2 text-white p-8 lg:p-12 rounded-3xl flex flex-col justify-center items-center text-center"
                        style={{ background: 'linear-gradient(89.79deg, #704180 5.07%, #8B2D6C 95.83%)' }}>
                        <div className="flex flex-col items-center space-y-4">
                            <img
                                src={Logo}
                                alt="Welcome"
                                className="w-[120px] h-[120px] lg:w-[140px] lg:h-[140px]"
                                loading="lazy"
                            />
                            <h1 className="text-3xl lg:text-4xl font-bold">Welcome</h1>
                            <p className="text-sm lg:text-base text-white/90 leading-relaxed max-w-sm">
                                Join our network of healthcare professionals. Register to start managing patients and providing quality care.
                            </p>
                        </div>
                    </div>

                    {/* Right Section with Form */}
                    <div className="w-full lg:w-1/2">
                        <Card className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 lg:p-10 shadow-2xl h-full">
                            <div className="flex flex-col items-center h-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Register as <span style={{ color: '#704180' }}>Doctor</span>
                                </h2>
                                <p className="text-sm text-gray-500 mb-6">Create your professional account</p>
                                <div className="w-full flex-1 overflow-y-auto">
                                    <DocRegistrationForm />
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
