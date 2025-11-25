-- migrations/001_create_tables.sql

CREATE TABLE accounts (
  name VARCHAR(255) PRIMARY KEY,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE debts (
  id SERIAL PRIMARY KEY,
  debtor_name VARCHAR(255) NOT NULL,
  creditor_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(debtor_name, creditor_name),
  FOREIGN KEY (debtor_name) REFERENCES accounts(name),
  FOREIGN KEY (creditor_name) REFERENCES accounts(name)
);

CREATE INDEX idx_debts_debtor ON debts(debtor_name);
CREATE INDEX idx_debts_creditor ON debts(creditor_name);