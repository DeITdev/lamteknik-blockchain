-- Seed blockchain transaction audit trail (matches demo akreditasi on-chain records)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE blockchain_transactions;

INSERT INTO blockchain_transactions
  (tx_hash, block_number, contract_address, function_name, kode_akreditasi, entity_type, from_address, gas_used, status)
VALUES
  ('0xak5f1e2d3c4b5a6978', 12, '0x5FbDB2315678afecb367f032d93F642f64180aa3', 'registerAkreditasi', 'AKR-2026-0005', 'AKREDITASI', '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', 21000, 'SUCCESS'),
  ('0xak6a1b2c3d4e5f6070', 18, '0x5FbDB2315678afecb367f032d93F642f64180aa3', 'updateStatus',       'AKR-2026-0006', 'AKREDITASI', '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', 22500, 'SUCCESS'),
  ('0xal7c1d2e3f4a5b6080', 24, '0x5FbDB2315678afecb367f032d93F642f64180aa3', 'updateStatus',       'AKR-2026-0007', 'AKREDITASI', '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', 22800, 'SUCCESS'),
  ('0xal8d1e2f3a4b5c6090', 31, '0x5FbDB2315678afecb367f032d93F642f64180aa3', 'uploadDokumen',      'AKR-2025-0008', 'DOKUMEN',    '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', 31200, 'SUCCESS'),
  ('0xal9e1f2a3b4c5d6100', 37, '0x5FbDB2315678afecb367f032d93F642f64180aa3', 'updateStatus',       'AKR-2025-0009', 'AKREDITASI', '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', 22100, 'SUCCESS'),
  ('0xsk10f1a2b3c4d5e6110', 44, '0x5FbDB2315678afecb367f032d93F642f64180aa3', 'tetapkanPeringkat',  'AKR-2025-0010', 'AKREDITASI', '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', 35000, 'SUCCESS'),
  ('0xreg0001a1b2c3d4e5f6',  5, '0x5FbDB2315678afecb367f032d93F642f64180aa3', 'registerTenant',     NULL,            'TENANT',     '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', 18000, 'SUCCESS'),
  ('0xreg0002a1b2c3d4e5f6',  6, '0x5FbDB2315678afecb367f032d93F642f64180aa3', 'registerTenant',     NULL,            'TENANT',     '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', 18000, 'SUCCESS'),
  ('0xreg0003a1b2c3d4e5f6',  7, '0x5FbDB2315678afecb367f032d93F642f64180aa3', 'registerTenant',     NULL,            'TENANT',     '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', 18000, 'SUCCESS'),
  ('0xakr0001a1b2c3d4e5f6',  8, '0x5FbDB2315678afecb367f032d93F642f64180aa3', 'registerAkreditasi', 'AKR-2026-0001', 'AKREDITASI', '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', 24000, 'SUCCESS'),
  ('0xakr0002a1b2c3d4e5f6',  9, '0x5FbDB2315678afecb367f032d93F642f64180aa3', 'registerAkreditasi', 'AKR-2026-0002', 'AKREDITASI', '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', 24000, 'SUCCESS'),
  ('0xakr0003a1b2c3d4e5f6', 10, '0x5FbDB2315678afecb367f032d93F642f64180aa3', 'registerAkreditasi', 'AKR-2026-0003', 'AKREDITASI', '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', 24000, 'SUCCESS');

SET FOREIGN_KEY_CHECKS = 1;
SELECT function_name, kode_akreditasi, tx_hash, block_number, status FROM blockchain_transactions ORDER BY block_number;
