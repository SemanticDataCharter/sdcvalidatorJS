/**
 * Convenience functions example
 *
 * This example shows how to use the simplified convenience functions
 * for common validation tasks.
 */

import { validateWithRecovery, isValid, iterErrors } from 'sdcvalidator';

async function main() {
  console.log('=== Convenience Functions Example ===\n');

  const schemaPath = './path/to/schema.xsd';
  const xmlPath = './path/to/data.xml';
  const outputPath = './path/to/recovered.xml';

  // Example 1: Quick validation check
  console.log('1. Checking if XML is valid...');
  const valid = await isValid(schemaPath, xmlPath);
  console.log(`   Valid: ${valid}`);

  if (!valid) {
    // Example 2: Quick iteration over errors
    console.log('\n2. Listing validation errors...');
    let count = 0;
    for await (const error of iterErrors(schemaPath, xmlPath)) {
      console.log(`   [${error.exceptionalValueType}] ${error.xpath}`);
      console.log(`     ${error.reason}`);
      count++;
      if (count >= 3) {
        console.log('   ... (showing first 3 errors)');
        break;
      }
    }

    // Example 3: Quick recovery with save
    console.log('\n3. Recovering XML with ExceptionalValues...');
    await validateWithRecovery(schemaPath, xmlPath, outputPath, {
      namespacePrefix: 'sdc4',
      validation: 'lax',
    });
    console.log(`   Recovered XML saved to: ${outputPath}`);
  }

  // Example 4: Recovery without saving
  console.log('\n4. Getting recovered DOM...');
  const doc = await validateWithRecovery(schemaPath, xmlPath);
  console.log(`   Document element: ${doc.documentElement.nodeName}`);
  console.log(`   Child nodes: ${doc.documentElement.childNodes.length}`);

  console.log('\n=== Example Complete ===');
}

// Run example
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
