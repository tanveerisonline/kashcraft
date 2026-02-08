/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from "@faker-js/faker";

export const userFactory = {
  create: (overrides?: any) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: faker.internet.password(),
    emailVerified: faker.date.past(),
    image: faker.image.avatar(),
    role: "USER",
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  createMany: (count: number, overrides?: any) => {
    return Array.from({ length: count }, () => userFactory.create(overrides));
  },

  admin: (overrides?: any) => {
    return userFactory.create({
      role: "ADMIN",
      ...overrides,
    });
  },
};

export const productFactory = {
  create: (overrides?: any) => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    stock: faker.number.int({ min: 0, max: 100 }),
    categoryId: faker.string.uuid(),
    image: faker.image.url(),
    rating: faker.number.float({ min: 0, max: 5, precision: 0.1 }),
    reviews: faker.number.int({ min: 0, max: 500 }),
    featured: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  createMany: (count: number, overrides?: any) => {
    return Array.from({ length: count }, () => productFactory.create(overrides));
  },

  withCategory: (categoryId: string, overrides?: any) => {
    return productFactory.create({ categoryId, ...overrides });
  },
};

export const categoryFactory = {
  create: (overrides?: any) => ({
    id: faker.string.uuid(),
    name: faker.commerce.department(),
    slug: faker.helpers.slugify(faker.commerce.department()).toLowerCase(),
    description: faker.lorem.paragraph(),
    image: faker.image.url(),
    parentId: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  createMany: (count: number, overrides?: any) => {
    return Array.from({ length: count }, () => categoryFactory.create(overrides));
  },

  withParent: (parentId: string, overrides?: any) => {
    return categoryFactory.create({ parentId, ...overrides });
  },
};

export const orderFactory = {
  create: (overrides?: any) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    orderNumber: faker.string.alphaNumeric(10).toUpperCase(),
    status: "PENDING",
    subtotal: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
    tax: parseFloat(faker.commerce.price({ min: 0, max: 50 })),
    shipping: parseFloat(faker.commerce.price({ min: 0, max: 25 })),
    total: parseFloat(faker.commerce.price({ min: 10, max: 600 })),
    discountCode: null,
    discountAmount: 0,
    shippingAddress: {
      name: faker.person.fullName(),
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip: faker.location.zipCode(),
      country: "US",
    },
    paymentMethod: "CARD",
    paymentStatus: "PENDING",
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  createMany: (count: number, overrides?: any) => {
    return Array.from({ length: count }, () => orderFactory.create(overrides));
  },

  withUser: (userId: string, overrides?: any) => {
    return orderFactory.create({ userId, ...overrides });
  },

  delivered: (overrides?: any) => {
    return orderFactory.create({
      status: "DELIVERED",
      paymentStatus: "COMPLETED",
      ...overrides,
    });
  },
};

export const reviewFactory = {
  create: (overrides?: any) => ({
    id: faker.string.uuid(),
    productId: faker.string.uuid(),
    userId: faker.string.uuid(),
    rating: faker.number.int({ min: 1, max: 5 }),
    title: faker.lorem.sentence(),
    comment: faker.lorem.paragraph(),
    helpful: faker.number.int({ min: 0, max: 100 }),
    unhelpful: faker.number.int({ min: 0, max: 50 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  createMany: (count: number, overrides?: any) => {
    return Array.from({ length: count }, () => reviewFactory.create(overrides));
  },

  forProduct: (productId: string, overrides?: any) => {
    return reviewFactory.create({ productId, ...overrides });
  },
};

export const cartItemFactory = {
  create: (overrides?: any) => ({
    id: faker.string.uuid(),
    productId: faker.string.uuid(),
    quantity: faker.number.int({ min: 1, max: 10 }),
    price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  createMany: (count: number, overrides?: any) => {
    return Array.from({ length: count }, () => cartItemFactory.create(overrides));
  },
};

export const couponFactory = {
  create: (overrides?: any) => ({
    id: faker.string.uuid(),
    code: faker.string.alphaNumeric(8).toUpperCase(),
    type: faker.helpers.arrayElement(["PERCENTAGE", "FIXED"]),
    discount: faker.number.float({ min: 5, max: 50, precision: 0.01 }),
    minOrderAmount: parseFloat(faker.commerce.price({ min: 0, max: 100 })),
    maxUses: faker.number.int({ min: 10, max: 1000 }),
    used: faker.number.int({ min: 0, max: 10 }),
    expiresAt: faker.date.future(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  createMany: (count: number, overrides?: any) => {
    return Array.from({ length: count }, () => couponFactory.create(overrides));
  },

  percentage: (discount: number, overrides?: any) => {
    return couponFactory.create({ type: "PERCENTAGE", discount, ...overrides });
  },

  fixed: (discount: number, overrides?: any) => {
    return couponFactory.create({ type: "FIXED", discount, ...overrides });
  },
};

export const addressFactory = {
  create: (overrides?: any) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    name: faker.person.fullName(),
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zip: faker.location.zipCode(),
    country: "US",
    phone: faker.phone.number(),
    isDefault: false,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  createMany: (count: number, overrides?: any) => {
    return Array.from({ length: count }, () => addressFactory.create(overrides));
  },

  forUser: (userId: string, overrides?: any) => {
    return addressFactory.create({ userId, ...overrides });
  },

  default: (overrides?: any) => {
    return addressFactory.create({ isDefault: true, ...overrides });
  },
};
