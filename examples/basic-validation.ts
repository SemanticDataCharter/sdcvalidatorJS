/**
 * Basic SDC4 validation example
 *
 * This example demonstrates the basic usage of the SDC4Validator
 * to validate XML documents and inject ExceptionalValue elements.
 */

import { SDC4Validator } from 'sdcvalidator';

async function main() {
  console.log('=== Basic SDC4 Validation Example ===\n');

  // Create validator with schema
  const validator = new SDC4Validator({
    schema: './path/to/schema.xsd',
    validation: 'lax', // Collect all errors
  });

  // Example 1: Validate and get report
  console.log('1. Generating validation report...');
  const report = await validator.validateAndReport('./path/to/data.xml');

  console.log(`   Valid: ${report.valid}`);
  console.log(`   Total Errors: ${report.errorCount}`);

  if (report.errorCount > 0) {
    console.log('\n   Error breakdown:');
    for (const [type, count] of Object.entries(report.exceptionalValueTypeCounts)) {
      if (count > 0) {
        console.log(`     ${type}: ${count}`);
      }
    }

    console.log('\n   First few errors:');
    report.errors.slice(0, 3).forEach((error) => {
      console.log(`     [${error.exceptionalValueType}] ${error.xpath}`);
      console.log(`       ${error.reason}`);
    });
  }

  // Example 2: Validate with recovery
  console.log('\n2. Validating with recovery...');
  const recoveredDoc = await validator.validateWithRecovery('./path/to/data.xml');
  console.log('   ExceptionalValue elements injected into DOM');

  // Example 3: Save recovered XML
  console.log('\n3. Saving recovered XML...');
  await validator.saveRecoveredXML('./path/to/recovered.xml', './path/to/data.xml', {
    prettyPrint: true,
    encoding: 'UTF-8',
  });
  console.log('   Recovered XML saved to recovered.xml');

  // Example 4: Iterate over errors
  console.log('\n4. Iterating over errors...');
  let errorCount = 0;
  for await (const error of validator.iterErrorsWithMapping('./path/to/data.xml')) {
    console.log(`   [${error.exceptionalValueType}] ${error.xpath}: ${error.reason}`);
    errorCount++;
    if (errorCount >= 5) {
      console.log('   ... (showing first 5 errors)');
      break;
    }
  }

  console.log('\n=== Example Complete ===');
}

// Run example
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
