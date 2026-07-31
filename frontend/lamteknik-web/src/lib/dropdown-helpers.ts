/**
 * Helper functions to map backend data to dropdown options
 * Handles different field name conventions from different API endpoints
 */

export interface DropdownOption {
  value: string;
  label: string;
}

/**
 * Maps generic API response to dropdown options
 * Tries multiple field name conventions
 */
export function mapToOptions(
  data: any[],
  valueField: string = 'id',
  labelFields: string[] = []
): DropdownOption[] {
  return (data || []).map((item: any) => {
    // Determine the label - try different field name conventions
    let label = '';
    for (const field of labelFields) {
      if (item[field]) {
        label = item[field];
        break;
      }
    }
    
    return {
      value: String(item[valueField] || ''),
      label: label || 'N/A',
    };
  });
}

// Specific mappers for each entity type
export const DropdownMappers = {
  institusi: (data: any[]) =>
    mapToOptions(data, 'id', ['namaInstitusi', 'nama']),
  
  upps: (data: any[]) =>
    mapToOptions(data, 'id', ['namaUpps', 'nama']),
  
  prodi: (data: any[]) =>
    mapToOptions(data, 'id', ['namaProdi', 'nama']),
  
  jenjang: (data: any[]) =>
    mapToOptions(data, 'id', ['namaJenjang', 'nama']),
  
  skemaPembayaran: (data: any[]) =>
    mapToOptions(data, 'id', ['namaSchemePembayaran', 'namaSkema', 'nama']),
  
  bank: (data: any[]) =>
    mapToOptions(data, 'id', ['namaBank', 'nama']),
  
  klaster: (data: any[]) =>
    mapToOptions(data, 'id', ['namaKlaster', 'nama']),
  
  asesor: (data: any[]) =>
    mapToOptions(data, 'id', ['namaLengkap', 'namaAsesor', 'nama']),
  
  registrasi: (data: any[]) =>
    mapToOptions(data, 'id', ['kodeRegistrasi', 'nama']),
  
  generic: (data: any[], labelField: string = 'nama') =>
    mapToOptions(data, 'id', [labelField]),
};

export const DropdownDefaults = {
  institusi: { value: '', label: 'Pilih institusi' },
  upps: { value: '', label: 'Pilih UPPS' },
  prodi: { value: '', label: 'Pilih program studi' },
  jenjang: { value: '', label: 'Pilih jenjang' },
  skemaPembayaran: { value: '', label: 'Pilih skema pembayaran' },
  bank: { value: '', label: 'Pilih bank' },
  klaster: { value: '', label: 'Pilih klaster' },
  asesor: { value: '', label: 'Pilih asesor' },
};
