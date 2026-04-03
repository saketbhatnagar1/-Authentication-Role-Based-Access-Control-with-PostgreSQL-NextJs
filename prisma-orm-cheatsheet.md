# Prisma ORM Cheatsheet

## What is Prisma?

Prisma is a **next-generation ORM** (Object-Relational Mapping) that simplifies database access in Node.js and TypeScript applications. Instead of writing raw SQL, you define your database schema in a declarative way and interact with your database using a type-safe, generated client.

### Key Benefits

- **Type-safe**: Full TypeScript support with auto-generated types
- **Intuitive API**: Easy-to-read query syntax
- **Database agnostic**: Works with PostgreSQL, MySQL, SQLite, SQL Server, MongoDB
- **Auto-migrations**: Built-in migration system
- **Developer experience**: IDE autocomplete, validation

---

## Setup & Installation

### 1. Initialize Prisma in your project

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

### 2. Configure database connection

Edit `.env` file:

```env
# PostgreSQL example
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# MySQL example
DATABASE_URL="mysql://user:password@localhost:3306/mydb"

# SQLite example
DATABASE_URL="file:./dev.db"
```

### 3. Define your schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id    Int     @id @default(autoincrement())
  title String
  content String?
  userId Int
  user  User @relation(fields: [userId], references: [id])
}
```

### 4. Create and run migrations

```bash
# Create a new migration
npx prisma migrate dev --name init

# Apply migrations in production
npx prisma migrate deploy

# View migration status
npx prisma migrate status
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

---

## Schema Basics

### Field Types

```prisma
String
Int
BigInt
Float
Decimal
Boolean
DateTime
Json
Bytes
Unsupported("type")
```

### Field Modifiers

```prisma
model User {
  id        Int      @id @default(autoincrement())     // Primary key, auto-increment
  email     String   @unique                             // Unique constraint
  name      String?                                      // Optional field (nullable)
  age       Int      @default(18)                        // Default value
  role      String   @default("USER")                    // Default with string
  createdAt DateTime @default(now())                     // Timestamp
  updatedAt DateTime @updatedAt                          // Auto-update on change
}
```

### Relationships

#### One-to-Many

```prisma
model User {
  id    Int     @id @default(autoincrement())
  posts Post[]  // User has many posts
}

model Post {
  id     Int  @id @default(autoincrement())
  userId Int
  user   User @relation(fields: [userId], references: [id])
}
```

#### One-to-One

```prisma
model User {
  id      Int     @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  userId Int  @unique
  user   User @relation(fields: [userId], references: [id])
}
```

#### Many-to-Many

```prisma
model Student {
  id        Int      @id @default(autoincrement())
  courses   Course[]
}

model Course {
  id       Int      @id @default(autoincrement())
  students Student[]
}
```

---

## CRUD Operations

### CREATE

#### Single record

```typescript
const user = await prisma.user.create({
  data: {
    email: "alice@example.com",
    name: "Alice",
  },
});
```

#### Multiple records

```typescript
const users = await prisma.user.createMany({
  data: [
    { email: "alice@example.com", name: "Alice" },
    { email: "bob@example.com", name: "Bob" },
  ],
  skipDuplicates: true, // Skip if email exists
});
```

#### Create with relations

```typescript
const user = await prisma.user.create({
  data: {
    email: "alice@example.com",
    name: "Alice",
    posts: {
      create: [
        { title: "Hello World", content: "First post" },
        { title: "Prisma Rocks", content: "Love this ORM" },
      ],
    },
  },
  include: { posts: true }, // Return related posts
});
```

#### Create or update (upsert)

```typescript
const user = await prisma.user.upsert({
  where: { email: "alice@example.com" },
  update: { name: "Alice Updated" },
  create: { email: "alice@example.com", name: "Alice" },
});
```

### READ

#### Find single record

```typescript
// By primary key
const user = await prisma.user.findUnique({
  where: { id: 1 },
});

// By unique field
const user = await prisma.user.findUnique({
  where: { email: "alice@example.com" },
});

// First match (returns null if not found)
const user = await prisma.user.findFirst({
  where: { name: "Alice" },
});
```

