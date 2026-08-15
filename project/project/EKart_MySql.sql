drop schema  if exists ekart_product ;

create schema ekart_product;
use `ekart_product`;

-- Sweets catalog (Mithai Junction). ProductMS itself creates/evolves this schema via
-- Hibernate ddl-auto=update on startup — the CREATE TABLE statements below are kept here
-- only as a standalone reference for setting the DB up from scratch without first running
-- the app. Category/Offer are separate tables (see ProductMS entity package) rather than a
-- free-text CATEGORY column, so admins can manage them without a redeploy.

CREATE TABLE EK_CATEGORY (
	CATEGORY_ID INT auto_increment,
	NAME VARCHAR(255) NOT NULL UNIQUE,
	DESCRIPTION VARCHAR(1000),
	IMAGE_URL VARCHAR(1000),
	DISPLAY_ORDER INT,
	constraint EK_CATEGORY_ID_PK primary key (CATEGORY_ID)
);

CREATE TABLE EK_PRODUCT(
	PRODUCT_ID INT auto_increment,
	NAME VARCHAR(500) NOT NULL,
	DESCRIPTION VARCHAR(1000) NOT NULL,
	CATEGORY_ID INT,
	PRICE BIGINT NOT NULL,
	QUANTITY SMALLINT NOT NULL,
	is_veg BIT(1),
	unit VARCHAR(255),
	unit_quantity INT,
	ingredients VARCHAR(1000),
	allergens VARCHAR(500),
	shelf_life_days INT,
	image_url VARCHAR(1000),
	is_available BIT(1),
	is_best_seller BIT(1),
	avg_rating DOUBLE,
	rating_count INT,
	created_at DATETIME(6),
	constraint EK_PRODUCT_ID_PK primary key ( PRODUCT_ID ),
	constraint EK_PRODUCT_CATEGORY_FK foreign key (CATEGORY_ID) references EK_CATEGORY(CATEGORY_ID)
);

CREATE TABLE EK_OFFER (
	OFFER_ID INT auto_increment,
	NAME VARCHAR(255) NOT NULL,
	DISCOUNT_TYPE VARCHAR(20) NOT NULL,
	DISCOUNT_VALUE DOUBLE NOT NULL,
	PRODUCT_ID INT,
	CATEGORY_ID INT,
	START_DATE DATE NOT NULL,
	END_DATE DATE NOT NULL,
	IS_ACTIVE BIT(1),
	constraint EK_OFFER_ID_PK primary key (OFFER_ID)
);

-- Seed data: see MithaiJunction_ProductSeed.sql in the repo root (project/project/) for the
-- full Mithai Junction category + product + offer seed data. Kept as a separate file since
-- it's re-run independently of schema setup (e.g. after `DELETE FROM EK_PRODUCT` to reseed).

