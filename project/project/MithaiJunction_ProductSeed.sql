-- Mithai Junction catalog seed data for ProductMS (schema EKART_PRODUCT / ekart_product).
-- Replaces the original eKart electronics/clothing/home-goods sample data.
-- Run against the ekart_product schema once ProductMS has created EK_CATEGORY / EK_PRODUCT
-- (via Hibernate ddl-auto=update) so the CATEGORY_ID foreign key exists.

USE `ekart_product`;

-- Clear previous sample data (old electronics catalog + anything already seeded here).
DELETE FROM EK_PRODUCT;
DELETE FROM EK_OFFER;
DELETE FROM EK_CATEGORY;

-- ===================== Categories =====================
INSERT INTO EK_CATEGORY (CATEGORY_ID, NAME, DESCRIPTION, IMAGE_URL, DISPLAY_ORDER) VALUES
(1, 'Sweet', 'Fresh and traditional Indian sweets', '/images/products/kaju-katli.jpg', 1),
(2, 'Namkeen', 'Savoury snacks and mixtures', '/images/products/aloo-bhujia.jpg', 2),
(3, 'Beverages', 'Traditional and festive drinks', '/images/products/thandai.jpg', 3);

-- ===================== Sweets =====================
INSERT INTO EK_PRODUCT (NAME, DESCRIPTION, CATEGORY_ID, PRICE, QUANTITY, IS_VEG, UNIT, UNIT_QUANTITY, INGREDIENTS, ALLERGENS, SHELF_LIFE_DAYS, IMAGE_URL, IS_AVAILABLE, IS_BEST_SELLER, AVG_RATING, RATING_COUNT, CREATED_AT) VALUES
('Kaju Katli', 'Diamond-cut cashew fudge finished with a silver leaf, a festival favourite.', 1, 620, 80, 1, 'GRAM', 500, 'Cashew nuts, sugar, ghee, silver leaf (varq)', 'Tree nuts (cashew)', 10, '/images/products/kaju-katli.jpg', 1, 1, 4.6, 128, NOW()),
('Motichoor Ladoo', 'Fine besan pearls simmered in sugar syrup and shaped into soft ladoos.', 1, 420, 120, 1, 'GRAM', 500, 'Gram flour, sugar, ghee, cardamom, edible color', 'Gluten may be present (shared equipment)', 7, '/images/products/motichoor-ladoo.jpg', 1, 1, 4.5, 96, NOW()),
('Besan Ladoo', 'Roasted gram flour ladoos with ghee and cardamom, no added preservatives.', 1, 380, 100, 1, 'GRAM', 500, 'Gram flour, ghee, sugar, cardamom', 'None declared', 12, '/images/products/besan-ladoo.jpg', 1, 0, 4.3, 54, NOW()),
('Gulab Jamun (12 pcs)', 'Soft khoya dumplings soaked in rose-cardamom sugar syrup.', 1, 320, 150, 1, 'PIECE', 12, 'Milk solids (khoya), maida, sugar syrup, rose water, cardamom', 'Milk, gluten', 5, '/images/products/gulab-jamun.jpg', 1, 1, 4.7, 210, NOW()),
('Rasgulla (12 pcs)', 'Spongy chenna balls in light sugar syrup, a Bengali classic.', 1, 280, 130, 1, 'PIECE', 12, 'Chenna (fresh cheese), sugar syrup', 'Milk', 5, '/images/products/rasgulla.jpg', 1, 0, 4.4, 67, NOW()),
('Soan Papdi', 'Flaky, melt-in-the-mouth gram-flour and sugar sweet with cardamom.', 1, 260, 90, 1, 'GRAM', 500, 'Gram flour, sugar, ghee, cardamom', 'None declared', 20, '/images/products/soan-papdi.jpg', 1, 0, 4.0, 38, NOW());

