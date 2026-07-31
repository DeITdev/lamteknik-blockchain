'use client';

import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

export function Form({
  className,
  children,
  ...props
}: FormProps) {
  return (
    <form className={clsx('space-y-6', className)} {...props}>
      {children}
    </form>
  );
}

interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export function FormGroup({ children, className }: FormGroupProps) {
  return <div className={clsx('space-y-2', className)}>{children}</div>;
}

interface FormLabelProps {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export function FormLabel({
  htmlFor,
  children,
  required = false,
  className,
}: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        'block text-sm font-medium text-gray-700',
        className
      )}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export function FormInput({
  error,
  helperText,
  fullWidth = true,
  className,
  disabled,
  ...props
}: FormInputProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <input
        className={clsx(
          'w-full px-4 py-2 border rounded-lg transition-colors',
          'text-gray-900 placeholder-gray-500',
          disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        disabled={disabled}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export function FormTextarea({
  error,
  helperText,
  fullWidth = true,
  className,
  disabled,
  ...props
}: FormTextareaProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <textarea
        className={clsx(
          'w-full px-4 py-2 border rounded-lg transition-colors',
          'text-gray-900 placeholder-gray-500 resize-none',
          disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        disabled={disabled}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string | number; label: string }>;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  placeholder?: string;
}

export function FormSelect({
  options,
  error,
  helperText,
  fullWidth = true,
  className,
  placeholder,
  disabled,
  ...props
}: FormSelectProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <select
        className={clsx(
          'w-full px-4 py-2 border rounded-lg transition-colors',
          'text-gray-900 bg-white',
          disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

interface FormCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormCheckbox({
  label,
  error,
  className,
  disabled,
  ...props
}: FormCheckboxProps) {
  return (
    <div>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={clsx(
            'w-4 h-4 rounded border-gray-300 transition-colors',
            disabled
              ? 'bg-gray-100 cursor-not-allowed'
              : 'cursor-pointer text-blue-600 focus:ring-blue-500',
            error && 'border-red-500',
            className
          )}
          disabled={disabled}
          {...props}
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface FormRadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  disabled?: boolean;
}

export function FormRadioGroup({
  name,
  value,
  onChange,
  options,
  error,
  disabled,
}: FormRadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            className={clsx(
              'w-4 h-4 text-blue-600 border-gray-300 transition-colors',
              disabled
                ? 'cursor-not-allowed'
                : 'cursor-pointer focus:ring-blue-500',
              error && 'border-red-500'
            )}
            disabled={disabled}
          />
          <span className="text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface FormErrorProps {
  message: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  return (
    <div
      className={clsx(
        'p-4 bg-red-50 border border-red-200 rounded-lg',
        className
      )}
    >
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}

interface FormSuccessProps {
  message: string;
  className?: string;
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  return (
    <div
      className={clsx(
        'p-4 bg-green-50 border border-green-200 rounded-lg',
        className
      )}
    >
      <p className="text-sm text-green-700">{message}</p>
    </div>
  );
}

interface FormSubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export function FormSubmitButton({
  loading = false,
  disabled = false,
  children,
  className,
  ...props
}: FormSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={clsx(
        'w-full px-4 py-2.5 font-medium text-white rounded-lg transition-colors',
        loading || disabled
          ? 'bg-blue-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block animate-spin">⟳</span>
          Memproses...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

interface FormActionsProps {
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function FormActions({
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
  cancelLabel = 'Batal',
  isLoading = false,
  isDisabled = false,
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || isDisabled}
        className={clsx(
          'px-4 py-2.5 font-medium text-white rounded-lg transition-colors',
          isLoading || isDisabled
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        )}
      >
        {isLoading ? 'Memproses...' : submitLabel}
      </button>
    </div>
  );
}
