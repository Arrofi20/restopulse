const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const examplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
  fs.copyFileSync(examplePath, envPath);
  console.log('.env created from .env.example — update with your values if needed');
} else if (fs.existsSync(envPath)) {
  console.log('.env already exists');
} else {
  console.warn('Warning: No .env or .env.example found');
}