-- (legacy electronics catalog removed — see git history if it's ever needed for reference)
-- INSERT INTO EK_PRODUCT (PRODUCT_ID, NAME, DESCRIPTION, CATEGORY, BRAND, PRICE,  QUANTITY) VALUES (1000,'Bot E5s Plus','Smart phone with (13+13)MP rear camera and 8MP front camera, 4GB RAM and 64GB ROM,5.5 inch FHD display, Snapdrag 625 processor', 'Electronics - Mobile', 'Motobot', 16000, 150);


commit;
SELECT * FROM EK_PRODUCT;

drop schema  if exists ekart_customer;
create schema ekart_customer;
use `ekart_customer`;


-- Customer identity, address book, and order lifecycle for Mithai Junction. CustomerMS
-- creates/evolves this schema via Hibernate ddl-auto=update; kept here as a standalone
-- reference. No customer/order seed data is included — passwords must be BCrypt-hashed by
-- the application, so create test accounts via POST /api/auth/register instead of raw SQL.

CREATE TABLE EK_CUSTOMER(
	EMAIL_ID VARCHAR(50),
	NAME VARCHAR(50) NOT NULL,
	PASSWORD VARCHAR(70) NOT NULL,
	PHONE_NUMBER VARCHAR(10) NOT NULL UNIQUE,
	role VARCHAR(255),
	constraint EK_CUSTOMER_EMAIL_ID_PK primary key ( EMAIL_ID )
);

CREATE TABLE EK_ADDRESS (
	ADDRESS_ID INT auto_increment,
	CUSTOMER_EMAIL_ID VARCHAR(50),
	LABEL VARCHAR(255),
	LINE1 VARCHAR(255) NOT NULL,
	LINE2 VARCHAR(255),
	CITY VARCHAR(255) NOT NULL,
	STATE VARCHAR(255) NOT NULL,
	PINCODE VARCHAR(255) NOT NULL,
	LANDMARK VARCHAR(255),
	IS_DEFAULT BIT(1),
	LATITUDE DOUBLE,
	LONGITUDE DOUBLE,
	constraint EK_ADDRESS_ID_PK primary key (ADDRESS_ID)
);

CREATE TABLE EK_REFRESH_TOKEN (
	token_id INT auto_increment,
	customer_email_id VARCHAR(255),
	token_hash VARCHAR(255),
	expires_at DATETIME(6),
	revoked BIT(1) NOT NULL,
	constraint EK_REFRESH_TOKEN_ID_PK primary key (token_id)
);

-- Delivery type/payment method/order status are validated in Java (JPA enums) rather than a
-- DB CHECK constraint, since MySQL 8 enforces CHECK constraints strictly and this domain's
-- enums (order status especially) are expected to grow.
CREATE TABLE EK_ORDER (
	ORDER_ID BIGINT NOT NULL auto_increment,
	DATE_OF_ORDER DATETIME NOT NULL,
	TOTAL_PRICE DECIMAL(12,2) NOT NULL,
	ORDER_STATUS VARCHAR(20) NOT NULL,
	PAYMENT_THROUGH VARCHAR(20) NOT NULL,
	DATE_OF_DELIVERY DATETIME,
	CUSTOMER_EMAIL_ID VARCHAR(50),
	DISCOUNT DECIMAL(10,2),
	delivery_type VARCHAR(255),
	address_id INT,
	delivery_address_snapshot VARCHAR(1000),
	pickup_store_location VARCHAR(255),
	constraint EK_ORDER_ID_PK primary key (ORDER_ID)
);

CREATE TABLE EK_ORDERED_PRODUCT (
    ORDERED_PRODUCT_ID INT auto_increment,
	ORDER_ID BIGINT ,
	PRODUCT_ID INT,
	QUANTITY INT,
	unit_price DOUBLE,
	constraint EK_ORDERED_PRODUCT_ID_PK primary key ( ORDERED_PRODUCT_ID),
	constraint EK_ORDERED_PRODUCT_ID_ORDER_FK foreign key (ORDER_ID)
    references EK_ORDER(ORDER_ID)
);

CREATE TABLE EK_ORDER_STATUS_HISTORY (
	history_id INT auto_increment,
	order_id INT,
	status VARCHAR(255),
	changed_at DATETIME(6),
	changed_by VARCHAR(255),
	note VARCHAR(255),
	constraint EK_ORDER_STATUS_HISTORY_ID_PK primary key (history_id)
);

-- Reviews require a DELIVERED order containing the product (enforced in ReviewServiceImpl,
-- not by a DB constraint) — one review per (customer, product) pair. Submitting/hiding a
-- review pushes a recomputed average rating to ProductMS (PUT /product-api/product/{id}/rating)
-- so the denormalized AVG_RATING/RATING_COUNT on EK_PRODUCT stays in sync.
CREATE TABLE EK_REVIEW (
	REVIEW_ID INT auto_increment,
	PRODUCT_ID INT,
	CUSTOMER_EMAIL_ID VARCHAR(255),
	ORDER_ID INT,
	RATING INT,
	COMMENT VARCHAR(1000),
	CREATED_AT DATETIME(6),
	IS_HIDDEN BIT(1),
	constraint EK_REVIEW_ID_PK primary key (REVIEW_ID)
);

-- Cart and wishlist for Mithai Junction. CustomerCartMS creates/evolves this schema via
-- Hibernate ddl-auto=update; kept here as a standalone reference. No seed data — carts and
-- wishlists are created organically as customers browse and shop.

drop schema  if exists  ekart_customercart;
create schema ekart_customercart;
use `ekart_customercart`;

CREATE TABLE EK_CUSTOMER_CART (
	CART_ID INT auto_increment,
    CUSTOMER_EMAIL_ID VARCHAR(50) unique,
	constraint EK_CART_ID_PK primary key (CART_ID)
);

CREATE TABLE EK_CART_PRODUCT
(
CART_PRODUCT_ID INT auto_increment,
CART_ID INT,
PRODUCT_ID INT NOT NULL,
QUANTITY SMALLINT,
constraint EK_CART_PRODUCT_ID_PK primary key (CART_PRODUCT_ID ),
constraint EK_CART_PRODUCT_ID_CUSTOMER_CART_FK foreign key (CART_ID) references EK_CUSTOMER_CART (CART_ID)
);

CREATE TABLE EK_WISHLIST (
	wishlist_id INT auto_increment,
	customer_email_id VARCHAR(255) unique,
	constraint EK_WISHLIST_ID_PK primary key (wishlist_id)
);

CREATE TABLE EK_WISHLIST_ITEM (
	wishlist_item_id INT auto_increment,
	wishlist_id INT,
	product_id INT,
	added_at DATETIME(6),
	constraint EK_WISHLIST_ITEM_ID_PK primary key (wishlist_item_id),
	constraint EK_WISHLIST_ITEM_WISHLIST_FK foreign key (wishlist_id) references EK_WISHLIST (wishlist_id)
);

-- Online payments for Mithai Junction, via Razorpay (test/sandbox mode). PaymentMS creates/
-- evolves this schema via Hibernate ddl-auto=update; kept here as a standalone reference.
--
-- Deliberately no card-storage table anymore: the original eKart schema stored raw card
-- numbers and SHA-256-hashed CVVs directly (EK_CARD, below, for reference/deletion only) —
-- a PCI-DSS-violating anti-pattern. Card/UPI details now never reach our servers at all;
-- they're entered directly inside Razorpay's Checkout widget on the frontend, and we only
-- ever store the gateway's own order/payment/signature references.
--
-- Cash on Delivery orders never create a row here at all — see CustomerMS's
-- OrderServiceImpl, which auto-confirms COD orders at placement with no payment step.

drop schema  if exists ekart_payment;
create schema ekart_payment;
use `ekart_payment`;

CREATE TABLE EK_PAYMENT_TRANSACTION (
	transaction_id INT auto_increment,
	order_id INT,
	customer_email_id VARCHAR(255),
	GATEWAY_ORDER_ID VARCHAR(255),
	GATEWAY_PAYMENT_ID VARCHAR(255),
	GATEWAY_SIGNATURE VARCHAR(512),
	amount DOUBLE,
	currency VARCHAR(255),
	payment_method_label VARCHAR(255),
	status VARCHAR(255),
	created_at DATETIME(6),
	updated_at DATETIME(6),
	constraint EK_PAYMENT_TRANSACTION_ID_PK primary key (transaction_id)
);