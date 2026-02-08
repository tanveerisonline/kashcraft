/* eslint-disable */
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Create Categories
  const categoryShawls = await prisma.category.upsert({
    where: { slug: "shawls" },
    update: {},
    create: {
      name: "Kashmiri Shawls",
      slug: "shawls",
      description: "Authentic Pashmina and wool shawls from Kashmir.",
      imageUrl: "/images/categories/shawls.jpg",
    },
  });

  // Create Admin User
  const adminEmail = "admin@kashcraft.com";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin User",
      role: UserRole.ADMIN,
      passwordHash: "hashed_password_placeholder", // In real app, hash this!
      emailVerified: true,
    },
  });

  // Create Sample Product
  await prisma.product.upsert({
    where: { slug: "pashmina-shawl-royal-blue" },
    update: {},
    create: {
      name: "Royal Blue Pashmina Shawl",
      slug: "pashmina-shawl-royal-blue",
      description: "Handwoven pure Pashmina shawl in royal blue with Sozni embroidery.",
      shortDescription: "Luxurious royal blue pashmina shawl.",
      price: 299.99,
      compareAtPrice: 350.0,
      costPrice: 150.0,
      sku: "PS-RB-001",
      barcode: "1234567890123",
      stockQuantity: 10,
      lowStockThreshold: 3,
      weight: 0.25,
      material: "Pashmina",
      origin: "Kashmir, India",
      isActive: true,
      isFeatured: true,
      categoryId: categoryShawls.id,
    },
  });

  // Create Sample Order
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  const pashminaProduct = await prisma.product.findUnique({
    where: { slug: "pashmina-shawl-royal-blue" },
  });

  if (adminUser && pashminaProduct) {
    await prisma.order.upsert({
      where: { orderNumber: "ORD-2026-0001" },
      update: {},
      create: {
        orderNumber: "ORD-2026-0001",
        userId: adminUser.id,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal: 299.99,
        tax: 20.0,
        shippingCost: 10.0,
        total: 329.99,
        items: {
          create: [
            {
              productId: pashminaProduct.id,
              quantity: 1,
              price: 299.99,
            },
          ],
        },
      },
    });
  }

  console.log("✅ Seed completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
