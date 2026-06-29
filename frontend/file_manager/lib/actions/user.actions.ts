"use server";

import { v4 as uuidv4 } from "uuid";
import { redirect } from "next/navigation";

import {
  createUser,
  getUserByEmail,
  getUserById,
} from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateWallet } from "@/lib/auth/wallet";
import { createSession, destroySession, getSession } from "@/lib/auth/session";
import { avatarPlaceholderUrl } from "@/constants";

/**
 * Shape returned to the StoreIt UI. Field names mirror the original Appwrite
 * user document so ported components need no changes.
 */
export interface CurrentUser {
  $id: string;
  accountId: string;
  fullName: string;
  email: string;
  avatar: string;
  walletAddress: string;
}

function buildUsername(fullName: string, email: string): string {
  const base =
    fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, "") ||
    email.split("@")[0].toLowerCase();
  const suffix = Math.random().toString(16).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function createAccount({
  fullName,
  email,
  password,
}: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ error?: string }> {
  const existing = await getUserByEmail(email);
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const wallet = generateWallet();
  const passwordHash = await hashPassword(password);
  const id = uuidv4();

  const user = await createUser({
    id,
    username: buildUsername(fullName, email),
    email,
    passwordHash,
    fullName,
    avatar: avatarPlaceholderUrl,
    walletAddress: wallet.address,
    publicKey: wallet.publicKey,
  });

  await createSession({
    userId: user.id,
    walletAddress: user.wallet_address,
    email: user.email,
  });

  return {};
}

export async function signInUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ error?: string }> {
  const user = await getUserByEmail(email);
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await createSession({
    userId: user.id,
    walletAddress: user.wallet_address,
    email: user.email,
  });

  return {};
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await getUserById(session.userId);
  if (!user) return null;

  return {
    $id: user.id,
    accountId: user.id,
    fullName: user.full_name || user.username,
    email: user.email,
    avatar: user.avatar || avatarPlaceholderUrl,
    walletAddress: user.wallet_address,
  };
}

export async function signOutUser(): Promise<void> {
  await destroySession();
  redirect("/sign-in");
}
