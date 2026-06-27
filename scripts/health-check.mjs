#!/usr/bin/env node

const DEFAULT_URL = 'http://localhost:3000/health';
const url = process.argv[2] || DEFAULT_URL;

const start = performance.now();

try {
  const response = await fetch(url);
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (jsonErr) {
    console.error(`Health check FAILED: Invalid JSON response — ${jsonErr.message}`);
    process.exit(1);
  }

  const elapsed = Math.round(performance.now() - start);

  if (data.status !== 'ok') {
    console.error(`Health check WARNING: status=${data.status}`);
    process.exit(1);
  }

  console.log(
    `Health: ${data.status} | Version: ${data.version ?? 'unknown'} | Env: ${data.environment ?? 'unknown'} | Response Time: ${elapsed}ms`
  );
  process.exit(0);
} catch (err) {
  console.error(`Health check FAILED: ${err.message}`);
  process.exit(1);
}
