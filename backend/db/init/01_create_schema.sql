DROP TABLE IF EXISTS bathrooms CASCADE;
CREATE TABLE bathrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position jsonb NOT NULL,
  details TEXT
);