-- ===================== More sweets =====================
INSERT INTO EK_PRODUCT (NAME, DESCRIPTION, CATEGORY_ID, PRICE, QUANTITY, IS_VEG, UNIT, UNIT_QUANTITY, INGREDIENTS, ALLERGENS, SHELF_LIFE_DAYS, IMAGE_URL, IS_AVAILABLE, IS_BEST_SELLER, AVG_RATING, RATING_COUNT, CREATED_AT) VALUES
('Sandesh', 'Delicately sweetened chenna sandesh, lightly flavoured with cardamom.', 1, 340, 90, 1, 'GRAM', 400, 'Chenna (fresh cheese), sugar, cardamom', 'Milk', 4, '/images/products/sandesh.jpg', 1, 0, 4.2, 41, NOW()),
('Mishti Doi', 'Traditional caramelised sweet yogurt set in earthen pots.', 1, 180, 60, 1, 'PIECE', 1, 'Milk, sugar, live yogurt culture', 'Milk', 3, '/images/products/mishti-doi.jpg', 1, 1, 4.6, 88, NOW()),
('Chum Chum', 'Oval chenna sweets soaked in syrup and coated with coconut.', 1, 300, 70, 1, 'PIECE', 10, 'Chenna, sugar syrup, desiccated coconut', 'Milk, coconut', 5, '/images/products/chum-chum.jpg', 1, 0, 4.1, 29, NOW()),
('Kheer Kadam', 'Rasgulla stuffed with sweet khoya and dusted with milk powder.', 1, 360, 55, 1, 'PIECE', 8, 'Chenna, khoya, sugar, milk powder', 'Milk', 4, '/images/products/kheer-kadam.jpg', 1, 0, 4.3, 22, NOW());

-- ===================== Namkeen =====================
INSERT INTO EK_PRODUCT (NAME, DESCRIPTION, CATEGORY_ID, PRICE, QUANTITY, IS_VEG, UNIT, UNIT_QUANTITY, INGREDIENTS, ALLERGENS, SHELF_LIFE_DAYS, IMAGE_URL, IS_AVAILABLE, IS_BEST_SELLER, AVG_RATING, RATING_COUNT, CREATED_AT) VALUES
('Aloo Bhujia', 'Crispy spiced potato and gram-flour noodles.', 2, 140, 150, 1, 'GRAM', 400, 'Potato, gram flour, edible oil, spices', 'None declared', 60, '/images/products/aloo-bhujia.jpg', 1, 1, 4.2, 71, NOW()),
('Navratan Mixture', 'Nine-ingredient savoury mix of lentils, nuts and sev.', 2, 160, 130, 1, 'GRAM', 400, 'Gram flour, lentils, peanuts, cashew, edible oil, spices', 'Tree nuts, peanuts', 45, '/images/products/navratan-mixture.jpg', 1, 0, 4.0, 46, NOW()),
('Khatta Meetha Mix', 'Classic sweet-and-tangy Bombay mix.', 2, 150, 130, 1, 'GRAM', 400, 'Gram flour, lentils, peanuts, edible oil, spices, sugar', 'Peanuts', 45, '/images/products/khatta-meetha-mix.jpg', 1, 0, 3.9, 24, NOW()),
('Moong Dal', 'Crunchy fried and salted split moong lentils.', 2, 130, 140, 1, 'GRAM', 400, 'Split moong lentils, edible oil, salt, spices', 'None declared', 60, '/images/products/moong-dal.jpg', 1, 0, 4.1, 30, NOW());

-- ===================== Beverages =====================
INSERT INTO EK_PRODUCT (NAME, DESCRIPTION, CATEGORY_ID, PRICE, QUANTITY, IS_VEG, UNIT, UNIT_QUANTITY, INGREDIENTS, ALLERGENS, SHELF_LIFE_DAYS, IMAGE_URL, IS_AVAILABLE, IS_BEST_SELLER, AVG_RATING, RATING_COUNT, CREATED_AT) VALUES
('Thandai (500ml)', 'Chilled festive drink with almonds, saffron and aromatic spices.', 3, 220, 40, 1, 'PIECE', 1, 'Milk, almonds, saffron, fennel, cardamom, sugar', 'Milk, tree nuts', 2, '/images/products/thandai.jpg', 1, 1, 4.3, 26, NOW()),
('Masala Chai Mix (200g)', 'Traditional spiced tea blend, just add milk and boil.', 3, 180, 90, 1, 'GRAM', 200, 'Tea leaves, ginger, cardamom, cinnamon, cloves', 'None declared', 180, '/images/products/masala-chai-mix.jpg', 1, 0, 4.1, 18, NOW()),
('Rose Sharbat (750ml)', 'Concentrated rose syrup, dilute with chilled water or milk.', 3, 160, 70, 1, 'PIECE', 1, 'Sugar, rose extract, citric acid, edible color', 'None declared', 365, '/images/products/rose-sharbat.jpg', 1, 0, 3.9, 14, NOW());

-- ===================== A sample festive offer =====================
INSERT INTO EK_OFFER (NAME, DISCOUNT_TYPE, DISCOUNT_VALUE, CATEGORY_ID, START_DATE, END_DATE, IS_ACTIVE) VALUES
('Mithai Festive Discount', 'PERCENT', 10, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 1);

COMMIT;
