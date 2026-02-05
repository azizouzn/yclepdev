
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const filesToDelete = [
  // Legacy Folders (Next.js / App Router artifacts not needed in Vite)
  'app', 
  'db', // Removed in favor of root database_schema.sql
  
  // Redundant Services (Replaced by api/_lib/*)
  'services/geminiService.ts', 
  'api/_lib/openaiService.ts',
  'api/_lib/huggingfaceService.ts',
  
  // Redundant / Wrapper Components
  'components/icons/PublicSite.tsx',
  'components/InteractiveShowcase.tsx',
  'components/ApiKeySetup.tsx',
  'components/ApiKeyWarning.tsx',
  'components/SetupGuide.tsx',
  'components/ProductReviewPage.tsx',
  'components/ProductDetailSidebar.tsx',
  'components/LandingPage.tsx',
  'components/ClientList.tsx',
  
  // Temporary / Development Files
  'untitled.tsx',
  'untitled-1.tsx',
  'NOTES.md',
  'site.html',
  'site.tsx',
  'utils/mock_analysis_result.json',
  'requirements.txt',
  'docker-compose.yml'
];

console.log('🧹 Starting Deep Project Cleanup...');

filesToDelete.forEach(file => {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Deleted: ${file}`);
    } catch (e) {
      console.error(`❌ Failed to delete ${file}:`, e.message);
    }
  }
});

console.log('\n✨ Project structure optimized! Switched to config.env.');
