# Donor Management System

This project is a Donor Management System that allows you to process and categorize donor information from a CSV file and retrieve it via a REST API. It uses Prisma ORM to handle database operations and Express.js to create the API endpoints.

## Features

- **Batch CSV Import**: Import and process donor data from a CSV file, categorize donors based on donation history, and save it to a database.
- **API for Donor Information**

## Prerequisites

- **Node.js** (v14 or later)
- **Prisma** ORM
- **Database**: MySQL
- **Postman** (for testing endpoints, optional)

## Setup Instructions

### 1. Install Dependencies

Install the required dependencies by running:

```bash
cd backend
npm install
```

### 2. Set Up Prisma

1. Initialize Prisma:

   ```bash
   npx prisma init
   ```
2. Create .env file under backend fold, configure the database URL for MySQL in your `.env` file

   ```prisma
   DATABASE_URL="mysql://<username>:<password>@<host>:<port>/<database_name>"
   ```
3. Create or apply change for table

   ```
   npx prisma db push
   ```

### 3. Run Batch Data Insertion

Run the data insertion script manually if needed:

```bash
node src/BatchDataInsertion.js
```

This script will fetch data from the CSV file, categorize each donor, and insert or update records in the database.

### 4. Start the Server

Start the Express.js server to access the API:

```bash
npx nodemon src/LifeCycleEndpoint.js
```

The server will be running at `http://localhost:5000`.

## API Endpoints

### 1. Get All Donors

Retrieve all donor records, ordered by `lastGiftDate` in descending order.

- **URL**: `GET /donors`
- **Response**: JSON array of donor records.

### 2. Get Donors by Lifecycle Stage

Retrieve donor records filtered by `lifecycleStage`, ordered by `lastGiftDate` in descending order.

- **URL**: `GET /donors?lifecycleStage=<stage>`
- **Parameters**:
  - `lifecycleStage` (optional): Filter results by lifecycle stage (`New`, `Active`, `At-Risk`, or `Lapsed`).
- **Response**: JSON array of filtered donor records.

### Example Requests with Postman

1. **Get All Donors**:

   - URL: `http://localhost:5000/donors`
   - Method: `GET`
2. **Get Donors by Lifecycle Stage**:

   - URL: `http://localhost:5000/donors?lifecycleStage=Active`
   - Method: `GET`
   - Query Parameter: `lifecycleStage=Active`

## Lifecycle Stage Categorization Logic

Donors are categorized based on `lastGiftDate` as follows:

- **New**: Donated within the last 6 months.
- **Active**: Donated within the last 48 months.
- **At-Risk**: Donated within the last 120 months.
- **Lapsed**: Donated more than 120 months ago.

## Additional Notes

- **Error Handling**: Both the data insertion script and API have basic error handling to log issues encountered during processing or fetching.
- **Database Configurations**: Modify the `prisma/schema.prisma` file if using a database other than Mysql.
