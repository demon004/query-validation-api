Query Validation API
This is a simple Node.js API that validates, explains, and processes SQL queries or natural language queries related to sales data.
Features
Validate SQL Queries: Checks if a given SQL query is valid.


Explain SQL Queries: Provides an explanation of a valid SQL query.


Process Natural Language Queries: Converts natural language queries into structured data.


Installation
# Clone the repository
git clone https://github.com/demon004/query-validation-api
cd query-validation-api

# Install dependencies
npm install

# Start the server
node index.js

API Usage
1. Validate SQL Query
Endpoint: POST /validate
Request:
{
  "query": "SELECT * FROM sales"
}

Response:
{
  "valid": true,
  "message": "Valid SQL query."
}

cURL Command:
curl -X POST "http://localhost:3000/validate" -H "Content-Type: application/json" -H "x-api-key: 123" -d '{"query": "SELECT * FROM sales"}'

cURL Command for Deployed API:
curl -X POST "https://query-validation-api-3.onrender.com/validate" -H "Content-Type: application/json" -H "x-api-key: 123" -d "{\"query\": \"SELECT * FROM sales\"}"

2. Explain SQL Query
Endpoint: POST /explain
Request:
{
  "query": "SELECT * FROM sales"
}

Response:
{
  "query": "SELECT * FROM sales",
  "explanation": "This query selects all columns from the specified table."
}

cURL Command:
curl -X POST "http://localhost:3000/explain" -H "Content-Type: application/json" -H "x-api-key: 123" -d '{"query": "SELECT * FROM sales"}'

3. Process Natural Language Query
Endpoint: POST /query
Request:
{
  "query": "Show total sales in North region"
}

Response:
{
  "question": "Show total sales in North region",
  "result": { "total": 50000 },
  "explanation": "Found 50 records matching your criteria",
  "pseudoSQL": "SELECT SUM(amount) FROM sales WHERE region = 'North'"
}

cURL Command:
curl -X POST "http://localhost:3000/query" -H "Content-Type: application/json" -H "x-api-key: 123" -d '{"query": "Show total sales in North region"}'

Running the Server
Start the server by running:
node index.js

Server runs on http://localhost:3000
Authentication
Each request must include an API key in the headers:
-H "x-api-key: 123"



