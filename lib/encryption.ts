'use client'

/**
 * Client-side encryption for sensitive financial data
 * Uses Web Crypto API with AES-GCM encryption
 * Key is derived from user's password using PBKDF2
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const PBKDF2_ITERATIONS = 100000
const SALT_LENGTH = 16
const IV_LENGTH = 12

// Convert string to ArrayBuffer
function stringToBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer as ArrayBuffer
}

// Convert ArrayBuffer to string
function bufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer)
}

// Convert ArrayBuffer to base64 string
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

// Convert base64 string to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// Generate a random salt
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
}

// Generate a random IV (initialization vector)
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH))
}

// Derive encryption key from password using PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordBuffer = stringToBuffer(password)

  // Import password as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  // Derive AES key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt data using a password-derived key
 * Returns base64 encoded string containing: salt + iv + ciphertext
 */
export async function encrypt(data: string, password: string): Promise<string> {
  const salt = generateSalt()
  const iv = generateIV()
  const key = await deriveKey(password, salt)

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv as Uint8Array<ArrayBuffer> },
    key,
    stringToBuffer(data)
  )

  // Combine salt + iv + ciphertext into single buffer
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length)

  return bufferToBase64(combined.buffer)
}

/**
 * Decrypt data using a password-derived key
 * Expects base64 encoded string containing: salt + iv + ciphertext
 */
export async function decrypt(encryptedData: string, password: string): Promise<string> {
  const combined = new Uint8Array(base64ToBuffer(encryptedData))

  // Extract salt, iv, and ciphertext
  const salt = combined.slice(0, SALT_LENGTH)
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH)

  const key = await deriveKey(password, salt)

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv as Uint8Array<ArrayBuffer> },
    key,
    ciphertext
  )

  return bufferToString(decrypted)
}

/**
 * Encrypt an object (serializes to JSON first)
 */
export async function encryptObject<T>(data: T, password: string): Promise<string> {
  return encrypt(JSON.stringify(data), password)
}

/**
 * Decrypt to an object (parses JSON)
 */
export async function decryptObject<T>(encryptedData: string, password: string): Promise<T> {
  const json = await decrypt(encryptedData, password)
  return JSON.parse(json)
}

/**
 * Generate a secure encryption key from user ID and a secret
 * This creates a consistent key for a user without storing it
 */
export function generateUserKey(userId: string, userSecret: string): string {
  // Combine user ID with their secret (could be password hash or separate PIN)
  return `${userId}:${userSecret}`
}

/**
 * Check if data appears to be encrypted (base64 with minimum length)
 */
export function isEncrypted(data: string): boolean {
  if (!data || data.length < SALT_LENGTH + IV_LENGTH + 16) return false
  try {
    atob(data)
    return true
  } catch {
    return false
  }
}

// Finance-specific encrypted data types
export interface EncryptedFinanceAccount {
  id: string
  user_id: string
  encrypted_data: string // Contains: name, type, balance, currency, notes
  created_at: string
  updated_at: string
}

export interface FinanceAccountData {
  name: string
  type: 'cash' | 'checking' | 'savings' | 'investment' | 'crypto' | 'property' | 'debt' | 'other'
  balance: number
  currency: string
  institution?: string
  notes?: string
  is_asset: boolean // true for assets, false for liabilities
  last_updated: string
}

export interface EncryptedFinanceTransaction {
  id: string
  user_id: string
  encrypted_data: string // Contains: amount, description, category, etc.
  date: string // Keep date unencrypted for sorting/filtering
  created_at: string
}

export interface FinanceTransactionData {
  amount: number
  description: string
  category: string
  type: 'income' | 'expense' | 'transfer'
  account_id?: string
  to_account_id?: string // For transfers
  tags?: string[]
  notes?: string
}

export interface EncryptedNetWorthSnapshot {
  id: string
  user_id: string
  encrypted_data: string // Contains: total_assets, total_liabilities, net_worth, breakdown
  date: string
  created_at: string
}

export interface NetWorthSnapshotData {
  total_assets: number
  total_liabilities: number
  net_worth: number
  breakdown: {
    account_id: string
    name: string
    type: string
    balance: number
  }[]
}
