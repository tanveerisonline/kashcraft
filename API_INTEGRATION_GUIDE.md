# KashCraft API Integration Guide

## Overview

This guide provides step-by-step instructions to complete the API integration for the KashCraft e-commerce platform. The frontend pages are fully implemented and API endpoints are in place. What remains is connecting the endpoints to the database using Prisma ORM.

## Current Status

### ✅ Completed

- [x] All frontend pages implemented
- [x] All API route files created with mock/sample data
- [x] Service layer architecture established (Cart, Wishlist, Address, Analytics services)
- [x] Authentication flow structure
- [x] Error handling framework
- [x] API documentation
- [x] Analytics integration (GA4, Facebook Pixel)
- [x] Internationalization setup (4 languages)
- [x] SEO features (Sitemap, Robots, Structured Data)

### 🔄 In Progress - Database Integration

- [ ] Connect Prisma ORM to production database
- [ ] Implement database queries in API routes
- [ ] Replace mock data with real database calls
- [ ] Set up proper authentication with JWT
- [ ] Implement payment processing

---

## Prerequisites

Ensure you have the following installed:

```bash
npm install
npm install prisma @prisma/client
npm install bcryptjs jsonwebtoken
npm install stripe # For payment processing
npm install nodemailer # For emails
```

---

## Step 1: Configure Database

### 1.1 Set up Prisma

Initialize Prisma with your database:

```bash
npx prisma init
```

### 1.2 Update `.env.local`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kashcraft"
# or for MySQL:
# DATABASE_URL="mysql://user:password@localhost:3306/kashcraft"

# Authentication
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Payment Processing
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=1234567890
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 1.3 Create Database Schema

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  phone         String?
  password      String
  emailVerified DateTime?
  image         String?
  role          Role      @default(CUSTOMER)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  addresses     Address[]
  orders        Order[]
  reviews       Review[]
  wishlist      Wishlist[]

  @@map("users")
}

model Product {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  description     String
  fullDescription String?
  price           Float
  originalPrice   Float?
  image           String?
  images          String[]

  categoryId      String
  category        Category  @relation(fields: [categoryId], references: [id])

  sku             String?   @unique
  material        String?
  origin          String?
  weight          String?
  dimensions      String?

  stockQuantity   Int       @default(0)
  rating          Float     @default(0)
  reviewCount     Int       @default(0)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  orderItems      OrderItem[]
  reviews         Review[]
  wishlistItems   Wishlist[]
  cartItems       CartItem[]

  @@map("products")
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  image       String?

  products    Product[]

  @@map("categories")
}

model Cart {
  id        String    @id @default(cuid())
  userId    String    @unique
  items     CartItem[]

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("carts")
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)

  productId String
  product   Product  @relation(fields: [productId], references: [id])

  quantity  Int      @default(1)

  @@unique([cartId, productId])
  @@map("cart_items")
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  userId          String
  user            User        @relation(fields: [userId], references: [id])

  items           OrderItem[]

  status          OrderStatus @default(PENDING)

  subtotal        Float
  tax             Float
  shippingCost    Float
  total           Float
  couponCode      String?

  shippingData    Json
  paymentData     Json
  shippingMethod  String

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@map("orders")
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  productId String
  product   Product  @relation(fields: [productId], references: [id])

  quantity  Int
  price     Float

  @@map("order_items")
}

model Address {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  firstName String
  lastName  String
  address   String
  city      String
  state     String
  zipCode   String
  country   String

  default   Boolean  @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("addresses")
}

model Review {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  rating    Int
  text      String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("reviews")
}

model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, productId])
  @@map("wishlist")
}

model PageView {
  id        String   @id @default(cuid())
  userId    String?
  path      String

  createdAt DateTime @default(now())

  @@map("page_views")
}

