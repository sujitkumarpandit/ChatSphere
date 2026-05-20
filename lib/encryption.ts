import nacl from 'tweetnacl'

// Use built-in methods
const { randomBytes, box, secretbox } = nacl

// Base64 encoding/decoding utilities
function encodeBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64')
}

function decodeBase64(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, 'base64'))
}

function encodeUTF8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

function decodeUTF8(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

export interface EncryptionKeyPair {
  publicKey: string
  privateKey: string
}

export function generateKeyPair(): EncryptionKeyPair {
  const { publicKey, secretKey } = box.keyPair()
  return {
    publicKey: encodeBase64(publicKey),
    privateKey: encodeBase64(secretKey),
  }
}

export function encryptMessage(message: string, recipientPublicKey: string, senderPrivateKey: string): string {
  const pubKey = decodeBase64(recipientPublicKey)
  const privKey = decodeBase64(senderPrivateKey)
  const nonce = randomBytes(box.nonceLength)
  const messageBytes = decodeUTF8(message)

  const encrypted = box(messageBytes, nonce, pubKey, privKey)
  const encryptedMessage = encodeBase64(nonce) + ':' + encodeBase64(encrypted)

  return encryptedMessage
}

export function decryptMessage(encryptedMessage: string, senderPublicKey: string, recipientPrivateKey: string): string {
  try {
    const [nonceStr, encryptedStr] = encryptedMessage.split(':')
    const nonce = decodeBase64(nonceStr)
    const encrypted = decodeBase64(encryptedStr)
    const pubKey = decodeBase64(senderPublicKey)
    const privKey = decodeBase64(recipientPrivateKey)

    const decrypted = box.open(encrypted, nonce, pubKey, privKey)

    if (!decrypted) {
      throw new Error('Failed to decrypt message')
    }

    return encodeUTF8(decrypted)
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt message')
  }
}

export function encryptSymmetric(message: string, key: Uint8Array): string {
  const nonce = randomBytes(secretbox.nonceLength)
  const messageBytes = decodeUTF8(message)
  const encrypted = secretbox(messageBytes, nonce, key)

  return encodeBase64(nonce) + ':' + encodeBase64(encrypted)
}

export function decryptSymmetric(encryptedMessage: string, key: Uint8Array): string {
  const [nonceStr, encryptedStr] = encryptedMessage.split(':')
  const nonce = decodeBase64(nonceStr)
  const encrypted = decodeBase64(encryptedStr)

  const decrypted = secretbox.open(encrypted, nonce, key)

  if (!decrypted) {
    throw new Error('Failed to decrypt message')
  }

  return encodeUTF8(decrypted)
}
