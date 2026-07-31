'use client';

import { useState, useEffect, useCallback } from 'react';
import { AxiosResponse } from 'axios';

// Generic API state
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Hook for fetching data with loading and error states
export function useApi<T>(
  fetchFn: () => Promise<AxiosResponse<T>>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchFn();
      setState({ data: response.data, loading: false, error: null });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Terjadi kesalahan';
      setState({ data: null, loading: false, error: message });
    }
  }, [fetchFn]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { ...state, refetch };
}

// Hook for CRUD operations with optimistic updates
export function useCrud<T extends { id: number | string }>(
  api: {
    getAll: (params?: Record<string, any>) => Promise<AxiosResponse<T[]>>;
    create: (data: Partial<T>) => Promise<AxiosResponse<T>>;
    update: (id: number | string, data: Partial<T>) => Promise<AxiosResponse<T>>;
    delete: (id: number | string) => Promise<AxiosResponse<void>>;
  },
  initialParams?: Record<string, any>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async (params?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAll(params || initialParams);
      // Backend list endpoints are inconsistent: some return a bare array,
      // others a paginated `{ data: [...] }`, and a few an informational object
      // (e.g. GET /dokumen). Coerce to an array so consumers can safely `.map`.
      const payload: any = response.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
      setData(list);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [api, initialParams]);

  const create = useCallback(async (newData: Partial<T>): Promise<T | null> => {
    setSaving(true);
    setError(null);
    try {
      const response = await api.create(newData);
      setData((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal menyimpan data');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [api]);

  const update = useCallback(async (id: number | string, updateData: Partial<T>): Promise<T | null> => {
    setSaving(true);
    setError(null);
    try {
      const response = await api.update(id, updateData);
      setData((prev) =>
        prev.map((item) => (item.id === id ? response.data : item))
      );
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memperbarui data');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [api]);

  const remove = useCallback(async (id: number | string): Promise<void> => {
    setSaving(true);
    setError(null);
    try {
      await api.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal menghapus data');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [api]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    data,
    loading,
    error,
    saving,
    fetchAll,
    create,
    update,
    remove,
    setData,
  };
}

// Hook for authentication
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Validate token with API
      setIsAuthenticated(true);
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser(null);
        }
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (token: string, userData: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantId');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  }, []);

  return { user, loading, isAuthenticated, login, logout };
}

// Hook for pagination
export function usePagination<T>(
  fetchFn: (params: { page: number; limit: number }) => Promise<AxiosResponse<{ data: T[]; total: number }>>,
  initialLimit = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn({ page, limit });
      setData(response.data.data);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,
    setPage,
    setLimit,
    refetch: fetchData,
  };
}

// Debounce hook for search
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================
// CUSTOM HOOKS FOR AKREDITASI WORKFLOW
// ============================================================

import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  Akreditasi,
  StatusAkreditasi,
  AsesmenKecukupan,
  AsesmenLapangan,
} from '@/types';

// Hook for managing workflow steps
export function useWorkflowSteps() {
  const steps: StatusAkreditasi[] = [
    StatusAkreditasi.REGISTRASI,
    StatusAkreditasi.VERIFIKASI_DOKUMEN,
    StatusAkreditasi.PEMBAYARAN,
    StatusAkreditasi.PENAWARAN_ASESOR,
    StatusAkreditasi.ASESMEN_KECUKUPAN,
    StatusAkreditasi.PENGESAHAN_AK,
    StatusAkreditasi.ASESMEN_LAPANGAN,
    StatusAkreditasi.TANGGAPAN_AL,
    StatusAkreditasi.PENGESAHAN_AL,
    StatusAkreditasi.PENETAPAN_PERINGKAT,
    StatusAkreditasi.SINKRONISASI_BANPT,
    StatusAkreditasi.SELESAI,
  ];

  const stepTitles: Record<StatusAkreditasi, string> = {
    [StatusAkreditasi.REGISTRASI]: 'Registrasi',
    [StatusAkreditasi.VERIFIKASI_DOKUMEN]: 'Verifikasi Dokumen',
    [StatusAkreditasi.PEMBAYARAN]: 'Pembayaran',
    [StatusAkreditasi.PENAWARAN_ASESOR]: 'Penawaran Asesor',
    [StatusAkreditasi.ASESMEN_KECUKUPAN]: 'Asesmen Kecukupan',
    [StatusAkreditasi.PENGESAHAN_AK]: 'Pengesahan AK',
    [StatusAkreditasi.ASESMEN_LAPANGAN]: 'Asesmen Lapangan',
    [StatusAkreditasi.TANGGAPAN_AL]: 'Tanggapan AL',
    [StatusAkreditasi.PENGESAHAN_AL]: 'Pengesahan AL',
    [StatusAkreditasi.PENETAPAN_PERINGKAT]: 'Penetapan Peringkat',
    [StatusAkreditasi.SINKRONISASI_BANPT]: 'Sinkronisasi BANPT',
    [StatusAkreditasi.SELESAI]: 'Selesai',
  };

  const getStepIndex = (status: StatusAkreditasi) => steps.indexOf(status);
  const getProgress = (status: StatusAkreditasi) => {
    const index = getStepIndex(status);
    return Math.round(((index + 1) / steps.length) * 100);
  };

  const getNextStep = (status: StatusAkreditasi) => {
    const index = getStepIndex(status);
    return steps[index + 1] || status;
  };

  return {
    steps,
    stepTitles,
    getStepIndex,
    getProgress,
    getNextStep,
  };
}

// Hook for async operations with loading state
export function useAsync<T>(asyncFn: () => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  return { data, loading, error, execute };
}

// Hook for form validation
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validate?: (values: T) => Partial<Record<keyof T, string>>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (touched[field] && validate) {
        const fieldErrors = validate({ ...values, [field]: value });
        setErrors((prev) => ({
          ...prev,
          [field]: fieldErrors[field],
        }));
      }
    },
    [touched, validate, values]
  );

  const handleBlur = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (validate) {
      const fieldErrors = validate(values);
      setErrors((prev) => ({
        ...prev,
        [field]: fieldErrors[field],
      }));
    }
  }, [validate, values]);

  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => Promise<void>) => {
      return async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate) {
          const newErrors = validate(values);
          setErrors(newErrors);
          if (Object.keys(newErrors).length > 0) {
            toast.error('Please correct the errors in the form');
            return;
          }
        }
        try {
          await onSubmit(values);
          setValues(initialValues);
          setTouched({});
        } catch (error) {
          console.error('Form submission error:', error);
        }
      };
    },
    [values, validate, initialValues]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
}

// Hook for breadcrumb navigation
export function useBreadcrumb() {
  const [breadcrumbs, setBreadcrumbs] = useState<
    Array<{ label: string; href?: string }>
  >([]);

  const addBreadcrumb = useCallback(
    (label: string, href?: string) => {
      setBreadcrumbs((prev) => [
        ...prev.filter((b) => b.href !== href),
        { label, href },
      ]);
    },
    []
  );

  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbs([]);
  }, []);

  return { breadcrumbs, addBreadcrumb, clearBreadcrumbs };
}
