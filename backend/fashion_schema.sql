-- Fashion E-Commerce & Live Auction Platform Database Dump
-- Generated for Cloud Hosting & phpMyAdmin Parity

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table structure for table `admins`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` text NOT NULL,
  `email` text NOT NULL,
  `password` text NOT NULL,
  `full_name` text DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `role` text DEFAULT NULL,
  `status` text DEFAULT NULL,
  `lastLogin` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `username` (`username`) USING HASH,
  UNIQUE KEY `email` (`email`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `admins`
INSERT INTO `admins` (`_id`, `username`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `lastLogin`, `createdAt`, `updatedAt`) VALUES
(1, 'superadmin', 'admin@fashion.com', '123456', 'Master Administrator', '9999999999', 'SUPER_ADMIN', 'ACTIVE', NULL, '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(2, 'admin', 'manager@fashion.com', '123456', 'Store Manager', '8888888888', 'ADMIN', 'ACTIVE', NULL, '2026-08-20 13:02:05', '2026-08-20 13:02:05');

-- --------------------------------------------------------
-- Table structure for table `auctions`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `auctions`;
CREATE TABLE `auctions` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `room_code` text DEFAULT NULL,
  `product_id` double DEFAULT NULL,
  `products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`products`)),
  `current_product_index` double DEFAULT 0,
  `host_id` double DEFAULT NULL,
  `min_bid` double DEFAULT 0,
  `bid_increment` double DEFAULT 100,
  `entry_fee` double DEFAULT 0,
  `current_price` double DEFAULT 0,
  `highest_bidder_id` double DEFAULT NULL,
  `highest_bidder_name` text DEFAULT NULL,
  `participants` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`participants`)),
  `chat_messages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`chat_messages`)),
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `turn_time_seconds` double DEFAULT 60,
  `status` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `room_code` (`room_code`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `bids`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `bids`;
CREATE TABLE `bids` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `auction_id` double NOT NULL,
  `user_id` double NOT NULL,
  `bid_amount` double NOT NULL,
  `time` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `carts`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` double NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  `status` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `categorys`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `categorys`;
