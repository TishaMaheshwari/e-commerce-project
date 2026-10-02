DROP TABLE IF EXISTS garment_skus CASCADE;
DROP TABLE IF EXISTS apparel_variants CASCADE;
DROP TABLE IF EXISTS clothing_catalog CASCADE;
DROP TABLE IF EXISTS fashion_categories CASCADE;

CREATE TABLE fashion_categories (
    category_id SERIAL PRIMARY KEY,
    parent_category_id INT REFERENCES fashion_categories(category_id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    slug_url VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clothing_catalog (
    product_id SERIAL PRIMARY KEY,
    category_id INT REFERENCES fashion_categories(category_id) ON DELETE RESTRICT,
    title_name VARCHAR(150) NOT NULL,
    slug_url VARCHAR(150) UNIQUE NOT NULL,
    fabric_description TEXT,
    production_state VARCHAR(20) DEFAULT 'draft' CHECK (production_state IN ('draft', 'active', 'archived')),
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE apparel_variants (
    variant_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES clothing_catalog(product_id) ON DELETE CASCADE,
    specification_type VARCHAR(50) NOT NULL,
    specification_value VARCHAR(50) NOT NULL,
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE garment_skus (
    sku_id SERIAL PRIMARY KEY,
    variant_id INT REFERENCES apparel_variants(variant_id) ON DELETE CASCADE,
    barcode_sku VARCHAR(50) UNIQUE NOT NULL,
    retail_price DECIMAL(10, 2) NOT NULL CHECK (retail_price >= 0.00),
    stock_count INT NOT NULL CHECK (stock_count >= 0),
    is_available BOOLEAN DEFAULT true,
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO fashion_categories (category_name, slug_url) VALUES ('Apparel', 'apparel-root');
INSERT INTO fashion_categories (category_name, slug_url, parent_category_id) VALUES ('Hoodies & Jackets', 'hoodies-jackets', 1);

INSERT INTO clothing_catalog (category_id, title_name, slug_url, fabric_description, production_state) VALUES 
(2, 'Vintage Heavyweight Hoodie', 'vintage-heavy-hoodie', '450GSM ultra-premium organic French terry cotton garment.', 'active'),
(2, 'Classic Slim Denim Jacket', 'classic-slim-denim', 'Raw indigo selvedge denim apparel structure.', 'active'),
(1, 'Graphic Summer Tee', 'graphic-summer-tee', 'Lightweight breathable combed cotton.', 'draft');

INSERT INTO apparel_variants (product_id, specification_type, specification_value) VALUES 
(1, 'Size Matrix', 'Oversized L'),
(1, 'Size Matrix', 'Medium M'),
(2, 'Color Layer', 'Indigo Blue');

INSERT INTO garment_skus (variant_id, barcode_sku, retail_price, stock_count) VALUES 
(1, 'APP-HOOD-OV-L', 85.00, 24),
(2, 'APP-HOOD-MED-M', 85.00, 15),
(3, 'APP-DENM-IND-S', 120.00, 10);