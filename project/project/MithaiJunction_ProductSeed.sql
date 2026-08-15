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
(1, 'Mithai', 'Classic Indian milk-based and sugar-based sweets', 'https://images.unsplash.com/photo-1601050690597-df0568f70950', 1),
(2, 'Bengali Sweets', 'Chenna and syrup-based specialities from Bengal', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84', 2),
(3, 'Cakes', 'Fresh-baked cakes for celebrations and everyday treats', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', 3),
(4, 'Pastries', 'Individual pastries, cupcakes and baked bites', 'https://images.unsplash.com/photo-1509440159596-0249088772ff', 4),
(5, 'Namkeen', 'Savoury snacks and mixtures', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027', 5),
(6, 'Chocolates', 'Handmade and assorted chocolates', 'https://images.unsplash.com/photo-1548907040-4baa419b3ef4', 6),
(7, 'Dry Fruits', 'Premium dry fruits and nut-based sweets', 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46', 7),
(8, 'Beverages', 'Traditional and festive drinks', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574', 8),
(9, 'Combos & Gift Boxes', 'Curated assortments for gifting and festivals', 'https://images.unsplash.com/photo-1607478900766-efe13248b125', 9);

-- ===================== Mithai =====================
INSERT INTO EK_PRODUCT (NAME, DESCRIPTION, CATEGORY_ID, PRICE, QUANTITY, IS_VEG, UNIT, UNIT_QUANTITY, INGREDIENTS, ALLERGENS, SHELF_LIFE_DAYS, IMAGE_URL, IS_AVAILABLE, IS_BEST_SELLER, AVG_RATING, RATING_COUNT, CREATED_AT) VALUES
('Kaju Katli', 'Diamond-cut cashew fudge finished with a silver leaf, a festival favourite.', 1, 620, 80, 1, 'GRAM', 500, 'Cashew nuts, sugar, ghee, silver leaf (varq)', 'Tree nuts (cashew)', 10, 'https://images.unsplash.com/photo-1601050690597-df0568f70950', 1, 1, 4.6, 128, NOW()),
('Motichoor Ladoo', 'Fine besan pearls simmered in sugar syrup and shaped into soft ladoos.', 1, 420, 120, 1, 'GRAM', 500, 'Gram flour, sugar, ghee, cardamom, edible color', 'Gluten may be present (shared equipment)', 7, 'https://images.unsplash.com/photo-1666190092210-d1a48c48f9a6', 1, 1, 4.5, 96, NOW()),
('Besan Ladoo', 'Roasted gram flour ladoos with ghee and cardamom, no added preservatives.', 1, 380, 100, 1, 'GRAM', 500, 'Gram flour, ghee, sugar, cardamom', 'None declared', 12, 'https://images.unsplash.com/photo-1666190092088-6fa4c1e3b8f5', 1, 0, 4.3, 54, NOW()),
('Gulab Jamun (12 pcs)', 'Soft khoya dumplings soaked in rose-cardamom sugar syrup.', 1, 320, 150, 1, 'PIECE', 12, 'Milk solids (khoya), maida, sugar syrup, rose water, cardamom', 'Milk, gluten', 5, 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8e5f', 1, 1, 4.7, 210, NOW()),
('Rasgulla (12 pcs)', 'Spongy chenna balls in light sugar syrup, a Bengali classic.', 1, 280, 130, 1, 'PIECE', 12, 'Chenna (fresh cheese), sugar syrup', 'Milk', 5, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c', 1, 0, 4.4, 67, NOW()),
('Soan Papdi', 'Flaky, melt-in-the-mouth gram-flour and sugar sweet with cardamom.', 1, 260, 90, 1, 'GRAM', 500, 'Gram flour, sugar, ghee, cardamom', 'None declared', 20, 'https://images.unsplash.com/photo-1615832724331-95b2b4d76dd5', 1, 0, 4.0, 38, NOW());

-- ===================== Bengali Sweets =====================
INSERT INTO EK_PRODUCT (NAME, DESCRIPTION, CATEGORY_ID, PRICE, QUANTITY, IS_VEG, UNIT, UNIT_QUANTITY, INGREDIENTS, ALLERGENS, SHELF_LIFE_DAYS, IMAGE_URL, IS_AVAILABLE, IS_BEST_SELLER, AVG_RATING, RATING_COUNT, CREATED_AT) VALUES
('Sandesh', 'Delicately sweetened chenna sandesh, lightly flavoured with cardamom.', 2, 340, 90, 1, 'GRAM', 400, 'Chenna (fresh cheese), sugar, cardamom', 'Milk', 4, 'https://images.unsplash.com/photo-1606313564174-01e5f8b0f5e6', 1, 0, 4.2, 41, NOW()),
('Mishti Doi', 'Traditional caramelised sweet yogurt set in earthen pots.', 2, 180, 60, 1, 'PIECE', 2, 'Milk, sugar, live yogurt culture', 'Milk', 3, 'https://images.unsplash.com/photo-1571212515416-fef01fc43637', 1, 1, 4.6, 88, NOW()),
('Chum Chum', 'Oval chenna sweets soaked in syrup and coated with coconut.', 2, 300, 70, 1, 'PIECE', 10, 'Chenna, sugar syrup, desiccated coconut', 'Milk, coconut', 5, 'https://images.unsplash.com/photo-1606313564200-9f2b2d6d3f9c', 1, 0, 4.1, 29, NOW()),
('Kheer Kadam', 'Rasgulla stuffed with sweet khoya and dusted with milk powder.', 2, 360, 55, 1, 'PIECE', 8, 'Chenna, khoya, sugar, milk powder', 'Milk', 4, 'https://images.unsplash.com/photo-1606313564350-6f1b2a41f4f2', 1, 0, 4.3, 22, NOW());

-- ===================== Cakes =====================
INSERT INTO EK_PRODUCT (NAME, DESCRIPTION, CATEGORY_ID, PRICE, QUANTITY, IS_VEG, UNIT, UNIT_QUANTITY, INGREDIENTS, ALLERGENS, SHELF_LIFE_DAYS, IMAGE_URL, IS_AVAILABLE, IS_BEST_SELLER, AVG_RATING, RATING_COUNT, CREATED_AT) VALUES
('Belgian Chocolate Truffle Cake', 'Rich chocolate sponge layered with Belgian dark chocolate ganache.', 3, 799, 25, 1, 'KG', 1, 'Wheat flour, Belgian chocolate, butter, eggs, cream, sugar', 'Gluten, egg, milk', 2, 'https://images.unsplash.com/photo-1606313564531-4a3b0e7f7e6a', 1, 1, 4.7, 156, NOW()),
('Fresh Fruit Cake', 'Vanilla sponge topped with seasonal fresh fruits and whipped cream.', 3, 699, 20, 1, 'KG', 1, 'Wheat flour, fresh cream, seasonal fruits, sugar, eggs', 'Gluten, egg, milk', 2, 'https://images.unsplash.com/photo-1587248720327-8eb72564be1e', 1, 0, 4.4, 74, NOW()),
('Red Velvet Cake', 'Classic red velvet layers with cream cheese frosting.', 3, 849, 18, 1, 'KG', 1, 'Wheat flour, cocoa, buttermilk, cream cheese, sugar, eggs', 'Gluten, egg, milk', 2, 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f', 1, 1, 4.6, 102, NOW()),
('Eggless Black Forest Cake', 'Chocolate sponge, cherries and whipped cream, made fully eggless.', 3, 749, 22, 1, 'KG', 1, 'Wheat flour, cocoa, cherries, whipped cream, sugar', 'Gluten, milk', 2, 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d', 1, 0, 4.3, 49, NOW());

-- ===================== Pastries =====================
INSERT INTO EK_PRODUCT (NAME, DESCRIPTION, CATEGORY_ID, PRICE, QUANTITY, IS_VEG, UNIT, UNIT_QUANTITY, INGREDIENTS, ALLERGENS, SHELF_LIFE_DAYS, IMAGE_URL, IS_AVAILABLE, IS_BEST_SELLER, AVG_RATING, RATING_COUNT, CREATED_AT) VALUES
('Chocolate Truffle Pastry', 'Individual slice of chocolate truffle cake.', 4, 129, 60, 1, 'PIECE', 1, 'Wheat flour, chocolate, cream, sugar, eggs', 'Gluten, egg, milk', 2, 'https://images.unsplash.com/photo-1509440159596-0249088772ff', 1, 1, 4.5, 61, NOW()),
('Pineapple Pastry', 'Light sponge with fresh pineapple and whipped cream.', 4, 99, 60, 1, 'PIECE', 1, 'Wheat flour, pineapple, cream, sugar, eggs', 'Gluten, egg, milk', 2, 'https://images.unsplash.com/photo-1519869325930-281384150729', 1, 0, 4.1, 33, NOW()),
('Blueberry Cheesecake Cup', 'Creamy baked cheesecake topped with blueberry compote.', 4, 149, 40, 1, 'PIECE', 1, 'Cream cheese, digestive biscuit, blueberry, sugar, eggs', 'Gluten, egg, milk', 3, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad', 1, 0, 4.4, 27, NOW());

-- ===================== Namkeen =====================
INSERT INTO EK_PRODUCT (NAME, DESCRIPTION, CATEGORY_ID, PRICE, QUANTITY, IS_VEG, UNIT, UNIT_QUANTITY, INGREDIENTS, ALLERGENS, SHELF_LIFE_DAYS, IMAGE_URL, IS_AVAILABLE, IS_BEST_SELLER, AVG_RATING, RATING_COUNT, CREATED_AT) VALUES
('Aloo Bhujia', 'Crispy spiced potato and gram-flour noodles.', 5, 140, 150, 1, 'GRAM', 400, 'Potato, gram flour, edible oil, spices', 'None declared', 60, 'https://images.unsplash.com/photo-1601050690597-2c5c5d5b3a0f', 1, 1, 4.2, 71, NOW()),
('Navratan Mixture', 'Nine-ingredient savoury mix of lentils, nuts and sev.', 5, 160, 130, 1, 'GRAM', 400, 'Gram flour, lentils, peanuts, cashew, edible oil, spices', 'Tree nuts, peanuts', 45, 'https://images.unsplash.com/photo-1600335895229-6e75511892c8', 1, 0, 4.0, 46, NOW()),
('Khatta Meetha Mix', 'Classic sweet-and-tangy Bombay mix.', 5, 150, 130, 1, 'GRAM', 400, 'Gram flour, lentils, peanuts, edible oil, spices, sugar', 'Peanuts', 45, 'https://images.unsplash.com/photo-1621939514649-280e7d7f6d9b', 1, 0, 3.9, 24, NOW()),
('Moong Dal', 'Crunchy fried and salted split moong lentils.', 5, 130, 140, 1, 'GRAM', 400, 'Split moong lentils, edible oil, salt, spices', 'None declared', 60, 'https://images.unsplash.com/photo-1604908176997-431725256ba8', 1, 0, 4.1, 30, NOW());

-- ===================== Chocolates =====================
INSERT INTO EK_PRODUCT (NAME, DESCRIPTION, CATEGORY_ID, PRICE, QUANTITY, IS_VEG, UNIT, UNIT_QUANTITY, INGREDIENTS, ALLERGENS, SHELF_LIFE_DAYS, IMAGE_URL, IS_AVAILABLE, IS_BEST_SELLER, AVG_RATING, RATING_COUNT, CREATED_AT) VALUES
('Assorted Chocolate Box', 'Handmade truffles, pralines and barks in a gift box.', 6, 499, 45, 1, 'BOX', 16, 'Cocoa butter, milk solids, sugar, assorted nuts', 'Milk, tree nuts, soy lecithin', 30, 'https://images.unsplash.com/photo-1548907040-4baa419b3ef4', 1, 1, 4.6, 88, NOW()),
('Dark Chocolate Almond Bark', 'Thin dark chocolate bark studded with roasted almonds.', 6, 249, 70, 1, 'GRAM', 200, '70% dark chocolate, roasted almonds', 'Tree nuts (almond)', 60, 'https://images.unsplash.com/photo-1511381939415-e44015466834', 1, 0, 4.5, 52, NOW()),
('Chocolate Modak', 'Modak-shaped chocolate shells filled with chocolate ganache.', 6, 349, 50, 1, 'PIECE', 8, 'Chocolate, cocoa, milk solids, sugar', 'Milk, soy lecithin', 20, 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e', 1, 0, 4.3, 19, NOW());

-- ===================== Dry Fruits =====================
INSERT INTO EK_PRODUCT (NAME, DESCRIPTION, CATEGORY_ID, PRICE, QUANTITY, IS_VEG, UNIT, UNIT_QUANTITY, INGREDIENTS, ALLERGENS, SHELF_LIFE_DAYS, IMAGE_URL, IS_AVAILABLE, IS_BEST_SELLER, AVG_RATING, RATING_COUNT, CREATED_AT) VALUES
('Premium Mixed Dry Fruits', 'Almonds, cashews, pistachios and raisins in a resealable pack.', 7, 899, 60, 1, 'GRAM', 500, 'Almonds, cashews, pistachios, raisins', 'Tree nuts', 180, 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46', 1, 1, 4.7, 143, NOW()),
('Kaju (Whole Cashews)', 'Whole grade-A cashew nuts, lightly roasted.', 7, 720, 80, 1, 'GRAM', 500, 'Cashew nuts', 'Tree nuts (cashew)', 180, 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716', 1, 0, 4.5, 61, NOW()),
('Anjeer (Dried Figs)', 'Soft, naturally sweet dried figs.', 7, 650, 55, 1, 'GRAM', 400, 'Dried figs', 'None declared', 180, 'https://images.unsplash.com/photo-1601493700750-6a6c3f4a3ff5', 1, 0, 4.2, 22, NOW()),
('Dry Fruit Ladoo', 'Sugar-free ladoos made with dates and mixed nuts.', 7, 480, 65, 1, 'GRAM', 400, 'Dates, almonds, cashews, pistachios, ghee', 'Tree nuts', 30, 'https://images.unsplash.com/photo-1600891965050-8dbfb4b1f7d1', 1, 1, 4.4, 37, NOW());

-- ===================== Beverages =====================
INSERT INTO EK_PRODUCT (NAME, DESCRIPTION, CATEGORY_ID, PRICE, QUANTITY, IS_VEG, UNIT, UNIT_QUANTITY, INGREDIENTS, ALLERGENS, SHELF_LIFE_DAYS, IMAGE_URL, IS_AVAILABLE, IS_BEST_SELLER, AVG_RATING, RATING_COUNT, CREATED_AT) VALUES
('Thandai (500ml)', 'Chilled festive drink with almonds, saffron and aromatic spices.', 8, 220, 40, 1, 'PIECE', 1, 'Milk, almonds, saffron, fennel, cardamom, sugar', 'Milk, tree nuts', 2, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574', 1, 1, 4.3, 26, NOW()),
('Masala Chai Mix (200g)', 'Traditional spiced tea blend, just add milk and boil.', 8, 180, 90, 1, 'GRAM', 200, 'Tea leaves, ginger, cardamom, cinnamon, cloves', 'None declared', 180, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f', 1, 0, 4.1, 18, NOW()),
('Rose Sharbat (750ml)', 'Concentrated rose syrup, dilute with chilled water or milk.', 8, 160, 70, 1, 'PIECE', 1, 'Sugar, rose extract, citric acid, edible color', 'None declared', 365, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859', 1, 0, 3.9, 14, NOW());

-- ===================== Combos & Gift Boxes =====================
INSERT INTO EK_PRODUCT (NAME, DESCRIPTION, CATEGORY_ID, PRICE, QUANTITY, IS_VEG, UNIT, UNIT_QUANTITY, INGREDIENTS, ALLERGENS, SHELF_LIFE_DAYS, IMAGE_URL, IS_AVAILABLE, IS_BEST_SELLER, AVG_RATING, RATING_COUNT, CREATED_AT) VALUES
('Festive Mithai Hamper', 'Assorted mithai selection with kaju katli, ladoo and barfi.', 9, 1299, 30, 1, 'BOX', 1, 'Assorted mithai (see individual items)', 'Milk, tree nuts, gluten (varies by item)', 10, 'https://images.unsplash.com/photo-1607478900766-efe13248b125', 1, 1, 4.8, 176, NOW()),
('Diwali Dry Fruit Gift Box', 'Premium dry fruits presented in a festive gift box.', 9, 1499, 25, 1, 'BOX', 1, 'Assorted dry fruits (see individual items)', 'Tree nuts', 180, 'https://images.unsplash.com/photo-1601493700631-6f5e2f4c1c62', 1, 1, 4.7, 94, NOW()),
('Sweet & Namkeen Combo', 'A balanced box of festive sweets and savoury namkeen.', 9, 899, 40, 1, 'BOX', 1, 'Assorted mithai and namkeen (see individual items)', 'Milk, tree nuts, peanuts', 15, 'https://images.unsplash.com/photo-1600335895229-3f8c1b6d6b4e', 1, 0, 4.4, 58, NOW()),
('Corporate Gifting Box', 'Premium assortment of chocolates and dry fruits for corporate gifting.', 9, 1799, 20, 1, 'BOX', 1, 'Assorted chocolates and dry fruits (see individual items)', 'Milk, tree nuts, soy lecithin', 60, 'https://images.unsplash.com/photo-1607478900766-9e6f4b1d5e5b', 1, 0, 4.5, 33, NOW());

-- ===================== A sample festive offer =====================
INSERT INTO EK_OFFER (NAME, DISCOUNT_TYPE, DISCOUNT_VALUE, CATEGORY_ID, START_DATE, END_DATE, IS_ACTIVE) VALUES
('Mithai Festive Discount', 'PERCENT', 10, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 1);

COMMIT;
