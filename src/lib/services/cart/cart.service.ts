// src/lib/services/cart/cart.service.ts

import { CacheService } from "../cache/cache.service";
import { ProductService } from "../product/product.service";

// Placeholder interfaces - these would typically be defined in a shared types file or their respective modules
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl?: string;
}

export interface Cart {
  sessionId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface CartValidation {
  isValid: boolean;
  errors: string[];
  validatedCart?: Cart;
}

export class CartService {
  constructor(
    private cacheService: CacheService,
    private productService: ProductService
  ) {}

  async getCart(sessionId: string): Promise<Cart> {
    const cachedCart = await this.cacheService.get<Cart>(`cart:${sessionId}`);
    if (cachedCart) {
      return cachedCart;
    }
    // In a real application, you might load the cart from a database here
    const newCart: Cart = {
      sessionId,
      items: [],
      totalItems: 0,
      totalAmount: 0,
    };
    await this.cacheService.set(`cart:${sessionId}`, newCart, 3600); // Cache for 1 hour
    return newCart;
  }

  async addItem(sessionId: string, productId: string, quantity: number): Promise<Cart> {
    const cart = await this.getCart(sessionId);
    const product = await this.productService.getProductById(productId);

    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    const existingItemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        price: product.price.toNumber(), // Convert Decimal to number
        quantity,
      });
    }

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await this.cacheService.set(`cart:${sessionId}`, cart, 3600);
    return cart;
  }

  async updateItemQuantity(sessionId: string, productId: string, quantity: number): Promise<Cart> {
    const cart = await this.getCart(sessionId);
    const existingItemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (existingItemIndex === -1) {
      throw new Error(`Product with ID ${productId} not found in cart.`);
    }

    if (quantity <= 0) {
      cart.items.splice(existingItemIndex, 1); // Remove item if quantity is 0 or less
    } else {
      cart.items[existingItemIndex].quantity = quantity;
    }

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await this.cacheService.set(`cart:${sessionId}`, cart, 3600);
    return cart;
  }

  async removeItem(sessionId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(sessionId);
    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId !== productId);

    if (cart.items.length === initialLength) {
      throw new Error(`Product with ID ${productId} not found in cart.`);
    }

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await this.cacheService.set(`cart:${sessionId}`, cart, 3600);
    return cart;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    await this.cacheService.del(`cart:${sessionId}`);
    return true;
  }

  async validateCart(sessionId: string): Promise<CartValidation> {
    const cart = await this.getCart(sessionId);
    const errors: string[] = [];
    let isValid = true;

    for (const item of cart.items) {
      const product = await this.productService.getProductById(item.productId);
      if (!product) {
        isValid = false;
        errors.push(`Product ${item.productId} no longer exists.`);
        continue;
      }
      if (product.stockQuantity < item.quantity) {
        isValid = false;
        errors.push(
          `Not enough stock for product ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}.`
        );
      }
      if (product.price.toNumber() !== item.price) {
        // Price has changed since item was added to cart
        isValid = false;
        errors.push(
          `Price for product ${product.name} has changed from ${item.price} to ${product.price.toNumber()}.`
        );
        // Optionally update the price in the cart here
        item.price = product.price.toNumber();
      }
    }

    if (!isValid) {
      // If prices changed, update the cart totals
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      await this.cacheService.set(`cart:${sessionId}`, cart, 3600);
    }

    return {
      isValid,
      errors,
      validatedCart: cart,
    };
  }
}
