CREATE USER 'root'@'%' IDENTIFIED BY 'L9CTENWNrrjRL9CTENWNrrjR';
GRANT ALL ON *.* TO 'root'@'%';
FLUSH PRIVILEGES;

-- 创建数据库
CREATE DATABASE game_vietnam CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 使用数据库
USE game_vietnam;

-- 导入数据（假设数据文件为init_game_vietnam.sql）
SOURCE /docker-entrypoint-initdb.d/init_game_vietnam.sql;