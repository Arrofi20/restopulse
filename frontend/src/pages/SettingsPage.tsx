import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useToast, ToastContainer } from '../components/ui/Toast';
import { Spinner } from '../components/ui/Spinner';
import type { GeminiTestResult } from '../types/settings';

export function SettingsPage() {
  const { config, loading, error, models, saveKey, saveModel, deleteKey, testConnection } = useSettings();
  const { showToast } = useToast();

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testResult, setTestResult] = useState<GeminiTestResult | null>(null);
  const [selectedModel, setSelectedModel] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    setSaving(true);
    setTestResult(null);
    try {
      await saveKey(apiKeyInput.trim());
      showToast('success', 'API key berhasil disimpan');
      setApiKeyInput('');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Gagal menyimpan API key');
    } finally {
      setSaving(false);
    }
  };

  const handleModelChange = async (model: string) => {
    setSelectedModel(model);
    try {
      await saveModel(model);
      showToast('success', `Model diubah ke ${model}`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Gagal menyimpan model');
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection();
      setTestResult(result);
      if (result.success) {
        showToast('success', 'Koneksi Gemini berhasil');
      } else {
        showToast('error', result.message);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menguji koneksi';
      setTestResult({ success: false, message: msg });
      showToast('error', msg);
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Hapus API key yang tersimpan? Sistem akan kembali menggunakan .env jika tersedia.')) return;
    setDeleting(true);
    try {
      await deleteKey();
      showToast('success', 'API key dihapus');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Gagal menghapus API key');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner />
        <span className="ml-3 text-gray-400">Memuat pengaturan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-950/30 p-4 text-red-300">
        {error}
      </div>
    );
  }

  const sourceLabel = config?.source === 'database' ? 'Database (Web UI)' : config?.source === 'env' ? '.env' : 'Tidak dikonfigurasi';
  const sourceColor = config?.source === 'database' ? 'text-green-400' : config?.source === 'env' ? 'text-yellow-400' : 'text-gray-500';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">Kelola konfigurasi Gemini AI</p>
      </div>

      <ToastContainer toasts={[]} onDismiss={() => {}} />

      {/* Gemini AI Configuration Status */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Gemini AI Configuration</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Status</div>
            <div className={`mt-1 font-medium ${config?.configured ? 'text-green-400' : 'text-red-400'}`}>
              {config?.configured ? '✓ Aktif' : '✗ Tidak Aktif'}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Sumber API Key</div>
            <div className={`mt-1 font-medium ${sourceColor}`}>{sourceLabel}</div>
          </div>
          <div>
            <div className="text-gray-400">Model</div>
            <div className="mt-1 font-medium text-white">{config?.model || 'gemini-2.5-flash'}</div>
          </div>
          <div>
            <div className="text-gray-400">Terakhir Diperbarui</div>
            <div className="mt-1 font-medium text-gray-300">
              {config?.lastUpdated
                ? new Date(config.lastUpdated).toLocaleString('id-ID')
                : '-'}
            </div>
          </div>
        </div>

        {config?.maskedKey && (
          <div>
            <div className="text-gray-400 text-sm">API Key</div>
            <div className="mt-1 font-mono text-sm text-gray-300 bg-gray-800 rounded px-3 py-2">
              {config.maskedKey}
            </div>
          </div>
        )}
      </div>

      {/* Model Selection */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Model Gemini</h3>
        <select
          value={selectedModel || config?.model || 'gemini-2.5-flash'}
          onChange={(e) => handleModelChange(e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
        >
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          gemini-2.5-flash: Cepat dan hemat kuota. gemini-2.5-pro: Lebih akurat tetapi lebih lambat.
        </p>
      </div>

      {/* API Key Input */}
      <form onSubmit={handleSave} className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">API Key</h3>

        <div>
          <label htmlFor="apiKey" className="mb-1 block text-sm text-gray-400">
            Gemini API Key
          </label>
          <div className="flex gap-2">
            <input
              id="apiKey"
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Masukkan API key dari Google AI Studio"
              className="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 min-h-[44px]"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="rounded bg-gray-700 px-3 py-2.5 text-sm text-white transition-colors hover:bg-gray-600 min-h-[44px]"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Dapatkan API key gratis di{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!apiKeyInput.trim() || saving}
            className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-50 min-h-[44px]"
          >
            {saving ? 'Menyimpan...' : 'Simpan API Key'}
          </button>
          {config?.source === 'database' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-800/50 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-800 hover:text-white disabled:opacity-50 min-h-[44px]"
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </button>
          )}
        </div>
      </form>

      {/* Test Connection */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Test Koneksi</h3>
        <button
          type="button"
          onClick={handleTest}
          disabled={testing || !config?.configured}
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
        >
          {testing ? (
            <>
              <Spinner />
              <span>Menguji koneksi...</span>
            </>
          ) : (
            'Test Connection'
          )}
        </button>

        {testResult && (
          <div
            className={`rounded-lg p-4 text-sm ${
              testResult.success
                ? 'border border-green-700 bg-green-900/30 text-green-300'
                : 'border border-red-700 bg-red-900/30 text-red-300'
            }`}
          >
            {testResult.success ? '✅ ' : '❌ '}
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
}
