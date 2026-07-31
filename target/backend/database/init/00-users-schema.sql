-- Users Table Schema
-- This file runs before 01-schema.sql (alphabetically)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table: users (Authentication & Authorization)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN', 'SEKRETARIAT', 'KOMITE_EVALUASI', 'MAJELIS_AKREDITASI', 'ASESOR', 'PRODI', 'UPPS', 'VALIDATOR', 'INSTITUTION', 'USER') NOT NULL DEFAULT 'PRODI',
  `tenantId` bigint(20) UNSIGNED NULL,
  `noIdentitas` varchar(100) NULL,
  `noSertifikatEdukatif` varchar(100) NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_tenant_id_fk` (`tenantId`),
  CONSTRAINT `users_tenant_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ----------------------------
-- Insert default admin user
-- Password: password123 (hashed with bcrypt, 10 rounds)
-- ----------------------------
INSERT INTO `users` (`name`, `email`, `password`, `role`, `tenantId`, `isActive`) VALUES
('Admin LAM Teknik', 'admin@lamtek.ac.id', '$2a$10$dGQpyMuHJt/ayZaMDF98QuLjLn8O6BKbmT69ZsyDVMs3QhHFNTzU6', 'ADMIN', NULL, 1),
('Test User', 'demo@test.com', '$2a$10$GUVUT4FgN7uWuGLdx1Fbp.k5HN3Epyta2q90vhc1SM.vgYWiVxL8.', 'PRODI', NULL, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

SET FOREIGN_KEY_CHECKS = 1;
