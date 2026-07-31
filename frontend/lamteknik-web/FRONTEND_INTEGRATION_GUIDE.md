# Frontend Integration Guide

## 🎯 Current Status

### ✅ Completed
- [x] Type definitions sesuai dengan smart contract & backend
- [x] Store & State management (Auth, Akreditasi, Dashboard, UI)
- [x] Custom hooks untuk API calls & workflow management
- [x] Workflow status visualization component
- [x] Enhanced dashboard dengan workflow integration
- [x] Reusable form components dengan validation
- [x] Data table component dengan pagination & filtering
- [x] API client configuration dengan auth interceptors

### ⏳ Ready to Implement
- Dashboard pages (Asesmen, Pembayaran, Dokumen)
- Akreditasi CRUD pages dengan workflow visualization
- Form pages untuk setiap status transition
- Document management interface
- Payment verification workflow
- Assessor assignment interface

---

## 📦 Reusable Components

### 1. WorkflowStatus Component

Menampilkan progress akreditasi dengan timeline visualization.

```tsx
import WorkflowStatus from '@/components/ui/WorkflowStatus';

export function MyComponent() {
  return (
    <WorkflowStatus 
      currentStatus="ASESMEN_KECUKUPAN"
      size="md"
      hideLabels={false}
    />
  );
}
```

**Props**:
- `currentStatus: StatusAkreditasi` - Current step dalam workflow
- `size?: 'sm' | 'md' | 'lg'` - Component size
- `hideLabels?: boolean` - Hide step labels
- `className?: string` - Additional CSS classes

**Features**:
- Desktop horizontal timeline
- Mobile vertical timeline
- Progress bar dengan percentage
- Colored step indicators
- Responsive design

---

### 2. Form Components

Building blocks untuk membuat form dengan validation.

```tsx
import {
  Form,
  FormGroup,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  FormRadioGroup,
  FormSubmitButton,
  FormActions,
  FormError,
  FormSuccess,
} from '@/components/ui/Form';

export function MyForm() {
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  return (
    <Form onSubmit={handleSubmit}>
      {success && <FormSuccess message="Berhasil disimpan!" />}

      <FormGroup>
        <FormLabel htmlFor="nama" required>
          Nama Program Studi
        </FormLabel>
        <FormInput
          id="nama"
          name="nama"
          placeholder="Masukkan nama..."
          error={errors.nama}
          required
        />
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="institusi" required>
          Institusi
        </FormLabel>
        <FormSelect
          id="institusi"
          name="institusi"
          options={[
            { value: '1', label: 'ITB' },
            { value: '2', label: 'UNPAR' },
          ]}
          error={errors.institusi}
          placeholder="Pilih institusi..."
          required
        />
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="tipe" required>
          Tipe Akreditasi
        </FormLabel>
        <FormRadioGroup
          name="tipe"
          value={values.tipe}
          onChange={(val) => setValues({ ...values, tipe: val })}
          options={[
            { value: 'REGULER', label: 'Reguler' },
            { value: 'PJJ', label: 'PJJ' },
            { value: 'PRODI_BARU_PTNBH', label: 'Prodi Baru PTNBH' },
          ]}
        />
      </FormGroup>

      <FormCheckbox
        id="agree"
        name="agree"
        label="Saya setuju dengan syarat dan ketentuan"
        error={errors.agree}
      />

      <FormActions
        onSubmit={() => handleFormSubmit()}
        onCancel={() => router.back()}
        submitLabel="Simpan"
        isLoading={loading}
      />
    </Form>
  );
}
```

**Available Components**:
- `FormInput` - Text input dengan error handling
- `FormTextarea` - Multi-line text
- `FormSelect` - Dropdown selection
- `FormCheckbox` - Single checkbox
- `FormRadioGroup` - Radio button group
- `FormLabel` - Label dengan required indicator
- `FormError` - Error message display
- `FormSuccess` - Success message display
- `FormActions` - Submit & cancel buttons

---

### 3. DataTable Component

Reusable table dengan pagination, sorting, dan row actions.

