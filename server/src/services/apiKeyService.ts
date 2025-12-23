import crypto from 'crypto';
import { ApiKey, CreateApiKeyRequest } from '../types/apikey';

class ApiKeyService {
  private apiKeys: Map<string, ApiKey> = new Map();

  generateApiKey(): string {
    return 'gm_' + crypto.randomBytes(32).toString('hex');
  }

  createApiKey(request: CreateApiKeyRequest): ApiKey {
    const id = crypto.randomUUID();
    const key = this.generateApiKey();
    const now = new Date();
    
    const apiKey: ApiKey = {
      id,
      name: request.name,
      key,
      role: request.role,
      created: now,
      expires: request.secondsToLive ? new Date(now.getTime() + request.secondsToLive * 1000) : undefined
    };

    this.apiKeys.set(key, apiKey);
    return apiKey;
  }

  validateApiKey(key: string): ApiKey | null {
    const apiKey = this.apiKeys.get(key);
    if (!apiKey) return null;

    // Check if expired
    if (apiKey.expires && apiKey.expires < new Date()) {
      this.apiKeys.delete(key);
      return null;
    }

    // Update last used
    apiKey.lastUsed = new Date();
    return apiKey;
  }

  getAllApiKeys(): ApiKey[] {
    return Array.from(this.apiKeys.values());
  }

  deleteApiKey(id: string): boolean {
    for (const [key, apiKey] of this.apiKeys.entries()) {
      if (apiKey.id === id) {
        this.apiKeys.delete(key);
        return true;
      }
    }
    return false;
  }

  getApiKeyById(id: string): ApiKey | null {
    for (const apiKey of this.apiKeys.values()) {
      if (apiKey.id === id) {
        return apiKey;
      }
    }
    return null;
  }
}

export const apiKeyService = new ApiKeyService();