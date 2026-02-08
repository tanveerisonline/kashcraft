# Testing Dependencies Installation Guide

To complete the testing setup, install the following dev dependencies:

```bash
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  jest-mock-extended \
  @faker-js/faker \
  @playwright/test \
  @axe-core/playwright \
  jest-axe
```

## Dependency Details

### Jest & TypeScript Setup

```json
{
  "jest": "^29.7.0",
  "@types/jest": "^29.5.11",
  "ts-jest": "^29.1.1",
  "jest-environment-jsdom": "^29.7.0"
}
```

### React Testing

```json
{
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/user-event": "^14.5.1"
}
```

### Mocking & Test Data

```json
{
  "jest-mock-extended": "^3.0.5",
  "@faker-js/faker": "^8.3.1"
}
```

### E2E Testing

```json
{
  "@playwright/test": "^1.40.1"
}
```

### Accessibility Testing

```json
{
  "jest-axe": "^8.0.0",
  "@axe-core/playwright": "^4.8.3"
}
```

## Installation Steps

### Step 1: Install Jest and Testing Libraries

```bash
npm install --save-dev jest @types/jest ts-jest jest-environment-jsdom
```

### Step 2: Install React Testing Library

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Step 3: Install Mocking and Test Data Tools

```bash
npm install --save-dev jest-mock-extended @faker-js/faker
```

### Step 4: Install Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Step 5: Install Accessibility Testing

```bash
npm install --save-dev jest-axe @axe-core/playwright
```

## Update package.json Scripts

Add these test scripts to your package.json:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:debug": "playwright test --debug",
    "test:all": "npm run test && npm run e2e"
  }
}
```

## Verify Installation

After installation, verify everything works:

```bash
# Run unit tests
npm test -- --version

# Run Playwright
npx playwright --version

# Run E2E tests
npx playwright test --version
```

## Troubleshooting Installation

### Issue: Jest can't find modules

**Solution:** Make sure moduleNameMapper is set in jest.config.ts

### Issue: Playwright complains about browsers

**Solution:** Run `npx playwright install` to install browser binaries

### Issue: @testing-library/react version mismatch

**Solution:** Ensure React 19 compatible version: `npm install --save-dev @testing-library/react@latest`

### Issue: Prisma mock not working

**Solution:** Check jest.setup.ts has mock configuration for Prisma

## Next Steps

1. Copy jest.config.ts to your project root
2. Copy jest.setup.ts to your project root
3. Copy playwright.config.ts to your project root
4. Copy test folders (src/test/, tests/e2e)
5. Run `npm test` to verify setup

---

## Full package.json devDependencies

```json
{
  "devDependencies": {
    "@axe-core/playwright": "^4.8.3",
    "@faker-js/faker": "^8.3.1",
    "@playwright/test": "^1.40.1",
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@types/jest": "^29.5.11",
    "@types/node": "^20",
    "@types/pg": "^8.16.0",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/swagger-ui-react": "^5.18.0",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.5.5",
    "eslint-plugin-simple-import-sort": "^12.1.1",
    "eslint-plugin-unused-imports": "^4.3.0",
    "husky": "^9.1.7",
    "jest": "^29.7.0",
    "jest-axe": "^8.0.0",
    "jest-environment-jsdom": "^29.7.0",
    "jest-mock-extended": "^3.0.5",
    "lint-staged": "^16.2.7",
    "prettier": "^3.8.1",
    "prettier-plugin-tailwindcss": "^0.7.2",
    "prisma": "^7.3.0",
    "tailwindcss": "^4",
    "ts-jest": "^29.1.1",
    "typescript": "^5"
  }
}
```

---

For more details, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)
