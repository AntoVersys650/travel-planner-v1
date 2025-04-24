// src/app/components/ui/calendar.tsx
'use client'

import React, { forwardRef, useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Button from 'src/app/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { cn } from 'src/lib/utils'

interface CalendarProps {
    date: Date | null;
    setDate: (date: Date | null) => void;
    placeholder?: string;
    minDate?: Date;
    className?: string; // Add className prop for more flexibility
}

// CustomInput forwards ref and onClick for react-datepicker
const CustomInput = forwardRef<HTMLInputElement, { value?: string; onClick?: () => void; placeholder: string }>(
    ({ value, onClick, placeholder }, ref) => (
        <Button
            variant="outline"
            ref={ref as any}
            onClick={onClick}
            className={cn(
                'w-full justify-start text-left font-normal',
                'flex items-center', // Ensure icon and text are vertically centered
                !value && 'text-muted-foreground'
            )}
        >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value || placeholder}
        </Button>
    )
);
CustomInput.displayName = 'CustomInput';

const Calendar: React.FC<CalendarProps> = ({ date, setDate, placeholder = 'Seleziona data', minDate, className }) => {
    const [inputWidth, setInputWidth] = useState<string>('100%');

    // Use useEffect to get the width of parent
    useEffect(() => {
        const updateWidth = () => {
            if (typeof window !== 'undefined') {
                const parentElement = document.querySelector('.date-input-container');
                if (parentElement) {
                    const width = parentElement.getBoundingClientRect().width;
                    setInputWidth(`${width}px`);
                } else {
                    setInputWidth('100%');
                }
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);

        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    return (
        <div className={cn("w-full", className)}>
            <DatePicker
                selected={date}
                onChange={d => setDate(d as Date)}
                dateFormat="dd/MM/yyyy"
                placeholderText={placeholder}
                minDate={minDate}
                customInput={<CustomInput placeholder={placeholder} />}
                style={{ width: inputWidth }}
            />
        </div>
    );
};

export default Calendar;