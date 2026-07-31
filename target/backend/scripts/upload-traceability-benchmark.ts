import { createHash } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { performance } from 'perf_hooks';
import { BlockchainService } from '../src/modules/blockchain/blockchain.service';
import { DokumenService, TipeDokumen } from '../src/modules/dokumen/dokumen.service';
import { ConnectorService, DataFileEvent } from '../src/modules/kafka/connector.service';

type WorkflowMode = 'sync' | 'kafka';

type UploadedFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

type ScenarioResult = {
  scenario: string;
  mode: WorkflowMode;
  fileSizeBytes: number;
  iterations: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
  stdDevMs: number;
  avgThroughputMBps: number;
  ipfsUploadCalls: number;
  blockchainUploadCalls: number;
  kafkaPublishCalls: number;
};

class MockConfigService {
  constructor(private readonly mode: WorkflowMode) {}

  get<T>(key: string, defaultValue?: T): T {
    if (key === 'DATA_FILE_WORKFLOW_MODE') {
      return this.mode as unknown as T;
    }

    return defaultValue as T;
  }
}

class MockIpfsService {
  public readonly uploadCalls: Array<{ fileName: string; size: number; ipfsHash: string; sha256: string }> = [];

  async uploadFile(file: UploadedFile): Promise<{ ipfsHash: string; url: string; size: number; sha256: string }> {
    const sha256 = createHash('sha256').update(file.buffer).digest('hex');
    const ipfsHash = `Qm${sha256.slice(0, 44)}`;

    this.uploadCalls.push({
      fileName: file.originalname,
      size: file.size,
      ipfsHash,
      sha256,
    });

    return {
      ipfsHash,
      url: `http://localhost:8080/ipfs/${ipfsHash}`,
      size: file.size,
      sha256,
    };
  }

  async getFile(ipfsHash: string): Promise<Buffer> {
    return Buffer.from(ipfsHash);
  }

  async verifyFileIntegrity(_ipfsHash: string, _expectedSha256: string): Promise<boolean> {
    return true;
  }
}

class MockBlockchainService {
  public readonly uploadCalls: Array<{
    kodeAkreditasi: string;
    ipfsHash: string;
    namaDokumen: string;
    tipeDokumen: string;
    txHash: string;
  }> = [];

  async uploadDokumen(data: {
    kodeAkreditasi: string;
    ipfsHash: string;
    namaDokumen: string;
    tipeDokumen: string;
  }): Promise<string> {
    const txHash = `0x${createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 64)}`;

    this.uploadCalls.push({
      ...data,
      txHash,
    });

    return txHash;
  }

  async getDokumen(): Promise<any[]> {
    return [];
  }
}

class MockKafkaService {
  public readonly events: Array<{ payload: Record<string, any>; key?: string }> = [];

  constructor(private readonly connected: boolean) {}

  isKafkaConnected(): boolean {
    return this.connected;
  }

  async publishDataFile(payload: Record<string, any>, key?: string): Promise<void> {
    this.events.push({ payload, key });
  }
}

function createFile(fileSizeBytes: number, marker: number): UploadedFile {
  const fillByte = marker % 255;
  const buffer = Buffer.alloc(fileSizeBytes, fillByte);

  return {
    originalname: `benchmark-${fileSizeBytes}-${marker}.bin`,
    mimetype: 'application/octet-stream',
    size: fileSizeBytes,
    buffer,
  };
}

function round(value: number): number {
  return Number(value.toFixed(3));
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(index, 0)] ?? 0;
}

