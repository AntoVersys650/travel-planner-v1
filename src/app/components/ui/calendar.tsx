'use client'

import React, { useState } from 'react';
import CalendarPrimitive from "src/app/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import Button from "src/app/components/ui/button"
import { cn } from "src/lib/utils"
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { it } from 'date-fns/locale';

interface CalendarProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    placeholder?: string;
}

const Calendar: React.FC<CalendarProps> = ({ date, setDate, placeholder = "Seleziona data" }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
                {/* Passa UN SOLO elemento Button come figlio */}
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: it }) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <CalendarPrimitive
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={it}
                    className="rounded-md border"
                />
            </PopoverContent>
        </Popover>
    );
};

export default Calendar;