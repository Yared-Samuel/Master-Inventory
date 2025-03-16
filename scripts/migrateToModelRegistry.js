/**
 * Migration Script: Direct Model Imports to Centralized Model Registry
 * 
 * This script helps identify files that are still using direct model imports
 * and provides guidance on how to update them to use the centralized model registry.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the root directory of the project
const rootDir = path.resolve(__dirname, '..');

// Define the model mappings
const modelMappings = {
  '@/models/userModel': 'getUserModel',
  '@/models/companyModel': 'getCompanyModel',
  '@/models/productModel': 'getProductModel',
  '@/models/storeList': 'getStoreListModel',
  '@/models/sellingPriceModel': 'getSellingPriceModel',
  '@/models/inventoryModel': 'getInventoryModel',
  '@/models/tokenModel': 'getTokenModel',
  '@/models/productCategoryModel': 'getProductCategoryModel'
};

// Find files that import directly from models
function findDirectModelImports() {
  console.log('Searching for files with direct model imports...');
  
  const results = {};
  
  for (const modelPath of Object.keys(modelMappings)) {
    try {
      // Use grep to find files that import from this model path
      const grepCommand = `grep -r "import.*${modelPath}" --include="*.js" ${rootDir}`;
      const output = execSync(grepCommand, { encoding: 'utf8' });
      
      // Process the output
      const lines = output.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const [filePath, importStatement] = line.split(':', 2);
        
        if (!filePath || !importStatement) continue;
        
        // Skip the models directory itself
        if (filePath.includes('/models/')) continue;
        
        // Skip the lib/models.js file
        if (filePath.endsWith('lib/models.js')) continue;
        
        // Extract the model name from the import statement
        const modelNameMatch = importStatement.match(/import\s+(\w+)/);
        if (!modelNameMatch) continue;
        
        const modelName = modelNameMatch[1];
        const relativePath = path.relative(rootDir, filePath);
        
        if (!results[relativePath]) {
          results[relativePath] = [];
        }
        
        results[relativePath].push({
          modelPath,
          modelName,
          importStatement: importStatement.trim(),
          replacement: `import { ${modelMappings[modelPath]} } from "@/lib/models";`
        });
      }
    } catch (error) {
      // Ignore errors (e.g., if grep doesn't find any matches)
    }
  }
  
  return results;
}

// Generate migration instructions
function generateMigrationInstructions(results) {
  console.log('\n=== Migration Instructions ===\n');
  console.log(`Found ${Object.keys(results).length} files with direct model imports.\n`);
  
  for (const [filePath, imports] of Object.entries(results)) {
    console.log(`File: ${filePath}`);
    console.log('Changes needed:');
    
    // Group imports by model path to avoid duplicate imports
    const groupedImports = {};
    for (const imp of imports) {
      if (!groupedImports[imp.modelPath]) {
        groupedImports[imp.modelPath] = [];
      }
      groupedImports[imp.modelPath].push(imp);
    }
    
    // Show the import replacements
    for (const [modelPath, imps] of Object.entries(groupedImports)) {
      console.log(`  Replace: ${imps[0].importStatement}`);
      console.log(`  With:    ${imps[0].replacement}`);
    }
    
    // Show the model usage replacements
    console.log('  In the code, replace:');
    for (const imp of imports) {
      console.log(`    ${imp.modelName} => ${modelMappings[imp.modelPath]}()`);
    }
    
    console.log('');
  }
  
  console.log('Migration Steps:');
  console.log('1. Update the imports at the top of each file');
  console.log('2. Replace direct model usage with the getter function calls');
  console.log('3. Add the model initialization at the beginning of your handler functions:');
  console.log('   ```');
  console.log('   const User = getUserModel();');
  console.log('   const Product = getProductModel();');
  console.log('   ```');
  console.log('4. Test thoroughly after each file update');
}

// Main function
function main() {
  console.log('Model Registry Migration Helper');
  console.log('==============================\n');
  
  const results = findDirectModelImports();
  generateMigrationInstructions(results);
}

main(); 