import "server-only";
import { ethers } from "ethers";

export interface GeneratedWallet {
  address: string;
  publicKey: string;
  privateKey: string;
}

/**
 * Generate a fresh Ethereum keypair for a new user. The address becomes the
 * user's on-chain identity (Cahyo thesis: each platform user maps to a wallet
 * address). In dev the server key signs transactions on the user's behalf, so
 * the private key is not persisted; production would hand this to EthSigner/Vault.
 */
export function generateWallet(): GeneratedWallet {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
  };
}
