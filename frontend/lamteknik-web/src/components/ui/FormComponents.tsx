'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
}

export function FormSection({ title, subtitle, children, className, icon: Icon }: FormSectionProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-secondary-200 overflow-hidden', className)}>
      <div className="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-primary-600" />}
          <h3 className="font-semibold text-secondary-900">{title}</h3>
        </div>
        {subtitle && <p className="text-sm text-secondary-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

interface FormGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormGrid({ children, cols = 2, className }: FormGridProps) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={cn('grid gap-4', colsClass[cols], className)}>{children}</div>;
}

interface FormActionsProps {
  children?: React.ReactNode;
  className?: string;
  onCancel?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitText?: string;
  cancelText?: string;
}

export function FormActions({ 
  children, 
  className, 
  onCancel, 
  onSubmit, 
  isSubmitting, 
  submitText = 'Simpan',
  cancelText = 'Batal',
}: FormActionsProps) {
  // If children provided, render them
  if (children) {
    return (
      <div className={cn('flex items-center justify-end gap-3 pt-6 border-t border-secondary-200', className)}>
        {children}
      </div>
    );
  }

  // Otherwise render default buttons
  return (
    <div className={cn('flex items-center justify-end gap-3 pt-6 border-t border-secondary-200', className)}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-100 rounded-lg"
        >
          {cancelText}
        </button>
      )}
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
      >
        {isSubmitting ? 'Menyimpan...' : submitText}
      </button>
    </div>
  );
}

interface FieldGroupProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  helpText?: string;
  className?: string;
}

export function FieldGroup({ label, required, children, error, helpText, className }: FieldGroupProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-sm font-medium text-secondary-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {helpText && !error && <p className="text-sm text-secondary-500">{helpText}</p>}
    </div>
  );
}

interface FileUploadFieldProps {
  label: string;
  accept?: string;
  required?: boolean;
  value?: File | null;
  currentFile?: string;
  onChange: (file: File | null) => void;
  error?: string;
  helpText?: string;
}

export function FileUploadField({
  label,
  accept = '.pdf,.doc,.docx,.xlsx,.xls',
  required,
  value,
  currentFile,
  onChange,
  error,
  helpText,
}: FileUploadFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  return (
    <FieldGroup label={label} required={required} error={error} helpText={helpText}>
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="block w-full text-sm text-secondary-600
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-medium
            file:bg-primary-50 file:text-primary-700
            hover:file:bg-primary-100
            cursor-pointer"
        />
      </div>
      {currentFile && !value && (
        <p className="text-sm text-secondary-500 mt-1">
          File saat ini: <span className="font-medium">{currentFile}</span>
        </p>
      )}
      {value && (
        <p className="text-sm text-green-600 mt-1">
          File dipilih: <span className="font-medium">{value.name}</span>
        </p>
      )}
    </FieldGroup>
  );
}

interface SwitchFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function SwitchField({ label, checked, onChange, description }: SwitchFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-secondary-900">{label}</p>
        {description && <p className="text-sm text-secondary-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? 'bg-primary-600' : 'bg-secondary-200'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

interface CheckboxGroupProps {
  label: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function CheckboxGroup({ label, options, value, onChange, error }: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <FieldGroup label={label} error={error}>
      <div className="space-y-2 mt-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700">{option.label}</span>
          </label>
        ))}
      </div>
    </FieldGroup>
  );
}

interface RadioGroupProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function RadioGroup({ label, options, value, onChange, error, required }: RadioGroupProps) {
  return (
    <FieldGroup label={label} required={required} error={error}>
      <div className="space-y-2 mt-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700">{option.label}</span>
          </label>
        ))}
      </div>
    </FieldGroup>
  );
}

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  error?: string;
  helpText?: string;
}

export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required,
  error,
  helpText,
}: TextareaFieldProps) {
  return (
    <FieldGroup label={label} required={required} error={error} helpText={helpText}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'block w-full px-3 py-2 border rounded-lg text-secondary-900 placeholder-secondary-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          error ? 'border-red-300' : 'border-secondary-300'
        )}
      />
    </FieldGroup>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
  helpText,
}: SelectFieldProps) {
  return (
    <FieldGroup label={label} required={required} error={error} helpText={helpText}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'block w-full px-3 py-2 border rounded-lg text-secondary-900 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          error ? 'border-red-300' : 'border-secondary-300'
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldGroup>
  );
}
