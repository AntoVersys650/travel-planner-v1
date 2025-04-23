import React, { TextareaHTMLAttributes } from 'react';
import { cn } from 'src/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}

const Textarea: React.FC<TextareaProps> = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    "min-h-[96px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-500 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
                    className
                )}
                {...props}
            />
        );
    }
);
Textarea.displayName = 'Textarea';
export default Textarea;