#### Find multiple records

```typescript
// All records
const users = await prisma.user.findMany();

// With filter
const users = await prisma.user.findMany({
  where: {
    name: "Alice",
    age: { gte: 18 },
  },
});
```

#### With include (nested relations)

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true, // Include all posts
    profile: true, // Include profile
  },
});
```

#### With select (specific fields)

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    email: true,
    posts: {
      select: { title: true },
    },
  },
});
```

#### Pagination

```typescript
const users = await prisma.user.findMany({
  skip: 10, // Skip first 10
  take: 5, // Take next 5
  orderBy: { id: "desc" },
});
```

#### Count

```typescript
const count = await prisma.user.count();
const count = await prisma.user.count({
  where: { age: { gte: 18 } },
});
```

### UPDATE

#### Single record

```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    name: "Alice Updated",
    age: 25,
  },
});
```

#### Multiple records

```typescript
const result = await prisma.user.updateMany({
  where: { age: { lt: 18 } },
  data: { role: "JUNIOR" },
});
console.log(`Updated ${result.count} users`);
```

#### Increment/Decrement

```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    age: { increment: 1 },
    balance: { decrement: 100 },
  },
});
```

#### Update with relations

```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      create: { title: "New post" }, // Create new post
      connect: { id: 5 }, // Connect existing post
      disconnect: { id: 3 }, // Disconnect relation
      deleteMany: { title: { contains: "old" } }, // Delete posts matching condition
    },
  },
  include: { posts: true },
});
```

### DELETE

#### Single record

```typescript
const user = await prisma.user.delete({
  where: { id: 1 },
});
```

#### Multiple records

```typescript
const result = await prisma.user.deleteMany({
  where: { age: { lt: 13 } },
});
console.log(`Deleted ${result.count} users`);
```

#### Delete all (be careful!)

```typescript
await prisma.user.deleteMany();
```

---

## Where Conditions (Filtering)

### Comparison Operators

```typescript
where: {
  // Equality
  name: "Alice",

  // Not equal
  name: { not: "Bob" },

  // Greater than / Less than
  age: { gt: 18 },    // greater than
  age: { gte: 18 },   // greater than or equal
  age: { lt: 65 },    // less than
  age: { lte: 65 },   // less than or equal

  // In / Not in
  status: { in: ["ACTIVE", "PENDING"] },
  status: { notIn: ["DELETED"] },

  // Null checks
  name: { equals: null },
  name: { not: null },

  // String operations
  email: { contains: "@example.com", mode: "insensitive" },
  email: { startsWith: "alice" },
  email: { endsWith: "@example.com" },
}
```

### Logical Operators

```typescript
where: {
  // AND (default, can be explicit)
  AND: [
    { age: { gte: 18 } },
    { status: "ACTIVE" },
  ],

  // OR
  OR: [
    { email: "alice@example.com" },
    { email: "bob@example.com" },
  ],

  // NOT
  NOT: { status: "DELETED" },
}
```

### Relation Filters

```typescript
// Find users with at least one post
where: {
  posts: {
    some: { title: { contains: "Prisma" } },
  },
}

// Find users with no posts
where: {
  posts: {
    none: {},
  },
}

// Find users where ALL posts are published
where: {
  posts: {
    every: { published: true },
  },
}
```

---

## Advanced Queries

### Distinct

```typescript
const uniqueEmails = await prisma.user.findMany({
  distinct: ["email"],
  select: { email: true },
});
```

### Raw queries

```typescript
// If you really need raw SQL
const result = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE age > ${18}
`;