```tsx
import { DataTable, DataTableToolbar } from '@/components/ui/DataTable';
import type { Akreditasi } from '@/types';

export function AkreditasiList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error } = useApi(() => 
    akreditasiApi.getAll({ search, page })
  );

  const columns = [
    {
      key: 'kodeAkreditasi' as const,
      label: 'Kode',
      width: '120px',
    },
    {
      key: 'prodi' as const,
      label: 'Program Studi',
      render: (val, row) => row.prodi?.nama,
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (status) => (
        <span className={getStatusColor(status)}>
          {stepTitles[status]}
        </span>
      ),
    },
    {
      key: 'peringkat' as const,
      label: 'Peringkat',
      render: (peringkat) => peringkat || '-',
    },
  ];

  return (
    <>
      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari kode, prodi..."
        actions={<Link href="/dashboard/akreditasi/new">Baru</Link>}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={loading}
        error={error?.message}
        pagination={{
          page,
          limit: 10,
          total: data?.total || 0,
          onPageChange: setPage,
        }}
        onRowClick={(row) => router.push(`/dashboard/akreditasi/${row.id}`)}
        rowActions={(row) => (
          <Link href={`/dashboard/akreditasi/${row.id}`}>Detail</Link>
        )}
      />
    </>
  );
}
```

**Props**:
- `columns: DataTableColumn<T>[]` - Column definitions
- `data: T[]` - Row data
- `loading?: boolean` - Loading state
- `error?: string` - Error message
- `pagination?: PaginationConfig` - Pagination settings
- `onRowClick?: (row) => void` - Row click handler
- `rowActions?: (row) => ReactNode` - Custom actions per row

---

## 🔧 Custom Hooks

### useWorkflowSteps()

Manage akreditasi workflow steps.

```tsx
import { useWorkflowSteps } from '@/lib/hooks';

export function MyComponent() {
  const { 
    steps,           // ['REGISTRASI', 'VERIFIKASI_DOKUMEN', ...]
    stepTitles,      // { REGISTRASI: 'Registrasi', ... }
    getStepIndex,    // (status) => number
    getProgress,     // (status) => percentage
    getNextStep,     // (status) => next status
  } = useWorkflowSteps();

  return (
    <div>
      <p>Current step: {getStepIndex('ASESMEN_KECUKUPAN')}</p>
      <p>Progress: {getProgress('ASESMEN_KECUKUPAN')}%</p>
    </div>
  );
}
```

### useAsync()

Handle async operations dengan loading/error states.

```tsx
import { useAsync } from '@/lib/hooks';

export function MyComponent() {
  const { data, loading, error, execute } = useAsync(
    () => fetchSomeData()
  );

  const handleClick = async () => {
    try {
      const result = await execute();
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <p>Data: {JSON.stringify(data)}</p>}
      <button onClick={handleClick}>Fetch Data</button>
    </>
  );
}
```

### useFormValidation()

Form validation dengan Zod integration (upcoming).

```tsx
import { useFormValidation } from '@/lib/hooks';

export function MyForm() {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useFormValidation(
      { nama: '', institusi: '' },
      (values) => {
        const newErrors = {};
        if (!values.nama) newErrors.nama = 'Nama harus diisi';
        if (!values.institusi) newErrors.institusi = 'Institusi harus dipilih';
        return newErrors;
      }
    );

  return (
    <form onSubmit={handleSubmit(async (vals) => {
      await submitForm(vals);
    })}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 📋 Store Usage

### useAuthStore

Manage authentication state.

```tsx
import { useAuthStore } from '@/lib/store';

export function MyComponent() {
  const { user, token, isAuthenticated, logout } = useAuthStore();

  return (
    <>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </>
  );
}
```

### useAkreditasiStore

Track current akreditasi & workflow.

```tsx
import { useAkreditasiStore } from '@/lib/store';

export function MyComponent() {
  const { current, list, selectedId, setCurrent, updateStatus } =
    useAkreditasiStore();

  const handleStatusUpdate = async (newStatus) => {
    await updateAkreditasiStatus(current.id, newStatus);
    updateStatus(newStatus);
  };

  return <>{/* UI */}</>;
}
```

---

## 🔌 API Integration Examples

### Create Akreditasi

```tsx
import { useCreateAkreditasi } from '@/lib/hooks';
import type { AkreditasiCreateDTO } from '@/types';

