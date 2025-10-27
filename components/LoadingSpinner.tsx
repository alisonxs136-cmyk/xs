
import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
    messages: string[];
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ messages }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 3000); // Change message every 3 seconds

        return () => clearInterval(intervalId);
    }, [messages]);

    return (
        <div className="text-center p-4">
            <svg
                className="animate-spin h-12 w-12 text-green-400 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            <p className="mt-4 text-lg text-gray-300 transition-opacity duration-500">
                {messages[currentMessageIndex]}
            </p>
        </div>
    );
};

export default LoadingSpinner;
