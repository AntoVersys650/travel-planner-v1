// components/ui/dropdown-menu.tsx
import React, { forwardRef, useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button'; // Assicurati che il percorso sia corretto
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assicurati che il percorso sia corretto

// Context per la gestione dello stato del menu
const DropdownMenuContext = createContext<{ open: boolean; onOpenChange: (open: boolean) => void; } | null>(null);

// Componente Trigger
const DropdownMenuTrigger = ({ children, asChild = false }: { children: React.ReactNode; asChild?: boolean }) => {
    const context = useContext(DropdownMenuContext);
    if (!context) return <>{children}</>;

    const triggerProps = {
        onClick: () => context.onOpenChange(!context.open),
        'aria-haspopup': 'true',
        'aria-expanded': context.open,
    };

    if (asChild) {
        return React.cloneElement(React.Children.only(children) as React.ReactElement, triggerProps);
    }

    return (
        <div {...triggerProps}>
            {children}
        </div>
    );
};

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

// Componente Content
const DropdownMenuContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    animation?: any; // Puoi definire un tipo più specifico per l'animazione se necessario
    onCloseAutoFocus?: (e: Event) => void;
}>(({
    className,
    side = 'bottom',
    align = 'start',
    children,
    animation = {
        initial: { opacity: 0, y: -10, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -10, scale: 0.95 },
        transition: { duration: 0.2, ease: 'easeInOut' },
    },
    onCloseAutoFocus,
    ...props
}, ref) => {
    const context = useContext(DropdownMenuContext);
    if (!context) return null;

    const contentClass = cn(
        'absolute min-w-[12rem] bg-white border border-gray-200 rounded-md shadow-lg p-1 z-50',
        side === 'top' && 'bottom-full',
        side === 'bottom' && 'top-full',
        side === 'left' && 'right-full',
        side === 'right' && 'left-full',
        align === 'start' && 'origin-top-start',
        align === 'center' && 'origin-top',
        align === 'end' && 'origin-top-end',
        className
    );

    // Gestione della chiusura con focus
    const handleClose = useCallback((e: Event) => {
        context.onOpenChange(false);
        onCloseAutoFocus?.(e);
    }, [context, onCloseAutoFocus]);

    // Effetto per gestire la chiusura al clic fuori
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                context.onOpenChange(false);
            }
        };

        if (context.open) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [context.open, context, ref]);

    // Effetto per ripristinare il focus sull'elemento trigger
    useEffect(() => {
        if (!context.open) return;

        const triggerElement = document.querySelector('[aria-haspopup="true"]');
        const firstFocusable = ref.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

        if (firstFocusable) {
          (firstFocusable as HTMLElement).focus();
        } else if (triggerElement) {
            (triggerElement as HTMLElement).focus();
        }

    }, [context.open]);


    return (
        <AnimatePresence>
            {context.open && (
                <motion.div
                    ref={ref}
                    className={contentClass}
                    {...props}
                    initial={animation.initial}
                    animate={animation.animate}
                    exit={animation.exit}
                    transition={animation.transition}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            handleClose(e);
                        }
                    }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
});

DropdownMenuContent.displayName = 'DropdownMenuContent';

// Componente Item
const DropdownMenuItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
    onSelect?: (e: Event) => void;
    disabled?: boolean;
    isSeparator?: boolean;
    className?: string;
}>(({
    className,
    onSelect,
    disabled,
    isSeparator,
    children,
    ...props
}, ref) => {
    const context = useContext(DropdownMenuContext);
    const itemClass = cn(
        'px-4 py-2 rounded-md text-sm cursor-pointer transition-colors duration-200',
        disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100',
        isSeparator && 'border-t border-gray-200 my-1',
        className
    );

    const handleClick = (e: Event) => {
        if (!disabled && context) {
            context.onOpenChange(false);
            onSelect?.(e);
        }
    };

    if (isSeparator) {
        return <div className="border-t border-gray-200 my-1" />;
    }

    return (
        <div
            ref={ref}
            className={itemClass}
            onClick={handleClick}
            {...props}
            role="menuitem"
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
        >
            {children}
        </div>
    );
});

DropdownMenuItem.displayName = 'DropdownMenuItem';

// Componente DropdownMenu
const DropdownMenu = ({
    children,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    defaultOpen = false,
}: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
}) => {
    const [open, setOpen] = useState(defaultOpen);
    const isControlled = typeof controlledOpen !== 'undefined';

    const onOpenChange = useCallback((newOpen: boolean) => {
        if (!isControlled) {
            setOpen(newOpen);
        }
        setControlledOpen?.(newOpen);
    }, [isControlled, setControlledOpen]);

    const contextValue = {
        open: isControlled ? controlledOpen : open,
        onOpenChange,
    };

    const validChildren = React.Children.toArray(children).filter(child =>
        React.isValidElement(child) &&
        ['DropdownMenuTrigger', 'DropdownMenuContent', 'DropdownMenuItem'].includes((child as React.ReactElement).type?.displayName || '')
    );

    return (
        <DropdownMenuContext.Provider value={contextValue}>
            <div className="relative inline-block">
                {validChildren}
            </div>
        </DropdownMenuContext.Provider>
    );
};

DropdownMenu.displayName = 'DropdownMenu';

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };

