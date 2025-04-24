'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useId } from 'react';
import { Button } from "src/app/components/ui/button"
import { cn } from "src/app/lib/utils"

interface PopoverProps {
    children: React.ReactNode;
    content: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    alignOffset?: number;
}

const Popover: React.FC<PopoverProps> = ({
    children,
    content,
    isOpen: controlledIsOpen,
    onOpenChange: setControlledIsOpen,
    align = 'center',
    side = 'bottom',
    sideOffset = 8,
    alignOffset = 0,
}) => {
    const [isInternalOpen, setIsInternalOpen] = useState(false);
    const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const isOpen = controlledIsOpen ?? isInternalOpen;
    const setIsOpen = setControlledIsOpen ?? setIsInternalOpen;
    const popoverId = useId();

    // Create portal
    useEffect(() => {
        const element = document.createElement('div');
        element.id = `popover-root-${popoverId}`;
        document.body.appendChild(element);
        setPortalElement(element);
        return () => {
            document.body.removeChild(element);
        };
    }, [popoverId]);

    // Handle outside clicks
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                isOpen &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node) &&
                contentRef.current &&
                !contentRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen, setIsOpen]);

    // Function to calculate position
    const calculatePosition = useCallback(() => {
        if (!triggerRef.current || !contentRef.current) {
            return { x: 0, y: 0, transformOrigin: '0 0' };
        }

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();

        let x = 0;
        let y = 0;
        let transformOrigin = '0 0';

        switch (side) {
            case 'top':
                y = triggerRect.top - contentRect.height - sideOffset;
                switch (align) {
                    case 'start':
                        x = triggerRect.left + alignOffset;
                        transformOrigin = 'top left';
                        break;
                    case 'center':
                        x = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2) + alignOffset;
                        transformOrigin = 'top center';
                        break;
                    case 'end':
                        x = triggerRect.right - contentRect.width - alignOffset;
                        transformOrigin = 'top right';
                        break;
                }
                break;
            case 'bottom':
                y = triggerRect.bottom + sideOffset;
                switch (align) {
                    case 'start':
                        x = triggerRect.left + alignOffset;
                        transformOrigin = 'bottom left';
                        break;
                    case 'center':
                        x = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2) + alignOffset;
                        transformOrigin = 'bottom center';
                        break;
                    case 'end':
                        x = triggerRect.right - contentRect.width - alignOffset;
                        transformOrigin = 'bottom right';
                        break;
                }
                break;
            case 'left':
                x = triggerRect.left - contentRect.width - sideOffset;
                switch (align) {
                    case 'start':
                        y = triggerRect.top + alignOffset;
                        transformOrigin = 'left top';
                        break;
                    case 'center':
                        y = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2) + alignOffset;
                        transformOrigin = 'left center';
                        break;
                    case 'end':
                        y = triggerRect.bottom - contentRect.height - alignOffset;
                        transformOrigin = 'left bottom';
                        break;
                }
                break;
            case 'right':
                x = triggerRect.right + sideOffset;
                switch (align) {
                    case 'start':
                        y = triggerRect.top + alignOffset;
                        transformOrigin = 'right top';
                        break;
                    case 'center':
                        y = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2) + alignOffset;
                        transformOrigin = 'right center';
                        break;
                    case 'end':
                        y = triggerRect.bottom - contentRect.height - alignOffset;
                        transformOrigin = 'right bottom';
                        break;
                }
                break;
        }
        return { x, y, transformOrigin };
    }, [align, side, sideOffset, alignOffset, isOpen]);

    // Apply position
    useEffect(() => {
        if (isOpen && contentRef.current) {
            const { x, y, transformOrigin } = calculatePosition();
            contentRef.current.style.left = `${x}px`;
            contentRef.current.style.top = `${y}px`;
            contentRef.current.style.transformOrigin = transformOrigin;
        }
    }, [isOpen, calculatePosition]);

    const toggleOpen = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen, setIsOpen]);

    if (!portalElement) return null;

    return (
        <>
            <div ref={triggerRef} onClick={toggleOpen} display="inline-block">
                {children}
            </div>
            {isOpen &&
                createPortal(
                    <AnimatePresence>
                        <motion.div
                            ref={contentRef}
                            style={{
                                position: 'fixed',
                                zIndex: 2000, // Increased z-index to be on top
                            }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: 'easeInOut' }}
                            className="bg-white border rounded-md shadow-lg p-2 min-w-[100px]"
                        >
                            {content}
                        </motion.div>
                    </AnimatePresence>
                    , portalElement
                )}
        </>
    );
};

export default Popover;