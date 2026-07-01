export interface GeminiConfig {
  configured: boolean;
  source: 'database' | 'env' | 'none';
  model: string;
  lastUpdated: string | null;
  maskedKey: string | null;
}

export interface GeminiTestResult {
  success: boolean;
  message: string;
}

export interface GeminiConfigResponse {
  success: boolean;
  data: GeminiConfig;
}

export interface GeminiTestResponse {
  success: boolean;
  data: GeminiTestResult;
}

export interface GeminiSaveResponse {
  success: boolean;
  data: { message: string };
}

export interface GeminiModelsResponse {
  success: boolean;
  data: string[];
}
