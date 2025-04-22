import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils'; // Supponiamo che tu abbia questa utility per Tailwind CSS

// Definisci i tipi per il componente Button, estendendo gli attributi HTML standard dei bottoni
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'link'; // Varianti di stile opzionali
    size?: 'default' | 'small' | 'large' | 'icon';       // Dimensioni opzionali
    className?: string;                                 // Classe CSS aggiuntiva opzionale
    asChild?: boolean;
}

// Utilizziamo forwardRef per consentire al componente di accettare un ref
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    variant = 'default',
    size = 'default',
    className,
    children,
    asChild = false,
    ...props
}, ref) => {
    // Definiamo un oggetto che mappa varianti e dimensioni a classi CSS di Tailwind CSS
    const variantClasses = {
        default: 'bg-blue-500 text-white hover:bg-blue-600',
        outline: 'border border-gray-200 hover:bg-gray-100',
        ghost: 'hover:bg-gray-100',
        link: 'text-blue-500 hover:underline',
    };

    const sizeClasses = {
        default: 'px-4 py-2',
        small: 'px-3 py-1.5 text-sm',
        large: 'px-6 py-3 text-lg',
        icon: 'p-2 rounded-full',
    };

    // Combiniamo le classi CSS di base, variante, dimensione e aggiuntive
    const baseClasses = cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.default,
        className
    );

     if (asChild) {
        const Component = props.children.type;
        return (
          <Component ref={ref} {...props.children.props} className={baseClasses} >
            {children}
          </Component>
        )
      }

    // Rendiamo un elemento <button> con le classi CSS appropriate e altri props
    return (
        <button ref={ref} className={baseClasses} {...props}>
            {children}
        </button>
    );
});
//Assegnamo un nome al componente per una migliore diagnostica negli strumenti di sviluppo
Button.displayName = 'Button';

export default Button;
