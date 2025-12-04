# Backend

## Initial Setup
This step can be skipped if `npm run install-backend` was run in the head directory/
```
npm install
```

## Setting Up Docker Container
Run the following command in the backend directory: 
```
docker compose up -d
```

To apply updates to the database schema or initial data, remove the old container before composing up again:
```
docker-compose down -v
```

## Running the Backend Server:
Run the following command in the backend directory:
```
npm start
```

swagger: http://localhost:3000/docs/

To run backend tests:
```
npm test
```
