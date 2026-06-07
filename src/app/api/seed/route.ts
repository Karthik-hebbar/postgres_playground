import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Language: SQL — full playground schema with data for learning JOINs, indexes,
// aggregations, CTEs, and window functions.
const SEED_SQL = `
BEGIN;

-- ── Teardown (idempotent) ──────────────────────────────────────────────────
DROP TABLE IF EXISTS reviews      CASCADE;
DROP TABLE IF EXISTS order_items  CASCADE;
DROP TABLE IF EXISTS orders       CASCADE;
DROP TABLE IF EXISTS products     CASCADE;
DROP TABLE IF EXISTS categories   CASCADE;
DROP TABLE IF EXISTS customers    CASCADE;
DROP TABLE IF EXISTS employees    CASCADE;
DROP TABLE IF EXISTS departments  CASCADE;

-- ── Schema ────────────────────────────────────────────────────────────────

CREATE TABLE departments (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE employees (
  id            SERIAL PRIMARY KEY,
  name          TEXT    NOT NULL,
  department_id INT     REFERENCES departments(id),
  manager_id    INT     REFERENCES employees(id),
  salary        NUMERIC(10,2) NOT NULL,
  hired_at      DATE    NOT NULL
);

CREATE TABLE customers (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  city       TEXT,
  country    TEXT NOT NULL DEFAULT 'US',
  created_at TIMESTAMPTZ DEFAULT NOW() - (random() * INTERVAL '730 days')
);

CREATE TABLE categories (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  parent_id INT  REFERENCES categories(id)
);

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        TEXT           NOT NULL,
  category_id INT            REFERENCES categories(id),
  price       NUMERIC(10,2)  NOT NULL,
  stock_qty   INT            NOT NULL DEFAULT 0,
  active      BOOLEAN        NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ    DEFAULT NOW()
);

CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  customer_id INT  NOT NULL REFERENCES customers(id),
  status      TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INT           NOT NULL REFERENCES orders(id),
  product_id  INT           NOT NULL REFERENCES products(id),
  quantity    INT           NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price  NUMERIC(10,2) NOT NULL
);

CREATE TABLE reviews (
  id          SERIAL PRIMARY KEY,
  product_id  INT  NOT NULL REFERENCES products(id),
  customer_id INT  NOT NULL REFERENCES customers(id),
  rating      INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() - (random() * INTERVAL '365 days')
);

-- ── Indexes ───────────────────────────────────────────────────────────────
-- Good for teaching EXPLAIN ANALYZE, index hits vs seq scans

CREATE INDEX idx_orders_customer_id   ON orders(customer_id);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_orders_created_at    ON orders(created_at DESC);
CREATE INDEX idx_order_items_order    ON order_items(order_id);
CREATE INDEX idx_order_items_product  ON order_items(product_id);
CREATE INDEX idx_products_category    ON products(category_id);
CREATE INDEX idx_products_price       ON products(price);
CREATE INDEX idx_products_active      ON products(active) WHERE active = true;
CREATE INDEX idx_reviews_product      ON reviews(product_id);
CREATE INDEX idx_reviews_rating       ON reviews(rating);
CREATE INDEX idx_customers_country    ON customers(country);
CREATE INDEX idx_employees_dept       ON employees(department_id);
CREATE INDEX idx_employees_salary     ON employees(salary);

-- ── Seed data ─────────────────────────────────────────────────────────────

INSERT INTO departments (name) VALUES
  ('Engineering'),
  ('Product'),
  ('Sales'),
  ('Support'),
  ('Finance');

-- Employees (self-referential for manager hierarchy)
INSERT INTO employees (name, department_id, manager_id, salary, hired_at) VALUES
  ('Diana Prince',  1, NULL, 180000, '2018-03-01'),  -- id 1, CTO
  ('Bruce Wayne',   2, NULL, 160000, '2019-01-15'),  -- id 2, CPO
  ('Clark Kent',    3, NULL, 140000, '2019-06-01'),  -- id 3, VP Sales
  ('Barry Allen',   1,    1, 130000, '2020-02-01'),
  ('Hal Jordan',    1,    1, 125000, '2020-05-15'),
  ('Oliver Queen',  2,    2, 115000, '2021-01-10'),
  ('Arthur Curry',  3,    3, 110000, '2021-03-20'),
  ('Victor Stone',  1,    4, 105000, '2021-07-01'),
  ('Wally West',    1,    4, 100000, '2022-01-15'),
  ('John Stewart',  2,    6,  98000, '2022-04-01'),
  ('Kara Danvers',  4, NULL, 120000, '2019-09-01'),  -- id 11, Support head
  ('James Gordon',  4,   11,  85000, '2020-11-01'),
  ('Lois Lane',     3,    3,  95000, '2020-08-15'),
  ('Perry White',   5, NULL, 135000, '2018-06-01'),  -- id 14, CFO
  ('Jimmy Olsen',   5,   14,  80000, '2021-09-01');

INSERT INTO categories (name, parent_id) VALUES
  ('Electronics',    NULL),   -- 1
  ('Books',          NULL),   -- 2
  ('Clothing',       NULL),   -- 3
  ('Laptops',           1),   -- 4
  ('Phones',            1),   -- 5
  ('Accessories',       1),   -- 6
  ('Fiction',           2),   -- 7
  ('Non-Fiction',       2),   -- 8
  ('Technical',         8),   -- 9
  ('Men''s',            3),   -- 10
  ('Women''s',          3);   -- 11

INSERT INTO products (name, category_id, price, stock_qty) VALUES
  ('MacBook Pro 16"',                    4,  2499.00,  25),
  ('ThinkPad X1 Carbon',                 4,  1799.00,  40),
  ('Dell XPS 15',                        4,  1599.00,  15),
  ('Surface Laptop 5',                   4,  1299.00,  30),
  ('iPhone 15 Pro',                      5,  1099.00,  80),
  ('Samsung Galaxy S24',                 5,   899.00,  60),
  ('Google Pixel 8',                     5,   699.00,  45),
  ('OnePlus 12',                         5,   549.00,  35),
  ('AirPods Pro',                        6,   249.00, 150),
  ('Sony WH-1000XM5',                    6,   349.00,  90),
  ('Logitech MX Master 3',               6,    99.00, 200),
  ('The Pragmatic Programmer',           9,    49.99, 200),
  ('Clean Code',                         9,    39.99, 150),
  ('Designing Data-Intensive Apps',      9,    59.99, 120),
  ('Database Internals',                 9,    54.99, 100),
  ('The Art of War',                     7,    12.99, 300),
  ('Dune',                               7,    16.99, 250),
  ('Foundation',                         7,    14.99, 220),
  ('Atomic Habits',                      8,    18.99, 400),
  ('Thinking, Fast and Slow',            8,    17.99, 350),
  ('Men''s Slim Fit Jeans',             10,    79.99, 500),
  ('Men''s Oxford Shirt',               10,    59.99, 350),
  ('Men''s Running Shoes',              10,   129.99, 200),
  ('Women''s Yoga Pants',              11,    69.99, 400),
  ('Women''s Blazer',                   11,   129.99, 200),
  ('Women''s Running Shoes',            11,   139.99, 180);

INSERT INTO customers (name, email, city, country) VALUES
  ('Alice Johnson',   'alice@example.com',   'New York',       'US'),
  ('Bob Smith',       'bob@example.com',     'Los Angeles',    'US'),
  ('Carol White',     'carol@example.com',   'Chicago',        'US'),
  ('David Brown',     'david@example.com',   'Houston',        'US'),
  ('Eva Martinez',    'eva@example.com',     'Phoenix',        'US'),
  ('Frank Lee',       'frank@example.com',   'Toronto',        'CA'),
  ('Grace Kim',       'grace@example.com',   'Seoul',          'KR'),
  ('Henry Chen',      'henry@example.com',   'Singapore',      'SG'),
  ('Isla Patel',      'isla@example.com',    'London',         'UK'),
  ('Jack Wilson',     'jack@example.com',    'Sydney',         'AU'),
  ('Karen Davis',     'karen@example.com',   'Miami',          'US'),
  ('Liam Miller',     'liam@example.com',    'Seattle',        'US'),
  ('Mia Anderson',    'mia@example.com',     'Boston',         'US'),
  ('Noah Taylor',     'noah@example.com',    'Denver',         'US'),
  ('Olivia Moore',    'olivia@example.com',  'Austin',         'US'),
  ('Paul Jackson',    'paul@example.com',    'Portland',       'US'),
  ('Quinn Harris',    'quinn@example.com',   'Atlanta',        'US'),
  ('Rose Thompson',   'rose@example.com',    'Nashville',      'US'),
  ('Sam Garcia',      'sam@example.com',     'Dallas',         'US'),
  ('Tina Robinson',   'tina@example.com',    'San Francisco',  'US'),
  ('Uma Thurman',     'uma@example.com',     'Berlin',         'DE'),
  ('Victor Hugo',     'victor@example.com',  'Paris',          'FR'),
  ('Wendy Park',      'wendy@example.com',   'Vancouver',      'CA'),
  ('Xander Cruz',     'xander@example.com',  'Mexico City',    'MX'),
  ('Yuki Tanaka',     'yuki@example.com',    'Tokyo',          'JP');

-- Orders spread over the past year with varied statuses
INSERT INTO orders (customer_id, status, created_at) VALUES
  (1,  'delivered',  NOW() - INTERVAL '340 days'),
  (1,  'delivered',  NOW() - INTERVAL '180 days'),
  (1,  'paid',       NOW() - INTERVAL '5 days'),
  (2,  'delivered',  NOW() - INTERVAL '300 days'),
  (2,  'shipped',    NOW() - INTERVAL '10 days'),
  (3,  'delivered',  NOW() - INTERVAL '250 days'),
  (3,  'cancelled',  NOW() - INTERVAL '200 days'),
  (4,  'delivered',  NOW() - INTERVAL '220 days'),
  (5,  'delivered',  NOW() - INTERVAL '190 days'),
  (5,  'delivered',  NOW() - INTERVAL '90 days'),
  (6,  'delivered',  NOW() - INTERVAL '160 days'),
  (7,  'delivered',  NOW() - INTERVAL '150 days'),
  (7,  'shipped',    NOW() - INTERVAL '8 days'),
  (8,  'delivered',  NOW() - INTERVAL '140 days'),
  (9,  'delivered',  NOW() - INTERVAL '130 days'),
  (9,  'paid',       NOW() - INTERVAL '3 days'),
  (10, 'delivered',  NOW() - INTERVAL '120 days'),
  (11, 'delivered',  NOW() - INTERVAL '110 days'),
  (12, 'delivered',  NOW() - INTERVAL '100 days'),
  (12, 'delivered',  NOW() - INTERVAL '50 days'),
  (13, 'delivered',  NOW() - INTERVAL '95 days'),
  (14, 'delivered',  NOW() - INTERVAL '85 days'),
  (15, 'delivered',  NOW() - INTERVAL '75 days'),
  (15, 'shipped',    NOW() - INTERVAL '6 days'),
  (16, 'delivered',  NOW() - INTERVAL '65 days'),
  (17, 'cancelled',  NOW() - INTERVAL '60 days'),
  (18, 'delivered',  NOW() - INTERVAL '55 days'),
  (19, 'delivered',  NOW() - INTERVAL '45 days'),
  (20, 'paid',       NOW() - INTERVAL '2 days'),
  (21, 'delivered',  NOW() - INTERVAL '40 days'),
  (22, 'delivered',  NOW() - INTERVAL '35 days'),
  (23, 'delivered',  NOW() - INTERVAL '30 days'),
  (24, 'pending',    NOW() - INTERVAL '1 day'),
  (25, 'delivered',  NOW() - INTERVAL '20 days'),
  (1,  'shipped',    NOW() - INTERVAL '4 days'),
  (2,  'delivered',  NOW() - INTERVAL '15 days'),
  (3,  'delivered',  NOW() - INTERVAL '22 days'),
  (4,  'cancelled',  NOW() - INTERVAL '70 days'),
  (5,  'pending',    NOW() - INTERVAL '1 day'),
  (6,  'delivered',  NOW() - INTERVAL '28 days');

-- Order items (referencing order ids 1-40 and product ids 1-26)
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (1,  1,  1, 2499.00),
  (1,  9,  1,  249.00),
  (2,  5,  1, 1099.00),
  (3,  12, 2,   49.99),
  (3,  13, 1,   39.99),
  (4,  2,  1, 1799.00),
  (4,  11, 1,   99.00),
  (5,  6,  1,  899.00),
  (6,  14, 1,   59.99),
  (6,  15, 1,   54.99),
  (6,  16, 2,   12.99),
  (7,  3,  1, 1599.00),
  (8,  7,  1,  699.00),
  (8,  10, 1,  349.00),
  (9,  17, 1,   16.99),
  (9,  18, 1,   14.99),
  (9,  19, 1,   18.99),
  (10, 4,  1, 1299.00),
  (11, 8,  1,  549.00),
  (11, 11, 2,   99.00),
  (12, 1,  1, 2499.00),
  (12, 10, 1,  349.00),
  (13, 5,  2, 1099.00),
  (14, 20, 1,   17.99),
  (14, 12, 1,   49.99),
  (15, 21, 2,   79.99),
  (15, 22, 1,   59.99),
  (16, 24, 1,   69.99),
  (16, 25, 1,  129.99),
  (17, 6,  1,  899.00),
  (18, 13, 1,   39.99),
  (18, 14, 1,   59.99),
  (19, 2,  1, 1799.00),
  (20, 9,  2,  249.00),
  (20, 11, 1,   99.00),
  (21, 7,  1,  699.00),
  (22, 23, 1,  129.99),
  (22, 26, 1,  139.99),
  (23, 1,  1, 2499.00),
  (23, 9,  1,  249.00),
  (24, 12, 3,   49.99),
  (25, 5,  1, 1099.00),
  (26, 3,  1, 1599.00),
  (27, 19, 2,   18.99),
  (27, 20, 1,   17.99),
  (28, 17, 1,   16.99),
  (29, 8,  1,  549.00),
  (30, 4,  1, 1299.00),
  (30, 10, 1,  349.00),
  (31, 6,  1,  899.00),
  (32, 1,  1, 2499.00),
  (33, 15, 2,   54.99),
  (34, 21, 1,   79.99),
  (34, 24, 2,   69.99),
  (35, 5,  1, 1099.00),
  (35, 9,  1,  249.00),
  (36, 2,  1, 1799.00),
  (37, 13, 1,   39.99),
  (37, 16, 3,   12.99),
  (38, 7,  1,  699.00),
  (39, 11, 1,   99.00),
  (40, 3,  1, 1599.00),
  (40, 22, 2,   59.99);

INSERT INTO reviews (product_id, customer_id, rating, comment) VALUES
  (1,  1,  5, 'Absolutely love this laptop. Fast and reliable.'),
  (1,  3,  4, 'Great performance, but pricey.'),
  (1,  12, 5, 'Best laptop I have ever owned.'),
  (2,  4,  4, 'Solid build quality, good battery life.'),
  (2,  6,  3, 'Decent but keyboard feels mushy.'),
  (3,  7,  4, 'Good value for money.'),
  (4,  23, 5, 'Perfect for students.'),
  (5,  2,  5, 'Camera is stunning. Best phone upgrade.'),
  (5,  9,  4, 'Love Face ID improvements.'),
  (5,  13, 5, 'Incredible camera. Worth every penny.'),
  (6,  5,  4, 'Great Android experience.'),
  (6,  10, 3, 'Battery life could be better.'),
  (7,  8,  5, 'Great mid-range phone.'),
  (9,  1,  5, 'Noise cancellation is phenomenal.'),
  (9,  11, 4, 'Sound quality is excellent.'),
  (10, 2,  5, 'Best headphones on the market.'),
  (10, 14, 5, 'Incredible noise cancellation.'),
  (11, 4,  4, 'Very precise and comfortable.'),
  (12, 3,  5, 'Changed how I think about software.'),
  (12, 6,  5, 'Essential reading for any developer.'),
  (12, 15, 4, 'Great book, slightly dated examples.'),
  (13, 7,  5, 'A must-read for developers.'),
  (13, 19, 4, 'Timeless advice on writing clean software.'),
  (14, 8,  5, 'Best technical book I have read this year.'),
  (14, 12, 5, 'Dense but incredibly valuable.'),
  (15, 20, 4, 'Great companion to DDIA.'),
  (17, 9,  5, 'Epic sci-fi. Loved it.'),
  (18, 16, 4, 'Classic Asimov. Holds up well.'),
  (19, 17, 5, 'Life-changing habits framework.'),
  (20, 18, 4, 'Fascinating look at decision-making.'),
  (21, 5,  4, 'Good fit and comfortable.'),
  (24, 10, 5, 'Perfect for workouts.'),
  (25, 22, 3, 'Nice but runs small.'),
  (26, 24, 5, 'Super comfortable for long runs.');

COMMIT;
`;

export async function POST(): Promise<NextResponse> {
  const client = await pool.connect();
  try {
    await client.query(SEED_SQL);
    return NextResponse.json({
      ok: true,
      message:
        "Playground schema created: customers, products, categories, orders, order_items, reviews, employees, departments — with indexes and sample data.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 200 });
  } finally {
    client.release();
  }
}
