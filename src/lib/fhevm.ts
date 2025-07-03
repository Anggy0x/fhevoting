import { BrowserProvider } from 'ethers';

// Import fhevmjs untuk client-side encryption
declare global {
  interface Window {
    fhevmjs?: any;
  }
}

export class FHEVMClient {
  private instance: any = null;
  private provider: BrowserProvider | null = null;
  private isReady: boolean = false;

  async init(provider: BrowserProvider): Promise<void> {
    this.provider = provider;
    
    try {
      // Dynamic import untuk fhevmjs
      const { createInstance } = await import('fhevmjs');
      
      // Get network info
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      console.log('Initializing FHEVM for chain:', chainId);
      
      if (chainId !== 11155111) {
        console.warn('FHEVM is optimized for Sepolia (11155111), current chain:', chainId);
      }

      // Create instance for Sepolia with Zama configuration
      this.instance = await createInstance({
        chainId: 11155111, // Sepolia
        publicKey: await this.getPublicKey(),
      });
      
      this.isReady = true;
      console.log('✅ FHEVM client initialized successfully');
    } catch (error) {
      console.error('FHEVM initialization failed:', error);
      this.isReady = false;
      throw error;
    }
  }

  private async getPublicKey(): Promise<string> {
    // In production, this would fetch the public key from Zama's infrastructure
    // For now, we'll use a placeholder or fetch from a known endpoint
    try {
      // This should be the actual public key from Zama's Sepolia deployment
      // You would typically fetch this from a known endpoint or hardcode it
      return "0x..."; // Placeholder - replace with actual public key
    } catch (error) {
      console.warn('Could not fetch public key, using fallback');
      return "0x..."; // Fallback public key
    }
  }

  async encrypt32(value: number): Promise<{ data: Uint8Array; proof: Uint8Array }> {
    if (!this.isReady || !this.instance) {
      throw new Error('FHEVM instance not initialized');
    }

    try {
      // Encrypt the value using fhevmjs
      const encrypted = this.instance.encrypt32(value);
      
      return {
        data: encrypted.data,
        proof: encrypted.proof || new Uint8Array(0)
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt value');
    }
  }

  async encryptVote(vote: number): Promise<{ encryptedVote: Uint8Array; proof: Uint8Array }> {
    if (vote !== 0 && vote !== 1) {
      throw new Error('Vote must be 0 or 1');
    }

    const encrypted = await this.encrypt32(vote);
    return {
      encryptedVote: encrypted.data,
      proof: encrypted.proof
    };
  }

  isInitialized(): boolean {
    return this.isReady && this.instance !== null;
  }

  getInstance() {
    return this.instance;
  }

  // Helper method untuk convert Uint8Array ke hex string
  toHexString(bytes: Uint8Array): string {
    return '0x' + Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  // Helper method untuk convert hex string ke Uint8Array
  fromHexString(hex: string): Uint8Array {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes;
  }

  // Create external input format for contract
  createExternalInput(encryptedData: Uint8Array): string {
    return this.toHexString(encryptedData);
  }
}

export const fhevmClient = new FHEVMClient();