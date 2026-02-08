/**
 * Dependency Scanning Configuration
 * npm audit, Snyk, Dependabot for vulnerability detection
 */

/**
 * npm audit configuration
 * Run: npm audit
 * Run with fix: npm audit fix
 */
export const npmAuditConfig = {
  // npm audit runs automatically on npm install in npm 6+
  // Check for vulnerabilities
  command: "npm audit",

  // Fix vulnerabilities automatically
  fixCommand: "npm audit fix",

  // Audit with JSON output for CI/CD
  ciCommand: "npm audit --json > audit-results.json",
};

/**
 * Snyk configuration (premium security scanning)
 * Install: npm install -g snyk
 * Authenticate: snyk auth
 * Scan: snyk test
 */
export const snykConfig = {
  enabled: process.env.SNYK_TOKEN ? true : false,

  // .snyk policy file for Snyk
  policyPath: ".snyk",

  // Scan command
  scanCommand: "snyk test --severity-threshold=high",

  // Monitor for ongoing vulnerability detection
  monitorCommand: "snyk monitor",

  // Protect from known vulnerabilities
  protectCommand: "snyk protect",
};

/**
 * Dependabot configuration (GitHub)
 * Requires: .github/dependabot.yml
 */
export const dependabotConfig = {
  version: 2,
  updates: [
    {
      // npm dependencies
      "package-ecosystem": "npm",
      directory: "/",
      schedule: {
        interval: "weekly",
      },
      "open-pull-requests-limit": 5,
      reviewers: ["@security-team"],
      "commit-message": {
        prefix: "chore(deps):",
      },
    },
    {
      // GitHub Actions
      "package-ecosystem": "github-actions",
      directory: "/",
      schedule: {
        interval: "weekly",
      },
    },
  ],
};

/**
 * GitHub Dependabot YAML (for .github/dependabot.yml)
 */
export const dependabotYAML = `
version: 2
updates:
  # npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "03:00"
    open-pull-requests-limit: 5
    reviewers:
      - "security-team"
    commit-message:
      prefix: "chore(deps):"
      prefix-development: "chore(deps-dev):"
      include: "scope"
    allow:
      - dependency-type: "all"
    ignore:
      # Ignore major version upgrades for stable versions
      - dependency-name: "next"
        update-types: ["version-update:semver-major"]

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"

  # Docker
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
`;

/**
 * OWASP Dependency Check configuration
 * Install: npm install --save-dev owasp-dependency-check
 */
export const owaspDependencyCheckConfig = {
  // Scan command
  scanCommand: 'dependency-check --scan . --format JSON --project "Kashcraft"',

  // Fail on CVSS score
  failOnCVSS: 7, // Critical vulnerabilities

  // Suppress known vulnerabilities
  suppressions: [
    // Add suppression rules here after review
    // {
    //   "until": "2025-12-31",
    //   "reason": "False positive - not applicable to this project",
    //   "cve": "CVE-2024-XXXX"
    // }
  ],
};

/**
 * GitHub Security Settings (for repository)
 */
export const githubSecuritySettings = {
  // Enable security alerts
  enableSecurityAlerts: true,

  // Enable Dependabot alerts
  enableDependabotAlerts: true,

  // Enable Dependabot security updates
  enableDependabotSecurityUpdates: true,

  // Enable code scanning with CodeQL
  enableCodeScanning: true,

  // Secret scanning
  enableSecretScanning: true,

  // Branch protection rules
  branchProtection: {
    requireCodeReview: true,
    requiredReviewCount: 1,
    dismissStaleReviews: true,
    requireStatusChecks: true,
    requireBranchUpToDate: true,
  },
};

/**
 * Pre-commit Git Hook for security scanning
 * Save as: .husky/pre-commit
 */
