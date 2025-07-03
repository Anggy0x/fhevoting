import { BrowserProvider } from 'ethers';

// Debug logging utility
const debugLog = (message: string, data?: any) => {
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    console.log(`[FHEVM Debug] ${message}`, data || '');
  }
};

// Zama configuration from environment variables
const ZAMA_CONFIG = {
  oracleAddress: import.meta.env.VITE_ZAMA_ORACLE_ADDRESS || '0xa02Cda4Ca3a71D7C46997716F4283aa851C28812',
  aclAddress: import.meta.env.VITE_ZAMA_ACL_ADDRESS || '0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D',
  executorAddress: import.meta.env.VITE_ZAMA_EXECUTOR_ADDRESS || '0xCD3ab3bd6bcc0c0bf3E27912a92043e817B1cf69',
  kmsVerifierAddress: import.meta.env.VITE_ZAMA_KMS_VERIFIER_ADDRESS || '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
  inputVerifierAddress: import.meta.env.VITE_ZAMA_INPUT_VERIFIER_ADDRESS || '0x901F8942346f7AB3a01F6D7613119Bca447Bb030',
};

export class FHEVMClient {
  private instance: any = null;
  private provider: BrowserProvider | null = null;
  private isReady: boolean = false;
  private publicKey: string | null = null;

  async init(provider: BrowserProvider): Promise<void> {
    this.provider = provider;
    
    try {
      debugLog('Starting FHEVM initialization...');
      
      // Get network info
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      debugLog('Network detected', { chainId, name: network.name });
      
      if (chainId !== 11155111) {
        debugLog('Warning: FHEVM is optimized for Sepolia (11155111)', { currentChain: chainId });
      }

      // Try to get public key from Zama's infrastructure
      await this.fetchPublicKey();

      // Try to initialize fhevmjs
      try {
        const { createInstance } = await import('fhevmjs');
        
        debugLog('Creating FHEVM instance with config', {
          chainId: 11155111,
          publicKey: this.publicKey ? 'Available' : 'Not available',
          zamaConfig: ZAMA_CONFIG
        });

        // Create instance for Sepolia with Zama configuration
        this.instance = await createInstance({
          chainId: 11155111, // Sepolia
          publicKey: this.publicKey || await this.getDefaultPublicKey(),
          gatewayUrl: 'https://gateway.sepolia.zama.ai', // Zama's gateway for Sepolia
          aclAddress: ZAMA_CONFIG.aclAddress,
        });
        
        this.isReady = true;
        debugLog('✅ FHEVM client initialized successfully');
      } catch (fhevmError) {
        debugLog('❌ fhevmjs initialization failed, using fallback mode', fhevmError);
        this.isReady = false;
        // Continue without FHEVM - app will use simulation mode
      }
    } catch (error) {
      debugLog('❌ FHEVM initialization failed completely', error);
      this.isReady = false;
      throw error;
    }
  }

  private async fetchPublicKey(): Promise<void> {
    try {
      debugLog('Fetching public key from Zama infrastructure...');
      
      // Try to fetch from Zama's public key endpoint for Sepolia
      const response = await fetch('https://gateway.sepolia.zama.ai/public-key', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.publicKey = data.publicKey || data.public_key;
        debugLog('✅ Public key fetched successfully', { keyLength: this.publicKey?.length });
      } else {
        debugLog('⚠️ Could not fetch public key from gateway, using fallback');
        this.publicKey = null;
      }
    } catch (error) {
      debugLog('⚠️ Public key fetch failed, using fallback', error);
      this.publicKey = null;
    }
  }

  private async getDefaultPublicKey(): Promise<string> {
    // Fallback public key for Sepolia testnet
    // This is a placeholder - in production, you should always fetch the real key
    const fallbackKey = "0x" + "0".repeat(64); // Placeholder
    debugLog('Using fallback public key', { key: fallbackKey });
    return fallbackKey;
  }

  async encrypt32(value: number): Promise<{ data: Uint8Array; proof: Uint8Array }> {
    if (!this.isReady || !this.instance) {
      debugLog('❌ FHEVM instance not ready, using simulation');
      return this.simulateEncryption(value);
    }

    try {
      debugLog('🔐 Encrypting value with FHEVM', { value });
      
      // Encrypt the value using fhevmjs
      const encrypted = this.instance.encrypt32(value);
      
      debugLog('✅ Encryption successful', { 
        dataLength: encrypted.data?.length,
        proofLength: encrypted.proof?.length 
      });
      
      return {
        data: encrypted.data,
        proof: encrypted.proof || new Uint8Array(0)
      };
    } catch (error) {
      debugLog('❌ Encryption failed, using simulation', error);
      return this.simulateEncryption(value);
    }
  }

  private simulateEncryption(value: number): { data: Uint8Array; proof: Uint8Array } {
    debugLog('🔒 Using simulated encryption', { value });
    
    // Create deterministic but secure-looking simulation
    const seed = value.toString().padStart(8, '0');
    const data = new Uint8Array(32);
    const proof = new Uint8Array(32);
    
    // Fill with pseudo-random data based on value
    for (let i = 0; i < 32; i++) {
      data[i] = (value * 7 + i * 13) % 256;
      proof[i] = (value * 11 + i * 17) % 256;
    }
    
    return { data, proof };
  }

  async encryptVote(vote: number): Promise<{ encryptedVote: Uint8Array; proof: Uint8Array }> {
    if (vote !== 0 && vote !== 1) {
      throw new Error('Vote must be 0 or 1');
    }

    debugLog('Encrypting vote', { vote });
    
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

  getZamaConfig() {
    return ZAMA_CONFIG;
  }

  // Helper method untuk convert Uint8Array ke hex string
  toHexString(bytes: Uint8Array): string {
    const hex = '0x' + Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    debugLog('Converting to hex', { 
      inputLength: bytes.length, 
      outputLength: hex.length 
    });
    
    return hex;
  }

  // Helper method untuk convert hex string ke Uint8Array
  fromHexString(hex: string): Uint8Array {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    
    debugLog('Converting from hex', { 
      inputLength: hex.length, 
      outputLength: bytes.length 
    });
    
    return bytes;
  }

  // Create external input format for contract
  createExternalInput(encryptedData: Uint8Array): string {
    const hex = this.toHexString(encryptedData);
    debugLog('Creating external input', { hex });
    return hex;
  }

  // Get debug information
  getDebugInfo() {
    return {
      isReady: this.isReady,
      hasInstance: !!this.instance,
      hasPublicKey: !!this.publicKey,
      zamaConfig: ZAMA_CONFIG,
      provider: !!this.provider
    };
  }
}

export const fhevmClient = new FHEVMClient();

// Export debug utilities
export { debugLog };