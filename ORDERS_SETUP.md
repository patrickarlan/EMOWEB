# Orders System Setup Guide

## Overview
The Orders system allows users to view their order history with detailed information about products, quantities, payment methods, and order status.

## Database Setup

### Step 1: Create Orders Tables
Run the following SQL file in MySQL Workbench:
```sql
sql/create_orders_tables.sql
```

This creates:
- `orders` table - Stores order information (order number, status, payment, totals)
- `order_items` table - Stores individual products in each order

### Step 2: Add Sample Data (Optional)
To test the orders panel with sample data:

1. First, find your user ID:
```sql
SELECT id, username FROM users;
```

2. Edit `sql/sample_orders_data.sql` and replace all instances of `user_id = 1` with your actual user ID

3. Run the sample data SQL file in MySQL Workbench:
```sql
sql/sample_orders_data.sql
```

## Features

### Order Information Displayed:
- ✅ Order number and date
- ✅ Order status with color-coded badges (pending, processing, shipped, delivered, cancelled)
- ✅ Product images (or placeholder if no image)
- ✅ Product names and quantities
- ✅ Individual item prices
- ✅ Payment method
- ✅ Subtotal, shipping fees, and total amount
- ✅ Item-level subtotals

### UI Features:
- 📦 Beautiful card-based layout
- 🎨 Glassmorphic design matching the dashboard theme
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Loading states and empty states
- 🎯 Hover effects and smooth animations
- 🏷️ Color-coded status badges

### Order Status Colors:
- **Pending** - Yellow/Amber
- **Processing** - Blue
- **Shipped** - Purple
- **Delivered** - Green
- **Cancelled** - Red

## Navigation

The Orders panel can be accessed:
1. Click the "Orders" box in the dashboard grid
2. Click "Orders" in the sidebar navigation

When in Profile view, the Orders will show in the detail panel on the right (or below on mobile).

## API Endpoints

### Get All Orders
```
GET /api/orders
```
Returns all orders for the authenticated user with their items.

### Get Single Order
```
GET /api/orders/:orderId
```
Returns detailed information for a specific order.

## File Structure

```
server/src/routes/
  └── orders.js                 # Backend API routes

src/backend/dashboards/userdash/
  ├── components/
  │   ├── Orders.jsx            # Orders component
  │   └── styles/
  │       └── Orders.css        # Orders styling
  ├── userdash.jsx              # Main dashboard (updated)
  └── USsidebar.jsx             # Sidebar navigation (updated)

sql/
  ├── create_orders_tables.sql  # Database schema
  └── sample_orders_data.sql    # Sample test data
```

## Next Steps

### For Development:
1. Run the database migrations
2. Add sample data to test the UI
3. Restart your backend server to load the new routes

### For Production:
You'll need to integrate this with your actual e-commerce/checkout system to:
- Create orders when users complete purchases
- Update order status as orders are processed
- Add product images from your product catalog
- Send order confirmation emails
- Track shipping information

## Order Status Workflow

Typical order flow:
1. **Pending** - Order placed, awaiting payment confirmation
2. **Processing** - Payment confirmed, preparing items
3. **Shipped** - Order dispatched, on the way
4. **Delivered** - Order received by customer
5. **Cancelled** - Order cancelled by user or admin

## Customization

### Adding More Payment Methods:
Edit the `payment_method` field in your orders. The system displays whatever payment method string you store.

### Adding Tracking Numbers:
Add a `tracking_number` column to the orders table and update the Orders.jsx component to display it.

### Adding Order Actions:
You can add buttons like "Cancel Order", "Track Package", "Reorder" by adding click handlers in Orders.jsx and corresponding API endpoints.

## Troubleshooting

### Orders not showing:
- Check that you've run the database migrations
- Verify the user_id in sample data matches your actual user
- Check browser console for API errors
- Ensure backend server is running

### Images not displaying:
- Verify product_image paths are correct
- Check that images exist in the specified location
- Ensure the uploads directory is accessible

### 404 on /api/orders:
- Restart your backend server after adding the new routes
- Verify orders.js is in server/src/routes/
- Check that app.js has the orders route registered
