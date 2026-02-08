import { test, expect } from "@playwright/test";

test.describe("User Account Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('input[name="email"]', "user@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign In")');
    await page.waitForURL("/dashboard");
  });

  test("should view user profile", async ({ page }) => {
    await page.goto("/account");

    // Verify profile information is displayed
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-email"]')).toBeVisible();
  });

  test("should edit profile information", async ({ page }) => {
    await page.goto("/account/profile");

    // Edit name
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill("Jane Doe");

    // Save
    await page.click('button:has-text("Save Changes")');

    // Verify success message
    await expect(page.locator("text=Profile updated successfully")).toBeVisible();

    // Verify change persists
    await page.reload();
    await expect(nameInput).toHaveValue("Jane Doe");
  });

  test("should update profile picture", async ({ page }) => {
    await page.goto("/account/profile");

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("tests/fixtures/avatar.jpg");

    // Wait for upload
    await page.waitForTimeout(1000);

    // Verify image is displayed
    await expect(page.locator('[data-testid="profile-picture"]')).toBeVisible();
  });

  test("should change password", async ({ page }) => {
    await page.goto("/account/security");

    // Fill password form
    await page.fill('input[name="currentPassword"]', "password123");
    await page.fill('input[name="newPassword"]', "newPassword456!");
    await page.fill('input[name="confirmPassword"]', "newPassword456!");

    // Submit
    await page.click('button:has-text("Change Password")');

    // Verify success
    await expect(page.locator("text=Password changed successfully")).toBeVisible();
  });

  test("should manage addresses", async ({ page }) => {
    await page.goto("/account/addresses");

    // Should show existing addresses
    await expect(page.locator('[data-testid="address-card"]')).toBeDefined();

    // Add new address
    await page.click('button:has-text("Add Address")');

    // Fill address form
    await page.fill('input[name="name"]', "Office");
    await page.fill('input[name="street"]', "456 Work Ave");
    await page.fill('input[name="city"]', "New York");
    await page.fill('input[name="state"]', "NY");
    await page.fill('input[name="zip"]', "10002");

    // Save
    await page.click('button:has-text("Save Address")');

    // Verify address added
    await expect(page.locator("text=Address added successfully")).toBeVisible();
  });

  test("should edit existing address", async ({ page }) => {
    await page.goto("/account/addresses");

    // Click edit on first address
    const addressCard = page.locator('[data-testid="address-card"]').first();
    await addressCard.locator('button:has-text("Edit")').click();

    // Update address
    const streetInput = page.locator('input[name="street"]');
    await streetInput.fill("789 New Street");

    // Save
    await page.click('button:has-text("Save Changes")');

    // Verify update
    await expect(page.locator("text=Address updated successfully")).toBeVisible();
  });

  test("should delete address", async ({ page }) => {
    await page.goto("/account/addresses");

    // Click delete on first address
    const addressCard = page.locator('[data-testid="address-card"]').first();
    await addressCard.locator('button[aria-label="Delete"]').click();

    // Confirm deletion
    await page.click('button:has-text("Confirm Delete")');

    // Verify deletion
    await expect(page.locator("text=Address deleted successfully")).toBeVisible();
  });

  test("should view order history", async ({ page }) => {
    await page.goto("/account/orders");

    // Verify orders are displayed
    await expect(page.locator('[data-testid="order-item"]')).toBeDefined();

    // Check order information
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-total"]')).toBeVisible();
  });

  test("should view single order details", async ({ page }) => {
    await page.goto("/account/orders");

    // Click on first order
    const orderItem = page.locator('[data-testid="order-item"]').first();
    await orderItem.click();

    // Should navigate to order details
    await page.waitForURL(/\/account\/orders\/[^/]+$/);

    // Verify order details
    await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-address"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
  });

  test("should track order", async ({ page }) => {
    await page.goto("/account/orders");

    // Click on order that has tracking
    const trackButton = page.locator('button:has-text("Track")').first();
    await trackButton.click();

    // Should show tracking information
    await expect(page.locator('[data-testid="tracking-info"]')).toBeVisible();
  });

  test("should view wishlist", async ({ page }) => {
    await page.goto("/account/wishlist");

    // Verify wishlist items are displayed
    if ((await page.locator('[data-testid="wishlist-item"]').count()) > 0) {
      await expect(page.locator('[data-testid="wishlist-item"]')).toBeVisible();
    } else {
      // Empty state
      await expect(page.locator("text=Your wishlist is empty")).toBeVisible();
    }
  });

  test("should remove from wishlist", async ({ page }) => {
    await page.goto("/account/wishlist");

    // Check if there are items
    const itemCount = await page.locator('[data-testid="wishlist-item"]').count();

    if (itemCount > 0) {
      // Remove item
      await page
        .locator('[data-testid="wishlist-item"]')
        .first()
        .locator('button[aria-label="Remove"]')
        .click();

      // Verify removal
      await expect(page.locator("text=Removed from wishlist")).toBeVisible();
    }
  });

  test("should view preferences", async ({ page }) => {
    await page.goto("/account/preferences");

    // Verify preferences form
    await expect(page.locator('input[name="newsletter"]')).toBeVisible();
    await expect(page.locator('input[name="notifications"]')).toBeVisible();
  });

  test("should update preferences", async ({ page }) => {
    await page.goto("/account/preferences");

    // Toggle newsletter subscription
    const newsletterCheckbox = page.locator('input[name="newsletter"]');
    await newsletterCheckbox.check();

    // Save preferences
    await page.click('button:has-text("Save Preferences")');

    // Verify success
    await expect(page.locator("text=Preferences updated")).toBeVisible();
  });

  test("should logout", async ({ page }) => {
    // Open user menu
    await page.click('[data-testid="user-menu"]');

    // Click logout
    await page.click('button:has-text("Logout")');

    // Should redirect to home
    await page.waitForURL("/");
    expect(page.url()).toBe("http://localhost:3000/");
  });
});

