export interface Route {
  _id?: string;
  name: string;
  path: string;
  method: string[];
  targets: {
    url: string;
    weight: number;
    healthCheck: boolean;
  }[];
  loadBalancer?: {
    algorithm: string;
    healthCheckInterval: number;
  };
  stripPath: boolean;
  preserveHost: boolean;
  timeout: number;
  active: boolean;
  requireAuth: boolean;
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Consumer {
  _id?: string;
  name: string;
  email: string;
  customId?: string;
  tags: string[];
  metadata?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiKey {
  _id?: string;
  keyHash: string;
  keyPrefix: string;
  consumer: {
    consumerId: string;
    name: string;
  };
  name?: string;
  rateLimit: {
    requests: number;
    window: string;
  };
  routes: string[];
  createdAt?: string;
  expiresAt?: string;
  lastUsedAt?: string;
  active: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
