/* eslint-disable no-console, simple-import-sort/imports */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Verifying database...");

  try {
    // Verify User
    const userCount = await prisma.user.count();
    console.log(`Users in DB: ${userCount}`);
    if (userCount === 0) {
      console.warn("No users found. Please run the seed script.");
    } else {
      const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });
      if (adminUser) {
        console.log(`Admin user found: ${adminUser.email}`);
      } else {
        console.warn("No admin user found.");
      }
    }

    // Verify Category
    const categoryCount = await prisma.category.count();
    console.log(`Categories in DB: ${categoryCount}`);
    if (categoryCount === 0) {
      console.warn("No categories found. Please run the seed script.");
    } else {
      const shawlCategory = await prisma.category.findFirst({
        where: { slug: "shawls" },
      });
      if (shawlCategory) {
        console.log(`Shawl category found: ${shawlCategory.name}`);
      } else {
        console.warn("No 'shawls' category found.");
      }
    }

    // Verify Product
    const productCount = await prisma.product.count();
    console.log(`Products in DB: ${productCount}`);
    if (productCount === 0) {
      console.warn("No products found. Please run the seed script.");
    } else {
      const pashminaProduct = await prisma.product.findFirst({
        where: { slug: "pashmina-shawl-royal-blue" },
      });
      if (pashminaProduct) {
        console.log(`Pashmina product found: ${pashminaProduct.name}`);
        console.log(`Product SKU: ${pashminaProduct.sku}`);
        console.log(`Product Price: ${pashminaProduct.price}`);
        console.log(`Product Stock: ${pashminaProduct.stockQuantity}`);
      } else {
        console.warn("No 'pashmina-shawl-royal-blue' product found.");
      }
    }

    // Verify Order
    const orderCount = await prisma.order.count();
    console.log(`Orders in DB: ${orderCount}`);
    if (orderCount === 0) {
      console.warn("No orders found. Please run the seed script.");
    } else {
      const sampleOrder = await prisma.order.findFirst({
        where: { orderNumber: "ORD-2026-0001" },
        include: { items: true },
      });
      if (sampleOrder) {
        console.log(`Sample order found: ${sampleOrder.orderNumber}`);
        console.log(`Order Total: ${sampleOrder.total}`);
        console.log(`Order Status: ${sampleOrder.status}`);
        console.log(`Order Payment Status: ${sampleOrder.paymentStatus}`);
        console.log(`Order Items: ${sampleOrder.items.length}`);
      } else {
        console.warn("No 'ORD-2026-0001' order found.");
      }
    }

    console.log("Database verification complete.");
  } catch (error) {
    console.error("Database verification failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