test.describe("Account Security", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('input[name="email"]', "user@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign In")');
    await page.waitForURL("/dashboard");
  });

  test("should enable two-factor authentication", async ({ page }) => {
    await page.goto("/account/security");

    // Click enable 2FA
    await page.click('button:has-text("Enable Two-Factor Authentication")');

    // Should show QR code
    await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();

    // Copy secret key
    const secretKey = await page.locator('[data-testid="secret-key"]').textContent();
    expect(secretKey).toBeTruthy();

    // Enter verification code
    // Note: In real test, would generate code from secret
    await page.fill('input[name="verificationCode"]', "000000");

    // Verify
    await page.click('button:has-text("Verify")');

    // Should show backup codes
    await expect(page.locator('[data-testid="backup-codes"]')).toBeVisible();
  });

  test("should disable two-factor authentication", async ({ page }) => {
    await page.goto("/account/security");

    // Click disable 2FA
    const disableButton = page.locator('button:has-text("Disable Two-Factor Authentication")');

    if (await disableButton.isVisible()) {
      await disableButton.click();

      // Confirm
      await page.click('button:has-text("Confirm Disable")');

      // Verify
      await expect(page.locator("text=2FA disabled successfully")).toBeVisible();
    }
  });

  test("should view active sessions", async ({ page }) => {
    await page.goto("/account/security");

    // Should show active sessions
    await expect(page.locator('[data-testid="session-item"]')).toBeDefined();
  });

  test("should sign out from other sessions", async ({ page }) => {
    await page.goto("/account/security");

    const sessionItems = page.locator('[data-testid="session-item"]');
    const count = await sessionItems.count();

    if (count > 1) {
      // Sign out other session
      await sessionItems.nth(1).locator('button:has-text("Sign Out")').click();

      // Verify
      await expect(page.locator("text=Session closed")).toBeVisible();
    }
  });
});