function standardDeviation(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

async function runScenario(
  mode: WorkflowMode,
  fileSizeBytes: number,
  iterations: number,
): Promise<ScenarioResult> {
  const ipfs = new MockIpfsService();
  const blockchain = new MockBlockchainService();
  const kafka = new MockKafkaService(true);
  const config = new MockConfigService(mode);

  const service = new DokumenService(
    ipfs as any,
    blockchain as any,
    config as any,
    kafka as any,
  );

  const timingsMs: number[] = [];

  for (let i = 0; i < iterations; i += 1) {
    const file = createFile(fileSizeBytes, i + 1);
    const start = performance.now();

    await service.uploadDokumen(
      'AKR-BENCH-001',
      file,
      TipeDokumen.LAPORAN_EVALUASI_DIRI,
      {
        requestId: `REQ-${mode.toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
        benchmark: true,
      },
    );

    const end = performance.now();
    timingsMs.push(end - start);
  }

  const avgMs = timingsMs.reduce((sum, value) => sum + value, 0) / timingsMs.length;
  const throughputMBps = (fileSizeBytes / 1024 / 1024) / (avgMs / 1000);

  return {
    scenario: `${mode}-${Math.round(fileSizeBytes / 1024)}kb`,
    mode,
    fileSizeBytes,
    iterations,
    avgMs: round(avgMs),
    minMs: round(Math.min(...timingsMs)),
    maxMs: round(Math.max(...timingsMs)),
    p95Ms: round(percentile(timingsMs, 95)),
    stdDevMs: round(standardDeviation(timingsMs)),
    avgThroughputMBps: round(throughputMBps),
    ipfsUploadCalls: ipfs.uploadCalls.length,
    blockchainUploadCalls: blockchain.uploadCalls.length,
    kafkaPublishCalls: kafka.events.length,
  };
}

function validateUuidV4(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function runTraceabilityAndAuditChecks(): Promise<Record<string, any>> {
  const syncIpfs = new MockIpfsService();
  const syncBlockchain = new MockBlockchainService();
  const syncConfig = new MockConfigService('sync');
  const syncKafka = new MockKafkaService(true);

  const syncService = new DokumenService(
    syncIpfs as any,
    syncBlockchain as any,
    syncConfig as any,
    syncKafka as any,
  );

  const syncResponse = await syncService.uploadDokumen(
    'AKR-TRACE-001',
    createFile(512 * 1024, 91),
    TipeDokumen.LAPORAN_AL,
    {
      actorId: 7001,
      sessionId: 'SESSION-TRACE-001',
      source: 'testing-paper',
    },
  );

  const kafkaIpfs = new MockIpfsService();
  const kafkaBlockchain = new MockBlockchainService();
  const kafkaConfig = new MockConfigService('kafka');
  const kafkaService = new MockKafkaService(true);

  const asyncService = new DokumenService(
    kafkaIpfs as any,
    kafkaBlockchain as any,
    kafkaConfig as any,
    kafkaService as any,
  );

  const asyncResponse = await asyncService.uploadDokumen(
    'AKR-TRACE-002',
    createFile(512 * 1024, 92),
    TipeDokumen.BERITA_ACARA,
    {
      actorId: 7002,
      sessionId: 'SESSION-TRACE-002',
      source: 'testing-paper',
    },
  );

  const publishedEvent = kafkaService.events[0]?.payload as DataFileEvent;

  const connector = new ConnectorService(
    kafkaBlockchain as any,
    kafkaIpfs as any,
  );

  if (publishedEvent) {
    await connector.processDataFile(publishedEvent);
  }

  const blockchainAuditService = new BlockchainService(
    {
      get: (_key: string, defaultValue?: string) => defaultValue,
    } as any,
    {
      getPrivateKey: async () => '',
    } as any,
  );

  (blockchainAuditService as any).akreditasiContract = {
    getAuditLogs: async () => [
      {
        kodeAkreditasi: 'AKR-TRACE-001',
        fromStatus: 0,
        toStatus: 1,
        ipfsHashBukti: 'QmAuditHash001',
        keterangan: 'Dokumen diverifikasi',
        changedBy: '0x1234567890abcdef1234567890abcdef12345678',
        timestamp: 1710000000,
      },
      {
        kodeAkreditasi: 'AKR-TRACE-001',
        fromStatus: 1,
        toStatus: 2,
        ipfsHashBukti: 'QmAuditHash002',
        keterangan: 'Pembayaran terverifikasi',
        changedBy: '0x1234567890abcdef1234567890abcdef12345678',
        timestamp: 1710000600,
      },
    ],
  };

  const parsedAuditLogs = await blockchainAuditService.getAuditLogs('AKR-TRACE-001');

  return {
    syncResponse,
    syncTraceabilityFieldsPresent: {
      ipfsHash: Boolean(syncResponse.ipfsHash),
      sha256: Boolean(syncResponse.sha256),
      blockchainTxHash: Boolean(syncResponse.blockchainTxHash),
      url: Boolean(syncResponse.url),
    },
    asyncResponse,
    asyncTraceabilityFieldsPresent: {
      queued: asyncResponse.queued === true,
      referenceId: Boolean(asyncResponse.referenceId),
      topic: asyncResponse.topic === 'lamtek.data.file',
      message: Boolean(asyncResponse.message),
    },
    asyncReferenceIdIsUuidV4: validateUuidV4(asyncResponse.referenceId || ''),
    publishedDataFileEventSnapshot: publishedEvent,
    publishedDataFileEventFieldPresence: {
      operation: publishedEvent?.operation === 'upload',
      referenceId: Boolean(publishedEvent?.referenceId),
      kodeAkreditasi: Boolean(publishedEvent?.kodeAkreditasi),
      tipeDokumen: Boolean(publishedEvent?.tipeDokumen),
      fileName: Boolean(publishedEvent?.fileName),
      mimeType: Boolean(publishedEvent?.mimeType),
      contentBase64: Boolean(publishedEvent?.contentBase64),
      metadata: Boolean(publishedEvent?.metadata),
      emittedAt: Boolean(publishedEvent?.emittedAt),
    },
    connectorDerivedBlockchainRecord: kafkaBlockchain.uploadCalls[0] || null,
    parsedAuditLogsSample: parsedAuditLogs,
    parsedAuditLogsCount: parsedAuditLogs.length,
  };
}

async function main(): Promise<void> {
  const scenarios: Array<{ mode: WorkflowMode; sizeBytes: number; iterations: number }> = [
    { mode: 'sync', sizeBytes: 256 * 1024, iterations: 80 },
    { mode: 'sync', sizeBytes: 1024 * 1024, iterations: 80 },
    { mode: 'sync', sizeBytes: 5 * 1024 * 1024, iterations: 50 },
    { mode: 'kafka', sizeBytes: 256 * 1024, iterations: 80 },
    { mode: 'kafka', sizeBytes: 1024 * 1024, iterations: 80 },
    { mode: 'kafka', sizeBytes: 5 * 1024 * 1024, iterations: 50 },
  ];

  const benchmarkResults: ScenarioResult[] = [];
  for (const scenario of scenarios) {
    const result = await runScenario(scenario.mode, scenario.sizeBytes, scenario.iterations);
    benchmarkResults.push(result);
  }

  const traceabilityAndAudit = await runTraceabilityAndAuditChecks();

  const report = {
    generatedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuCount: require('os').cpus().length,
    },
    benchmarkResults,
    traceabilityAndAudit,
  };

  const outputPath = resolve(__dirname, '../../docs/testing-artifacts/upload-traceability-results.json');
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log(`Benchmark and traceability report written to ${outputPath}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error('Failed to run upload benchmark script:', error);
  process.exitCode = 1;
});