const users = await prisma.$queryRaw(
  Prisma.sql`SELECT * FROM User WHERE email = ${email}`,
);
```

### Group by (aggregation)

```typescript
const result = await prisma.user.groupBy({
  by: ["role"],
  _count: { id: true },
  _avg: { age: true },
  _max: { createdAt: true },
});
// Returns: [{ role: 'ADMIN', _count: { id: 5 }, _avg: { age: 35 }, ... }]
```

### Transactions

```typescript
// Multiple operations, all succeed or all fail
const [user, post] = await prisma.$transaction([
  prisma.user.create({
    data: { email: "alice@example.com", name: "Alice" },
  }),
  prisma.post.create({
    data: { title: "Hello", userId: 1 },
  }),
]);

// Sequential transaction
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: "alice@example.com", name: "Alice" },
  });
  const post = await tx.post.create({
    data: { title: "Hello", userId: user.id },
  });
  return { user, post };
});
```

---

## Common Patterns

### Soft Delete

```prisma
model Post {
  id        Int     @id @default(autoincrement())
  title     String
  deletedAt DateTime?
}
```

Query non-deleted:

```typescript
const posts = await prisma.post.findMany({
  where: { deletedAt: null },
});
```

### Auditing (createdAt, updatedAt)

```prisma
model User {
  id        Int     @id @default(autoincrement())
  email     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Enums

```prisma
enum Role {
  ADMIN
  USER
  GUEST
}

model User {
  id   Int  @id @default(autoincrement())
  role Role @default(USER)
}
```

Query by enum:

```typescript
const admins = await prisma.user.findMany({
  where: { role: "ADMIN" },
});
```

### Composite Primary Key

```prisma
model StudentCourse {
  studentId Int
  courseId  Int
  grade     String?

  @@id([studentId, courseId])
}
```

### Indexes

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String

  @@index([name])
  @@index([email, name])
}
```

---

## Common Mistakes & Tips

| ❌ Wrong                                                 | ✅ Correct                                                           |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| `where: { age: 18 }`                                     | `where: { age: { equals: 18 } }` or `where: { age: 18 }` (shorthand) |
| `include: { posts: { where: {...} } }` without select    | Add `select: { title: true }` inside include                         |
| Forgetting `include` or `select` when you need relations | Relations are NOT included by default                                |
| `await prisma.user.delete()` without where               | Always specify `where` to avoid deletion without filter              |
| Mutating query results directly                          | Results are frozen; create new objects if you need to modify         |

### Performance Tips

1. Use `select` instead of `include` when you don't need all fields
2. Pagination for large datasets: `skip` and `take`
3. Batch operations with `createMany`, `updateMany`, `deleteMany`
4. Use database indexes on frequently queried fields
5. Avoid N+1 queries: fetch related data in one query with `include`

---

## Testing with Prisma

### Test with SQLite in-memory database

`.env.test`:

```env
DATABASE_URL="file::memory:"
```

### Reset database between tests

```typescript
beforeEach(async () => {
  await prisma.$executeRaw`DELETE FROM "Post";`;
  await prisma.$executeRaw`DELETE FROM "User";`;
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

---

## Useful Commands

```bash
# Introspect existing database (reverse engineering)
npx prisma db pull

# Generate Prisma Client
npx prisma generate

# Launch Prisma Studio (GUI for database)
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Seed database
npx prisma db seed

# Check migrations
npx prisma migrate status
```

---

## Troubleshooting

### "PrismaClientKnownRequestError"

Your database query failed. Check your `where` conditions and ensure records exist.

### Type errors with relations

Make sure to use `include` or `select` when accessing related data:

```typescript
// ❌ Error: posts is not defined
const user = await prisma.user.findUnique({ where: { id: 1 } });
console.log(user.posts);

// ✅ Correct
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true },
});
console.log(user.posts);
```

### Foreign key constraint errors

Ensure the related record exists before creating relations:

```typescript
// Create user first
const user = await prisma.user.create({
  data: { email: "alice@example.com" },
});

// Then create post with valid userId
const post = await prisma.post.create({
  data: { title: "Hello", userId: user.id },
});
```

---

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma API Reference](https://www.prisma.io/docs/reference/api-reference)
- [Prisma GitHub](https://github.com/prisma/prisma)
