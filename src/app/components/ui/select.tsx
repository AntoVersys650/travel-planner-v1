import React, { useState, forwardRef, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
    label: string;
    value: string;
    icon?: ReactNode; // Opzionale: un'icona per ogni opzione
}

interface SelectProps {
    options: SelectOption[];
    value?: string | string[]; // Permette selezione singola o multipla
    onChange?: (value: string | string[]) => void;
    placeholder?: string;
    isMultiSelect?: boolean;
    isDisabled?: boolean;
    searchable?: boolean; // Aggiunta proprietà per la ricerca
    customTrigger?: React.ReactNode; // Permette un trigger personalizzato
    className?: string;        // Aggiunta per lo stile del div principale
    triggerClassName?: string; // Aggiunta per lo stile del trigger
    contentClassName?: string; // Aggiunta per lo stile del contenuto
    itemClassName?: string;    // Aggiunta per lo stile delle opzioni
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
    ({
        options,
        value: initialValue,
        onChange,
        placeholder = 'Seleziona un\'opzione',
        isMultiSelect = false,
        isDisabled = false,
        searchable = false, // Usa la proprietà searchable
        customTrigger,
        className,
        triggerClassName,
        contentClassName,
        itemClassName,
    }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>(() => {
            if (initialValue === undefined) return [];
            if (isMultiSelect) {
                if (Array.isArray(initialValue)) {
                    return options.filter(option => initialValue.includes(option.value));
                }
                return [];
            } else {
                const found = options.find(option => option.value === initialValue);
                return found ? [found] : [];
            }
        });
        const [searchTerm, setSearchTerm] = useState(''); // Stato per il termine di ricerca

        // Aggiorna selectedOptions quando initialValue cambia
        useEffect(() => {
            if (initialValue === undefined) {
                setSelectedOptions([]);
                return;
            }

            if (isMultiSelect) {
                if (Array.isArray(initialValue)) {
                    setSelectedOptions(options.filter(option => initialValue.includes(option.value)));
                } else {
                    setSelectedOptions([]);
                }
            } else {
                const found = options.find(option => option.value === initialValue);
                setSelectedOptions(found ? [found] : []);
            }
        }, [initialValue, isMultiSelect, options]);

        const handleOptionClick = (option: SelectOption) => {
            if (isDisabled) return;

            if (isMultiSelect) {
                const isSelected = selectedOptions.some(selected => selected.value === option.value);
                let newValue: SelectOption[];
                if (isSelected) {
                    newValue = selectedOptions.filter(selected => selected.value !== option.value);
                } else {
                    newValue = [...selectedOptions, option];
                }
                setSelectedOptions(newValue);
                onChange?.(newValue.map(opt => opt.value));
            } else {
                setSelectedOptions([option]);
                onChange?.(option.value);
                setIsOpen(false); // Chiude il dropdown alla selezione singola
            }
        };

        const clearSelection = () => {
            setSelectedOptions([]);
            onChange?.(isMultiSelect ? [] : '');
        };

        const triggerText = () => {
            if (customTrigger) return customTrigger; // Usa il trigger personalizzato se fornito

            if (selectedOptions.length === 0) {
                return placeholder;
            } else if (isMultiSelect) {
                return selectedOptions.map(option => option.label).join(', ');
            } else {
                return selectedOptions[0].label;
            }
        };

        // Filtra le opzioni in base al termine di ricerca
        const filteredOptions = searchable
            ? options.filter(option =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : options;

        return (
            <div ref={ref} className={cn("relative w-full", className)} onClick={() => !isDisabled && setIsOpen(!isOpen)}>
                {/* Trigger */}
                <div
                    className={cn(
                        'flex items-center justify-between w-full px-4 py-2 rounded-md cursor-pointer transition-colors duration-200',
                        'border border-gray-300 shadow-sm',
                        isOpen ? 'ring-2 ring-blue-500 ring-opacity-50' : 'hover:border-blue-500',
                        isDisabled && 'opacity-50 cursor-not-allowed',
                        'bg-white', // Aggiunto per migliore visibilità
                        triggerClassName
                    )}
                >
                    <span className={cn(
                        "truncate",
                        selectedOptions.length === 0 && "text-gray-500"
                    )}>
                        {triggerText()}
                    </span>
                    {selectedOptions.length > 0 && !isMultiSelect && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Impedisce l'apertura del dropdown
                                clearSelection();
                            }}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                            title="Clear selection"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <ChevronDown
                        className={cn(
                            'w-5 h-5 transition-transform duration-300',
                            isOpen && 'rotate-180'
                        )}
                    />
                </div>

                {/* Contenuto del Dropdown */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.ul
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={cn(
                                "absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto",
                                contentClassName
                            )}
                        >
                            {searchable && (
                                <div className="p-2 sticky top-0 bg-white z-10">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Cerca..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 pr-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}
                            {filteredOptions.length === 0 && (
                                <li className="px-4 py-2 text-gray-500">Nessuna opzione trovata</li>
                            )}
                            {filteredOptions.map((option) => (
                                <li
                                    key={option.value}
                                    onClick={() => handleOptionClick(option)}
                                    className={cn(
                                        'flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100',
                                        selectedOptions.some(selected => selected.value === option.value) && 'bg-blue-100 text-blue-800',
                                        itemClassName
                                    )}
                                >
                                    {option.icon && <span className="mr-2">{option.icon}</span>}
                                    {isMultiSelect && (
                                        <span className="mr-2">
                                            {selectedOptions.some(selected => selected.value === option.value) ? (
                                                <Check className="w-4 h-4 text-blue-600" />
                                            ) : (
                                                <></>
                                            )}
                                        </span>
                                    )}
                                    {option.label}
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);
Select.displayName = 'Select';

const SelectTrigger = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("relative", className)} {...props}>
        {children}
    </div>
);
const SelectValue = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <span className={cn("truncate", className)} {...props}>
        {children}
    </span>
);

const SelectContent = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto", className)} {...props}>
        {children}
    </div>
);
const SelectItem = ({ children, value, className, ...props }: { children: React.ReactNode; value: string; className?: string }) => (
    <div className={cn('flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100', className)} data-value={value} {...props}>
        {children}
    </div>
);

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
