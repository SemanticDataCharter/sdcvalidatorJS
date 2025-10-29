/**
 * Custom error mapping example
 *
 * This example shows how to customize error classification
 * by adding custom rules to the ErrorMapper.
 */

import { SDC4Validator, ErrorMapper, ExceptionalValueType } from 'sdcvalidator';

async function main() {
  console.log('=== Custom Error Mapping Example ===\n');

  // Create custom error mapper
  const errorMapper = new ErrorMapper();

  // Add custom rule: Mark "sensitive" errors as Masked (MSK)
  console.log('1. Adding custom rule for sensitive data...');
  errorMapper.addRule(
    (error) => {
      const msg = error.message.toLowerCase();
      return msg.includes('sensitive') || msg.includes('confidential') || msg.includes('private');
    },
    ExceptionalValueType.MSK,
    5 // High priority
  );

  // Add custom rule: Mark "calculated" errors as Derived (DER)
  console.log('2. Adding custom rule for calculated fields...');
  errorMapper.addRule(
    (error) => {
      return error.path?.includes('calculated') || error.message.includes('computed');
    },
    ExceptionalValueType.DER,
    10
  );

  // Add custom rule: Mark "future" errors as Not Available (NAV)
  console.log('3. Adding custom rule for future data...');
  errorMapper.addRule(
    (error) => {
      return error.message.toLowerCase().includes('future date');
    },
    ExceptionalValueType.NAV,
    15
  );

  console.log(`\n   Total rules: ${errorMapper.getRuleCount()}`);

  // Create validator with custom error mapper
  const validator = new SDC4Validator({
    schema: './path/to/schema.xsd',
    errorMapper: errorMapper,
    validation: 'lax',
  });

  // Test custom mapping
  console.log('\n4. Testing custom error mapping...');
  const report = await validator.validateAndReport('./path/to/data.xml');

  console.log(`   Total errors: ${report.errorCount}`);
  console.log('\n   Error type distribution:');
  for (const [type, count] of Object.entries(report.exceptionalValueTypeCounts)) {
    if (count > 0) {
      console.log(`     ${type}: ${count}`);
    }
  }

  // Show some example mappings
  if (report.errors.length > 0) {
    console.log('\n   Example errors with custom mappings:');
    report.errors.slice(0, 5).forEach((error) => {
      console.log(`     [${error.exceptionalValueType}] ${error.exceptionalValueName}`);
      console.log(`       Path: ${error.xpath}`);
      console.log(`       Reason: ${error.reason}`);
      console.log();
    });
  }

  console.log('=== Example Complete ===');
}

// Run example
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
