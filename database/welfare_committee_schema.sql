-- Welfare Committee Table Schema
CREATE TABLE IF NOT EXISTS welfare_committee (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    position VARCHAR(100) NOT NULL,
    congregation VARCHAR(255) NOT NULL,
    picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_welfare_committee_email ON welfare_committee(email);
CREATE INDEX IF NOT EXISTS idx_welfare_committee_position ON welfare_committee(position);
CREATE INDEX IF NOT EXISTS idx_welfare_committee_congregation ON welfare_committee(congregation);
CREATE INDEX IF NOT EXISTS idx_welfare_committee_deleted_at ON welfare_committee(deleted_at);

-- Add comments for documentation
COMMENT ON TABLE welfare_committee IS 'Stores welfare committee member information';
COMMENT ON COLUMN welfare_committee.id IS 'Unique identifier for committee member';
COMMENT ON COLUMN welfare_committee.name IS 'Full name of committee member';
COMMENT ON COLUMN welfare_committee.email IS 'Email address (must be unique)';
COMMENT ON COLUMN welfare_committee.phone IS 'Phone number in Ghana format (+233 or 0)';
COMMENT ON COLUMN welfare_committee.position IS 'Position in the welfare committee';
COMMENT ON COLUMN welfare_committee.congregation IS 'Home congregation of the member';
COMMENT ON COLUMN welfare_committee.picture IS 'Profile picture file path or URL';
COMMENT ON COLUMN welfare_committee.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN welfare_committee.updated_at IS 'Timestamp when record was last updated';
COMMENT ON COLUMN welfare_committee.deleted_at IS 'Soft delete timestamp (NULL if not deleted)';
