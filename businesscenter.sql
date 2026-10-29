-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 10, 2026 at 11:13 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `businesscenter`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` bigint UNSIGNED NOT NULL,
  `category_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `category_name`, `description`, `icon`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Printing Supplies', 'Papers, inks, and printing materials', 'Printer', 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(2, 'ID Materials', 'ID cards, lanyards, and accessories', 'CreditCard', 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(3, 'Fabrics', 'Tela and fabric materials for uniforms', 'ShoppingBag', 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(4, 'Lamination Materials', 'Laminating sheets and supplies', 'FileText', 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(5, 'Binding Materials', 'Document binding supplies', 'Book', 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(6, 'Uniform Accessories', 'Buttons, patches, and uniform items', 'User', 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventories`
--

CREATE TABLE `inventories` (
  `inventory_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `reorder_level` int NOT NULL DEFAULT '10',
  `reorder_quantity` int NOT NULL DEFAULT '50',
  `last_restock_date` date DEFAULT NULL,
  `last_restock_quantity` int DEFAULT NULL,
  `status` enum('available','low','out') COLLATE utf8mb4_unicode_ci GENERATED ALWAYS AS ((case when (`quantity` = 0) then _utf8mb4'out' when (`quantity` <= `reorder_level`) then _utf8mb4'low' else _utf8mb4'available' end)) STORED,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_08_26_100418_add_two_factor_columns_to_users_table', 1),
(5, '2025_11_03_143159_create_categories_table', 1),
(6, '2025_11_03_143224_create_products_table', 1),
(7, '2025_11_03_143432_create_inventories_table', 1),
(8, '2025_11_03_143454_create_orders_table', 1),
(9, '2025_11_03_143537_create_order_items_table', 1),
(10, '2025_11_03_143641_create_payments_table', 1),
(11, '2025_11_03_144738_create_personal_access_tokens_table', 1),
(12, '2025_11_04_064845_create_staff_info_table', 1),
(13, '2025_11_05_231824_create_rental_properties_table', 1),
(14, '2025_11_05_231853_create_rental_tenants_table', 1),
(15, '2025_11_05_231954_create_rental_contracts_table', 1),
(16, '2025_11_05_232027_create_rental_payments_table', 1),
(17, '2025_11_05_232055_create_rental_maintenance_table', 1),
(18, '2025_11_06_061654_remove_unique_from_rental_contracts_contract_number', 1),
(19, '2025_11_06_061851_remove_unique_from_payment_and_maintenance_numbers', 1),
(20, '2025_11_08_020218_add_expiration_date_to_products_table', 1),
(21, '2025_11_08_161333_create_product_transactions_table', 1),
(22, '2025_11_08_170456_backfill_product_transactions_from_orders', 1),
(23, '2025_11_08_171749_add_expiration_and_status_to_products_table', 1),
(24, '2025_11_08_172021_create_sales_summary_table', 1),
(25, '2025_11_08_184848_add_is_active_to_products_table', 1),
(26, '2025_11_08_210545_add_void_fields_and_update_service_type_in_orders_table', 1),
(27, '2025_11_09_105401_add_performance_indexes_to_tables', 1),
(28, '2025_11_09_124505_add_compound_indexes_for_ultra_performance', 1),
(29, '2025_11_10_051352_add_database_indexes_for_optimization', 1),
(30, '2025_11_10_051400_add_critical_indexes_for_performance', 1),
(31, '2025_11_10_120711_modify_orders_service_type_to_string', 1),
(32, '2025_11_11_174503_add_product_image_to_products_table', 1),
(33, '2025_11_12_025044_add_comprehensive_database_indexes_for_speed', 1),
(34, '2025_11_12_231521_add_stall_number_to_rental_properties_table', 1),
(35, '2025_11_13_204218_add_unique_index_to_stall_number', 1),
(36, '2025_11_14_202633_create_toga_departments_table', 1),
(37, '2025_11_14_202647_create_toga_rentals_table', 1),
(38, '2025_11_14_202755_create_toga_payments_table', 1),
(39, '2025_11_14_212138_create_toga_departments_table', 1),
(40, '2025_11_14_212255_create_toga_students_table', 1),
(41, '2025_11_14_212306_create_toga_payments_table', 1),
(42, '2025_11_20_212632_add_indexes_to_toga_tables', 1),
(43, '2025_11_21_090118_update_foreign_keys_to_allow_product_deletion', 1),
(44, '2025_11_21_095327_add_product_name_to_order_items_table', 1),
(45, '2025_12_10_061423_add_optimized_indexes_for_performance', 1),
(46, '2025_12_10_063836_add_last_login_to_users_table', 1),
(47, '2025_12_10_070000_add_redis_optimized_indexes', 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` bigint UNSIGNED NOT NULL,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('Pending','In Progress','Completed','Cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `is_voided` tinyint(1) NOT NULL DEFAULT '0',
  `void_reason` text COLLATE utf8mb4_unicode_ci,
  `voided_by` bigint UNSIGNED DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `preferred_pickup_date` date DEFAULT NULL,
  `completed_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `payment_method` enum('Cash','GCash') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_by` bigint UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` bigint UNSIGNED NOT NULL,
  `product_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_image` longtext COLLATE utf8mb4_unicode_ci,
  `category_id` bigint UNSIGNED NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `expiration_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `cost` decimal(10,2) DEFAULT NULL,
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'piece',
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `product_name`, `barcode`, `product_image`, `category_id`, `description`, `price`, `expiration_date`, `is_active`, `cost`, `unit`, `image_url`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Bond Paper A4', 'BP-A4-500', NULL, 1, '500 sheets per ream, 80gsm', 250.00, NULL, 1, 180.00, 'ream', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(2, 'Photo Paper 4R', 'PP-4R-100', NULL, 1, 'Glossy photo paper, 100 sheets per pack', 350.00, NULL, 1, 250.00, 'pack', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(3, 'Sublimation Paper A4', 'SP-A4-100', NULL, 1, 'For sublimation printing, 100 sheets', 180.00, NULL, 1, 120.00, 'pack', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(4, 'Ink Cartridge Black', 'IC-BK-001', NULL, 1, 'Compatible with most printers', 450.00, NULL, 1, 320.00, 'piece', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(5, 'Ink Cartridge Color', 'IC-CL-001', NULL, 1, 'Tri-color ink cartridge', 550.00, NULL, 1, 400.00, 'piece', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(6, 'PVC ID Card Blank', 'ID-PVC-100', NULL, 2, 'Blank white PVC cards, 100 pieces', 380.00, NULL, 1, 280.00, 'pack', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(7, 'Lanyard Standard', 'LY-STD-001', NULL, 2, 'Standard lanyard with clip', 25.00, NULL, 1, 15.00, 'piece', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(8, 'Lanyard Premium', 'LY-PRM-001', NULL, 2, 'Premium quality lanyard with safety clip', 45.00, NULL, 1, 30.00, 'piece', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(9, 'ID Card Holder', 'CH-STD-001', NULL, 2, 'Transparent card holder', 15.00, NULL, 1, 8.00, 'piece', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(10, 'ID String Rope', 'IS-001', NULL, 2, 'Durable ID string, assorted colors', 8.00, NULL, 1, 4.00, 'piece', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(11, 'School Uniform Fabric White', 'SF-WHT-001', NULL, 3, 'White cotton polyester blend for school uniforms', 120.00, NULL, 1, 85.00, 'yard', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(12, 'School Uniform Fabric Blue', 'SF-BLU-001', NULL, 3, 'Navy blue fabric for school uniforms', 125.00, NULL, 1, 90.00, 'yard', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(13, 'PE Uniform Fabric', 'PE-FAB-001', NULL, 3, 'Dri-fit fabric for PE uniform', 150.00, NULL, 1, 110.00, 'yard', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(14, 'Plaid Fabric Red', 'PL-RED-001', NULL, 3, 'Red plaid pattern for skirts', 140.00, NULL, 1, 100.00, 'yard', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(15, 'Laminating Sheet A4', 'LS-A4-100', NULL, 4, 'Clear laminating sheets, 100 pieces', 280.00, NULL, 1, 200.00, 'pack', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(16, 'Laminating Sheet Legal', 'LS-LGL-100', NULL, 4, 'Legal size laminating sheets, 100 pieces', 320.00, NULL, 1, 230.00, 'pack', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(17, 'Laminating Pouch ID Size', 'LP-ID-100', NULL, 4, 'ID card size laminating pouches, 100 pieces', 150.00, NULL, 1, 100.00, 'pack', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(18, 'Laminating Film Roll', 'LF-ROLL-001', NULL, 4, '100 meter laminating film roll', 1200.00, NULL, 1, 900.00, 'roll', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(19, 'Plastic Binding Cover Clear', 'BC-CLR-100', NULL, 5, 'Transparent plastic covers, 100 pieces', 220.00, NULL, 1, 160.00, 'pack', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(20, 'Plastic Binding Cover Colored', 'BC-COL-100', NULL, 5, 'Colored plastic covers, assorted, 100 pieces', 250.00, NULL, 1, 180.00, 'pack', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(21, 'Spiral Binding Wire', 'SW-001', NULL, 5, 'Metal spiral binding wire, assorted sizes', 8.00, NULL, 1, 4.00, 'piece', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(22, 'Plastic Binding Comb', 'PBC-001', NULL, 5, 'Plastic binding combs, various sizes', 12.00, NULL, 1, 6.00, 'piece', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(23, 'School Button White', 'BTN-WHT-100', NULL, 6, 'White buttons for school uniforms, 100 pieces', 50.00, NULL, 1, 30.00, 'pack', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(24, 'School Button Gold', 'BTN-GLD-100', NULL, 6, 'Gold buttons for uniform blazers, 100 pieces', 80.00, NULL, 1, 50.00, 'pack', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(25, 'Embroidered Patch', 'EP-001', NULL, 6, 'Custom school logo embroidered patch', 35.00, NULL, 1, 20.00, 'piece', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(26, 'Zipper Standard', 'ZIP-STD-001', NULL, 6, 'Standard zipper, assorted colors and sizes', 18.00, NULL, 1, 10.00, 'piece', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(27, 'Velcro Strip', 'VLC-001', NULL, 6, 'Hook and loop velcro strip, 1 meter', 25.00, NULL, 1, 15.00, 'meter', NULL, 'active', '2026-08-05 13:21:31', '2026-08-05 13:21:31');

-- --------------------------------------------------------

--
-- Table structure for table `product_transactions`
--

CREATE TABLE `product_transactions` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `type` enum('IN','OUT') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'IN = stock added, OUT = stock sold/removed',
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `reference_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'order, restock, adjustment, etc',
  `reference_id` bigint UNSIGNED DEFAULT NULL COMMENT 'ID of the related record',
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rental_contracts`
--

CREATE TABLE `rental_contracts` (
  `id` bigint UNSIGNED NOT NULL,
  `contract_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `property_id` bigint UNSIGNED NOT NULL,
  `tenant_id` bigint UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `monthly_rent` decimal(10,2) NOT NULL,
  `deposit` decimal(10,2) NOT NULL,
  `status` enum('Active','Expired','Terminated') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rental_maintenance`
--

CREATE TABLE `rental_maintenance` (
  `id` bigint UNSIGNED NOT NULL,
  `request_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `property_id` bigint UNSIGNED NOT NULL,
  `tenant_id` bigint UNSIGNED NOT NULL,
  `issue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('Low','Medium','High','Critical') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Medium',
  `status` enum('Pending','In Progress','Completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `date_reported` date NOT NULL,
  `assigned_to` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rental_payments`
--

CREATE TABLE `rental_payments` (
  `id` bigint UNSIGNED NOT NULL,
  `payment_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` bigint UNSIGNED NOT NULL,
  `property_id` bigint UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `month` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Paid','Pending','Overdue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rental_properties`
--

CREATE TABLE `rental_properties` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stall_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monthly_rate` decimal(10,2) NOT NULL,
  `status` enum('Occupied','Vacant','Under Maintenance') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Vacant',
  `contract_end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rental_tenants`
--

CREATE TABLE `rental_tenants` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `property_rented_id` bigint UNSIGNED DEFAULT NULL,
  `contract_status` enum('Active','Inactive','Expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Inactive',
  `deposit_paid` decimal(10,2) NOT NULL DEFAULT '0.00',
  `last_payment_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_summary`
--

CREATE TABLE `sales_summary` (
  `summary_id` bigint UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `period_type` enum('daily','monthly','yearly') COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_sales` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_orders` int NOT NULL DEFAULT '0',
  `previous_period_sales` decimal(12,2) DEFAULT NULL,
  `growth_rate` decimal(8,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_info`
--

CREATE TABLE `staff_info` (
  `id` bigint UNSIGNED NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `status` enum('pending','active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `toga_departments`
--

CREATE TABLE `toga_departments` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'blue',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Building2',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `toga_payments`
--

CREATE TABLE `toga_payments` (
  `id` bigint UNSIGNED NOT NULL,
  `toga_rental_id` bigint UNSIGNED NOT NULL,
  `toga_department_id` bigint UNSIGNED NOT NULL,
  `payment_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Paid','Pending') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `type` enum('Rental Fee','Deposit','Rental Fee + Deposit') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Rental Fee',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `toga_rentals`
--

CREATE TABLE `toga_rentals` (
  `id` bigint UNSIGNED NOT NULL,
  `toga_department_id` bigint UNSIGNED NOT NULL,
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rental_date` date NOT NULL,
  `return_date` date NOT NULL,
  `rental_fee` decimal(10,2) NOT NULL,
  `deposit` decimal(10,2) NOT NULL,
  `status` enum('Active','Returned','Overdue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `payment_status` enum('Paid','Partial','Pending') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `two_factor_secret` text COLLATE utf8mb4_unicode_ci,
  `two_factor_recovery_codes` text COLLATE utf8mb4_unicode_ci,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('Customer','Staff','Admin','Faculty') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Customer',
  `status` enum('active','inactive','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `phone`, `role`, `status`, `email_verified`, `email_verified_at`, `remember_token`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'System Administrator', 'jmpagaran@gmail.com', '$2y$12$QEogEc6.cdoVFETKxo0Wg.ksHKRicgNczzSc0Ijk7BN.Lzs9HHYHC', NULL, NULL, NULL, '09123456789', 'Admin', 'active', 1, NULL, NULL, NULL, '2026-08-05 13:21:31', '2026-08-05 13:21:31'),
(2, 'Test Admin', 'test@example.com', '$2y$12$w74eZRFEcqQWHSy./Nqjo.VKp1rglhCKVkevO8OmGFa00CyEy3TFy', NULL, NULL, NULL, '09987654321', 'Admin', 'active', 1, NULL, NULL, NULL, '2026-08-05 13:21:31', '2026-08-05 13:21:31');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `categories_category_name_unique` (`category_name`),
  ADD KEY `categories_status_index` (`status`),
  ADD KEY `idx_categories_status` (`status`),
  ADD KEY `idx_categories_name` (`category_name`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `inventories`
--
ALTER TABLE `inventories`
  ADD PRIMARY KEY (`inventory_id`),
  ADD UNIQUE KEY `inventories_product_id_unique` (`product_id`),
  ADD KEY `inventories_status_index` (`status`),
  ADD KEY `inventories_quantity_index` (`quantity`),
  ADD KEY `idx_inventories_product_id` (`product_id`),
  ADD KEY `idx_inventories_quantity` (`quantity`),
  ADD KEY `idx_inventories_product_qty` (`product_id`,`quantity`),
  ADD KEY `idx_inv_product` (`product_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `orders_order_number_unique` (`order_number`),
  ADD KEY `orders_order_number_index` (`order_number`),
  ADD KEY `orders_customer_name_index` (`customer_name`),
  ADD KEY `orders_status_index` (`status`),
  ADD KEY `orders_created_at_index` (`created_at`),
  ADD KEY `orders_is_voided_index` (`is_voided`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_order_number` (`order_number`),
  ADD KEY `idx_orders_completed_date` (`completed_date`),
  ADD KEY `idx_orders_created_at` (`created_at`),
  ADD KEY `idx_orders_status_completed` (`status`,`completed_date`),
  ADD KEY `idx_ord_number` (`order_number`),
  ADD KEY `idx_ord_completed` (`completed_date`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_items_order_id_index` (`order_id`),
  ADD KEY `order_items_product_id_index` (`product_id`),
  ADD KEY `idx_order_items_order_id` (`order_id`),
  ADD KEY `idx_order_items_product_id` (`product_id`),
  ADD KEY `idx_order_items_order_product` (`order_id`,`product_id`),
  ADD KEY `idx_oi_order` (`order_id`),
  ADD KEY `idx_oi_product` (`product_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `payments_processed_by_foreign` (`processed_by`),
  ADD KEY `payments_payment_date_index` (`payment_date`),
  ADD KEY `idx_payments_order_id` (`order_id`),
  ADD KEY `idx_payments_payment_date` (`payment_date`),
  ADD KEY `idx_payments_method` (`payment_method`),
  ADD KEY `idx_pay_order` (`order_id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD UNIQUE KEY `products_product_name_unique` (`product_name`),
  ADD UNIQUE KEY `products_barcode_unique` (`barcode`),
  ADD KEY `products_category_id_index` (`category_id`),
  ADD KEY `products_status_index` (`status`),
  ADD KEY `products_barcode_index` (`barcode`),
  ADD KEY `idx_products_status_v2` (`status`),
  ADD KEY `idx_products_barcode_v2` (`barcode`),
  ADD KEY `idx_products_category_v2` (`category_id`),
  ADD KEY `idx_products_status_cat` (`status`,`category_id`),
  ADD KEY `idx_prod_barcode` (`barcode`);

--
-- Indexes for table `product_transactions`
--
ALTER TABLE `product_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_transactions_user_id_foreign` (`user_id`),
  ADD KEY `product_transactions_product_id_index` (`product_id`),
  ADD KEY `product_transactions_type_index` (`type`),
  ADD KEY `product_transactions_reference_type_reference_id_index` (`reference_type`,`reference_id`),
  ADD KEY `product_transactions_created_at_index` (`created_at`),
  ADD KEY `idx_product_transactions_product_id` (`product_id`),
  ADD KEY `idx_product_transactions_type` (`type`),
  ADD KEY `idx_product_transactions_created_at` (`created_at`),
  ADD KEY `idx_product_transactions_product_type` (`product_id`,`type`),
  ADD KEY `idx_product_transactions_product_date` (`product_id`,`created_at`),
  ADD KEY `idx_pt_product` (`product_id`),
  ADD KEY `idx_pt_created` (`created_at`);

--
-- Indexes for table `rental_contracts`
--
ALTER TABLE `rental_contracts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rental_contracts_property_id` (`property_id`),
  ADD KEY `idx_rental_contracts_tenant_id` (`tenant_id`),
  ADD KEY `idx_rental_contracts_status` (`status`),
  ADD KEY `idx_rental_contracts_property_status` (`property_id`,`status`),
  ADD KEY `idx_rc_property` (`property_id`),
  ADD KEY `idx_rc_tenant` (`tenant_id`);

--
-- Indexes for table `rental_maintenance`
--
ALTER TABLE `rental_maintenance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rental_maintenance_tenant_id_foreign` (`tenant_id`),
  ADD KEY `idx_rental_maintenance_property_id` (`property_id`),
  ADD KEY `idx_rental_maintenance_status` (`status`),
  ADD KEY `idx_rm_property` (`property_id`);

--
-- Indexes for table `rental_payments`
--
ALTER TABLE `rental_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rental_payments_tenant_id_foreign` (`tenant_id`),
  ADD KEY `rental_payments_property_id_foreign` (`property_id`),
  ADD KEY `idx_rental_payments_payment_date` (`payment_date`);

--
-- Indexes for table `rental_properties`
--
ALTER TABLE `rental_properties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rental_properties_status` (`status`),
  ADD KEY `idx_rental_properties_stall` (`stall_number`);

--
-- Indexes for table `rental_tenants`
--
ALTER TABLE `rental_tenants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rental_tenants_property_rented_id_foreign` (`property_rented_id`);

--
-- Indexes for table `sales_summary`
--
ALTER TABLE `sales_summary`
  ADD PRIMARY KEY (`summary_id`),
  ADD UNIQUE KEY `sales_summary_date_period_type_unique` (`date`,`period_type`),
  ADD KEY `sales_summary_date_index` (`date`),
  ADD KEY `sales_summary_period_type_index` (`period_type`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `staff_info`
--
ALTER TABLE `staff_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `staff_info_email_unique` (`email`),
  ADD KEY `idx_staff_info_email` (`email`),
  ADD KEY `idx_staff_info_user_id` (`user_id`);

--
-- Indexes for table `toga_departments`
--
ALTER TABLE `toga_departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `toga_departments_code_unique` (`code`),
  ADD KEY `toga_departments_code_index` (`code`),
  ADD KEY `toga_departments_created_at_index` (`created_at`);

--
-- Indexes for table `toga_payments`
--
ALTER TABLE `toga_payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `toga_payments_payment_number_unique` (`payment_number`),
  ADD KEY `toga_payments_payment_number_index` (`payment_number`),
  ADD KEY `toga_payments_status_index` (`status`),
  ADD KEY `toga_payments_toga_department_id_index` (`toga_department_id`),
  ADD KEY `toga_payments_toga_rental_id_index` (`toga_rental_id`),
  ADD KEY `toga_payments_payment_date_index` (`payment_date`),
  ADD KEY `toga_payments_created_at_index` (`created_at`),
  ADD KEY `toga_payments_toga_department_id_status_index` (`toga_department_id`,`status`),
  ADD KEY `toga_payments_toga_department_id_created_at_index` (`toga_department_id`,`created_at`),
  ADD KEY `idx_toga_payments_payment_date` (`payment_date`);

--
-- Indexes for table `toga_rentals`
--
ALTER TABLE `toga_rentals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `toga_rentals_student_number_index` (`student_number`),
  ADD KEY `toga_rentals_status_index` (`status`),
  ADD KEY `toga_rentals_toga_department_id_index` (`toga_department_id`),
  ADD KEY `toga_rentals_payment_status_index` (`payment_status`),
  ADD KEY `toga_rentals_rental_date_index` (`rental_date`),
  ADD KEY `toga_rentals_return_date_index` (`return_date`),
  ADD KEY `toga_rentals_created_at_index` (`created_at`),
  ADD KEY `toga_rentals_toga_department_id_status_index` (`toga_department_id`,`status`),
  ADD KEY `toga_rentals_toga_department_id_created_at_index` (`toga_department_id`,`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_email_index` (`email`),
  ADD KEY `users_role_index` (`role`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventories`
--
ALTER TABLE `inventories`
  MODIFY `inventory_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `product_transactions`
--
ALTER TABLE `product_transactions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rental_contracts`
--
ALTER TABLE `rental_contracts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rental_maintenance`
--
ALTER TABLE `rental_maintenance`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rental_payments`
--
ALTER TABLE `rental_payments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rental_properties`
--
ALTER TABLE `rental_properties`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rental_tenants`
--
ALTER TABLE `rental_tenants`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_summary`
--
ALTER TABLE `sales_summary`
  MODIFY `summary_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_info`
--
ALTER TABLE `staff_info`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `toga_departments`
--
ALTER TABLE `toga_departments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `toga_payments`
--
ALTER TABLE `toga_payments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `toga_rentals`
--
ALTER TABLE `toga_rentals`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `inventories`
--
ALTER TABLE `inventories`
  ADD CONSTRAINT `inventories_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE SET NULL;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `payments_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT;

--
-- Constraints for table `product_transactions`
--
ALTER TABLE `product_transactions`
  ADD CONSTRAINT `product_transactions_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rental_contracts`
--
ALTER TABLE `rental_contracts`
  ADD CONSTRAINT `rental_contracts_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `rental_properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rental_contracts_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `rental_tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rental_maintenance`
--
ALTER TABLE `rental_maintenance`
  ADD CONSTRAINT `rental_maintenance_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `rental_properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rental_maintenance_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `rental_tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rental_payments`
--
ALTER TABLE `rental_payments`
  ADD CONSTRAINT `rental_payments_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `rental_properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rental_payments_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `rental_tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rental_tenants`
--
ALTER TABLE `rental_tenants`
  ADD CONSTRAINT `rental_tenants_property_rented_id_foreign` FOREIGN KEY (`property_rented_id`) REFERENCES `rental_properties` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `staff_info`
--
ALTER TABLE `staff_info`
  ADD CONSTRAINT `staff_info_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `toga_payments`
--
ALTER TABLE `toga_payments`
  ADD CONSTRAINT `toga_payments_toga_department_id_foreign` FOREIGN KEY (`toga_department_id`) REFERENCES `toga_departments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `toga_payments_toga_rental_id_foreign` FOREIGN KEY (`toga_rental_id`) REFERENCES `toga_rentals` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `toga_rentals`
--
ALTER TABLE `toga_rentals`
  ADD CONSTRAINT `toga_rentals_toga_department_id_foreign` FOREIGN KEY (`toga_department_id`) REFERENCES `toga_departments` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
