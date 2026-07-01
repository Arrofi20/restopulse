import { useState, useCallback, useEffect } from 'react';
import { get, post, del } from '../api/client';
import type {
  GeminiConfig,
  GeminiConfigResponse,
  GeminiSaveResponse,
  GeminiTestResponse,
  GeminiModelsResponse,
} from '../types/settings';

interface UseSettingsResult {
  config: GeminiConfig | null;
  loading: boolean;
  error: string | null;
  models: string[];
  refresh: () => void;
  saveKey: (apiKey: string) => Promise<void>;
  saveModel: (model: string) => Promise<void>;
  deleteKey: () => Promise<void>;
  testConnection: () => Promise<GeminiTestResponse['data']>;
}

export function useSettings(): UseSettingsResult {
  const [config, setConfig] = useState<GeminiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchConfig() {
      setLoading(true);
      setError(null);
      try {
        const [configRes, modelsRes] = await Promise.all([
          get<GeminiConfigResponse>('/settings/gemini'),
          get<GeminiModelsResponse>('/settings/gemini/models'),
        ]);
        if (!cancelled) {
          setConfig(configRes.data);
          setModels(modelsRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat pengaturan');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchConfig();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const saveKey = useCallback(async (apiKey: string) => {
    await post<GeminiSaveResponse>('/settings/gemini', { apiKey });
    refresh();
  }, [refresh]);

  const saveModel = useCallback(async (model: string) => {
    await post<GeminiSaveResponse>('/settings/gemini/model', { model });
    refresh();
  }, [refresh]);

  const deleteKey = useCallback(async () => {
    await del<GeminiSaveResponse>('/settings/gemini');
    refresh();
  }, [refresh]);

  const testConnection = useCallback(async () => {
    const result = await post<GeminiTestResponse>('/settings/gemini/test', {});
    return result.data;
  }, []);

  return {
    config,
    loading,
    error,
    models,
    refresh,
    saveKey,
    saveModel,
    deleteKey,
    testConnection,
  };
}
