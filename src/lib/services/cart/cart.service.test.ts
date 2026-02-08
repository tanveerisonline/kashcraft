import { CartService } from "@/lib/services/cart/cart.service";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { cartItemFactory, productFactory } from "@/test/factories";

describe("CartService", () => {
  let cartService: CartService;
  let mockProductRepo: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    mockProductRepo = {
      findById: jest.fn(),
      checkStock: jest.fn(),
    } as unknown as jest.Mocked<ProductRepository>;

    cartService = new CartService(mockProductRepo);
  });

  describe("addToCart", () => {
    it("should add item to cart", async () => {
      const product = productFactory.create({ stock: 10 });
      mockProductRepo.findById.mockResolvedValue(product);

      const result = await cartService.addToCart({ items: [] }, product.id, 2);

      expect(result.items).toContainEqual(
        expect.objectContaining({
          productId: product.id,
          quantity: 2,
        })
      );
    });

    it("should update quantity if item already in cart", async () => {
      const product = productFactory.create();
      const cart = {
        items: [cartItemFactory.create({ productId: product.id, quantity: 2 })],
      };

      mockProductRepo.findById.mockResolvedValue(product);

      const result = await cartService.addToCart(cart, product.id, 3);

      expect(result.items[0].quantity).toBe(5); // 2 + 3
    });

    it("should not exceed available stock", async () => {
      const product = productFactory.create({ stock: 5 });
      mockProductRepo.findById.mockResolvedValue(product);

      await expect(cartService.addToCart({ items: [] }, product.id, 10)).rejects.toThrow(
        "Insufficient stock"
      );
    });

    it("should fail if product not found", async () => {
      mockProductRepo.findById.mockResolvedValue(null);

      await expect(cartService.addToCart({ items: [] }, "non-existent", 1)).rejects.toThrow(
        "Product not found"
      );
    });
  });

  describe("removeFromCart", () => {
    it("should remove item from cart", () => {
      const item1 = cartItemFactory.create();
      const item2 = cartItemFactory.create();
      const cart = { items: [item1, item2] };

      const result = cartService.removeFromCart(cart, item1.productId);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe(item2.productId);
    });

    it("should return unchanged cart if item not found", () => {
      const item = cartItemFactory.create();
      const cart = { items: [item] };

      const result = cartService.removeFromCart(cart, "non-existent");

      expect(result.items).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("should update item quantity", () => {
      const item = cartItemFactory.create({ quantity: 2 });
      const cart = { items: [item] };

      const result = cartService.updateQuantity(cart, item.productId, 5);

      expect(result.items[0].quantity).toBe(5);
    });

    it("should remove item if quantity is 0", () => {
      const item = cartItemFactory.create();
      const cart = { items: [item] };

      const result = cartService.updateQuantity(cart, item.productId, 0);

      expect(result.items).toHaveLength(0);
    });

    it("should fail if quantity exceeds stock", async () => {
      const product = productFactory.create({ stock: 3 });
      const item = cartItemFactory.create({ productId: product.id, quantity: 1 });
      const cart = { items: [item] };

      mockProductRepo.findById.mockResolvedValue(product);

      await expect(cartService.updateQuantity(cart, item.productId, 10)).rejects.toThrow(
        "Insufficient stock"
      );
    });
  });

  describe("clearCart", () => {
    it("should clear all items from cart", () => {
      const cart = { items: cartItemFactory.createMany(3) };

      const result = cartService.clearCart(cart);

      expect(result.items).toHaveLength(0);
    });
  });

  describe("calculateCartTotal", () => {
    it("should calculate total correctly", () => {
      const items = [
        cartItemFactory.create({ quantity: 2, price: 50 }),
        cartItemFactory.create({ quantity: 1, price: 100 }),
      ];
      const cart = { items };

      const total = cartService.calculateCartTotal(cart);

      expect(total).toBe(200); // (2*50) + (1*100)
    });

    it("should return 0 for empty cart", () => {
      const cart = { items: [] };

      const total = cartService.calculateCartTotal(cart);

      expect(total).toBe(0);
    });
  });

  describe("getCartItemCount", () => {
    it("should return total item count", () => {
      const items = [
        cartItemFactory.create({ quantity: 3 }),
        cartItemFactory.create({ quantity: 2 }),
      ];
      const cart = { items };

      const count = cartService.getCartItemCount(cart);

      expect(count).toBe(5);
    });

    it("should return 0 for empty cart", () => {
      const cart = { items: [] };

      const count = cartService.getCartItemCount(cart);

      expect(count).toBe(0);
    });
  });

  describe("validateCart", () => {
    it("should validate cart with valid items", async () => {
      const product = productFactory.create({ stock: 5 });
      const item = cartItemFactory.create({ productId: product.id, quantity: 2 });
      const cart = { items: [item] };

      mockProductRepo.findById.mockResolvedValue(product);
      mockProductRepo.checkStock.mockResolvedValue(true);

      const result = await cartService.validateCart(cart);

      expect(result.isValid).toBe(true);
    });

    it("should identify items with insufficient stock", async () => {
      const product = productFactory.create({ stock: 1 });
      const item = cartItemFactory.create({ productId: product.id, quantity: 5 });
      const cart = { items: [item] };

      mockProductRepo.findById.mockResolvedValue(product);
      mockProductRepo.checkStock.mockResolvedValue(false);

      const result = await cartService.validateCart(cart);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({ productId: product.id }));
    });
  });
});
