'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Column definition for data-driven tables
interface Column<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

// Support both children-based and data-driven patterns
interface TablePropsBase {
  className?: string;
}

interface TablePropsWithChildren extends TablePropsBase {
  children: React.ReactNode;
  columns?: never;
  data?: never;
}

interface TablePropsWithData<T = any> extends TablePropsBase {
  children?: never;
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

type TableProps<T = any> = TablePropsWithChildren | TablePropsWithData<T>;

export function Table<T extends Record<string, any>>({
  children,
  columns,
  data,
  className,
  emptyMessage = 'Tidak ada data',
}: TableProps<T> & { emptyMessage?: string }) {
  // Data-driven table
  if (columns && data) {
    return (
      <div className="overflow-x-auto rounded-lg border border-secondary-200">
        <table className={cn('min-w-full divide-y divide-secondary-200', className)}>
          <thead className="bg-secondary-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-6 py-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider',
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 bg-white">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-secondary-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-secondary-50 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-6 py-4 text-sm text-secondary-900',
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      )}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Children-based table
  return (
    <div className="overflow-x-auto rounded-lg border border-secondary-200">
      <table className={cn('min-w-full divide-y divide-secondary-200', className)}>
        {children}
      </table>
    </div>
  );
}

interface TableChildProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableChildProps) {
  return <thead className={cn('bg-secondary-50', className)}>{children}</thead>;
}

export function TableBody({ children, className }: TableChildProps) {
  return <tbody className={cn('divide-y divide-secondary-100 bg-white', className)}>{children}</tbody>;
}

export function TableRow({ children, className }: TableChildProps) {
  return (
    <tr className={cn('hover:bg-secondary-50 transition-colors', className)}>
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function TableHead({ children, className, align = 'left' }: TableHeadProps) {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <th
      className={cn(
        'px-6 py-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider',
        alignments[align],
        className
      )}
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
}

export function TableCell({ children, className, align = 'left', colSpan }: TableCellProps) {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td colSpan={colSpan} className={cn('px-6 py-4 text-sm text-secondary-900', alignments[align], className)}>
      {children}
    </td>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function TableEmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={100} className="px-6 py-12 text-center">
        {icon && <div className="flex justify-center mb-3 text-secondary-400">{icon}</div>}
        <h3 className="text-sm font-medium text-secondary-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-secondary-500">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </td>
    </tr>
  );
}

// DataTable - declarative table with columns/data props
interface Column<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  className,
  emptyMessage = 'Tidak ada data',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-secondary-200">
      <table className={cn('min-w-full divide-y divide-secondary-200', className)}>
        <thead className="bg-secondary-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-6 py-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider',
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-secondary-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-secondary-50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-6 py-4 text-sm text-secondary-900',
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    )}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
