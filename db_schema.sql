-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    role VARCHAR(10) NOT NULL DEFAULT 'buyer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (role IN ('admin', 'seller', 'buyer'))
);

-- 2. Categories Table (Hierarchical structure)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_parent
      FOREIGN KEY (parent_id)
      REFERENCES categories(id)
      ON DELETE SET NULL
);

-- 3. Locations Table (Hierarchical: country, region, city, etc.)
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT,
    type VARCHAR(20) DEFAULT 'other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_location_parent
      FOREIGN KEY (parent_id)
      REFERENCES locations(id)
      ON DELETE SET NULL,
    CHECK (type IN ('country', 'region', 'city', 'other'))
);

-- 4. Listings (Ads) Table
CREATE TABLE ads (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    location_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(10) NOT NULL DEFAULT 'pending',
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ads_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_ads_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_ads_location FOREIGN KEY (location_id) REFERENCES locations(id),
    CHECK (status IN ('active','pending','expired','deleted'))
);

-- 5. Payments Table (for transactions related to premium/sponsored listings)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    ad_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'other',
    status VARCHAR(10) NOT NULL DEFAULT 'pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_payments_ad FOREIGN KEY (ad_id) REFERENCES ads(id),
    CHECK (payment_method IN ('mobile_money','paypal','other')),
    CHECK (status IN ('successful','pending','failed'))
);

-- 6. Sponsored Listings Table
CREATE TABLE sponsored_ads (
    id SERIAL PRIMARY KEY,
    ad_id INT NOT NULL,
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_id INT,
    status VARCHAR(10) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sponsored_ad_ad FOREIGN KEY (ad_id) REFERENCES ads(id),
    CONSTRAINT fk_sponsored_ad_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_sponsored_ad_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
    CHECK (status IN ('active','expired'))
);

-- 7. Ad Images Table (multiple images per ad)
CREATE TABLE ad_images (
    id SERIAL PRIMARY KEY,
    ad_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_image_ad FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
);

-- 8. Favorites Table (users can save ads)
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    ad_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_favorite_ad FOREIGN KEY (ad_id) REFERENCES ads(id)
);

-- 9. Messages Table (for internal conversations)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    ad_id INT,
    message_text TEXT NOT NULL,
    read_status VARCHAR(10) NOT NULL DEFAULT 'unread',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(id),
    CONSTRAINT fk_message_receiver FOREIGN KEY (receiver_id) REFERENCES users(id),
    CONSTRAINT fk_message_ad FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
    CHECK (read_status IN ('read','unread'))
);

-- 10. Reviews Table (buyers reviewing sellers)
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    reviewer_id INT NOT NULL,
    seller_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id),
    CONSTRAINT fk_review_seller FOREIGN KEY (seller_id) REFERENCES users(id),
    CHECK (rating BETWEEN 1 AND 5)
);

-- 11. Reports Table (for flagging ads or users)
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reported_by INT NOT NULL,
    ad_id INT,
    user_id INT,
    reason TEXT NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_report_reporter FOREIGN KEY (reported_by) REFERENCES users(id),
    CONSTRAINT fk_report_ad FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_user FOREIGN KEY (user_id) REFERENCES users(id),
    CHECK (status IN ('pending','resolved'))
);

-- 12. Notifications Table (optional, for user alerts)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 13. Listing Images Table (multiple images per listing)
CREATE TABLE listing_images (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    listing_id BIGINT REFERENCES ads(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
