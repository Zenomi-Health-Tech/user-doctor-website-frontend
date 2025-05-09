import React, { useCallback } from 'react';
import { useCountdown } from '@/hooks/CountdownTimer';

// Define props interface for CountdownTimer component
interface CountdownTimerProps {
    initialCountdown: number;
    onResend: () => void;
}

// CountdownTimer component
const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialCountdown, onResend }) => {
    const { countdown, resendDisabled, resetCountdown } = useCountdown(initialCountdown); // Use custom hook for countdown logic

    // Handle click on resend button
    const handleResendClick = useCallback(() => {
        if (!resendDisabled) { // If resend button is enabled
            onResend(); // Call parent component's resend function
            resetCountdown(); // Reset countdown to start again
        }
    }, [resendDisabled, onResend, resetCountdown]); // Add dependencies for useCallback

    // Render countdown timer UI
    return (
        <p
            className={`flex items-end justify-end lg:text-sm text-muted-foreground md:pr-40 lg:pr-2 p-1 ${!resendDisabled ? 'cursor-pointer text-blue-500' : ''}`}
            onClick={handleResendClick}
        >
            {resendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
        </p>
    );
};

export default CountdownTimer; // Export CountdownTimer component as default
