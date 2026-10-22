USE `auracraft_db`;

ALTER TABLE `users`
    ADD COLUMN `username` VARCHAR(20) NULL,
    ADD COLUMN `reset_token` VARCHAR(100) NULL,
    ADD COLUMN `reset_token_expiry` DATETIME NULL,
    ADD COLUMN `otp_attempts` INT NOT NULL DEFAULT 0,
    ADD COLUMN `updated_at` DATETIME NULL;

UPDATE `users`
SET `username` = CONCAT('u', LPAD(`id`, 19, '0'))
WHERE `username` IS NULL OR TRIM(`username`) = '';

ALTER TABLE `users`
    MODIFY COLUMN `username` VARCHAR(20) NOT NULL,
    MODIFY COLUMN `role` VARCHAR(30) NOT NULL,
    MODIFY COLUMN `status` VARCHAR(20) NOT NULL,
    ADD CONSTRAINT `uk_users_username` UNIQUE (`username`);

CREATE TABLE `user_refresh_tokens` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `token_hash` VARCHAR(64) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_refresh_tokens_token_hash` (`token_hash`),
    KEY `idx_refresh_token_user` (`user_id`),
    CONSTRAINT `fk_refresh_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
