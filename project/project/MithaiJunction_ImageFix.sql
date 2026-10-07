-- Safe, non-destructive image repair for an already-seeded local eKart catalog.
-- Updates IMAGE_URL to verified local product assets for all 17 active products.
USE `ekart_product`;

UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/kaju-katli.jpg' WHERE NAME = 'Kaju Katli';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/motichoor-ladoo.jpg' WHERE NAME = 'Motichoor Ladoo';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/besan-ladoo.jpg' WHERE NAME = 'Besan Ladoo';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/gulab-jamun.jpg' WHERE NAME LIKE 'Gulab Jamun%';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/rasgulla.jpg' WHERE NAME LIKE 'Rasgulla%';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/soan-papdi.jpg' WHERE NAME = 'Soan Papdi';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/sandesh.jpg' WHERE NAME = 'Sandesh';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/mishti-doi.jpg' WHERE NAME = 'Mishti Doi';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/chum-chum.jpg' WHERE NAME = 'Chum Chum';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/kheer-kadam.jpg' WHERE NAME = 'Kheer Kadam';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/aloo-bhujia.jpg' WHERE NAME = 'Aloo Bhujia';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/navratan-mixture.jpg' WHERE NAME = 'Navratan Mixture';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/khatta-meetha-mix.jpg' WHERE NAME = 'Khatta Meetha Mix';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/moong-dal.jpg' WHERE NAME = 'Moong Dal';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/thandai.jpg' WHERE NAME LIKE 'Thandai%';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/masala-chai-mix.jpg' WHERE NAME LIKE 'Masala Chai Mix%';
UPDATE EK_PRODUCT SET IMAGE_URL = '/images/products/rose-sharbat.jpg' WHERE NAME LIKE 'Rose Sharbat%';

COMMIT;

