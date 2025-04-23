import React, { InputHTMLAttributes } from 'react';
import { cn } from 'src/lib/utils'; // Assuming you have this utility

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
    return (
        <input
            type="text" // Default type is text, but you can override it
            className={cn(
                "w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                className
            )}
            {...props}
        />
    );
};

export default Input;