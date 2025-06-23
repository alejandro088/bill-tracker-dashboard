-- Create a table for account transfers
CREATE TABLE Transfer (
    id SERIAL PRIMARY KEY,
    from_account_id INT NOT NULL,
    to_account_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    description TEXT,
    transfer_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES Accounts(id),
    FOREIGN KEY (to_account_id) REFERENCES Accounts(id)
);