export const preCommitHookScript = `
#!/bin/sh
# Pre-commit hook for security scanning

# Run npm audit
echo "Running npm audit..."
npm audit --audit-level=moderate
if [ $? -ne 0 ]; then
  echo "⚠️  npm audit found vulnerabilities. Run 'npm audit fix' to resolve."
  exit 1
fi

# Run ESLint security plugin
echo "Running security lints..."
npm run lint:security
if [ $? -ne 0 ]; then
  echo "❌ Security linting failed"
  exit 1
fi

# Run type checking
echo "Running type checks..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ Type checking failed"
  exit 1
fi

echo "✅ All security checks passed"
exit 0
`;

/**
 * GitHub Actions Workflow for Security Scanning
 * Save as: .github/workflows/security.yml
 */
export const githubSecurityWorkflow = `
name: Security Scanning

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC

jobs:
  npm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      
      - name: Generate audit report
        if: always()
        run: npm audit --json > audit-results.json
      
      - name: Upload audit report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: audit-results
          path: audit-results.json

  snyk-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  codeql-analysis:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        language: ['javascript', 'typescript']
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: \${{ matrix.language }}
      
      - name: Autobuild
        uses: github/codeql-action/autobuild@v2
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'Kashcraft'
          path: '.'
          format: 'JSON'
          args: >
            --enable-experimental
            --fail-on-cvss 7
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: dependency-check
          path: dependency-check-report.json
`;

/**
 * package.json security scripts
 */
export const securityScripts = {
  audit: "npm audit",
  "audit:fix": "npm audit fix",
  "audit:report": "npm audit --json > audit-results.json",
  "deps:check": "snyk test --severity-threshold=high",
  "deps:fix": "snyk fix",
  "deps:monitor": "snyk monitor",
  "lint:security": "eslint . --plugin security",
  "type-check": "tsc --noEmit",
  "security:check": "npm run audit && npm run deps:check && npm run lint:security",
};

/**
 * ESLint security plugin configuration
 * Install: npm install --save-dev eslint-plugin-security
 */
export const eslintSecurityConfig = {
  extends: ["plugin:security/recommended"],
  plugins: ["security"],
  rules: {
    "security/detect-eval-with-expression": "error",
    "security/detect-non-literal-regexp": "warning",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "error",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-fs-filename": "warning",
    "security/detect-non-literal-require": "warning",
    "security/detect-object-injection": "warning",
  },
};

/**
 * Trivy container scanning configuration
 * Install: curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh
 */
export const trivyConfig = {
  // Scan Docker image for vulnerabilities
  scanCommand: "trivy image --severity HIGH,CRITICAL my-image:latest",

  // Generate report
  reportCommand: "trivy image --format json --output report.json my-image:latest",

  // Config file
  configPath: ".trivy.yaml",
};

/**
 * Regular dependency update schedule
 */
export const dependencyUpdateSchedule = {
  scheduleType: "automated",

  // Check for updates weekly
  checkFrequency: "weekly",

  // Group updates
  grouping: {
    // Group minor/patch updates
    non_breaking: ["minor", "patch"],

    // Separate major updates
    breaking: ["major"],
  },

  // Auto-merge safe updates
  autoMerge: {
    enabled: true,
    allowedTypes: ["patch", "minor"],
    requireTests: true,
  },

  // Restrict update patterns
  restrictions: {
    // Don't auto-update if multiple vulnerabilities
    maxVulnerabilities: 1,

    // Don't auto-update major versions
    onlyPatch: false,
  },
};

/**
 * Security dependency list (always keep updated)
 * These are critical for security and should be kept current
 */
export const criticalSecurityDependencies = [
  "next", // Framework security patches
  "react", // Core library security
  "bcrypt", // Password hashing
  "@prisma/client", // Database ORM
  "zod", // Validation
  "jsonwebtoken", // Auth tokens
  "dotenv", // Env config
  "helmet", // Security headers (if using Express)
  "cors", // CORS handling
  "@sentry/nextjs", // Error tracking
  "isomorphic-dompurify", // XSS prevention
  "crypto", // Native module
];
