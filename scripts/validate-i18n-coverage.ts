import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';

/**
 * Recursively get all keys from an object
 */
function getAllKeys(obj: any, prefix: string = ''): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Validate that all keys in en.json exist in es.json
 */
function validateCoverage() {
  const enKeys = getAllKeys(enTranslations);
  const esKeys = getAllKeys(esTranslations);

  const missingKeys = enKeys.filter(key => !esKeys.includes(key));

  if (missingKeys.length > 0) {
    console.error('❌ Missing translation keys in es.json:');
    missingKeys.forEach(key => {
      console.error(`  - ${key}`);
    });
    process.exit(1);
  }

  console.log('✅ All translation keys are covered in both en.json and es.json');
  console.log(`   Total keys: ${enKeys.length}`);
}

validateCoverage();
