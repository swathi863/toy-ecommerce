-- MySQL dump 10.13  Distrib 8.0.4-rc, for Win64 (x86_64)
--
-- Host: localhost    Database: stringstacks_ecommerce
-- ------------------------------------------------------
-- Server version	8.0.4-rc-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8mb4 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `cart_items` (
  `cart_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  PRIMARY KEY (`cart_id`),
  KEY `user_id_idx` (`user_id`),
  KEY `product_id_idx` (`product_id`),
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `fk_cart_items_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_id_UNIQUE` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Soft Toys'),(2,'Dolls'),(3,'Action Toys'),(4,'Electronic Toys'),(5,'Educational & Puzzle Toys');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jwt_tokens`
--

DROP TABLE IF EXISTS `jwt_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `jwt_tokens` (
  `token_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(1000) NOT NULL,
  `created_at` date NOT NULL,
  `updated_at` date NOT NULL,
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `token_id_UNIQUE` (`token_id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jwt_tokens`
--

LOCK TABLES `jwt_tokens` WRITE;
/*!40000 ALTER TABLE `jwt_tokens` DISABLE KEYS */;
INSERT INTO `jwt_tokens` VALUES (4,2,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkZXNhc3dhdGhpQGdtYWlsLmNvbSIsImlhdCI6MTc5MDA1NDg3MSwiZXhwIjoxNzkwMTQxMjcxfQ.7aGxnRZB8eg6SdBaMeIaTM6Ae1x8_8m58mioP6lBpRBUL80titPDspgD96AsjFQ1J9uXLshOiXN7oFof87XS2g','2026-09-19','2026-09-22'),(5,4,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkB0b3lsYW5kLmNvbSIsImlhdCI6MTc5MDA1NDkyOSwiZXhwIjoxNzkwMTQxMzI5fQ.iMPTSSCRCY4UpNrHkOTaGaW1JUPVNY4Rf__gXWWMeTbpAk2kJMg_9a_Y3Kb2IJS0iW-IqeduPRJBMTxq1JYhCA','2026-09-19','2026-09-22');
/*!40000 ALTER TABLE `jwt_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `order_items` (
  `order_items_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(255) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_per_unit` decimal(38,2) NOT NULL,
  `total_price` decimal(38,2) NOT NULL,
  PRIMARY KEY (`order_items_id`),
  KEY `order_id_idx` (`order_id`),
  KEY `product_id_idx` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,'ORD-C7B4B8A3',1,2,499.00,998.00),(2,'ORD-2D2591C4',5,1,899.00,899.00),(3,'ORD-E0DE67CA',3,1,649.00,649.00),(4,'ORD-E0DE67CA',7,1,499.00,499.00),(5,'ORD-ADF28478',8,2,349.00,698.00),(6,'ORD-9BB17107',2,1,599.00,599.00),(7,'ORD-9BB17107',4,1,999.00,999.00),(8,'ORD-820B0036',1,1,499.00,499.00),(9,'ORD-7C85B5F2',22,1,399.00,399.00),(10,'ORD-7C85B5F2',29,1,866.00,866.00),(11,'ORD-7C85B5F2',47,1,699.00,699.00),(12,'ORD-7C85B5F2',89,1,899.00,899.00),(13,'ORD-7C85B5F2',97,1,450.00,450.00),(14,'ORD-F523A1E7',2,1,599.00,599.00),(15,'ORD-F523A1E7',3,1,649.00,649.00),(16,'ORD-F523A1E7',5,2,899.00,1798.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `orders` (
  `order_id` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_amount` decimal(38,2) NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order_id_UNIQUE` (`order_id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('ORD-2D2591C4',2,899.00,'SUCCESS','2026-09-19 01:18:00','2026-09-19 01:18:00'),('ORD-7C85B5F2',2,3363.00,'SUCCESS','2026-09-21 23:47:29','2026-09-21 23:47:29'),('ORD-820B0036',2,549.00,'SUCCESS','2026-09-19 06:11:59','2026-09-19 06:11:59'),('ORD-9BB17107',2,1648.00,'SUCCESS','2026-09-19 05:12:32','2026-09-19 05:12:32'),('ORD-ADF28478',2,698.00,'SUCCESS','2026-09-19 03:38:55','2026-09-19 03:38:55'),('ORD-C7B4B8A3',NULL,998.00,'SUCCESS','2026-09-19 01:16:45','2026-09-19 01:16:45'),('ORD-E0DE67CA',2,1148.00,'SUCCESS','2026-09-19 03:17:23','2026-09-19 03:17:23'),('ORD-F523A1E7',2,3096.00,'SUCCESS','2026-09-21 23:58:39','2026-09-21 23:58:39');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `product_images` (
  `image_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  PRIMARY KEY (`image_id`),
  UNIQUE KEY `image_id_UNIQUE` (`image_id`),
  KEY `product_id_idx` (`product_id`),
  CONSTRAINT `product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/TeadyBear1.jpg'),(2,6,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Elephant.jpg'),(3,7,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Panda.jpg'),(4,8,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Bunny.jpg'),(5,9,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Lion.jpg'),(6,10,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Giraffe.jpg'),(7,11,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Monkey.jpg'),(8,12,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Puppy.jpg'),(9,13,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Kitten.jpg'),(10,14,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Penguin.jpg'),(11,15,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Dinosaur.jpg'),(12,16,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/unicorn.jpg'),(13,17,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Fox.jpg'),(14,18,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/koala.jpg'),(15,19,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Tiger.jpg'),(16,20,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/DEER.jpg'),(17,21,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Hippo.jpg'),(18,22,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Cow.jpg'),(19,23,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Duck.jpg'),(20,24,'https://ik.imagekit.io/StringStackSwathi/SoftToys/images/Frog.jpg'),(21,2,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Babt%20Doll.jpg'),(22,25,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Fashion.jpg'),(23,26,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Princess%20Doll.jpg'),(24,27,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Barbie%20Doll.jpg'),(25,28,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Fairy%20Doll.jpg'),(26,29,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Mermaid%20Doll.jpg'),(27,30,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Ballerina%20Doll.jpg'),(28,31,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Bridal%20Doll.jpg'),(29,32,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Doctor%20Doll.jpg'),(30,33,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/School%20Doll.jpg'),(31,34,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Ethnic%20Doll.jpg'),(32,35,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Talking%20Doll.jpg'),(33,36,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Musical%20Doll.jpg'),(34,37,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Mini%20Doll.jpg'),(35,38,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Cloth%20Doll.jpg'),(36,39,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Handmade%20Doll.jpg'),(37,40,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Doll%20Set.jpg'),(38,41,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Doll%20House%20Doll.jpg'),(39,42,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Celebrity%20Doll.jpg'),(40,43,'https://ik.imagekit.io/StringStackSwathi/Dolls/Dolls/Animal%20Doll.jpg'),(41,3,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Spider-Man.jpg'),(42,44,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Batman.jpg'),(43,45,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Superman.jpg'),(44,46,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Iron%20Man.jpg'),(45,47,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Hulk.jpg'),(46,48,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Captain%20America.jpg'),(47,49,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Thor.jpg'),(48,50,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Wonder%20Woman.jpg'),(49,51,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Black%20Panther.jpg'),(50,52,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Flash.jpg'),(51,4,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Interactive%20Robot.jpg'),(52,53,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Remote%20Control%20Car.jpg'),(53,54,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Dancing%20Robot.jpg'),(54,55,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Talking%20Robot.jpg'),(55,56,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Musical%20Keyboard.jpg'),(56,57,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Remote%20Control%20Helicopter.jpg'),(57,58,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Walking%20Robot.jpg'),(58,59,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Electronic%20Piano.jpg'),(59,60,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Light%20Up%20Spinner.jpg'),(60,61,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Smart%20Toy%20Car.jpg'),(61,5,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Building%20Blocks.jpg'),(62,62,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Number%20Puzzle.jpg'),(63,63,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Alphabet%20Puzzle.jpg'),(64,64,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Shape%20Sorter.jpg'),(65,65,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Jigsaw%20Puzzle.jpg'),(66,66,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Math%20Learning%20Board.jpg'),(67,67,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Spelling%20Game.jpg'),(68,68,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Memory%20Matching%20Game.jpg'),(69,69,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Science%20Experiment%20Kit.jpg'),(70,70,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Kids%20Puzzle%20Set.jpg'),(71,71,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Ant-Man.jpg'),(72,72,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Aquaman.jpg'),(73,73,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Green%20Lantern.jpg'),(74,74,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Deadpool.jpg'),(75,75,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Wolverine.jpg'),(76,76,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Superman%20Black%20Suit.jpg'),(77,77,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Venom.jpg'),(78,78,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Doctor%20Strange.jpg'),(79,79,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Loki.jpg'),(80,80,'https://ik.imagekit.io/StringStackSwathi/Action/Action/Star-Lord.jpg'),(81,81,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/RC%20Boat.jpg'),(82,82,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Electronic%20Drum%20Set.jpg'),(83,83,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Voice%20Recording%20Toy.jpg'),(84,84,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/LED%20Drawing%20Board.jpg'),(85,85,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/OIP.jpg'),(86,86,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Electronic%20Quiz%20Game.jpg'),(87,87,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/RC%20Stunt%20Car.jpg'),(88,88,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Light%20Up%20Guitar.jpg'),(89,89,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Electronic%20Cash%20Register.jpg'),(90,90,'https://ik.imagekit.io/StringStackSwathi/Electronic/Electronic/Musical%20Microphone.jpg'),(91,91,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Counting%20Abacus.jpg'),(92,92,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Word%20Puzzle.jpg'),(93,93,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Color%20Matching%20Game.jpg'),(94,94,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Tangram%20Puzzle.jpg'),(95,95,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Kids%20Sudoku.jpg'),(96,96,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Geography%20Puzzle.jpg'),(97,97,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Clock%20Learning%20Toy.jpg'),(98,98,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Pattern%20Puzzle.jpg'),(99,99,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Coding%20Board%20Game.jpg'),(100,100,'https://ik.imagekit.io/StringStackSwathi/Educational/Educational/Brain%20Teaser%20Set.jpg');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `price` decimal(38,2) NOT NULL,
  `stock` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `product_id_UNIQUE` (`product_id`),
  KEY `category_id_idx` (`category_id`),
  CONSTRAINT `category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Teddy Bear','Soft and cuddly teddy bear for kids',499.00,25,1,'2026-09-18 07:46:21','2026-09-18 07:46:21'),(2,'Baby Doll','Cute doll with soft clothes and accessories',599.00,15,2,'2026-09-18 07:46:21','2026-09-18 12:05:30'),(3,'Spider-Man Toy','Spider-Man character toy with detailed design',649.00,16,3,'2026-09-18 07:46:21','2026-09-18 07:46:21'),(4,'Interactive Robot','Battery-powered interactive toy robot',999.00,12,4,'2026-09-18 07:46:21','2026-09-18 07:46:21'),(5,'Building Blocks','Colorful blocks for creative building activities',899.00,25,5,'2026-09-18 07:46:21','2026-09-18 07:46:21'),(6,'Elephant','Cute and soft elephant plush toy',399.00,30,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(7,'Panda','Adorable black and white panda plush',499.00,20,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(8,'Bunny','Cute fluffy bunny with soft fur',349.00,28,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(9,'Lion','Friendly lion plush toy for children',549.00,18,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(10,'Giraffe','Soft giraffe plush toy with a long neck',599.00,15,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(11,'Monkey','Playful and cuddly monkey plush toy',399.00,22,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(12,'Puppy','Cute puppy-shaped plush toy',449.00,24,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(13,'Kitten','Adorable kitten plush toy with soft fur',399.00,26,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(14,'Penguin','Cute penguin plush toy for kids',326.00,45,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(15,'Dinosaur','Colorful dinosaur plush toy',549.00,19,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(16,'Unicorn','Colorful unicorn plush toy for children',649.00,14,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(17,'Fox','Soft orange fox plush toy',449.00,21,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(18,'Koala','Cute koala plush toy with soft fur',499.00,16,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(19,'Tiger','Soft tiger plush toy with striped design\n',599.00,13,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(20,'Deer','Cute deer plush toy with soft fabric',479.00,54,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(21,'Hippo','Friendly hippo-shaped plush toy',549.00,12,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(22,'Cow','Cute cow plush toy with soft fabric',399.00,10,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(23,'Duck','Adorable yellow duck plush toy',299.00,33,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(24,'Frog','Cute green frog plush toy for kids',349.00,12,1,'2026-09-18 10:55:17','2026-09-18 10:55:17'),(25,'Fashion Doll','Stylish fashion doll with a beautiful outfit',600.00,23,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(26,'Princess Doll','Pretty princess doll with a colorful royal dress',799.00,12,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(27,'Barbie Doll','Fashionable doll with a stylish dress and accessories',1000.00,17,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(28,'Fairy Doll','Cute fairy doll with colorful wings and dress',800.00,12,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(29,'Mermaid Doll','Beautiful mermaid doll with a colorful tail',866.00,34,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(30,'Ballerina Doll','Graceful ballerina doll wearing a dancing outfit',1299.00,23,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(31,'Bridal Doll','Elegant bridal doll wearing a traditional wedding dress',458.00,12,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(32,'Doctor Doll','Doctor doll with a coat and medical accessories',269.00,45,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(33,'School Doll','School-themed doll with a cute uniform and bag',569.00,55,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(34,'Ethnic Doll','Traditional doll wearing a colorful ethnic outfit',670.00,78,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(35,'Talking Doll','Interactive doll that plays simple sounds and phrases',456.00,12,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(36,'Musical Doll','Doll that plays music when activated',238.00,14,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(37,'Mini Doll','Small and cute doll suitable for kids',345.00,56,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(38,'Cloth Doll','Soft cloth doll made with child-friendly fabric',1233.00,34,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(39,'Handmade Doll','Beautiful handmade doll with a unique design',1500.00,45,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(40,'Doll Set','Set of dolls with different outfits and accessories',2000.00,56,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(41,'Doll House Doll','Cute doll designed for playing with doll houses',250.00,66,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(42,'Celebrity Doll','Stylish doll inspired by popular celebrity fashion',890.00,12,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(43,'Animal Doll','Cute doll designed with a fun animal theme',460.00,23,2,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(44,'Batman','Batman action figure with a classic superhero design',649.00,20,3,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(45,'Superman','Superman action figure with a strong superhero pose',699.00,18,3,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(46,'Iron Man','Iron Man action figure with detailed armor design',750.00,22,3,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(47,'Hulk','Hulk action figure with a powerful muscular design',699.00,15,3,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(48,'Captain America','Captain America action figure with shield accessory ',650.00,5,3,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(49,'Thor','Thor action figure with hammer accessory',465.00,33,3,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(50,'Wonder Woman','Wonder Woman action figure with superhero outfi',699.00,17,3,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(51,'Black Panther','Black Panther action figure with detailed suit design',699.00,15,3,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(52,'Flash','Flash action figure with a dynamic running pose',599.00,12,3,'2026-09-18 12:05:30','2026-09-18 12:05:30'),(53,'Remote Control Car','Battery-powered car with remote control and moving functions',1000.00,20,4,'2026-09-18 12:19:29','2026-09-18 12:19:29'),(54,'Dancing Robot','Electronic robot that dances and plays music',1299.00,10,4,'2026-09-18 12:19:29','2026-09-18 12:19:29'),(55,'Talking Robot','Robot toy that talks and repeats simple words',900.00,18,4,'2026-09-18 12:19:29','2026-09-18 12:19:29'),(56,'Musical Keyboard','Mini electronic keyboard with different sounds and tunes',800.00,25,4,'2026-09-18 12:19:29','2026-09-18 12:19:29'),(57,'Remote Control Helicopter','Small rechargeable helicopter controlled with a remote',1600.00,10,4,'2026-09-18 12:19:29','2026-09-18 12:19:29'),(58,'Walking Robot','Battery-powered robot that walks and makes sounds',1200.00,5,4,'2026-09-18 12:19:29','2026-09-18 12:19:29'),(59,'Electronic Piano','Colorful electronic piano with multiple sound modes',900.00,22,4,'2026-09-18 12:19:29','2026-09-18 12:19:29'),(60,'Light Up Spinner','Electronic spinner with colorful LED lights',400.00,39,4,'2026-09-18 12:19:29','2026-09-18 12:19:29'),(61,'Smart Toy Car','Interactive toy car with lights, sounds, and movement',1099.00,12,4,'2026-09-18 12:19:29','2026-09-18 12:19:29'),(62,'Number Puzzle','Educational puzzle for learning numbers and counting',400.00,30,5,'2026-09-18 12:48:16','2026-09-18 12:48:16'),(63,'Alphabet Puzzle','Fun alphabet puzzle designed to help children learn letters',350.00,28,5,'2026-09-18 12:48:16','2026-09-18 12:48:16'),(64,'Shape Sorter','Educational toy for learning different shapes and colors',499.00,22,5,'2026-09-18 12:48:16','2026-09-18 12:48:16'),(65,'Jigsaw Puzzle','Colorful jigsaw puzzle that improves problem-solving skills',450.00,20,5,'2026-09-18 12:48:16','2026-09-18 12:48:16'),(66,'Math Learning Board','Interactive board for practicing basic mathematics',600.00,9,5,'2026-09-18 12:48:16','2026-09-18 12:48:16'),(67,'Spelling Game','Educational spelling game for learning simple words',499.00,24,5,'2026-09-18 12:48:16','2026-09-18 12:48:16'),(68,'Memory Matching Game','Matching game that helps improve memory and concentration',399.00,26,5,'2026-09-18 12:48:16','2026-09-18 12:48:16'),(69,'Science Experiment Kit','Beginner-friendly kit for learning basic science concepts',899.00,12,5,'2026-09-18 12:48:16','2026-09-18 12:48:16'),(70,'Kids Puzzle Set','Collection of fun puzzles for developing logical thinking',650.00,17,5,'2026-09-18 12:48:16','2026-09-18 12:48:16'),(71,'Ant Man','Ant-Man action figure with detailed superhero suit',699.00,18,3,'2026-09-21 07:01:57','2026-09-21 07:01:57'),(72,'Aquaman','Aquaman action figure with a detailed warrior design',749.00,16,3,'2026-09-21 07:05:41','2026-09-21 07:05:41'),(73,'Green Lantern','Green Lantern action figure with superhero costume',699.00,20,3,'2026-09-21 07:13:48','2026-09-21 07:13:48'),(74,'Deadpool','Deadpool action figure with detailed combat outfit',700.00,14,3,'2026-09-21 07:14:31','2026-09-21 07:14:31'),(75,'Wolverine','Wolverine action figure with detailed claws and costume',749.00,17,3,'2026-09-21 07:15:19','2026-09-21 07:15:19'),(76,'Superman Black Suit','Superman action figure with a black suit design',799.00,12,3,'2026-09-21 07:15:54','2026-09-21 07:15:54'),(77,'Venom','Venom action figure with detailed monster design',849.00,15,3,'2026-09-21 07:16:27','2026-09-21 07:16:27'),(78,'Doctor Strange','Doctor Strange action figure with magical accessories',799.00,13,3,'2026-09-21 07:17:55','2026-09-21 07:17:55'),(79,'Loki','Loki action figure with detailed costume and accessories',550.00,12,3,'2026-09-21 07:18:41','2026-09-21 07:18:41'),(80,'Star-Lord','Star-Lord action figure with space-themed accessories',699.00,16,3,'2026-09-21 07:19:17','2026-09-21 07:19:17'),(81,'RC Boat','Remote-controlled boat with motorized movement',1499.00,14,4,'2026-09-21 07:29:32','2026-09-21 07:29:32'),(82,'Electronic Drum Set','Mini electronic drum set with different beats and sounds',9999.00,14,4,'2026-09-21 07:30:14','2026-09-21 08:07:16'),(83,'Voice Recording Toy','Electronic toy that records and plays back voices',699.00,20,4,'2026-09-21 07:31:05','2026-09-21 07:31:05'),(84,'LED Drawing Board','Electronic drawing board with colorful LED display',899.00,16,4,'2026-09-21 07:31:51','2026-09-21 07:31:51'),(85,'Talking Parrot','Interactive electronic parrot that repeats words and sounds',799.00,19,4,'2026-09-21 07:32:25','2026-09-21 07:32:25'),(86,'Electronic Quiz Game','Interactive quiz toy with questions and sound effects',749.00,22,4,'2026-09-21 07:33:16','2026-09-21 07:33:16'),(87,'RC Stunt Car','Remote-controlled car with spinning and stunt functions',1499.00,34,4,'2026-09-21 07:33:58','2026-09-21 07:33:58'),(88,'Light Up Guitar','Electronic toy guitar with music and colorful lights',849.00,17,4,'2026-09-21 07:34:48','2026-09-21 07:34:48'),(89,'Electronic Cash Register','Toy cash register with buttons, sounds, and display',899.00,15,4,'2026-09-21 07:35:25','2026-09-21 07:35:25'),(90,'Musical Microphone','Electronic microphone that plays music and amplifies voice',599.00,24,4,'2026-09-21 07:36:09','2026-09-21 07:36:09'),(91,'Counting Abacus','Colorful abacus for learning counting and basic math',299.00,30,5,'2026-09-21 07:44:57','2026-09-21 07:44:57'),(92,'Word Puzzle','Educational puzzle for building and learning new words',450.00,25,5,'2026-09-21 07:45:39','2026-09-21 07:45:39'),(93,'Color Matching Game','Fun game for learning colors and improving observation',349.00,28,5,'2026-09-21 07:46:26','2026-09-21 07:46:26'),(94,'Tangram Puzzle','Shape puzzle that develops creativity and logical thinking',399.00,22,5,'2026-09-21 07:47:05','2026-09-21 07:47:05'),(95,'Kids Sudoku','Simple number puzzle designed for children',499.00,20,5,'2026-09-21 07:47:42','2026-09-21 07:47:42'),(96,'Geography Puzzle','Map puzzle for learning countries and continents',599.00,15,5,'2026-09-21 07:48:22','2026-09-21 07:48:22'),(97,'Clock Learning Toy','Educational toy for learning time and reading a clock',450.00,34,5,'2026-09-21 07:49:11','2026-09-21 07:49:11'),(98,'Pattern Puzzle','Puzzle game for identifying and completing patterns',399.00,26,5,'2026-09-21 07:49:50','2026-09-21 07:49:50'),(99,'Coding Board Game','Beginner-friendly game for learning basic coding concepts',799.00,14,5,'2026-09-21 07:50:38','2026-09-21 07:50:38'),(100,'Brain Teaser Set','Collection of puzzles designed to improve logical thinking',699.00,18,5,'2026-09-21 08:08:58','2026-09-21 08:08:58');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','CUSTOMER') NOT NULL,
  `created_at` date NOT NULL,
  `updated_at` date NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  UNIQUE KEY `user_name_UNIQUE` (`user_name`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Desa swathi','desaswathi@gmail.com','$2a$10$iGXXjMsSRAJWgrqaRFM9A.A7NYY/eLEOVFymu8hAzG/o/Qs1OqofO','CUSTOMER','2026-09-18','2026-09-22'),(4,'Admin','admin@toyland.com','$2a$10$2lR1uuDquiu4w0Vk0.rRCuG80bPlLLhjZmQ3TpSe1s8Ls7UCwjwMS','ADMIN','2026-09-19','2026-09-19');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-22 11:37:42
