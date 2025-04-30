-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 30, 2025 at 10:15 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.3.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `church_property_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `borrow_request`
--

CREATE TABLE `borrow_request` (
  `request_id` int(11) NOT NULL,
  `member_id` varchar(50) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `request_date` date DEFAULT NULL,
  `due_return_date` date DEFAULT NULL,
  `receive_date` date DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `borrow_request_status`
--

CREATE TABLE `borrow_request_status` (
  `status_id` int(11) NOT NULL,
  `request_id` int(11) DEFAULT NULL,
  `status_name` varchar(100) DEFAULT NULL,
  `cancel_reason` varchar(255) DEFAULT NULL,
  `canceled_by` varchar(255) DEFAULT NULL,
  `updated_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `name`, `status`) VALUES
(1, 'ชุดเดรสหรือชุด', 1),
(2, 'เสื้อ', 1),
(3, 'กระโปรง', 1),
(4, 'ชุดคลุม / ผ้าคลุม และ เสื้อคลุม', 1),
(5, 'อุปกรณ์ตกแต่งเสริม (นักร้อง)', 1),
(6, 'อุปกรณ์ตกแต่งเสริม (ร่ายรำ)', 1),
(7, 'ครุภัณฑ์', 1),
(8, 'react2', 0),
(9, 'ves22', 0),
(10, 'เกษ', 0),
(11, 'เกษ', 0);

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `member_id` varchar(50) NOT NULL,
  `prefix` varchar(20) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `full_name` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `team` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `join_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`member_id`, `prefix`, `first_name`, `last_name`, `full_name`, `email`, `team`, `phone_number`, `birthday`, `username`, `password`, `role_id`, `join_date`) VALUES
('M001', 'นาย', 'สมชาย', 'ใจดี', 'สมชาย ใจดี', 'test@example.com', 'A', '0800000000', '1995-05-01', 'testuser', '123456789', 1, '2025-04-19 22:01:30'),
('M002', 'นางสาว', 'ส้มโอ', 'ธรรมดี', 'ส้มโอ ธรรมดี', 'user@example.com', 'B', '0891234567', '2000-08-15', 'normaluser', '123456789', 2, '2025-04-19 22:01:30'),
('M003', 'นางสาว', 'Yutita', 'Kaewlom', 'Yutita Kaewlom', 'Yutita.ka@t111fac.or.th', 'H', '0653876135', '2007-04-24', 'yutitak', '123456', 2, '2025-04-25 23:16:16'),
('M004', 'นาย', 'itthkorn', 'peingern', 'itthkorn peingern', 'test@test.com', 'G', '0971517780', '2000-10-29', 'iomasterz', '123456', 2, '2025-04-28 11:41:43');

-- --------------------------------------------------------

--
-- Table structure for table `notification_settings`
--

CREATE TABLE `notification_settings` (
  `id` int(11) NOT NULL,
  `member_id` varchar(50) NOT NULL,
  `status` char(1) NOT NULL,
  `alert_enabled` tinyint(1) DEFAULT 1,
  `last_alert_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `alert_interval` int(11) DEFAULT 30
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification_settings`
--

INSERT INTO `notification_settings` (`id`, `member_id`, `status`, `alert_enabled`, `last_alert_time`, `alert_interval`) VALUES
(1, 'M001', 'Y', 1, '2025-04-28 05:37:02', 30),
(2, 'M002', 'Y', 1, '2025-04-28 05:46:31', 30),
(5, 'M004', 'Y', 1, '2025-04-27 22:47:04', 30);

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `product_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `quantity` int(11) DEFAULT 0,
  `size` varchar(100) DEFAULT NULL,
  `price_per_item` decimal(10,2) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `status` varchar(100) DEFAULT 'พร้อมใช้งาน',
  `image` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`product_id`, `name`, `color`, `quantity`, `size`, `price_per_item`, `category_id`, `status`, `image`) VALUES
