DROP TABLE IF EXISTS bathrooms CASCADE;
DROP TABLE IF EXISTS userLikes CASCADE;


CREATE TABLE bathrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL
);

CREATE TABLE userLikes (
  userId UUID NOT NULL,
  bathroomId UUID NOT NULL,
  PRIMARY KEY (userId, bathroomId),
  FOREIGN KEY (bathroomId)
    REFERENCES bathrooms(id)
    ON DELETE CASCADE
);
