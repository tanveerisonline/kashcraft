# Testing Guide for KashCraft E-Commerce Platform

## Overview

This document provides comprehensive guidelines for testing the KashCraft e-commerce platform, including unit tests, integration tests, component tests, and end-to-end tests.

## Table of Contents

1. [Testing Architecture](#testing-architecture)
2. [Unit Testing](#unit-testing)
3. [Component Testing](#component-testing)
4. [E2E Testing](#e2e-testing)
5. [Running Tests](#running-tests)
6. [Coverage Reports](#coverage-reports)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Testing Architecture

### Test Structure

```
kashcraft/
├── jest.config.ts                 # Jest configuration
├── jest.setup.ts                  # Jest setup and global mocks
├── playwright.config.ts           # Playwright configuration
├── src/
│   ├── lib/
│   │   ├── services/
│   │   │   └── **/*.test.ts       # Service tests
│   │   ├── repositories/
│   │   │   └── **/*.test.ts       # Repository tests
│   │   └── utils/
│   │       └── **/*.test.ts       # Utility tests
│   ├── components/
│   │   └── __tests__/
│   │       └── *.test.tsx         # Component tests
│   └── test/
│       ├── utils/
│       │   └── render.tsx         # Custom render function
│       ├── mocks/
│       │   └── prisma.ts          # Prisma mocks
│       └── factories/
│           └── index.ts           # Test data factories
└── tests/
    └── e2e/
        ├── auth.spec.ts           # Authentication tests
        ├── shopping.spec.ts       # Shopping flow tests
        └── account.spec.ts        # Account flow tests
```

### Test Tools Stack

**Unit & Component Testing:**

- **Jest** - JavaScript testing framework
- **@testing-library/react** - React component testing
- **jest-mock-extended** - Advanced mocking utilities
- **@faker-js/faker** - Test data generation

**End-to-End Testing:**

- **Playwright** - Cross-browser E2E testing
- Multiple browser support: Chromium, Firefox, WebKit
- Mobile testing: Pixel 5, iPhone 12

**Coverage:**

- 70% minimum coverage for all code
- 80% minimum for services
- 85% minimum for utilities

---

## Unit Testing

### Service Testing

Services contain business logic and should be thoroughly tested.

#### Example: Testing ProductService

```typescript
import { ProductService } from "@/lib/services/product/product.service";
import { productFactory } from "@/test/factories";

describe("ProductService", () => {
  let productService: ProductService;
  let mockRepo: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    mockRepo = mockProductRepository();
    productService = new ProductService(mockRepo);
  });

  it("should fetch product by id with caching", async () => {
    const product = productFactory.create();
    mockRepo.findById.mockResolvedValue(product);

    const result = await productService.getProductById(product.id);

    expect(result).toEqual(product);
    expect(mockRepo.findById).toHaveBeenCalled();
  });
});
```

**Key Points:**

- Mock all dependencies (repositories, external services)
- Test happy paths and error scenarios
- Verify caching behavior
- Test pagination and filtering

### Repository Testing

Repositories handle database operations and should be tested with mocked Prisma.

```typescript
import { ProductRepository } from "@/lib/repositories/product.repository";
import { prismaMock } from "@/test/mocks/prisma";

describe("ProductRepository", () => {
  it("should find product by id", async () => {
    const product = productFactory.create();
    prismaMock.product.findUnique.mockResolvedValue(product as any);

    const result = await productRepository.findById(product.id);

    expect(result).toEqual(product);
  });
});
```

### Utility Function Testing

Test pure functions with various inputs and edge cases.

```typescript
describe("Format Utilities", () => {
  describe("formatPrice", () => {
    it("should format price with currency", () => {
      expect(formatPrice(99.99)).toBe("$99.99");
      expect(formatPrice(1000)).toBe("$1,000.00");
    });

    it("should handle edge cases", () => {
      expect(formatPrice(0)).toBe("$0.00");
      expect(formatPrice(-50)).toBe("-$50.00");
    });
  });
});
```

---

## Component Testing

### React Component Testing

Use React Testing Library to test components from user perspective.

```typescript
import { render, screen, fireEvent } from '@/test/utils/render';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Best Practices for Component Testing

1. **Test User Interactions** - Click buttons, type in inputs
2. **Avoid Implementation Details** - Don't test internal state
3. **Test Accessibility** - Use semantic queries (getByRole)
4. **Test User Workflows** - Simulate real user behavior
5. **Mock External Dependencies** - API calls, routing

### Component Testing Checklist

- [ ] Renders correctly with default props
- [ ] Renders correctly with different prop combinations
- [ ] Handles user interactions (click, focus, type)
- [ ] Shows loading states
- [ ] Shows error states
- [ ] Handles disabled state
- [ ] Works with keyboard navigation
- [ ] Accessible (ARIA attributes, semantic HTML)

---

## E2E Testing

### Playwright Configuration

Playwright is configured in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
```

### Writing E2E Tests

#### Authentication Flow Test

```typescript
import { test, expect } from "@playwright/test";

test("should register new user", async ({ page }) => {
  await page.goto("/register");

  // Fill form
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "SecurePass123!");

  // Submit
  await page.click('button:has-text("Register")');

  // Verify redirect
  await page.waitForURL("/dashboard");
  expect(page.url()).toContain("/dashboard");
});
```

#### Shopping Flow Test

```typescript
test("should complete purchase", async ({ page }) => {
  // Browse products
  await page.goto("/products");
  await page.waitForSelector('[data-testid="product-card"]');

  // Add to cart
  await page.click('[data-testid="product-card"] button:has-text("Add to Cart")');

  // Proceed to checkout
  await page.click('[data-testid="cart-link"]');
  await page.click('button:has-text("Checkout")');

  // Fill shipping
  await page.fill('input[name="name"]', "John Doe");
  await page.fill('input[name="address"]', "123 Main St");

  // Complete payment
  await page.click('button:has-text("Pay Now")');

  // Verify success
  await page.waitForURL(/\/order-confirmation/);
});
```

### E2E Testing Best Practices

1. **Use Data Attributes** - Add `data-testid` for reliable selectors
2. **Wait for Elements** - Use `waitForSelector` or `waitForURL`
3. **Test User Workflows** - Complete journeys, not isolated steps
4. **Handle Dynamic Content** - Use proper waits, not `hardcoded sleeps`
5. **Test Multiple Browsers** - Local: Chromium. CI: All browsers
6. **Test Responsive Design** - Include mobile viewport tests

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- ProductService.test.ts

# Run with coverage
npm test -- --coverage

# Run services tests only
npm test -- src/lib/services
```

### Component Tests

```bash
# Run component tests
npm test -- components

# Watch mode for components
npm test -- --watch src/components
```

### E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test auth.spec.ts

# Run in UI mode (interactive)
npx playwright test --ui

# Run for specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug
```

### All Tests

```bash
# Run all tests (unit + E2E)
npm run test:all

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

---

## Coverage Reports

### Viewing Coverage

```bash
# Generate coverage report
npm test -- --coverage

# Open coverage report in browser
open coverage/lcov-report/index.html
```

### Coverage Thresholds

Default thresholds (can be configured in jest.config.ts):

```typescript
coverageThresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
  './src/lib/services/': {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

### Improving Coverage

1. **Identify Uncovered Code** - Check coverage report
2. **Write Missing Tests** - Add tests for uncovered lines
3. **Test Edge Cases** - Error scenarios, boundary conditions
4. **Test Error Paths** - What happens when things fail

---

## Test Data Factories

### Using Factories

Factories generate realistic test data:

```typescript
import { userFactory, productFactory, orderFactory, couponFactory } from "@/test/factories";

// Single item
const user = userFactory.create();
const admin = userFactory.admin();

// Multiple items
const products = productFactory.createMany(5);

// With overrides
const pricedProduct = productFactory.create({
  price: 99.99,
  stock: 0,
});

// Specific types
const delivered = orderFactory.delivered();
const percentageDiscount = couponFactory.percentage(15);
```

### Available Factories

- **userFactory** - Users with profiles
- **productFactory** - Products with pricing
- **categoryFactory** - Categories with subcategories
- **orderFactory** - Orders with items and addresses
- **reviewFactory** - Product reviews
- **couponFactory** - Discounts and promotions
- **cartItemFactory** - Shopping cart items
- **addressFactory** - Shipping addresses

---

## Best Practices

### 1. Writing Testable Code

```typescript
// ❌ Bad: Hard to test
class OrderService {
  async placeOrder(data: any) {
    const db = new Database();
    const api = new StripeAPI();
    // ...
  }
}

// ✅ Good: Testable with dependency injection
class OrderService {
  constructor(
    private db: Database,
    private api: StripeAPI
  ) {}

  async placeOrder(data: OrderData) {
    // ...
  }
}
```

### 2. Meaningful Test Names

```typescript
// ❌ Bad: Vague name
it("works", () => {
  expect(result).toEqual(expected);
});

// ✅ Good: Descriptive name
it("should calculate order total including tax and shipping", () => {
  expect(calculateTotal(100, 10, 5)).toBe(115);
});
```

### 3. Arrange-Act-Assert Pattern

```typescript
it("should update product price", async () => {
  // Arrange
  const product = productFactory.create({ price: 100 });
  mockRepo.findById.mockResolvedValue(product);

  // Act
  const updated = await service.updatePrice(product.id, 150);

  // Assert
  expect(updated.price).toBe(150);
  expect(mockRepo.update).toHaveBeenCalled();
});
```

### 4. Testing Error Scenarios

```typescript
it("should throw error for invalid product id", async () => {
  mockRepo.findById.mockResolvedValue(null);

  await expect(service.getProduct("invalid-id")).rejects.toThrow("Product not found");
});
```

### 5. Mock Third-Party Services

```typescript
it("should handle payment failure", async () => {
  const error = new Error("Card declined");
  mockStripe.charge.mockRejectedValue(error);

  await expect(service.processPayment(cartData)).rejects.toThrow("Card declined");
});
```

---

## Accessibility Testing

### Manual Accessibility Testing

1. **Keyboard Navigation**
   - Tab through the page
   - All interactive elements should be reachable
   - Focus should be visible

2. **Screen Reader Testing**
   - Use NVDA (Windows) or VoiceOver (Mac)
   - All content should be readable
   - Form labels should be associated

3. **Color Contrast**
   - Use WebAIM Contrast Checker
   - Should meet WCAG AA standards

### Automated Accessibility Testing

```typescript
import { axe } from 'jest-axe';

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## Troubleshooting

### Common Issues

#### Tests Timeout

```bash
# Increase timeout
jest.setTimeout(10000);

# Or in test
it('slow test', async () => {
  // test code
}, 10000);
```

#### Module Not Found

```bash
# Check path alias in tsconfig.json
# Ensure jest.config.ts has moduleNameMapper configured
```

#### Prisma Mock Issues

```typescript
// Ensure mock is set up correctly
import { prismaMock } from "@/test/mocks/prisma";

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### E2E Tests Not Finding Elements

```typescript
// Use more specific selectors
// ❌ Too generic
page.click("button");

// ✅ Specific
page.click('button[data-testid="submit-button"]');

// ✅ With wait
await page.waitForSelector('[data-testid="product"]');
page.click('[data-testid="product"] button');
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test:ci
      - run: npx playwright install
      - run: npx playwright test
```

---

## Performance Testing

### Lighthouse CI

```bash
# Run Lighthouse CI
npm run lighthouse

# Check Core Web Vitals
# LCP (Largest Contentful Paint) < 2.5s
# FID (First Input Delay) < 100ms
# CLS (Cumulative Layout Shift) < 0.1
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/products

# Using wrk
wrk -t12 -c400 -d30s http://localhost:3000/api/products
```

---

## Continuous Improvement

### Test Metrics to Track

1. **Code Coverage**
   - Aim for 80%+ coverage
   - Focus on critical paths
   - Track progress over time

2. **Test Execution Time**
   - Unit tests: < 30 seconds
   - E2E tests: < 5 minutes
   - Total: < 10 minutes in CI

3. **Flaky Tests**
   - Track recurring failures
   - Fix timing/race conditions
   - Use proper waits in E2E tests

4. **Bug Escape Rate**
   - Track bugs found in production
   - Add tests for escaped bugs
   - Improve test coverage areas

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [WCAG Accessibility Standards](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Best Practices](https://testingjavascript.com/)

---

## Questions or Issues?

For questions about testing:

1. Check test examples in the codebase
2. Review this guide
3. Check specific tool documentation
4. Ask in team discussions
