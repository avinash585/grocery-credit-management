CREATE TABLE language_dictionary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    language VARCHAR(30) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'PRODUCT', 'ACTION', 'NUMBER', 'UNIT', 'SLANG'
    canonical_id VARCHAR(100) NOT NULL,
    value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE language_aliases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    language VARCHAR(30) NOT NULL,
    category VARCHAR(50) NOT NULL,
    canonical_id VARCHAR(100) NOT NULL,
    alias_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_lang_alias (language, category, canonical_id, alias_value)
);

CREATE TABLE shop_aliases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'CUSTOMER', 'PRODUCT'
    canonical_id VARCHAR(100) NOT NULL,
    alias_value VARCHAR(255) NOT NULL,
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_shop_alias (shop_id, category, alias_value)
);

CREATE TABLE voice_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id VARCHAR(100),
    raw_transcript TEXT NOT NULL,
    detected_language VARCHAR(30),
    confidence_score DECIMAL(5,2),
    processed_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE speech_commands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voice_log_id INT,
    intent VARCHAR(50) NOT NULL,
    customer_name VARCHAR(100),
    product_alias VARCHAR(100),
    amount DECIMAL(10,2),
    quantity VARCHAR(50),
    unit VARCHAR(30),
    status VARCHAR(30), -- 'EXECUTED', 'PENDING_CONFIRMATION', 'REJECTED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voice_log_id) REFERENCES voice_logs(id)
);

CREATE TABLE learning_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id VARCHAR(100) NOT NULL,
    unknown_word VARCHAR(255) NOT NULL,
    mapped_canonical VARCHAR(255),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