model Coupon {
  code        String   @id
  discount    Float
  type        String   @default("percentage") // percentage or fixed
  minAmount   Float    @default(0)
  maxUses     Int      @default(100)
  used        Int      @default(0)
  expiresAt   DateTime

  createdAt   DateTime @default(now())

  @@map("coupons")
}

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}
```

### 1.4 Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Step 2: Update API Routes with Database Queries

### 2.1 Products API

Update `src/app/api/products/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "12");
    const sort = request.nextUrl.searchParams.get("sort") || "newest";
    const categoryId = request.nextUrl.searchParams.get("categoryId");
    const minPrice = request.nextUrl.searchParams.get("minPrice");
    const maxPrice = request.nextUrl.searchParams.get("maxPrice");
    const search = request.nextUrl.searchParams.get("search");

    // Build where clause
    const where: any = {};

    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (minPrice) where.price = { gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };

    // Build orderBy
    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "popular":
        orderBy = { reviewCount: "desc" };
        break;
    }

    const total = await prisma.product.count({ where });
    const totalPages = Math.ceil(total / limit);

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true },
    });

    return NextResponse.json({
      data: products,
      totalPages,
      total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
```

### 2.2 Update Other Routes

Follow the same pattern for:

- `GET /products/{id}`
- `GET /products/featured`
- `GET /products/{id}/reviews`
- `GET /categories`
- `GET /categories/{slug}`
- `GET /user/orders`
- `GET /user/addresses`
- `GET /wishlist`
- `POST /orders` (create order)

---

## Step 3: Implement Authentication

### 3.1 Update Login Route

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      { message: "Login successful", data: { ...user, password: undefined } },
      { status: 200 }
    );

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
```

### 3.2 Update Register Route

```typescript
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password } = await request.json();

    const exists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (exists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: fullName,
        password: hashedPassword,
      },
    });

    // TODO: Send verification email

    return NextResponse.json({ message: "Registration successful" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
```

---

## Step 4: Implement Payment Processing

### 4.1 Install Stripe

```bash
npm install stripe next-stripe
```

### 4.2 Create Payment Intent

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: { orderId },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
```

---

## Step 5: Set Up Email Notifications

### 5.1 Install Nodemailer

```bash
npm install nodemailer @types/nodemailer
```

### 5.2 Create Email Service

```typescript
// src/lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOrderConfirmation(email: string, order: any) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <h1>Order Confirmed!</h1>
      <p>Order Number: ${order.orderNumber}</p>
      <p>Total: $${order.total}</p>
      <p>We'll notify you when your order ships.</p>
    `,
  });
}
```

---

## Step 6: Testing

### 6.1 Test Database Connection

```bash
npx prisma studio # Opens Prisma Studio UI
```

### 6.2 Test APIs

Use Postman or curl to test each endpoint:

```bash
# Test products
curl http://localhost:3000/api/products

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Test create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[...],"shippingData":{...}}'
```

---

## Step 7: Environment Variables Checklist

Ensure all required environment variables are set:

```env
# Database
DATABASE_URL=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Payment
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=

# Analytics
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_FB_PIXEL_ID=
NEXT_PUBLIC_APP_URL=

# Storage (optional)
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=
```

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Authentication tested
- [ ] Payment processing tested
- [ ] Email notifications tested
- [ ] Analytics events verified
- [ ] SEO metadata validated
- [ ] Error handling tested
- [ ] Rate limiting configured
- [ ] CORS configured properly
- [ ] SSL certificates installed
- [ ] Database backups configured

---

## Common Issues & Solutions

### Issue: Prisma Client Not Found

**Solution:** Run `npm install @prisma/client` and `npx prisma generate`

### Issue: Database Connection Error

**Solution:** Check DATABASE_URL in .env.local and ensure database server is running

### Issue: JWT Token Invalid

**Solution:** Ensure ACCESS_TOKEN_SECRET is configured and matches in decode

### Issue: Stripe Payment Fails

**Solution:** Use test keys from Stripe dashboard, not production keys

---

## Next Steps

1. Set up your database (PostgreSQL recommended)
2. Configure all environment variables
3. Update API routes with Prisma queries
4. Implement authentication properly
5. Set up payment processing
6. Configure email notifications
7. Deploy to production

---

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [JWT Auth](https://jwt.io/)
- [Stripe Integration](https://stripe.com/docs)
- [Nodemailer Guide](https://nodemailer.com/)