CREATE TABLE `categorys` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` double DEFAULT NULL,
  `name` text NOT NULL,
  `description` text DEFAULT NULL,
  `status` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `categorys`
INSERT INTO `categorys` (`_id`, `parent_id`, `name`, `description`, `status`, `created_at`, `createdAt`, `updatedAt`) VALUES
(1, NULL, 'Men\'s Luxury Wear', 'Designer suits, jackets, and shirts.', 'ACTIVE', '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(2, NULL, 'Women\'s Couture', 'Luxury dresses, gowns, and handwoven silk sarees.', 'ACTIVE', '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(3, NULL, 'High-End Watches', 'Swiss chronometers and automatic luxury watches.', 'ACTIVE', '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(4, NULL, 'Fine Jewelry', 'Diamond necklaces, rings, and gold bracelets.', 'ACTIVE', '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(5, NULL, 'Designer Footwear', 'Handcrafted leather shoes and designer heels.', 'ACTIVE', '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(6, NULL, 'Leather Accessories', 'Premium leather bags, belts, and wallets.', 'ACTIVE', '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05');

-- --------------------------------------------------------
-- Table structure for table `customers`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` text NOT NULL,
  `nickname` text DEFAULT NULL,
  `email` text NOT NULL,
  `address` text DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `dob` datetime DEFAULT NULL,
  `password` text NOT NULL,
  `raw_password` text DEFAULT NULL,
  `status` text DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `orders_count` double DEFAULT 0,
  `total_spent` double DEFAULT 0,
  `bank_account` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `email` (`email`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `customers`
INSERT INTO `customers` (`_id`, `username`, `nickname`, `email`, `address`, `phone`, `dob`, `password`, `raw_password`, `status`, `last_login`, `orders_count`, `total_spent`, `bank_account`, `created_at`, `createdAt`, `updatedAt`) VALUES
(1, 'Alex Morgan', NULL, 'alex.morgan@gmail.com', NULL, '9123456789', NULL, '123456', NULL, 'ACTIVE', '2026-09-04 12:27:20', 3, 45000, NULL, '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-09-04 12:27:20'),
(2, 'Sophia Bennett', NULL, 'sophia.b@gmail.com', NULL, '9123456790', NULL, '123456', NULL, 'ACTIVE', NULL, 5, 89000, NULL, '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(3, 'Rohan Sharma', NULL, 'rohan.sharma@yahoo.com', NULL, '9123456791', NULL, '123456', NULL, 'ACTIVE', NULL, 2, 28000, NULL, '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(4, 'Priya Patel', NULL, 'priya.p@outlook.com', NULL, '9123456792', NULL, '123456', NULL, 'ACTIVE', NULL, 1, 15000, NULL, '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(5, 'David Miller', NULL, 'david.miller@gmail.com', NULL, '9123456793', NULL, '123456', NULL, 'BLOCKED', NULL, 0, 0, NULL, '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05');

-- --------------------------------------------------------
-- Table structure for table `hostings`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `hostings`;
CREATE TABLE `hostings` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `auction_id` double NOT NULL,
  `host_id` double DEFAULT NULL,
  `status` text DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `ended_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `notifications`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` double NOT NULL,
  `type` text DEFAULT NULL,
  `title` text NOT NULL,
  `message` text NOT NULL,
  `link` text DEFAULT NULL,
  `room_code` text DEFAULT NULL,
  `metadata` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `orders`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` double NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  `total_amount` double NOT NULL,
  `status` text DEFAULT NULL,
  `payment_method` text DEFAULT NULL,
  `delivery_deadline` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `payments`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` double NOT NULL,
  `payment_type` text NOT NULL,
  `amount` double NOT NULL,
  `payment_status` text DEFAULT NULL,
  `transaction_reference` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `products`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `vendor_id` double NOT NULL,
  `category_id` double DEFAULT NULL,
  `product_name` text NOT NULL,
  `description` text DEFAULT NULL,
  `price` double NOT NULL,
  `stock` double DEFAULT 0,
  `image` text DEFAULT NULL,
  `sold_count` double DEFAULT 0,
  `rating` double DEFAULT 0,
  `review_count` double DEFAULT 0,
  `views` double DEFAULT 0,
  `status` text DEFAULT NULL,
  `is_auction_exclusive` tinyint(1) DEFAULT 0,
  `auction_room_id` double DEFAULT NULL,
  `auction_availability` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `products`
INSERT INTO `products` (`_id`, `vendor_id`, `category_id`, `product_name`, `description`, `price`, `stock`, `image`, `sold_count`, `rating`, `review_count`, `views`, `status`, `is_auction_exclusive`, `auction_room_id`, `auction_availability`, `created_at`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 'Shadow Onyx Velvet Blazer', 'Handcrafted midnight black velvet blazer with silk lapels.', 18500, 12, '/uploads/shadow_onyx_velvet_blazer.jpg', 14, 0, 0, 0, 'ACTIVE', 0, NULL, 'AVAILABLE', '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(2, 2, 2, 'Emerald Silk Evening Gown', 'Tailored floor-length emerald green silk gown.', 24900, 8, '/uploads/emerald_silk_evening_gown.jpg', 22, 0, 0, 0, 'ACTIVE', 0, NULL, 'AVAILABLE', '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(3, 3, 3, 'Royal Chrono Automatic Watch', 'Sapphire crystal chronometer with genuine leather strap.', 49500, 5, '/uploads/royal_chrono_automatic_watch.jpg', 8, 0, 0, 0, 'ACTIVE', 0, NULL, 'AVAILABLE', '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(4, 3, 4, 'Diamond Solitaire Pendant 18K', '18K white gold pendant with certified 1-carat diamond.', 78000, 3, '/uploads/diamond_solitaire_pendant_18k.jpg', 5, 0, 0, 0, 'ACTIVE', 0, NULL, 'AVAILABLE', '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(5, 1, 5, 'Italian Calfskin Oxford Shoes', 'Hand-burnished Italian leather Oxford shoes.', 14500, 15, '/uploads/italian_calfskin_oxford_shoes.jpg', 19, 0, 0, 0, 'ACTIVE', 0, NULL, 'AVAILABLE', '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(6, 2, 6, 'Signature Monogram Tote Bag', 'Embossed calfskin leather tote bag with gold hardware.', 22000, 9, '/uploads/signature_monogram_tote_bag.jpg', 11, 0, 0, 0, 'ACTIVE', 0, NULL, 'AVAILABLE', '2026-08-20 13:02:05', '2026-08-20 13:02:05', '2026-08-20 13:02:05');

-- --------------------------------------------------------
-- Table structure for table `reviews`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` double NOT NULL,
  `user_id` double NOT NULL,
  `rating` double DEFAULT 5,
  `comment` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `subscriptions`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` double NOT NULL,
  `plan` text NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `vendors`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `vendors`;
CREATE TABLE `vendors` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_name` text NOT NULL,
  `owner_name` text NOT NULL,
  `email` text NOT NULL,
  `phone` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `password` text NOT NULL,
  `status` text DEFAULT NULL,
  `lastLogin` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `email` (`email`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `vendors`
INSERT INTO `vendors` (`_id`, `shop_name`, `owner_name`, `email`, `phone`, `address`, `password`, `status`, `lastLogin`, `createdAt`, `updatedAt`) VALUES
(1, 'Shadow Atelier Paris', 'Jean Dupont', 'jean@shadowatelier.com', '9876543210', '75 Rue du Faubourg Saint-Honoré, Paris', '123456', 'APPROVED', '2026-09-04 12:22:32', '2026-08-20 13:02:05', '2026-09-04 12:22:32'),
(2, 'Milano Fashion Hub', 'Marco Rossi', 'marco@milanofashion.it', '9876543211', 'Via Montenapoleone 8, Milan', '123456', 'APPROVED', NULL, '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(3, 'Crown Jewelers London', 'Elizabeth Thorne', 'elizabeth@crownjewelers.uk', '9876543212', '12 Bond Street, London', '123456', 'APPROVED', NULL, '2026-08-20 13:02:05', '2026-08-20 13:02:05'),
(4, 'Tokyo Streetwear Collective', 'Kenji Sato', 'kenji@tokyostreet.jp', '9876543213', 'Shibuya Crossing 4-1, Tokyo', '123456', 'PENDING', NULL, '2026-08-20 13:02:05', '2026-08-20 13:02:05');

-- --------------------------------------------------------
-- Table structure for table `wallets`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `wallets`;
CREATE TABLE `wallets` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` double NOT NULL,
  `red_chips` double DEFAULT 0,
  `blue_chips` double DEFAULT 0,
  `green_chips` double DEFAULT 0,
  `yellow_chips` double DEFAULT 0,
  `black_chips` double DEFAULT 0,
  `cash_balance` double DEFAULT 0,
  `transactions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`transactions`)),
  `created_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `wallets`
INSERT INTO `wallets` (`_id`, `user_id`, `red_chips`, `blue_chips`, `green_chips`, `yellow_chips`, `black_chips`, `cash_balance`, `transactions`, `created_at`, `createdAt`, `updatedAt`) VALUES
(1, 1, 0, 0, 0, 0, 0, 40000, '[{"$each":[{"type":"CREDIT","amount":10000,"description":"Cash balance added","createdAt":"2026-09-04T12:30:44.297Z"}]},{"$each":[{"type":"CREDIT","amount":10000,"description":"Cash balance added","createdAt":"2026-09-04T12:30:57.042Z"}]},{"$each":[{"type":"CREDIT","amount":10000,"description":"Cash balance added","createdAt":"2026-09-04T12:31:00.814Z"}]},{"$each":[{"type":"CREDIT","amount":10000,"description":"Cash balance added","createdAt":"2026-09-04T12:31:04.484Z"}]}]', '2026-09-04 10:25:27', '2026-09-04 10:25:27', '2026-09-04 12:31:04');

-- --------------------------------------------------------
-- Table structure for table `wallettransactions`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `wallettransactions`;
CREATE TABLE `wallettransactions` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `wallet_id` double NOT NULL,
  `user_id` double NOT NULL,
  `type` text NOT NULL,
  `category` text DEFAULT NULL,
  `chip_type` text DEFAULT NULL,
  `amount` double NOT NULL,
  `description` text NOT NULL,
  `metadata` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `wallettransactions`
INSERT INTO `wallettransactions` (`_id`, `wallet_id`, `user_id`, `type`, `category`, `chip_type`, `amount`, `description`, `metadata`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 'CREDIT', 'CASH', NULL, 10000, 'Cash balance added', '{}', '2026-09-04 12:30:44', '2026-09-04 12:30:44'),
(2, 1, 1, 'CREDIT', 'CASH', NULL, 10000, 'Cash balance added', '{}', '2026-09-04 12:30:57', '2026-09-04 12:30:57'),
(3, 1, 1, 'CREDIT', 'CASH', NULL, 10000, 'Cash balance added', '{}', '2026-09-04 12:31:00', '2026-09-04 12:31:00'),
(4, 1, 1, 'CREDIT', 'CASH', NULL, 10000, 'Cash balance added', '{}', '2026-09-04 12:31:04', '2026-09-04 12:31:04');

-- --------------------------------------------------------
-- Table structure for table `winners`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `winners`;
CREATE TABLE `winners` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `auction_id` double NOT NULL,
  `product_id` double DEFAULT NULL,
  `product_name` text DEFAULT NULL,
  `user_id` double DEFAULT NULL,
  `winner_name` text DEFAULT NULL,
  `winner_nickname` text DEFAULT NULL,
  `winning_bid` double DEFAULT 0,
  `result_type` text DEFAULT NULL,
  `wallet_settled` tinyint(1) DEFAULT 0,
  `wallet_settled_at` datetime DEFAULT NULL,
  `declared_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `wishlists`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE `wishlists` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` double NOT NULL,
  `product_id` double NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `wonproducts`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `wonproducts`;
CREATE TABLE `wonproducts` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` double NOT NULL,
  `product_id` double NOT NULL,
  `auction_id` double NOT NULL,
  `winning_bid` double DEFAULT 0,
  `status` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;
