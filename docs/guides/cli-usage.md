# CLI Usage Guide

Complete reference for the `sdcvalidate` command-line tool.

## Installation

```bash
npm install -g sdcvalidator
```

## Basic Commands

### Validate XML

```bash
sdcvalidate data.xml --schema schema.xsd
```

### Validate with Recovery

```bash
sdcvalidate data.xml -s schema.xsd --recover -o recovered.xml
```

### Generate JSON Report

```bash
sdcvalidate data.xml -s schema.xsd --report > report.json
```

### Check Validity (Exit Code)

```bash
sdcvalidate data.xml -s schema.xsd --check
echo $?  # 0 = valid, 1 = invalid
```

## Options

- `-s, --schema <file>` - XSD schema file (required)
- `-r, --recover` - Enable recovery mode
- `-o, --output <file>` - Output file for recovered XML
- `--report` - Generate JSON report
- `--check` - Check validity only (exit code)
- `--prefix <prefix>` - Namespace prefix (default: sdc4)
- `--validation <mode>` - Mode: strict, lax, skip
- `-v, --verbose` - Verbose output
- `-h, --help` - Show help
- `-V, --version` - Show version

## Exit Codes

- `0` - Valid or success
- `1` - Invalid (validation errors found)
- `2` - Error (missing args, file not found, etc.)

## Resources

- [Getting Started](./getting-started.md)
- [Error Mapping](./error-mapping.md)
- [API Reference](../api/)
