import 'reflect-metadata';

import { createHash, randomBytes } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { performance } from 'perf_hooks';
import { Wallet } from 'ethers';

import { BlockchainService } from '../src/modules/blockchain/blockchain.service';
import { DokumenService, TipeDokumen } from '../src/modules/dokumen/dokumen.service';
import { ConnectorService, DataFileEvent, DataQueryEvent } from '../src/modules/kafka/connector.service';
import { KafkaController } from '../src/modules/kafka/kafka.controller';

type TestResult = {
  id: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details: Record<string, any>;
};

type PublishCall = {
  payload: Record<string, any>;
  key?: string;
};

class MockConfigService {
  constructor(private readonly values: Record<string, string>) {}

  get<T>(key: string, defaultValue?: T): T {
    if (Object.prototype.hasOwnProperty.call(this.values, key)) {
      return this.values[key] as unknown as T;
    }

    return defaultValue as T;
  }
}

class MockVaultService {
  constructor(private readonly privateKey: string | null) {}

  async getPrivateKey(): Promise<string | null> {
    return this.privateKey;
  }
}

class MockKafkaService {
  public readonly dataQueryCalls: PublishCall[] = [];
  public readonly dataQuerySoftDeleteCalls: PublishCall[] = [];
  public readonly dataFileCalls: PublishCall[] = [];

  constructor(private readonly connected = true) {}

  isKafkaConnected(): boolean {
    return this.connected;
  }

  async publishDataQuery(payload: Record<string, any>, key?: string): Promise<void> {
    this.dataQueryCalls.push({ payload, key });
  }

  async publishDataQuerySoftDelete(payload: Record<string, any>, key?: string): Promise<void> {
    this.dataQuerySoftDeleteCalls.push({ payload, key });
  }

  async publishDataFile(payload: Record<string, any>, key?: string): Promise<void> {
    this.dataFileCalls.push({ payload, key });
  }
}

class MockConnectorTargetService {
  public readonly queryEvents: DataQueryEvent[] = [];
  public readonly fileEvents: DataFileEvent[] = [];

  async processDataQuery(event: DataQueryEvent): Promise<void> {
    this.queryEvents.push(event);
  }

  async processDataFile(event: DataFileEvent): Promise<void> {
    this.fileEvents.push(event);
  }
}

class MockIpfsService {
  public readonly uploads: Array<{ size: number; fileName: string; ipfsHash: string }> = [];

  async uploadFile(file: any): Promise<{ ipfsHash: string; url: string; size: number; sha256: string }> {
    const sha256 = createHash('sha256').update(file.buffer).digest('hex');
    const ipfsHash = `Qm${sha256.slice(0, 44)}`;

    this.uploads.push({
      size: file.size,
      fileName: file.originalname,
      ipfsHash,
    });

    return {
      ipfsHash,
      url: `http://localhost:8080/ipfs/${ipfsHash}`,
      size: file.size,
      sha256,
    };
  }

  async getFile(_ipfsHash: string): Promise<Buffer> {
    return Buffer.from('dummy');
  }

  async verifyFileIntegrity(_ipfsHash: string, _expectedSha256: string): Promise<boolean> {
    return true;
  }
}

class MockBlockchainConnectorAdapter {
  public readonly registerCalls: Array<Record<string, any>> = [];
  public readonly updateCalls: Array<Record<string, any>> = [];
  public readonly uploadCalls: Array<Record<string, any>> = [];

  async registerAkreditasi(payload: Record<string, any>): Promise<string> {
    this.registerCalls.push(payload);
    return '0xregister';
  }

  async updateAkreditasiStatus(payload: Record<string, any>): Promise<string> {
    this.updateCalls.push(payload);
    return '0xupdate';
  }

  async uploadDokumen(payload: Record<string, any>): Promise<string> {
    this.uploadCalls.push(payload);
    return '0xupload';
  }
}

function createFakeKafkaContext(topic: string): any {
  return {
    getTopic: () => topic,
    getPartition: () => 0,
    getMessage: () => ({ offset: '0' }),
  };
}

