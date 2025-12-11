# Stock Management Implementation

## Overview
Implemented automatic stock decrement system when orders are shipped by admin.

## Database Changes

### 1. SQL Migrations
Run these SQL files to add product_id columns:

```sql
-- Run in order:
sql/add_product_id_to_cart.sql
sql/add_product_id_to_order_items.sql
```

These add `product_id` columns to:
- `cart` table
- `order_items` table

## Features Implemented

### 1. Stock Display on Product Cards
- Stock quantity shown in product specifications
- Low stock warning (red text) when stock ≤ 10 units
- "Out of Stock" message when stock = 0

### 2. Automatic Stock Decrement
When admin changes order status to "shipped":
- System checks current order status
- If changing FROM any status TO "shipped"
- Automatically decrements stock for each product in the order
- Only decrements if sufficient stock exists
- Logs stock changes to console

### 3. Product ID Tracking
- Cart now stores `product_id` along with product details
- Order items now store `product_id` for accurate stock tracking
- Frontend sends `productId` when adding items to cart

## Backend Changes

### Modified Files:

1. **server/src/routes/admin.js**
   - Updated `PATCH /orders/:id/status` endpoint
   - Added stock decrement logic when status = 'shipped'
   - Prevents duplicate decrements for already-shipped orders

2. **server/src/routes/cart.js**
   - Updated `GET /` to include product_id
   - Updated `POST /add` to accept and store product_id
   - Updated checkout to pass product_id to order_items

3. **server/src/routes/orders.js**
   - Updated order creation to include product_id in order_items

## Frontend Changes

### Modified Files:

1. **src/main/products/CartPanel.jsx**
   - Added `productId` to cart add request

2. **src/main/products/ProductCard.jsx**
   - Added stock display in product specifications
   - Shows stock quantity with low-stock warning styling

3. **src/main/products/productCard.scss**
   - Added `.low-stock` class for red warning text

## How It Works

### Flow:
1. User orders products → Order created with status = "pending"
2. Admin views order in Product Management dashboard
3. Admin changes order status to "shipped"
4. Backend automatically:
   - Retrieves all order items with product_id
   - Decrements stock_quantity for each product
   - Only decrements if stock is sufficient
   - Logs the change

### Stock Decrement Logic:
```sql
UPDATE products 
SET stock_quantity = stock_quantity - [ordered_quantity] 
WHERE id = [product_id] 
AND stock_quantity >= [ordered_quantity]
```

## Testing

### To Test:
1. Run SQL migrations first
2. Restart backend server
3. Add products to cart from product page
4. Checkout to create an order
5. Go to Admin Dashboard → Product Management
6. Change order status to "shipped"
7. Check product stock has decreased
8. View product card to see updated stock

## Notes
- Stock only decrements when order status changes TO "shipped"
- Changing from "shipped" to another status does NOT restore stock
- Stock won't decrement below 0 (safety check in SQL)
- Console logs show which products had stock decremented
