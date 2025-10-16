DELETE FROM bathrooms;

INSERT INTO bathrooms (id, data) VALUES (
  '5f1169fe-4db2-48a2-b059-f05cfe63588b',
  '{
    "name": "Namaste Lounge Bathroom",
    "position": {"lat": 37.00076576303953, "lng": -122.05719563060227},
    "details": "more details"
  }'::jsonb
);

INSERT INTO bathrooms (id, data) VALUES (
  'd924edd4-8291-4706-b472-9875319e8c18',
  '{
    "name": "E2 Second Floor Bathroom",
    "position": {"lat": 37.00089593913641, "lng": -122.06296383018844},
    "details": "more details"
  }'::jsonb
);

INSERT INTO bathrooms (id, data) VALUES (
  '6d6a6a5f-217d-4fea-9ab4-1f21ea2c1b0a',
  '{
    "name": "McDonald`s Ocean St Bathroom",
    "position": {"lat": 36.967136756404564, "lng": -122.03905636700443},
    "details": "more details"
  }'::jsonb
);