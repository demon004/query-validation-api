const express = require('express');
const app = express();
app.use(express.json());

// ======================================
// Mock Database (In-Memory Storage)
// ======================================
const mockDB = {
  sales: Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    product: ['Laptop', 'Phone', 'Tablet'][i % 3],
    region: ['North', 'South', 'East', 'West'][i % 4],
    amount: Math.floor(Math.random() * 1000) + 100,
    date: new Date(2023, i % 12, (i % 28) + 1).toISOString()
  }))
};

// ======================================
// Authentication Middleware
// ======================================
const API_KEY = "123"; 

const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized. Invalid API Key." });
  }
  next();
};

// ======================================
// SQL Validation Function
// ======================================
const isValidSQL = (query) => {
  const sqlPattern = /^(SELECT|UPDATE|DELETE|INSERT)\s+.+\s+FROM\s+\w+(\s+WHERE\s+.+)?$/i;
  return sqlPattern.test(query.trim());
};

// ======================================
// Query Processing Function
// ======================================
const parseNaturalLanguage = (query) => {
  const lower = query.toLowerCase();
  const result = {
    table: 'sales',
    operation: 'SELECT',
    filters: {},
  };

  if (lower.includes('how many')) result.operation = 'COUNT';
  if (lower.includes('total')) result.operation = 'SUM';
  if (lower.includes('average')) result.operation = 'AVG';

  const regionMatch = lower.match(/in\s+([a-z\s,]+)/);
  if (regionMatch) {
    result.filters.region = regionMatch[1].split(/(?:\s+and\s+|\s+or\s+|,)/).map(r => r.trim().toLowerCase());
  }

  const productMatch = lower.match(/(laptop|phone|tablet)/);
  if (productMatch) result.filters.product = productMatch[1];

  return result;
};

// ======================================
// API Endpoints
// ======================================
app.post('/validate', authenticate, (req, res) => {
  const query = req.body.query?.trim();
  if (!query) {
    return res.status(400).json({ error: "Query is required." });
  }
  
  const valid = isValidSQL(query);
  res.json({ valid, message: valid ? "Valid SQL query." : "Invalid SQL query." });
});

app.post('/explain', authenticate, (req, res) => {
  const query = req.body.query?.trim();
  if (!query) {
    return res.status(400).json({ error: "Query is required." });
  }
  
  if (!isValidSQL(query)) {
    return res.status(400).json({ error: "Invalid SQL query. Cannot explain." });
  }

  let explanation = "This query retrieves data from the database.";
  if (/^SELECT\s+\*\s+FROM/i.test(query)) {
    explanation = "This query selects all columns from the specified table.";
  } else if (/^SELECT\s+.+\s+FROM/i.test(query)) {
    explanation = "This query selects specific columns from the specified table.";
  } else if (/^INSERT/i.test(query)) {
    explanation = "This query inserts new records into the specified table.";
  } else if (/^UPDATE/i.test(query)) {
    explanation = "This query updates existing records in the specified table.";
  } else if (/^DELETE/i.test(query)) {
    explanation = "This query deletes records from the specified table.";
  }

  res.json({ query, explanation });
});

app.post('/query', authenticate, (req, res) => {
  try {
    if (!req.body.query) {
      return res.status(400).json({
        error: "Missing query",
        example: "Try: 'Show total sales in North region last month'"
      });
    }

    const parsed = parseNaturalLanguage(req.body.query);
    let data = mockDB[parsed.table];
    let whereClauses = [];

    if (parsed.filters.region) {
      data = data.filter(item => parsed.filters.region.includes(item.region?.toLowerCase()));
      whereClauses.push(`region IN (${parsed.filters.region.map(r => `'${r}'`).join(', ')})`);
    }
    if (parsed.filters.product) {
      data = data.filter(item => item.product?.toLowerCase() === parsed.filters.product);
      whereClauses.push(`product = '${parsed.filters.product}'`);
    }

    let response;
    switch (parsed.operation) {
      case 'COUNT':
        response = { count: data.length };
        break;
      case 'SUM':
        response = { total: data.reduce((sum, item) => sum + item.amount, 0) };
        break;
      default:
        response = data.slice(0, 5);
    }

    res.json({
      question: req.body.query,
      result: response,
      explanation: `Found ${data.length} records matching your criteria`,
      pseudoSQL: `SELECT ${parsed.operation === 'SELECT' ? '*' : parsed.operation} FROM ${parsed.table}${whereClauses.length ? ' WHERE ' + whereClauses.join(' AND ') : ''}`
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", message: "Please try again later" });
  }
});

// ======================================
// Start Server
// ======================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