(1, 'เหลืองลูกไม้', '', 2, 'M', 350.00, 1, 'พร้อมใช้งาน', 'https://i.postimg.cc/bYV68NzV/yellow-lace-and-jersey-slit-prom-dress-2.webp'),
(2, 'เดรสโอรส', 'โอรส', 1, 'L', 400.00, 1, 'รายการนี้ถูกลบแล้ว', 'https://i.postimg.cc/K8xQDKQz/iz63bp.jpg'),
(3, 'เดรสบานเย็น', NULL, 0, NULL, 300.00, 1, 'รายการนี้ถูกลบแล้ว', 'https://i.postimg.cc/xTYLWwmp/images.jpg'),
(4, 'เดรสชมพูกะปิจีบรอบ', NULL, 3, NULL, 400.00, 1, 'พร้อมใช้งาน', 'https://i.postimg.cc/sgKFYCYk/th-11134207-7ras9-m1fe1h2a2zebe3.jpg'),
(5, 'เดรสเขียวเข้ม', NULL, 6, NULL, 350.00, 1, 'พร้อมใช้งาน', 'https://i.postimg.cc/bJ74yyPt/images-1.jpg'),
(6, 'มินิเดรสน้ำเงิน', NULL, 4, NULL, 350.00, 1, 'พร้อมใช้งาน', 'https://i.postimg.cc/wTV4Pc1J/c7thdf.jpg'),
(7, 'เดรสกระโปรงม่วงพาสเทล ผ้าชีฟอง', NULL, 1, NULL, 300.00, 1, 'พร้อมใช้งาน', 'https://i.postimg.cc/7h4XtfDm/th-11134207-7r990-lxaxltcs0x5b71-tn.webp'),
(8, 'เดรสกระโปรงเขียวพาสเทล ผ้าชีฟอง', NULL, 1, NULL, 300.00, 1, 'พร้อมใช้งาน', 'https://i.postimg.cc/9XBBFXcH/78.jpg'),
(9, 'เดรสส้มลูกไม้ขาว', NULL, 1, NULL, 350.00, 1, 'พร้อมใช้งาน', 'https://i.postimg.cc/65jLnH7H/images-2.jpg'),
(10, 'เดรสสั้น สีส้มแดง', NULL, 1, NULL, 150.00, 1, 'พร้อมใช้งาน', 'https://i.postimg.cc/SRQCz8mF/ez.jpg'),
(11, 'บอดี้สูทสีเขียวตอง', NULL, 6, NULL, 100.00, 1, 'พร้อมใช้งาน', 'https://i.postimg.cc/RhqqBTMF/4b08ed67103c4a80a59d55489002184398802707-xxl-1.jpg'),
(12, 'เดรสขาวซีทรู', NULL, 2, NULL, 250.00, 1, 'พร้อมใช้งาน', 'https://i.postimg.cc/MHhZ82PP/Shop1-7858-17290.jpg'),
(13, 'กั๊กน้ำเงิน', NULL, 8, NULL, 150.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/fR7z1PxC/7d.jpg'),
(14, 'เชิ้ตเหลืองอ่อน', NULL, 2, NULL, 100.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/d0qsF96Y/09cc67699c638fe1b7e01712d3ee82f8-jpg-720x720q80.jpg'),
(15, 'เชิ้ตเขียวมิ้น', NULL, 1, NULL, 120.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/x8bY5pfK/shm00055a.jpg'),
(16, 'เสื้อเขียวหยก', NULL, 7, NULL, 120.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/dDPFxR3g/abda7a20cac3d9ae3b4e7537b1ead4b6.jpg'),
(17, 'เสื้อเขียวใหญ่', NULL, 1, NULL, 150.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/DwcW10Y7/rp16vq.jpg'),
(18, 'เสื้อสีชมพูกะปิเลื่อม', NULL, 3, NULL, 120.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/TwKp892P/images-3.jpg'),
(19, 'เสื้อเหลืองมัสตาร์ดผู้หญิง', NULL, 4, NULL, 120.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/wxs700bf/images-4.jpg'),
(20, 'ฟ้าคอบัว', NULL, 2, NULL, 300.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/8PQs3M21/images-5.jpg'),
(21, 'ฟ้าแขนยาวปาด', NULL, 1, NULL, 300.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/RZvhC9Cy/images-6.jpg'),
(22, 'เชิร์ตมัสตาร์ดชาย', NULL, 3, NULL, 160.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/dQdV8DLg/images-7.jpg'),
(23, 'เชิ้ตขาว', NULL, 2, NULL, 150.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/sD4fN8Pc/2000007855946-1-20230914103244.webp'),
(24, 'เสื้อกล้ามเขียวตอง', NULL, 6, NULL, 60.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/x1sf0z4N/images-8.jpg'),
(25, 'ครอบสีเขียว แขนตุ๊กตา', NULL, 3, NULL, 160.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/MZyzn4LS/5d045e7b71b8b89bc9c034fda17c9ced.jpg'),
(26, 'เสื้อแขนกุดประดับดอกสีขาว สีน้ำเงิน', NULL, 1, NULL, 100.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/3w4TYbGz/13666902b73069501f5893563fae1b07.jpg'),
(27, 'เสื้อแขนกุดประดับดอกสีขาว สีแสด ', NULL, 1, NULL, 100.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/7ZbvnQKb/A25-C1-GD001-RED000-4-a27baaae-5c2f-4151-b42f-1ee1bdfe98eb.webp'),
(28, 'เสื้อแขนกุดประดับดอกสีขาว สีแดง', NULL, 1, NULL, 100.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/Qx4wCJjD/images-9.jpg'),
(29, 'เสื้อแขนกุดประดับดอกสีขาว สีเขียอ่อน', NULL, 1, NULL, 100.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/YCTPf24y/th-11134207-7r98o-ltnnzwjl9npk37.jpg'),
(30, 'แดงกากเพชร', NULL, 5, NULL, 290.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/sfK0H4QW/th-11134207-7r98y-lp4ubdemym4e6b.jpg'),
(31, 'ทองกากเพชร', NULL, 5, NULL, 290.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/MT5t4zTw/S1e279396ff1644ffb3798fc5843d5a52k-jpg-360x360q75-jpg.webp'),
(32, 'เขียวกากเพชร', NULL, 7, NULL, 290.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/CMtbKR9t/6d7415b229e500dc57647376bc26b6b3.jpg'),
(33, 'เสื้อสโนวไวท์สีม่วง', NULL, 1, NULL, 150.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/TPRDsgWy/r40bb8.jpg'),
(34, 'เสื้อสโนวไวท์สีชมพู', NULL, 1, NULL, 150.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/y6JvnCHM/download.jpg'),
(35, 'เสื้อสโนวไวท์สีน้ำเงิน', NULL, 1, NULL, 150.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/X7dxSKXx/2zbpsa.jpg'),
(36, 'เสื้อขาวระบาย', NULL, 12, NULL, 150.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/MGKYQh5r/images-10.jpg'),
(37, 'เสื้อยืดสีดำ', NULL, 7, NULL, 150.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/fLVjHm6c/images-11.jpg'),
(38, 'กั้กชีฟองปักมุก', NULL, 1, NULL, 300.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/pXfQ1216/th-11134207-7r98p-lxrztttr3cts98.jpg'),
(39, 'เสื้อขาวลูกไม้แขนตุ๊กตา', NULL, 4, NULL, 350.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/QMycWVHH/5b9fd0e1e43b2f6d21589e9afe4e7228.jpg'),
(40, 'เสื้อขาวแขนยาวรัดรูป', NULL, 6, NULL, 300.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/nz9BKZDT/images-12.jpg'),
(41, 'เสื้อขาวปักลายดอกบลูโรส', NULL, 2, NULL, 290.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/pV8KpWxL/original.jpg'),
(42, 'เสื้อขาวแขนยาวลูกไม้', NULL, 2, NULL, 200.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/4x4cLpcY/images-13.jpg'),
(43, 'เสื้อขาวแขนสั้น', NULL, 3, NULL, 150.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/zGdg93w0/images-14.jpg'),
(44, 'เสื้อขาวคละแบบ (ยังไม่เคยใช้)', NULL, 3, NULL, 120.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/d3Kk8Cvt/images-15.jpg'),
(45, 'เสื้อขาวแขนยาวคอย้วยปักดอกขาว', NULL, 1, NULL, 290.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/CMjfwcHZ/images-16.jpg'),
(46, 'กระโปรงลูกไม้ขาว สีฟ้า', NULL, 1, NULL, 200.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/VLhwp8rX/images-21.jpg'),
(47, 'เสื้อขาวแขนยาว ป้ายEVE', NULL, 11, NULL, 260.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/NMRLf0Th/images-17.jpg'),
(48, 'เสื้อแขนย้วยสีแดง', NULL, 1, NULL, 160.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/KjNzBsJJ/images-18.jpg'),
(49, 'เสื้อแขนย้วยสีเขียวมิ้น', NULL, 1, NULL, 160.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/Yqd0SZ4S/298d9e96-488d-1e35-41f2-6408483f82a8.webp'),
(50, 'เสื้อแขนย้วยสีม่วง', NULL, 1, NULL, 160.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/ZRPKzMt4/6-3.jpg'),
(51, 'เสื้อแขนย้วยสีเขียว', NULL, 1, NULL, 400.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/zX2DNhMb/images-19.jpg'),
(52, 'เสื้อเขียวสามชั้น', NULL, 2, NULL, 250.00, 2, 'พร้อมใช้งาน', 'https://i.postimg.cc/CKkwbQKk/images-20.jpg'),
(53, 'กระโปรงน้ำตาล', NULL, 9, NULL, 200.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/qvCrd5yS/images-22.jpg'),
(54, 'พีทขาวยาว', NULL, 6, NULL, 300.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/SsVFrFb2/th-11134207-7r98y-ltv4lbvy6sfz86.jpg'),
(55, 'สีเทาชายลูกไม้', NULL, 4, NULL, 290.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/ZKGg6Kvs/sg-11134201-22100-e3jg6qbhz6hved.jpg'),
(56, 'กระโปรงทอง', NULL, 5, NULL, 200.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/zXTmtgNY/images-23.jpg'),
(57, 'กระโปรงเขียว', NULL, 6, NULL, 200.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/NFwD5LzR/images-24.jpg'),
(58, 'กระโปรงแดง', NULL, 2, NULL, 200.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/SxX9bkZ4/images-25.jpg'),
(59, 'กระโปรงสีเขียวตอง', NULL, 6, NULL, 150.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/KzcvF5ZT/images-26.jpg'),
(60, 'กระโปรงเขียวออแกนซ่า', NULL, 2, NULL, 120.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/LXj7CddB/images-27.jpg'),
(61, 'ผ้าพลิ้วมัดเอว สีฟ้า', NULL, 17, NULL, 80.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/prxS30RN/images-28.jpg'),
(62, 'ผ้าพลิ้วมัดเอว สีน้ำเงิน', NULL, 14, NULL, 80.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/vH0KSLKj/th-11134207-7qul1-lewa0k2r4wrx77.jpg'),
(63, 'ผ้าพลิ้วสีฟ้าตะขอ', NULL, 1, NULL, 280.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/brz6ms9p/114720-Mix.webp'),
(64, 'กระโปรงฟูฟ่อง ตาข่ายสีฟ้า', NULL, 1, NULL, 70.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/gktMKcXb/images-29.jpg'),
(65, 'กระโปรงพริ้วสั้น สีน้ำไเงิน', NULL, 1, NULL, 280.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/t41Bv0WZ/th-11134207-7rasm-m2y09lukyo6ad2.jpg'),
(66, 'กระโปรงพริ้วสั้น สีพีช', NULL, 1, NULL, 280.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/dVz4zWjW/images-30.jpg'),
(67, 'กระโปรงพริ้วสั้น สีแดงเข้ม', NULL, 1, NULL, 280.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/d1Fn0LXr/ba05cc7b74c26b0c39d465a114903a28.jpg'),
(68, 'กระโปรงเขียวน้ำทะเล 3 ชั้น', NULL, 1, NULL, 250.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/26xGLCRJ/62a7ea1672bb9b1866357d31f4d080d7.jpg'),
(69, 'กระโปรงพลีทสีทอง', NULL, 3, NULL, 300.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/hvy0MMG1/images-31.jpg'),
(70, 'กระโปรงเจ้าสาวสั้น', NULL, 1, NULL, 300.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/vHThDRPq/images-32.jpg'),
(71, 'กระโปรงเจ้าสาวยาว', NULL, 5, NULL, 300.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/TPMJkKTF/images-33.jpg'),
(72, 'กระโปรงฟูฟ่อง ตาข่ายสีขาว', NULL, 4, NULL, 200.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/RhDcwFPP/images-34.jpg'),
(73, 'กระโปรงสโนวไวท์สีม่วง', NULL, 1, NULL, 300.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/xd3MtgxN/468202a6b6f0e57b1e4c2d10052040e2.jpg'),
(74, 'กระโปรงสโนวไวท์สีเขียว', NULL, 1, NULL, 300.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/xd3MtgxN/468202a6b6f0e57b1e4c2d10052040e2.jpg'),
(75, 'กระโปรงสโนวไวท์สีน้ำเงิน', NULL, 1, NULL, 300.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/xd3MtgxN/468202a6b6f0e57b1e4c2d10052040e2.jpg'),
(76, 'กระโปรงสโนวไวท์สีชมพู', NULL, 1, NULL, 300.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/xd3MtgxN/468202a6b6f0e57b1e4c2d10052040e2.jpg'),
(77, 'กระโปรงพริ้วสีชมพูเข้ม-อ่อน 2 ชั้น', NULL, 2, NULL, 100.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/FKNJd3rr/sg-11134201-7rd44-lvo7ry3uab048a.jpg'),
(78, 'กระโปรงชมพู 3 ชั้น', NULL, 3, NULL, 250.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/vTg1Fvzz/images-35.jpg'),
(79, 'กระโปรงกำมะหยี่สีม่วง', NULL, 2, NULL, 300.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/9XKRPvmN/images-36.jpg'),
(80, 'กระโปรงลูกไม้ขาว สีชมพู', NULL, 1, NULL, 300.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/pLYmHrDg/sg-11134201-7rdy9-lxce0qwh333ac9.jpg'),
(81, 'กระโปรงลูกไม้ขาว สีแสด', NULL, 1, NULL, 300.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/fy9bgRzq/images-37.jpg'),
(82, 'กระโปรงลูกไม้ขาว สีม่วง', NULL, 1, NULL, 300.00, 3, 'พร้อมใช้งาน', 'https://i.postimg.cc/gcQ47zqV/images-38.jpg'),
(83, 'เสื้อคลุมขาว', NULL, 25, NULL, 250.00, 4, 'พร้อมใช้งาน', 'https://i.postimg.cc/W3Kmx8rN/images-39.jpg'),
(84, 'สีขาวแถบทอง', NULL, 7, NULL, 350.00, 4, 'พร้อมใช้งาน', 'https://i.postimg.cc/05TdftPZ/sg-11134201-7rcca-lszsxb6ytaet96.jpg'),
(85, 'ชุดคลุมขาวสั้น', NULL, 11, NULL, 350.00, 4, 'พร้อมใช้งาน', 'https://i.postimg.cc/QMdptwJN/sg-11134201-7reoj-m27w97703zgj07.jpg'),
(86, 'ผ้าคลุมไหล่ทอง', NULL, 2, NULL, 100.00, 4, 'พร้อมใช้งาน', 'https://i.postimg.cc/d1zd51PD/nmbuix.jpg'),
(87, 'ผ้าคลุมไหล่เหลือง', NULL, 6, NULL, 100.00, 4, 'พร้อมใช้งาน', 'https://i.postimg.cc/SNL8GkZN/images-40.jpg'),
(88, 'ไทด์ดำ', NULL, 4, NULL, 70.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/hGY7GjGM/images-41.jpg'),
(89, 'ไทด์ชมพู', NULL, 2, NULL, 59.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/Y9mLLHG7/images-42.jpg'),
(90, 'ไทด์น้ำเงิน', NULL, 6, NULL, 70.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/SRF2WvCM/images-43.jpg'),
(91, 'ไทด์ฟ้า', NULL, 3, NULL, 70.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/sxYBK440/1a77dd63939ae97cf08b8c724e2152d6.jpg'),
(92, 'ไทด์บานเย็น', NULL, 4, NULL, 60.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/kgXVF86f/images-44.jpg'),
(93, 'ไทด์แดง', NULL, 8, NULL, 70.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/vZq4PB5M/images-45.jpg'),
(94, 'ไทด์เหลืองทอง', NULL, 7, NULL, 50.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/W4xhvH9H/images-46.jpg'),
(95, 'ไทด์ส้ม', NULL, 8, NULL, 50.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/3NTNyDQj/images-47.jpg'),
(96, 'ไทด์แดง', NULL, 1, NULL, 50.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/vZq4PB5M/images-45.jpg'),
(97, 'ไทด์เขียวเข้ม', NULL, 6, NULL, 50.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/G3F9WzvX/images-48.jpg'),
(98, 'ไทด์เขียวอ่อน', NULL, 3, NULL, 50.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/3xcwXqHx/sg-11134201-7rdx8-lxs7gwabkmmi68-tn.jpg'),
(99, 'สร้อยมุก', NULL, 12, NULL, 70.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/HxGsK7nG/images-49.jpg'),
(100, 'ผ้าเลื่อมสีดำทอง', NULL, 19, NULL, 100.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/SRdSJTrq/images-50.jpg'),
(101, 'หูกระต่ายสีน้ำเงิน', NULL, 8, NULL, 130.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/bNYYKPyv/images-51.jpg'),
(102, 'โบว์ชมพู', NULL, 20, NULL, 50.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/GmHLmjsw/images-52.jpg'),
(103, 'โบว์เขียว-แดง คริสต์มาส', NULL, 9, NULL, 50.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/52TxYFwH/images-53.jpg'),
(104, 'ผ้าแถบเขียวแดง คริสต์มาส', NULL, 17, NULL, 50.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/mkLRf3Gn/images-54.jpg'),
(105, 'ผ้าสีขาวพาดบ่า', NULL, 4, NULL, 80.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/rFpcf9j0/a3d03c5df47aa6a9feae2d7143caf193.jpg'),
(106, 'ผ้าเหลืองพาดบ่า', NULL, 14, NULL, 80.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/T3z6Yv6g/images-55.jpg'),
(107, 'ผ้าฟ้าพาดบ่า', NULL, 10, NULL, 80.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/SsrFrXzf/008-160.jpg'),
(108, 'หมวกขาว', NULL, 14, NULL, 150.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/7Ycvmrbd/peach-buckle-b-white-02.jpg'),
(109, 'หมวกคริสต์มาส', NULL, 10, NULL, 160.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/xdDwVGvP/images-56.jpg'),
(110, 'ผ้าชมพูพาสเทล', NULL, 19, NULL, 100.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/rmg34vvh/images-57.jpg'),
(111, 'ที่คาดผมเพชร', NULL, 8, NULL, 150.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/rsKnrzGm/images-58.jpg'),
(112, 'สร้อยคอใบโคลเวอร์สีดำ', NULL, 5, NULL, 150.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/3rcbHC7D/images-59.jpg'),
(113, 'ผ้าเขียวตองเข้มพาดบ่า', NULL, 20, NULL, 80.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/SsrFrXzf/008-160.jpg'),
(114, 'ผ้าเขียวเข้มพาดบ่า', NULL, 19, NULL, 80.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/SsrFrXzf/008-160.jpg'),
(115, 'ผ้าสีส้มพาดบ่า', NULL, 17, NULL, 80.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/SsrFrXzf/008-160.jpg'),
(116, 'ผ้าชีฟอง เขียวมิ้นท์', NULL, 15, NULL, 100.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/XYMHrjrj/images-60.jpg'),
(117, 'ผ้าทอมกำมะหยี่ ผืนเล็ก', NULL, 11, NULL, 100.00, 5, 'พร้อมใช้งาน', 'https://i.postimg.cc/rpMf9fG7/images-61.jpg'),
(118, 'ผ้าคาดเอวเล็กสีทอง', NULL, 19, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/zBfps3cj/186729b3bde680953e00cbcf0e4370d7.jpg'),
(119, 'สะไบทอง', NULL, 2, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/qRZQ44fd/images-62.jpg'),
(120, 'มงกุฎเล็กสีฟ้า', NULL, 3, NULL, 150.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/gjXs0QdL/images-63.jpg'),
(121, 'มงกุฎเล็กสีชมพ', NULL, 3, NULL, 150.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/tJK5nkCS/images-64.jpg'),
(122, 'ไม้คาดผมสีดำประดับเพชร อันเล็ก', NULL, 5, NULL, 180.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/cH62QD00/images-65.jpg'),
(123, 'ไม้คาดผมสีดำประดับเพชร หยักหยัก', NULL, 6, NULL, 180.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/8c6YYj7Y/782ebba009289723b4b087858e3f566a.jpg'),
(124, 'มงกุฎดอกไม้สีเขียว', NULL, 2, NULL, 200.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/J0ZTqvgV/sg-11134201-7rcdb-ltdqwncx2zzme2.jpg'),
(125, 'มงกุฎเชือกประดับดอกกุหลาบสีขาว', NULL, 4, NULL, 200.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/prbCpkd0/images-66.jpg'),
(126, 'มงกุฎสีฟ้าขาว เส้นเล็ก', NULL, 5, NULL, 200.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/wMXVJJy9/images-67.jpg'),
(127, 'มงกุฎดอกไม้สีพาสเทล', NULL, 2, NULL, 200.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/sgDcQMVR/th-11134207-7rask-m5hi958igulz60.jpg'),
(128, 'มงกุฎดอกไม้สีชมพู', NULL, 1, NULL, 200.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/d3YRq1Wp/original-1.jpg'),
(129, 'มงกุฎดอกไม้สีขาวแดง', NULL, 2, NULL, 200.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/Prdb9Cv8/images-68.jpg'),
(130, 'มงกุฎดอกไม้สีชมพูขาวเหลือง ', NULL, 1, NULL, 200.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/FRt3ZzQz/3yzkxz.jpg'),
(131, 'ห่วงขาวทอง ผ้าตาข่าย', NULL, 2, NULL, 80.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/RVb3dh7m/Hc0d4fc2b34734276aa5f9e81e2fab4282-jpg-720x720q50.avif'),
(132, 'ห่วงทอง', NULL, 4, NULL, 60.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/7Yc67c4Y/4e98703d972c52234e7bfe941442cd9f.jpg'),
(133, 'ห่วงชมพูตาข่าย', NULL, 6, NULL, 80.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/gJJFgzq9/image.png'),
(134, 'ห่วงม่วงเข้ม', NULL, 3, NULL, 60.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/HxqmjG5f/images-69.jpg'),
(135, 'ห่วงม่วงอ่อน', NULL, 2, NULL, 60.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/HxqmjG5f/images-69.jpg'),
(136, 'ห่วงฟ้าดอกไม้', NULL, 4, NULL, 100.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/jqHmyJrW/images-70.jpg'),
(137, 'มงกุฎเพชร 1', NULL, 1, NULL, 120.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/HL8Pnr2k/images-71.jpg'),
(138, 'มงกุฎเพชร 2', NULL, 1, NULL, 120.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/HL8Pnr2k/images-71.jpg'),
(139, 'ที่คาดผมเพชรประดับมุก', NULL, 1, NULL, 100.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/hjgbnvZw/images-72.jpg'),
(140, 'มงกุฎเพชร 3', NULL, 1, NULL, 120.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/HL8Pnr2k/images-71.jpg'),
(141, 'ดอกไม้ขาวมุกประดับผม', NULL, 3, NULL, 120.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/BnKx1Hdk/images-73.jpg'),
(142, 'โบว์มงกุฎสีขาว', NULL, 4, NULL, 100.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/SNX9wcNR/images-74.jpg'),
(143, 'โบว์ดอกไม้อันใหญ่สีขาว', NULL, 4, NULL, 160.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/rmF0grP8/th-11134207-7r98s-lqcsrmhc3fms46.jpg'),
(144, 'ต่างหูยาว', NULL, 5, NULL, 80.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/0QW64yT7/images-75.jpg'),
(145, 'ต่างหูดอกไม้ชมพู สำหรับคนไม่เจาะหู ', NULL, 3, NULL, 80.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/xTbksYtb/images-76.jpg'),
(146, 'ต่างหูดอกไม้ชมพู', NULL, 7, NULL, 80.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/xTbksYtb/images-76.jpg'),
(147, 'แถบผูกผมผ้าซาตินสีฟ้าแบบสั้น', NULL, 2, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/FRRz0QYz/sg-11134201-7rd3r-lug3j4d5al4w89.jpg'),
(148, 'แถบผูกผมผ้าซาตินสีฟ้าแบบยาว', NULL, 1, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/MHfGrbb8/th-11134207-7r98p-luvq9yur7msu1c.jpg'),
(149, 'แถบผูกผมผ้าซาตินสีบานเย็นแบบสั้น', NULL, 2, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/XNtKNsPd/images-77.jpg'),
(150, 'แถบผูกผมผ้าซาตินสีบานเย็นแบบยาว', NULL, 2, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/WbrGdMRK/images-78.jpg'),
(151, 'ผ้าผูกผมสีชมพู', NULL, 1, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/x13LRn13/images-79.jpg'),
(152, 'โบว์ผ้าผูกผมสีชมพู', NULL, 1, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/506vbzqs/images-80.jpg'),
(153, 'โบว์ผ้าผูกผมสีทอง', NULL, 5, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/B6kF6vm4/images-81.jpg'),
(154, 'โบว์ผ้าผูกผมสีทอง', NULL, 1, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/B6kF6vm4/images-81.jpg'),
(155, 'ผ้าผูกเอวชีฟองสีฟ้า', NULL, 1, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/L821hw3Y/images-82.jpg'),
(156, 'ผ้าผูกผมสีฟ้า', NULL, 1, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/JzxBXxpT/images-83.jpg'),
(157, 'ผ้าบางสีฟ้า', NULL, 1, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/GpS872wG/images-84.jpg'),
(158, 'ผ้าสีน้ำเงิน', NULL, 1, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/Y9547sSS/765ec1ac35c2b88cc51ca7166f782934.jpg'),
(159, 'โบว์ผ้าผูกข้างหลังสีเหลือง', NULL, 1, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/dtK7SpXH/images-85.jpg'),
(160, 'ผ้าบางสีเหลือง', NULL, 1, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/7YMCvXrx/images-86.jpg'),
(161, 'โบว์ผ้าผูกข้างหลังสีม่วง', NULL, 1, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/nh3CrzLg/th-11134207-7rasi-m2uioqlqlxia9c.jpg'),
(162, 'โบว์ผ้าผูกข้างหลังสีเขียวเข้ม', NULL, 2, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/BbfvkPhL/images-87.jpg'),
(163, 'ผ้าพาดสีเขียวเข้ม', NULL, 1, NULL, 30.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/4NZd1t7j/images-88.jpg'),
(164, 'ผ้าผูกผมสีเขียวมินท์', NULL, 1, NULL, 30.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/28w596ny/images-89.jpg'),
(165, 'ผ้วผูกผมสีขาวแบบสั้น', NULL, 2, NULL, 25.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/htZtg5yq/20483c0207a9683c3d5e9164d5da0806.jpg'),
(166, 'ผ้วผูกผมสีขาวแบบยาว', NULL, 2, NULL, 30.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/vm1Hmtkx/20600fb8ee08ce88d1dba4059ab3ce8a.jpg'),
(167, 'เข็มกลัดดอกไม้สีขาวเล็ก', NULL, 24, NULL, 150.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/pTzWfX22/images-90.jpg'),
(168, 'ดอกไม้ติดไหล่สีชมพู อันใหญ่', NULL, 6, NULL, 80.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/15J9cdZN/images-91.jpg'),
(169, 'มงกุฎดอกไม้สีชมพูพาสเทล', NULL, 1, NULL, 150.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/zGQ84Rvz/th-11134207-7rasm-m5kboz9bv5bq4b.jpg'),
(170, 'พร๊อพดอกไม้ใหญ่ผ้าแก้วสีเขียวตอง ', NULL, 5, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/GpsdRhTk/images-92.jpg'),
(171, 'โบว์ติดคาดเอวสีเขียวตอง', NULL, 7, NULL, 50.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/Pxsh5s10/images-93.jpg'),
(172, 'คาดเอวสีครีม', NULL, 9, NULL, 30.00, 6, 'พร้อมใช้งาน', 'https://i.postimg.cc/tT3b1S5J/sg-11134201-22110-xiznveubhakv76.jpg'),
(173, 'เครื่องรับ-ส่งวิทยุระบบ VHF/FM', NULL, 10, NULL, 12000.00, 7, 'พร้อมใช้งาน', 'https://i.postimg.cc/t7QpY00s/images-94.jpg'),
(174, 'เครื่องดูดฝุ่น ', NULL, 5, NULL, 8600.00, 7, 'พร้อมใช้งาน', 'https://i.postimg.cc/v8pVWcbV/images-95.jpg'),
(175, 'ตู้เหล็ก', NULL, 5, NULL, 6600.00, 7, 'พร้อมใช้งาน', 'https://i.postimg.cc/CLkfJSx6/images-96.jpg'),
(176, 'เครื่องตัดหญ้า', NULL, 1, NULL, 9500.00, 7, 'พร้อมใช้งาน', 'https://i.postimg.cc/ht0QWsxL/1139860234-5100218000401.jpg'),
(177, 'เครื่องมัลติมีเดียโปรเจคเตอร์', NULL, 1, NULL, 23300.00, 7, 'พร้อมใช้งาน', 'https://i.postimg.cc/7LYGxzMp/images-97.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `reasons`
--

CREATE TABLE `reasons` (
  `id` int(11) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reasons`
--

INSERT INTO `reasons` (`id`, `description`) VALUES
(1, 'เกินเวลาที่กำหนด'),
(2, 'ของมีรอยขีดข่วนหรือแตกหัก'),
(3, 'หาของไม่พบ ต้องจ่ายเต็มราคา'),
(4, 'คืนของผิดชิ้น ต้องเปลี่ยนคืนใหม่'),
(5, 'คืนของครบและสมบูรณ์'),
(6, 'คืนของบางชิ้น ขาดบางชิ้น'),
(7, 'จ่ายค่าปรับแล้ว'),
(8, 'เหตุผลอื่นๆ');

-- --------------------------------------------------------

--
-- Table structure for table `return_detail`
--

CREATE TABLE `return_detail` (
  `return_id` int(11) NOT NULL,
  `request_id` int(11) DEFAULT NULL,
  `returned_good` int(11) DEFAULT NULL,
  `returned_damaged` int(11) DEFAULT NULL,
  `returned_lost` int(11) DEFAULT NULL,
  `repaired_quantity` int(11) DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `fine_amount` text DEFAULT NULL,
  `received_by` varchar(255) DEFAULT NULL,
  `returned_by` varchar(255) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `repair_note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'Admin'),
(2, 'User'),
(3, 'Newuser');

-- --------------------------------------------------------

--
-- Table structure for table `sizes`
--

CREATE TABLE `sizes` (
  `size_id` int(11) NOT NULL,
  `size_label` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sizes`
--

INSERT INTO `sizes` (`size_id`, `size_label`) VALUES
(1, 'S'),
(2, 'M'),
(3, 'L'),
(4, 'XL'),
(5, 'Free Size');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `borrow_request`
--
ALTER TABLE `borrow_request`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `borrow_request_status`
--
ALTER TABLE `borrow_request_status`
  ADD PRIMARY KEY (`status_id`),
  ADD KEY `request_id` (`request_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`member_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `notification_settings`
--
ALTER TABLE `notification_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `reasons`
--
ALTER TABLE `reasons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `return_detail`
--
ALTER TABLE `return_detail`
  ADD PRIMARY KEY (`return_id`),
  ADD KEY `request_id` (`request_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`size_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `borrow_request`
--
ALTER TABLE `borrow_request`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `borrow_request_status`
--
ALTER TABLE `borrow_request_status`
  MODIFY `status_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `notification_settings`
--
ALTER TABLE `notification_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=179;

--
-- AUTO_INCREMENT for table `return_detail`
--
ALTER TABLE `return_detail`
  MODIFY `return_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sizes`
--
ALTER TABLE `sizes`
  MODIFY `size_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `borrow_request`
--
ALTER TABLE `borrow_request`
  ADD CONSTRAINT `borrow_request_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`),
  ADD CONSTRAINT `borrow_request_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`);

--
-- Constraints for table `borrow_request_status`
--
ALTER TABLE `borrow_request_status`
  ADD CONSTRAINT `borrow_request_status_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `borrow_request` (`request_id`);

--
-- Constraints for table `notification_settings`
--
ALTER TABLE `notification_settings`
  ADD CONSTRAINT `notification_settings_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`);

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);

--
-- Constraints for table `return_detail`
--
ALTER TABLE `return_detail`
  ADD CONSTRAINT `return_detail_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `borrow_request` (`request_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
