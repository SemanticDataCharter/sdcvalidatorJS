#!/usr/bin/env node

/**
 * CLI entry point for sdcvalidate command
 *
 * @module cli
 */

/* eslint-disable no-console */

import { Command } from 'commander';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SDC4Validator } from '../sdc4/validator.js';

// Get package.json for version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../../package.json');

async function getVersion(): Promise<string> {
  try {
    const pkg = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    return pkg.version;
  } catch {
    return '4.0.0';
  }
}

async function main(): Promise<void> {
  const version = await getVersion();

  const program = new Command();

  program
    .name('sdcvalidate')
    .description('SDC4 validator with ExceptionalValue recovery')
    .version(version);

  program
    .argument('<xml-file>', 'XML file to validate')
    .requiredOption('-s, --schema <file>', 'XSD schema file')
    .option('-r, --recover', 'Enable recovery mode (inject ExceptionalValues)')
    .option('-o, --output <file>', 'Output file for recovered XML')
    .option('--report', 'Generate JSON validation report')
    .option('--check', 'Check validity only (exit code 0 = valid, 1 = invalid)')
    .option('-p, --prefix <prefix>', 'Namespace prefix for ExceptionalValues', 'sdc4')
    .option('-v, --verbose', 'Verbose output')
    .action(async (xmlFile, options) => {
      try {
        // Create validator
        const validator = new SDC4Validator({
          schema: options.schema,
          namespacePrefix: options.prefix,
          validation: 'lax',
        });

        // Check mode
        if (options.check) {
          const report = await validator.validateAndReport(xmlFile);
          if (options.verbose) {
            console.log(`Valid: ${report.valid}`);
            console.log(`Errors: ${report.errorCount}`);
          }
          process.exit(report.valid ? 0 : 1);
        }

        // Report mode
        if (options.report) {
          const report = await validator.validateAndReport(xmlFile);
          console.log(JSON.stringify(report, null, 2));
          return;
        }

        // Recover mode
        if (options.recover) {
          if (!options.output) {
            console.error('Error: --output is required with --recover');
            process.exit(1);
          }

          await validator.saveRecoveredXML(options.output, xmlFile);

          if (options.verbose) {
            console.log(`Recovered XML saved to: ${options.output}`);
          }
          return;
        }

        // Default: simple validation with error list
        const report = await validator.validateAndReport(xmlFile);
        console.log(`Valid: ${report.valid}`);
        console.log(`Errors: ${report.errorCount}`);

        if (report.errorCount > 0) {
          console.log('\nError summary:');
          for (const [type, count] of Object.entries(report.exceptionalValueTypeCounts)) {
            if (count > 0) {
              console.log(`  ${type}: ${count}`);
            }
          }

          if (options.verbose) {
            console.log('\nDetailed errors:');
            for (const error of report.errors) {
              console.log(`  ${error.xpath}: ${error.reason}`);
            }
          }
        }
      } catch (error) {
        const err = error as Error;
        console.error(`Error: ${err.message}`);
        if (options.verbose && err.stack) {
          console.error(err.stack);
        }
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
