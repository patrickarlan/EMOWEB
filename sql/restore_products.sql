    -- Restore EMO AI products to the database
    USE emoweb;

    -- Check if products already exist and insert only if they don't
    INSERT INTO products (product_name, product_image, description, price, stock_quantity, specifications, is_active)
    SELECT * FROM (
    SELECT 
        'EMO-S AI ROBOT' as product_name,
        '/uploads/products/emo-s.jpg' as product_image,
        'Lorem Ipsum is simply dummy printing and typesetting industry' as description,
        67.00 as price,
        100 as stock_quantity,
        JSON_OBJECT(
        'dimensions', '3.2 x 2.6 x 4.6 cm',
        'weight', '100g',
        'camera', 'Raspi Cam',
        'microprocessor', 'Raspi 4 8GB R',
        'batteryLife', '4 hrs',
        'warranty', '1 Year'
        ) as specifications,
        1 as is_active
    ) AS tmp
    WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE product_name = 'EMO-S AI ROBOT'
    ) LIMIT 1;

    INSERT INTO products (product_name, product_image, description, price, stock_quantity, specifications, is_active)
    SELECT * FROM (
    SELECT 
        'EMO AI PROTOTYPE' as product_name,
        '/uploads/products/emo-prototype.jpg' as product_image,
        'Lorem Ipsum is simply dummy printing and typesetting industry' as description,
        40.00 as price,
        100 as stock_quantity,
        JSON_OBJECT(
        'dimensions', '3.2 x 2.6 x 4.6 cm',
        'weight', '100g',
        'camera', 'Raspi Cam',
        'microprocessor', 'Raspi 4 8GB R',
        'batteryLife', '4 hrs',
        'warranty', '1 Year'
        ) as specifications,
        1 as is_active
    ) AS tmp
    WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE product_name = 'EMO AI PROTOTYPE'
    ) LIMIT 1;

    INSERT INTO products (product_name, product_image, description, price, stock_quantity, specifications, is_active)
    SELECT * FROM (
    SELECT 
        'EMO AI PRO' as product_name,
        '/uploads/products/emo-pro.jpg' as product_image,
        'Lorem Ipsum is simply dummy printing and typesetting industry' as description,
        95.00 as price,
        100 as stock_quantity,
        JSON_OBJECT(
        'dimensions', '3.2 x 2.6 x 4.6 cm',
        'weight', '100g',
        'camera', 'Raspi Cam',
        'microprocessor', 'Raspi 4 8GB R',
        'batteryLife', '4 hrs',
        'warranty', '1 Year'
        ) as specifications,
        1 as is_active
    ) AS tmp
    WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE product_name = 'EMO AI PRO'
    ) LIMIT 1;

    -- Verify products were inserted
    SELECT id, product_name, price, stock_quantity, is_active FROM products;
