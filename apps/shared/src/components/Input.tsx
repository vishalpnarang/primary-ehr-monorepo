import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  monospace?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
  id?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  required,
  leftIcon,
  rightIcon,
  monospace,
  inputSize = 'md',
  id: externalId,
  className,
  disabled,
  ...props
}) => {
  const generatedId = React.useId();
  const id = externalId ?? generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);

  const sizeClasses: Record<string, string> = {
    sm: 'h-8 text-xs px-2.5',
    md: 'h-9 text-sm px-3',
    lg: 'h-11 text-base px-3.5',
  };

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-gray-700">
          {label}
          {required && (
            <span className="text-red-500 ml-0.5" aria-hidden="true"> *</span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-gray-400 pointer-events-none" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <input
          id={id}
          disabled={disabled}
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={
            [error ? errorId : null, helperText ? helperId : null].filter(Boolean).join(' ') || undefined
          }
          className={cn(
            'w-full rounded-md border bg-white transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
            hasError
              ? 'border-red-400 focus-visible:ring-red-400'
              : 'border-gray-300 focus-visible:ring-blue-500',
            disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            monospace && 'font-mono tracking-tight',
            sizeClasses[inputSize],
            className
          )}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 text-gray-400 pointer-events-none" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>

      {helperText && !error && (
        <p id={helperId} className="text-xs text-gray-500">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
