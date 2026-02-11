import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    to,
    href,
    onClick,
    className = '',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500 shadow-sm hover:shadow-md',
        secondary: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };

    const sizes = {
        sm: 'px-4 py-2.5 text-sm min-h-[44px] touch-manipulation',
        md: 'px-5 sm:px-6 py-3 text-base min-h-[48px] touch-manipulation',
        lg: 'px-6 sm:px-8 py-3.5 sm:py-4 text-lg min-h-[52px] touch-manipulation',
    };

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

    if (to) {
        return (
            <Link to={to} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    if (href) {
        return (
            <a href={href} className={classes} {...props}>
                {children}
            </a>
        );
    }

    return (
        <button onClick={onClick} className={classes} {...props}>
            {children}
        </button>
    );
};

export default Button;
