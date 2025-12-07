# Profile Settings with Address Fields - Implementation Guide

## Database Setup

### Step 1: Run the SQL migration
Execute the SQL file to add address fields to your database:

```bash
# Connect to your MySQL database and run:
mysql -u your_username -p emoweb < sql/add_address_fields.sql
```

Or manually run this SQL:
```sql
USE emoweb;

ALTER TABLE users
ADD COLUMN region VARCHAR(50) AFTER contact_number,
ADD COLUMN country VARCHAR(100) AFTER region,
ADD COLUMN city VARCHAR(100) AFTER country,
ADD COLUMN street_address TEXT AFTER city,
ADD COLUMN postal_code VARCHAR(20) AFTER street_address;
```

## Backend Setup

### Step 2: Restart your server
The following files have been created/updated:
- ✅ `server/src/routes/profile.js` - New profile API endpoints
- ✅ `server/src/app.js` - Added profile routes

Restart your Node.js server to apply changes:
```bash
cd server
npm start
```

## Frontend Setup

### Step 3: Frontend is ready
The ProfileSettings component has been updated with:
- ✅ Auto-fetch user profile data on load
- ✅ Save profile changes to database
- ✅ Success/error message display
- ✅ Loading and saving states

## API Endpoints

### GET /api/profile
Fetches the current logged-in user's profile data.
- **Auth**: Required (cookie-based)
- **Returns**: User profile with all fields including address

### PUT /api/profile
Updates the current logged-in user's profile.
- **Auth**: Required (cookie-based)
- **Body**: JSON with fields: firstName, middleInitial, lastName, contactNumber, region, country, city, address, postalCode
- **Returns**: Updated user profile

## Testing

1. **Login** to your application
2. **Navigate** to the user dashboard
3. **Fill out** the profile form with your information
4. **Click** "Save Changes"
5. **Refresh** the page - your data should persist

## Database Schema

The `users` table now includes:
- `region` - VARCHAR(50) - e.g., "Asia", "Europe"
- `country` - VARCHAR(100) - e.g., "Philippines", "United States"
- `city` - VARCHAR(100) - e.g., "Manila", "New York"
- `street_address` - TEXT - Full street address
- `postal_code` - VARCHAR(20) - Postal/ZIP code

## Notes

- Make sure your backend server is running on `http://localhost:3000`
- If using a different port, update the fetch URLs in `ProfileSettings.jsx`
- The API uses HttpOnly cookies for authentication
- All fields are optional except those marked as required in the form
