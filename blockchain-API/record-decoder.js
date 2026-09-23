const MAX_SAFE_INTEGER_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

export function normalizeRecordId(recordId) {
  const value = String(recordId);
  if (/^(0|[1-9]\d*)$/.test(value)) {
    const numericValue = BigInt(value);
    if (numericValue <= MAX_SAFE_INTEGER_BIGINT) return Number(numericValue);
  }
  return value;
}

export function decodeStoredRecord(record) {
  const recordId = record.recordId ?? record[0];
  const allData = record.allData ?? record[4];
  const id = normalizeRecordId(recordId);

  try {
    const decoded = JSON.parse(allData);
    if (decoded && typeof decoded === "object" && !Array.isArray(decoded)) {
      return { ...decoded, id };
    }
  } catch {
    // Legacy records can contain arbitrary strings. Return the stored value below.
  }

  return { id, allData };
}
