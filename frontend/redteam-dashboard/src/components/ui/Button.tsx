import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className,
  ...props
}) => {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-cyber',
    danger: 'px-6 py-2 rounded-lg bg-red-600/20 border border-red-500 text-red-400 hover:bg-red-600/30',
  };

  return (
    <button
      className={`${variantClasses[variant]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};
