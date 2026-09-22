# Toyland E-Commerce - Database

This directory contains the database SQL dump, schema definitions, table structures, and initial seed data for the Toyland E-Commerce application.

## Files

- `schema.sql`: Full MySQL database dump containing all tables (`users`, `categories`, `products`, `product_images`, `cart_items`, `orders`, `order_items`, `jwt_tokens`), indices, foreign key constraints, and seed data.

## Setup Instructions

1. Ensure MySQL Server (version 8.0+) is installed and running on your system.
2. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS stringstacks_ecommerce;
   ```
3. Import the `schema.sql` dump file:
   ```bash
   mysql -u root -p stringstacks_ecommerce < database/schema.sql
   ```
4. Verify backend configuration in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/stringstacks_ecommerce?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
