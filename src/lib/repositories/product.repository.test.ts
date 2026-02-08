import { ProductRepository } from "@/lib/repositories/product.repository";
import { prismaMock } from "@/test/mocks/prisma";
import { productFactory } from "@/test/factories";

describe("ProductRepository", () => {
  let productRepository: ProductRepository;

  beforeEach(() => {
    productRepository = new ProductRepository(prismaMock);
  });

  describe("findById", () => {
    it("should return product if found", async () => {
      const product = productFactory.create();
      prismaMock.product.findUnique.mockResolvedValue(product as any);

      const result = await productRepository.findById(product.id);

      expect(result).toEqual(product);
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: product.id },
      });
    });

    it("should return null if product not found", async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      const result = await productRepository.findById("non-existent-id");

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      const error = new Error("Database connection failed");
      prismaMock.product.findUnique.mockRejectedValue(error);

      await expect(productRepository.findById("id")).rejects.toThrow("Database connection failed");
    });
  });

  describe("findMany", () => {
    it("should return paginated products", async () => {
      const products = productFactory.createMany(3);
      prismaMock.product.findMany.mockResolvedValue(products as any);
      prismaMock.product.count.mockResolvedValue(10);

      const result = await productRepository.findMany({ skip: 0, take: 3 });

      expect(result).toHaveLength(3);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 3,
      });
      expect(prismaMock.product.count).toHaveBeenCalled();
    });

    it("should filter products by category", async () => {
      const categoryId = "cat-1";
      const products = productFactory.createMany(2, { categoryId });
      prismaMock.product.findMany.mockResolvedValue(products as any);
      prismaMock.product.count.mockResolvedValue(2);

      const result = await productRepository.findMany({
        where: { categoryId },
        skip: 0,
        take: 10,
      });

      expect(result).toHaveLength(2);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { categoryId },
        })
      );
    });

    it("should filter by price range", async () => {
      const products = productFactory.createMany(2);
      prismaMock.product.findMany.mockResolvedValue(products as any);
      prismaMock.product.count.mockResolvedValue(2);

      const result = await productRepository.findMany({
        where: {
          price: { gte: 50, lte: 200 },
        },
      });

      expect(result).toHaveLength(2);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 50, lte: 200 },
          }),
        })
      );
    });

    it("should apply sorting", async () => {
      const products = productFactory.createMany(3);
      prismaMock.product.findMany.mockResolvedValue(products as any);
      prismaMock.product.count.mockResolvedValue(3);

      await productRepository.findMany({
        orderBy: { price: "asc" },
      });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: "asc" },
        })
      );
    });
  });

  describe("create", () => {
    it("should create a new product", async () => {
      const createData = {
        name: "New Product",
        slug: "new-product",
        description: "Description",
        price: 99.99,
        sku: "SKU-001",
        stockQuantity: 100,
        categoryId: "cat-1",
      };

      const createdProduct = productFactory.create(createData);
      prismaMock.product.create.mockResolvedValue(createdProduct as any);

      const result = await productRepository.create(createData);

      expect(result).toEqual(createdProduct);
      expect(prismaMock.product.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it("should fail with duplicate slug", async () => {
      const createData = {
        name: "Product",
        slug: "duplicate-slug",
      };

      prismaMock.product.create.mockRejectedValue(
        new Error("Unique constraint failed on the fields: (`slug`)")
      );

      await expect(productRepository.create(createData as any)).rejects.toThrow(
        "Unique constraint failed"
      );
    });
  });

  describe("update", () => {
    it("should update product", async () => {
      const productId = "prod-1";
      const updateData = { name: "Updated Name", price: 149.99 };
      const updatedProduct = productFactory.create(updateData);

      prismaMock.product.update.mockResolvedValue(updatedProduct as any);

      const result = await productRepository.update(productId, updateData);

      expect(result).toEqual(updatedProduct);
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateData,
      });
    });

    it("should throw error if product not found", async () => {
      prismaMock.product.update.mockRejectedValue(new Error(`Record to update not found`));

      await expect(productRepository.update("non-existent", { name: "New Name" })).rejects.toThrow(
        "Record to update not found"
      );
    });
  });

  describe("delete", () => {
    it("should delete product", async () => {
      const productId = "prod-1";
      const deletedProduct = productFactory.create();

      prismaMock.product.delete.mockResolvedValue(deletedProduct as any);

      const result = await productRepository.delete(productId);

      expect(result).toEqual(deletedProduct);
      expect(prismaMock.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe("checkStock", () => {
    it("should return true if stock available", async () => {
      const product = productFactory.create({ stock: 10 });
      prismaMock.product.findUnique.mockResolvedValue(product as any);

      const result = await productRepository.checkStock("prod-1", 5);

      expect(result).toBe(true);
    });

    it("should return false if insufficient stock", async () => {
      const product = productFactory.create({ stock: 3 });
      prismaMock.product.findUnique.mockResolvedValue(product as any);

      const result = await productRepository.checkStock("prod-1", 5);

      expect(result).toBe(false);
    });
  });

  describe("updateStock", () => {
    it("should update product stock", async () => {
      const product = productFactory.create({ stock: 10 });
      prismaMock.product.update.mockResolvedValue({
        ...product,
        stock: 8,
      } as any);

      const result = await productRepository.updateStock("prod-1", -2);

      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: "prod-1" },
        data: {
          stock: {
            decrement: 2,
          },
        },
      });
    });
  });

  describe("search", () => {
    it("should search products by name and description", async () => {
      const query = "carpet";
      const products = productFactory.createMany(2);
      prismaMock.product.findMany.mockResolvedValue(products as any);

      const result = await productRepository.search(query);

      expect(result).toHaveLength(2);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          },
        })
      );
    });
  });
});