export function CreateAkreditasiForm() {
  const { create, loading, error } = useCreateAkreditasi();
  const router = useRouter();

  const handleSubmit = async (data: AkreditasiCreateDTO) => {
    try {
      const result = await create(data);
      toast.success('Akreditasi berhasil dibuat');
      router.push(`/dashboard/akreditasi/${result.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(formValues);
    }}>
      {/* Form fields */}
    </Form>
  );
}
```

### Upload Document

```tsx
import { useUploadDokumen } from '@/lib/hooks';

export function DocumentUpload({ kodeAkreditasi }) {
  const { upload, loading } = useUploadDokumen();

  const handleFileSelect = async (file: File) => {
    try {
      const result = await upload(
        kodeAkreditasi,
        file,
        file.name,
        'DOKUMEN_PENDUKUNG'
      );
      toast.success('Dokumen berhasil diunggah');
    } catch (err) {
      toast.error('Gagal mengunggah dokumen');
    }
  };

  return (
    <input
      type="file"
      onChange={(e) => handleFileSelect(e.target.files?.[0])}
      disabled={loading}
    />
  );
}
```

---

## 🎨 Styling & Classes

Menggunakan Tailwind CSS dengan Figma design system.

### Common Classes

```tsx
// Spacing
<div className="p-4 m-4 gap-3 space-y-2"></div>

// Colors
// Text: text-gray-900, text-blue-600, text-red-500
// BG: bg-gray-50, bg-blue-100, bg-green-500
// Border: border-gray-200, border-blue-300

// Responsive
<div className="hidden md:block lg:grid-cols-3"></div>

// States
<button className="hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"></button>
```

---

## 📖 Page Templates

### Detail Page Template

```tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAkreditasi } from '@/lib/hooks';
import WorkflowStatus from '@/components/ui/WorkflowStatus';

export default function AkreditasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: akreditasi, loading, error } = useAkreditasi(params.id as string);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!akreditasi) return <div>Not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">{akreditasi.kodeAkreditasi}</h1>
        <p className="text-gray-600">{akreditasi.prodi?.nama}</p>
      </div>

      {/* Workflow Status */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <WorkflowStatus currentStatus={akreditasi.status} />
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Main content */}
        </div>
        <div>
          {/* Sidebar */}
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Next Implementation Steps

### Phase 1: Core Pages (Week 1)
1. [ ] Akreditasi List page
2. [ ] Akreditasi Detail page
3. [ ] Create Akreditasi form
4. [ ] Asesmen Kecukupan page

### Phase 2: Supporting Features (Week 2)
5. [ ] Asesmen Lapangan page
6. [ ] Document management interface
7. [ ] Payment management page
8. [ ] Assessor assignment interface

### Phase 3: Workflows (Week 3)
9. [ ] Pengesahan AK/AL pages
10. [ ] Payment verification flow
11. [ ] Report submission workflow
12. [ ] Final approval process

### Phase 4: Polish (Week 4)
13. [ ] Error boundaries
14. [ ] Loading skeleton screens
15. [ ] Comprehensive error messages
16. [ ] Mobile responsiveness test

---

## 🧪 Testing

### Example Component Test

```tsx
import { render, screen } from '@testing-library/react';
import { WorkflowStatus } from '@/components/ui/WorkflowStatus';

describe('WorkflowStatus', () => {
  it('should render current step', () => {
    render(<WorkflowStatus currentStatus="ASESMEN_KECUKUPAN" />);
    expect(screen.getByText('Current Status: Asesmen Kecukupan')).toBeInTheDocument();
  });

  it('should calculate correct progress', () => {
    const { rerender } = render(<WorkflowStatus currentStatus="REGISTRASI" />);
    expect(screen.getByText('8%')).toBeInTheDocument();

    rerender(<WorkflowStatus currentStatus="SELESAI" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
```

---

## 📞 Support & Resources

- **Types**: `frontend/src/types/index.ts`
- **Hooks**: `frontend/src/lib/hooks.ts`
- **Store**: `frontend/src/lib/store.ts`
- **API**: `frontend/src/lib/api.ts`
- **Components**: `frontend/src/components/ui/`
- **Dashboard**: `frontend/src/app/dashboard/`

---

**Last Updated**: March 4, 2026
**Version**: 1.0.0-alpha
