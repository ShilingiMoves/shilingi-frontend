import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    to,
    href,
    onClick,
    showArrow = false,
    className = '',
    ...props
}) => {
    // Base: pill shape, DM Sans font weight
    const baseClasses = 'inline-flex items-center justify-center gap-3 font-semibold font-sans transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 hover:-translate-y-0.5';

    const variants = {
        primary: 'bg-primary-600 hover:bg-primary-500 text-white focus:ring-primary-500 shadow-sm hover:shadow-lg hover:shadow-primary-900/30',
        secondary: 'border-2 border-primary-600 text-primary-700 hover:bg-primary-50 focus:ring-primary-500',
        ghost: 'border-2 border-white/80 text-white hover:bg-white/10 hover:border-white focus:ring-white/50',
        outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-400',
    };

    const sizes = {
        sm: 'px-5 py-2.5 text-sm min-h-[40px]',
        md: 'px-6 py-3 text-base min-h-[48px]',
        lg: 'px-8 py-4 text-base min-h-[52px]',
    };

    const arrowBg = {
        primary: 'bg-white/20 group-hover:bg-white/30',
        secondary: 'bg-primary-100 group-hover:bg-primary-200',
        ghost: 'border border-white/50 group-hover:border-white',
        outline: 'bg-gray-100 group-hover:bg-gray-200',
    };

    const classes = `${baseClasses} ${variants[variant] ?? variants.primary} ${sizes[size]} group ${className}`;

    const content = (
        <>
            {children}
            {showArrow && (
                <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${arrowBg[variant] ?? arrowBg.primary}`}>
                    <ArrowRight size={13} />
                </span>
            )}
        </>
    );

    if (to) return <Link to={to} className={classes} {...props}>{content}</Link>;
    if (href) return <a href={href} className={classes} {...props}>{content}</a>;
    return <button onClick={onClick} className={classes} {...props}>{content}</button>;
};

export default Button;
