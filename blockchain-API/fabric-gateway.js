import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import grpc from "@grpc/grpc-js";
import { connect, hash, signers } from "@hyperledger/fabric-gateway";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const decoder = new TextDecoder();

function firstFile(directory) {
  const names = fs.readdirSync(directory).sort();
  if (!names.length) throw new Error(`No identity private key found in ${directory}`);
  return path.join(directory, names[0]);
}

export class FabricGateway {
  constructor() {
    this.cryptoPath = process.env.FABRIC_CRYPTO_PATH || path.join(__dirname, "..", "backend", "hyperledger-fabric", "docker", "explorer", "organizations");
    this.peerEndpoint = process.env.FABRIC_PEER_ENDPOINT || "127.0.0.1:7051";
    this.peerHostAlias = process.env.FABRIC_PEER_HOST_ALIAS || "peer0.org1.example.com";
    this.channelName = process.env.FABRIC_CHANNEL || "mychannel";
    this.chaincodeName = process.env.FABRIC_CHAINCODE_NAME || "lamteknik-ledger";
    this.gateway = null;
    this.client = null;
  }

  paths() {
    const org = path.join(this.cryptoPath, "peerOrganizations", "org1.example.com");
    return {
      tlsCert: path.join(org, "peers", "peer0.org1.example.com", "tls", "ca.crt"),
      certificate: path.join(org, "users", "User1@org1.example.com", "msp", "signcerts", "cert.pem"),
      keyDirectory: path.join(org, "users", "User1@org1.example.com", "msp", "keystore"),
    };
  }

  async contract() {
    if (!this.gateway) {
      const { tlsCert, certificate, keyDirectory } = this.paths();
      const tlsCredentials = grpc.credentials.createSsl(fs.readFileSync(tlsCert));
      this.client = new grpc.Client(this.peerEndpoint, tlsCredentials, { "grpc.ssl_target_name_override": this.peerHostAlias });
      const identity = { mspId: "Org1MSP", credentials: fs.readFileSync(certificate) };
      const privateKey = crypto.createPrivateKey(fs.readFileSync(firstFile(keyDirectory)));
      this.gateway = connect({ client: this.client, identity, signer: signers.newPrivateKeySigner(privateKey), hash: hash.sha256 });
    }
    return this.gateway.getNetwork(this.channelName).getContract(this.chaincodeName);
  }

  async evaluate(name, ...args) {
    const contract = await this.contract();
    return decoder.decode(await contract.evaluateTransaction(name, ...args));
  }

  async submit(name, ...args) {
    const contract = await this.contract();
    const commit = await contract.submitAsync(name, { arguments: args });
    const status = await commit.getStatus();
    if (!status.successful) throw new Error(`Fabric transaction ${status.transactionId} failed with status ${status.code}`);
    return { result: decoder.decode(commit.getResult()), transactionId: status.transactionId };
  }

  async health() {
    const result = await this.evaluate("Ping");
    return { channel: this.channelName, chaincode: this.chaincodeName, peerEndpoint: this.peerEndpoint, result };
  }

  close() {
    this.gateway?.close();
    this.client?.close();
    this.gateway = null;
    this.client = null;
  }
}