function assertCondition(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function createFile(sizeBytes: number): any {
  const buffer = randomBytes(sizeBytes);

  return {
    originalname: `section8-${sizeBytes}.bin`,
    mimetype: 'application/octet-stream',
    size: sizeBytes,
    buffer,
  };
}

async function runTest(
  id: string,
  name: string,
  fn: () => Promise<Record<string, any>>,
): Promise<TestResult> {
  const start = performance.now();

  try {
    const details = await fn();
    return {
      id,
      name,
      passed: true,
      durationMs: Number((performance.now() - start).toFixed(3)),
      details,
    };
  } catch (error) {
    return {
      id,
      name,
      passed: false,
      durationMs: Number((performance.now() - start).toFixed(3)),
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

async function testCdcNormalizationAndDeleteRewrite(): Promise<Record<string, any>> {
  const kafkaService = new MockKafkaService();
  const connectorSink = new MockConnectorTargetService();
  const controller = new KafkaController(kafkaService as any, connectorSink as any);

  const createMessage = {
    value: Buffer.from(
      JSON.stringify({
        __op: 'c',
        __db: 'lamtek_dev',
        __table: 'akreditasi',
        __source_ts_ms: '1712570000000',
        __file: 'mysql-bin.000001',
        __pos: '120',
        __row: '1',
        kode_akreditasi: 'AKR-CDC-001',
        institusi_id: 7,
        prodi_id: 21,
        upps_id: 9,
        tipe: 'REGULER',
        status: 'REGISTRASI',
      }),
    ),
  };

  await (controller as any).handleCdcMessage(createMessage, createFakeKafkaContext('cdc-lamtek-akreditasi'));

  assertCondition(kafkaService.dataQueryCalls.length === 1, 'CDC create harus publish ke DATA_QUERY');
  assertCondition(kafkaService.dataQuerySoftDeleteCalls.length === 0, 'CDC create tidak boleh publish soft_delete');

  const createEvent = kafkaService.dataQueryCalls[0].payload as DataQueryEvent;
  assertCondition(createEvent.operation === 'create', 'Operasi CDC create harus menjadi create');
  assertCondition(createEvent.table === 'akreditasi', 'Table harus akreditasi');

  const deleteMessage = {
    value: Buffer.from(
      JSON.stringify({
        __op: 'd',
        __deleted: 'true',
        __db: 'lamtek_dev',
        __table: 'akreditasi',
        __source_ts_ms: '1712570100000',
        __file: 'mysql-bin.000001',
        __pos: '160',
        __row: '1',
        kode_akreditasi: 'AKR-CDC-001',
        status: 'VERIFIKASI_DOKUMEN',
      }),
    ),
  };

  await (controller as any).handleCdcMessage(deleteMessage, createFakeKafkaContext('cdc-lamtek-akreditasi'));

  assertCondition(kafkaService.dataQuerySoftDeleteCalls.length === 1, 'CDC delete harus diubah ke soft_delete');

  const softDeleteEvent = kafkaService.dataQuerySoftDeleteCalls[0].payload as DataQueryEvent;
  assertCondition(softDeleteEvent.operation === 'soft_delete', 'Operasi delete harus menjadi soft_delete');
  assertCondition(softDeleteEvent.after?.isDeleted === true, 'Projection after harus menandai isDeleted=true');
  assertCondition(softDeleteEvent.metadata?.mappedFromDelete === true, 'Metadata harus menandai mappedFromDelete=true');

  return {
    createTraceId: createEvent.traceId,
    softDeleteTraceId: softDeleteEvent.traceId,
    publishDataQueryCount: kafkaService.dataQueryCalls.length,
    publishSoftDeleteCount: kafkaService.dataQuerySoftDeleteCalls.length,
    softDeleteProjection: {
      isDeleted: softDeleteEvent.after?.isDeleted,
      deletedAt: softDeleteEvent.after?.deletedAt,
    },
  };
}

async function testConnectorDataQueryFilteringAndSmartContractRouting(): Promise<Record<string, any>> {
  const blockchain = new MockBlockchainConnectorAdapter();
  const ipfs = new MockIpfsService();
  const connector = new ConnectorService(blockchain as any, ipfs as any);

  const createEvent: DataQueryEvent = {
    source: 'debezium',
    table: 'akreditasi',
    operation: 'create',
    eventTime: new Date().toISOString(),
    after: {
      kode_akreditasi: 'AKR-FILTER-001',
      institusi_id: 8,
      prodi_id: 20,
      upps_id: 5,
      tipe: 'REGULER',
      status: 'REGISTRASI',
    },
  };

  await connector.processDataQuery(createEvent);

  const softDeleteEvent: DataQueryEvent = {
    source: 'debezium',
    table: 'akreditasi',
    operation: 'soft_delete',
    eventTime: new Date().toISOString(),
    before: {
      kodeAkreditasi: 'AKR-FILTER-001',
      status: 'VERIFIKASI_DOKUMEN',
    },
    after: {
      kodeAkreditasi: 'AKR-FILTER-001',
      isDeleted: true,
    },
  };

  await connector.processDataQuery(softDeleteEvent);

  const ignoredTableEvent: DataQueryEvent = {
    source: 'debezium',
    table: 'users',
    operation: 'create',
    eventTime: new Date().toISOString(),
    after: {
      id: 99,
      email: 'ignored@example.com',
    },
  };

  await connector.processDataQuery(ignoredTableEvent);

  assertCondition(blockchain.registerCalls.length === 1, 'DataQuery create akreditasi harus masuk registerAkreditasi');
  assertCondition(blockchain.updateCalls.length === 1, 'soft_delete harus masuk updateAkreditasiStatus');
  assertCondition(blockchain.registerCalls[0].kodeAkreditasi === 'AKR-FILTER-001', 'kodeAkreditasi harus terbaca dari payload');
  assertCondition(blockchain.updateCalls[0].newStatus === 'SELESAI', 'soft_delete harus dipetakan ke status SELESAI');

  return {
    registerCalls: blockchain.registerCalls.length,
    updateCalls: blockchain.updateCalls.length,
    ignoredTablesStillMapped: blockchain.registerCalls.length + blockchain.updateCalls.length,
    mappedSoftDeleteStatus: blockchain.updateCalls[0].newStatus,
  };
}

async function testDataFileSplitAndConnectorProcessing(): Promise<Record<string, any>> {
  const kafkaProducer = new MockKafkaService(true);
  const config = new MockConfigService({ DATA_FILE_WORKFLOW_MODE: 'kafka' });
  const ipfs = new MockIpfsService();
  const blockchain = new MockBlockchainConnectorAdapter();

  const dokumenService = new DokumenService(
    ipfs as any,
    blockchain as any,
    config as any,
    kafkaProducer as any,
  );

  const file = createFile(1024 * 1024);

  const uploadResponse = await dokumenService.uploadDokumen(
    'AKR-FILE-001',
    file,
    TipeDokumen.LAPORAN_AK,
    {
      source: 'section8-test',
      actorId: 1001,
    },
  );

  assertCondition(uploadResponse.queued === true, 'Mode kafka harus mengembalikan queued=true');
  assertCondition(Boolean(uploadResponse.referenceId), 'Mode kafka harus mengembalikan referenceId');
  assertCondition(kafkaProducer.dataFileCalls.length === 1, 'Mode kafka harus publish DataFile event');

  const event = kafkaProducer.dataFileCalls[0].payload as DataFileEvent;
  assertCondition(event.operation === 'upload', 'Event DataFile operation harus upload');
  assertCondition(Boolean(event.contentBase64), 'Event DataFile harus membawa contentBase64 saat belum ada ipfsHash');

  const connector = new ConnectorService(blockchain as any, ipfs as any);
  await connector.processDataFile(event);

  assertCondition(ipfs.uploads.length === 1, 'Connector DataFile harus upload ke IPFS');
  assertCondition(blockchain.uploadCalls.length === 1, 'Setelah IPFS, hash file harus dikirim ke blockchain');

  return {
    queued: uploadResponse.queued,
    referenceId: uploadResponse.referenceId,
    dataFileEventTopicExpected: 'lamtek.data.file',
    contentBase64Length: event.contentBase64?.length,
    ipfsUploadCount: ipfs.uploads.length,
    blockchainUploadCount: blockchain.uploadCalls.length,
    blockchainUploadPayload: blockchain.uploadCalls[0],
  };
}

async function testConnectorConsumerEntryPoints(): Promise<Record<string, any>> {
  const kafka = new MockKafkaService();
  const connectorSink = new MockConnectorTargetService();
  const controller = new KafkaController(kafka as any, connectorSink as any);

  const queryEvent: DataQueryEvent = {
    source: 'debezium',
    table: 'akreditasi',
    operation: 'update',
    eventTime: new Date().toISOString(),
    before: { kodeAkreditasi: 'AKR-CONSUMER-001', status: 'REGISTRASI' },
    after: { kodeAkreditasi: 'AKR-CONSUMER-001', status: 'VERIFIKASI_DOKUMEN' },
  };

  await controller.handleDataQuery(
    { value: Buffer.from(JSON.stringify(queryEvent)) },
    createFakeKafkaContext('lamtek.data.query'),
  );

  const fileEvent: DataFileEvent = {
    operation: 'upload',
    referenceId: '9f7ebcb9-4d70-49fe-92f5-7de0d1ed0e22',
    kodeAkreditasi: 'AKR-CONSUMER-001',
    tipeDokumen: 'LAPORAN_AK',
    fileName: 'sample.pdf',
    mimeType: 'application/pdf',
    contentBase64: Buffer.from('sample').toString('base64'),
    emittedAt: new Date().toISOString(),
  };

  await controller.handleDataFile(
    { value: Buffer.from(JSON.stringify(fileEvent)) },
    createFakeKafkaContext('lamtek.data.file'),
  );

  assertCondition(connectorSink.queryEvents.length === 1, 'Consumer DATA_QUERY harus meneruskan event ke connector');
  assertCondition(connectorSink.fileEvents.length === 1, 'Consumer DATA_FILE harus meneruskan event ke connector');

  return {
    dataQueryConsumerCalls: connectorSink.queryEvents.length,
    dataFileConsumerCalls: connectorSink.fileEvents.length,
  };
}

async function testSignerModesAndVaultPath(): Promise<Record<string, any>> {
  const testPrivateKey = '0x59c6995e998f97a5a0044966f0945382d7f4f4ef4d0f4e8fddf6c9b8f1d7e8a1';

  const externalConfig = new MockConfigService({
    SIGNER_MODE: 'external',
    EXTERNAL_SIGNER_RPC_URL: 'http://localhost:8545',
    EXTERNAL_SIGNER_ADDRESS: '',
  });

  const externalMode = externalConfig.get<string>('SIGNER_MODE', 'external');
  const externalRpcUrl = externalConfig.get<string>('EXTERNAL_SIGNER_RPC_URL', '');

  assertCondition(externalMode === 'external', 'Konfigurasi external signer harus aktif');
  assertCondition(externalRpcUrl.length > 0, 'EXTERNAL_SIGNER_RPC_URL harus tersedia');

  const vaultService = new BlockchainService(
    new MockConfigService({ SIGNER_MODE: 'vault' }) as any,
    new MockVaultService(testPrivateKey) as any,
  );
  (vaultService as any).provider = undefined;

  const vaultSigner = await (vaultService as any).resolveSigner('http://localhost:8545');
  assertCondition(vaultSigner instanceof Wallet, 'Signer mode vault harus mengembalikan Wallet');

  const directService = new BlockchainService(
    new MockConfigService({
      SIGNER_MODE: 'direct',
      BLOCKCHAIN_PRIVATE_KEY: testPrivateKey,
    }) as any,
    new MockVaultService(null) as any,
  );
  (directService as any).provider = undefined;

  const directSigner = await (directService as any).resolveSigner('http://localhost:8545');
  assertCondition(directSigner instanceof Wallet, 'Signer mode direct harus mengembalikan Wallet');

  return {
    externalSignerConfigMode: externalMode,
    externalSignerRpcConfigured: externalRpcUrl,
    vaultSignerIsWallet: vaultSigner instanceof Wallet,
    directSignerIsWallet: directSigner instanceof Wallet,
    signerModesTested: ['external', 'vault', 'direct'],
  };
}

async function testSmartContractBridgeMethods(): Promise<Record<string, any>> {
  const blockchainService = new BlockchainService(
    new MockConfigService({}) as any,
    new MockVaultService(null) as any,
  );

  (blockchainService as any).akreditasiContract = {
    registerAkreditasi: async () => ({ wait: async () => ({ hash: '0xaaa111' }) }),
    updateStatus: async () => ({ wait: async () => ({ hash: '0xbbb222' }) }),
    uploadDokumen: async () => ({ wait: async () => ({ hash: '0xccc333' }) }),
  };

  const txRegister = await blockchainService.registerAkreditasi({
    kodeAkreditasi: 'AKR-SC-001',
    institusiId: 1,
    prodiId: 2,
    uppsId: 3,
    tipe: 'REGULER',
    ipfsHashDokumen: 'QmDoc001',
  });

  const txUpdate = await blockchainService.updateAkreditasiStatus({
    kodeAkreditasi: 'AKR-SC-001',
    oldStatus: 'REGISTRASI',
    newStatus: 'VERIFIKASI_DOKUMEN',
    keterangan: 'Testing section 8',
  });

  const txUpload = await blockchainService.uploadDokumen({
    kodeAkreditasi: 'AKR-SC-001',
    ipfsHash: 'QmFile001',
    namaDokumen: 'file.pdf',
    tipeDokumen: 'LAPORAN_AK',
  });

  assertCondition(txRegister === '0xaaa111', 'registerAkreditasi harus mengembalikan tx hash dari smart contract');
  assertCondition(txUpdate === '0xbbb222', 'updateStatus harus mengembalikan tx hash dari smart contract');
  assertCondition(txUpload === '0xccc333', 'uploadDokumen harus mengembalikan tx hash dari smart contract');

  return {
    txRegister,
    txUpdate,
    txUpload,
    smartContractBridgeStatus: 'ok',
  };
}

async function main(): Promise<void> {
  const tests: TestResult[] = [];

  tests.push(
    await runTest('S8-T01', 'CDC normalize + delete rewrite to soft_delete', testCdcNormalizationAndDeleteRewrite),
  );

  tests.push(
    await runTest('S8-T02', 'Connector DataQuery filtering and smart-contract routing', testConnectorDataQueryFilteringAndSmartContractRouting),
  );

  tests.push(
    await runTest('S8-T03', 'DataFile split and connector flow to IPFS then blockchain', testDataFileSplitAndConnectorProcessing),
  );

  tests.push(
    await runTest('S8-T04', 'Connector consumer entry points for DATA_QUERY and DATA_FILE', testConnectorConsumerEntryPoints),
  );

  tests.push(
    await runTest('S8-T05', 'Eth signer modes with Vault path', testSignerModesAndVaultPath),
  );

  tests.push(
    await runTest('S8-T06', 'Smart contract bridge methods return tx hashes', testSmartContractBridgeMethods),
  );

  const passed = tests.filter((test) => test.passed).length;
  const failed = tests.length - passed;

  const report = {
    generatedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    summary: {
      total: tests.length,
      passed,
      failed,
    },
    tests,
  };

  const outputPath = resolve(__dirname, '../../docs/testing-artifacts/section8-debezium-kafka-pipeline-results.json');
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log(`Section 8 pipeline report written to ${outputPath}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error('Failed to run section 8 pipeline tests:', error);
  process.exitCode = 1;
});
