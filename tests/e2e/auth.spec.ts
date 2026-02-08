import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should register new user", async ({ page }) => {
    await page.goto("/register");

    // Fill in registration form
    await page.fill('input[name="name"]', "John Doe");
    await page.fill('input[name="email"]', "john@example.com");
    await page.fill('input[name="password"]', "SecurePassword123!");
    await page.fill('input[name="confirmPassword"]', "SecurePassword123!");

    // Accept terms
    await page.check('input[type="checkbox"]');

    // Submit form
    await page.click('button:has-text("Create Account")');

    // Wait for redirect to dashboard
    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");
  });

  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/login");

    // Fill in login form
    await page.fill('input[name="email"]', "user@example.com");
    await page.fill('input[name="password"]', "password123");

    // Submit form
    await page.click('button:has-text("Sign In")');

    // Wait for redirect
    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    // Fill in login form with invalid credentials
    await page.fill('input[name="email"]', "invalid@example.com");
    await page.fill('input[name="password"]', "wrongpassword");

    // Submit form
    await page.click('button:has-text("Sign In")');

    // Wait for error message
    await expect(page.locator("text=Invalid credentials")).toBeVisible();
  });

  test("should logout user", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[name="email"]', "user@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign In")');
    await page.waitForURL("/dashboard");

    // Open user menu
    await page.click('[data-testid="user-menu"]');

    // Click logout
    await page.click('button:has-text("Logout")');

    // Should redirect to home
    await page.waitForURL("/");
    expect(page.url()).toBe("http://localhost:3000/");
  });

  test("should show validation errors on register", async ({ page }) => {
    await page.goto("/register");

    // Try to submit empty form
    await page.click('button:has-text("Create Account")');

    // Check for validation errors
    await expect(page.locator("text=Name is required")).toBeVisible();
    await expect(page.locator("text=Email is required")).toBeVisible();
    await expect(page.locator("text=Password is required")).toBeVisible();
  });

  test("should handle password reset", async ({ page }) => {
    await page.goto("/login");

    // Click forgot password
    await page.click('a:has-text("Forgot Password")');

    // Fill email
    await page.fill('input[name="email"]', "user@example.com");

    // Submit
    await page.click('button:has-text("Send Reset Link")');

    // Should show success message
    await expect(page.locator("text=Check your email")).toBeVisible();
  });
});

test.describe("Social Authentication", () => {
  test("should login with Google", async ({ page }) => {
    await page.goto("/login");

    // Click Google button
    await page.click('button:has-text("Login with Google")');

    // Wait for redirect to Google login
    await expect(page).toHaveURL(/accounts\.google\.com/);
  });

  test("should login with GitHub", async ({ page }) => {
    await page.goto("/login");

    // Click GitHub button
    await page.click('button:has-text("Login with GitHub")');

    // Wait for redirect to GitHub auth
    await expect(page).toHaveURL(/github\.com/);
  });
});
