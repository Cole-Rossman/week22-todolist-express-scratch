-- Use this file to define your SQL tables
-- The SQL in this file will be executed when you run `npm run setup-db`
DROP TABLE IF EXISTS todos CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL
);

CREATE TABLE todos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT,
    task VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    complete BOOLEAN NOT NULL DEFAULT(false),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)    
);

INSERT INTO users (
    email,
    password_hash
)
VALUES
    ('testemail@example.com', 'testing123');

INSERT INTO todos (
    task,
    description,
    complete,
    user_id
)
VALUES
    ('Clean my room', 'Make bed, vacuum floor, fold laundry', true, '1'),
    ('Wash my car', 'Go through wash, scrub moss off door, vacuum carpets', false, '1'),
    ('Do yardwork', 'Mow the lawn, trim the hedges, pressure wash the driveway', true, '1');