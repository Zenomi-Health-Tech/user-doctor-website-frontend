import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface LottieLoaderProps {
  text?: string;
  height?: number;
}

export default function LottieLoader({ text, height = 180 }: LottieLoaderProps) {
  const [animData, setAnimData] = useState<any>(null);

  useEffect(() => {
    fetch('/meditation.json').then(r => r.json()).then(setAnimData).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] font-['Poppins']">
      {animData ? (
        <Lottie animationData={animData} loop style={{ height }} />
      ) : (
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-[#F0EBF4]" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#8B2D6C] animate-spin" />
        </div>
      )}
      {text && <p className="text-sm text-[#808080] mt-3 font-medium">{text}</p>}
    </div>
  );
}
