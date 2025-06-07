# Sustainability Issues in JavaScript/TypeScript and Python - Part 2

## Table of Contents
6. [Code Quality](#code-quality)
7. [Architecture](#architecture)
8. [Dependencies](#dependencies)
9. [Build & Deploy](#build--deploy)
10. [Monitoring & Logging](#monitoring--logging)

## Code Quality

### 26. Unhandled Promise Rejections (JS/TS)
```typescript
// ❌ Bad: Unhandled promise rejection
async function fetchData() {
    const response = await fetch('/api/data');
    return response.json();
}

// ✅ Good: Handle errors
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch data:', error);
        throw error; // Re-throw or handle appropriately
    }
}
```

### 27. Inefficient Error Logging (Python)
```python
# ❌ Bad: Logging entire stack trace for expected errors
try:
    result = process_data(data)
except ValueError as e:
    logging.exception("Failed to process data")  # Logs full traceback
    
# ✅ Good: Log specific error information
try:
    result = process_data(data)
except ValueError as e:
    logging.error(f"Invalid data format: {e}")
    raise  # Re-raise if needed
```

### 28. Memory-Intensive String Operations (JS)
```javascript
// ❌ Bad: String concatenation in loop
let result = '';
for (let i = 0; i < largeArray.length; i++) {
    result += largeArray[i];  // Creates new string each iteration
}

// ✅ Good: Use array join
const result = largeArray.join('');
```

### 29. Inefficient Data Validation (Python)
```python
# ❌ Bad: Multiple validations with separate iterations
def validate_user(user):
    errors = []
    if not user.get('name'):
        errors.append('Name is required')
    if not user.get('email'):
        errors.append('Email is required')
    if not is_valid_email(user.get('email', '')):
        errors.append('Invalid email format')
    return errors

# ✅ Good: Single validation pass
def validate_user(user):
    name = user.get('name', '').strip()
    email = user.get('email', '').strip()
    
    if not name or not email:
        return ['Name and email are required']
        
    if not is_valid_email(email):
        return ['Invalid email format']
        
    return []
```

### 30. Unoptimized Regular Expressions (JS/Python)
```javascript
// ❌ Bad: Catastrophic backtracking possible
const regex = /(a+)*$/;  // Can cause exponential time complexity

// ✅ Good: Make regex more specific and efficient
const regex = /^[a-z]+$/;  // More specific and efficient

// In Python, use re.compile() for repeated patterns
import re

# Compile once, use many times
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

def is_valid_email(email):
    return bool(EMAIL_REGEX.match(email))
```

## Architecture

### 31. Monolithic Architecture (General)
```
# ❌ Bad: Monolithic architecture
/app
  /controllers
  /models
  /views
  /services
  /utils
  /tests

# ✅ Better: Feature-based modularization
/features
  /auth
    /controllers
    /models
    /routes
    /tests
  /products
    /controllers
    /models
    /routes
    /tests
  /orders
    /controllers
    /models
    /routes
    /tests
```

### 32. Tight Coupling (Python)
```python
# ❌ Bad: Tightly coupled components
class OrderProcessor:
    def __init__(self):
        self.db = Database()  # Direct dependency
        self.logger = Logger()  # Direct dependency
    
    def process_order(self, order):
        self.logger.log(f"Processing order {order.id}")
        # Process order...
        self.db.save(order)
        self.logger.log(f"Order {order.id} processed")

# ✅ Better: Dependency injection
class OrderProcessor:
    def __init__(self, db, logger):
        self.db = db
        self.logger = logger
    
    def process_order(self, order):
        self.logger.log(f"Processing order {order.id}")
        # Process order...
        self.db.save(order)
        self.logger.log(f"Order {order.id} processed")

# Usage
db = Database()
logger = Logger()
processor = OrderProcessor(db=db, logger=logger)
```

### 33. Missing Caching Layer (Python/JS)
```python
# ❌ Bad: No caching for expensive operations
def get_user_data(user_id):
    # Always hits the database
    return db.query("SELECT * FROM users WHERE id = %s", (user_id,))

# ✅ Better: Add caching layer
from functools import lru_cache
import time

@lru_cache(maxsize=1000)
def get_user_data(user_id):
    return db.query("SELECT * FROM users WHERE id = %s", (user_id,))

# For time-based expiration
def get_user_data_with_ttl(user_id, ttl=300):
    cache_key = f"user_{user_id}"
    cached = cache.get(cache_key)
    
    if cached is not None:
        return cached
        
    data = db.query("SELECT * FROM users WHERE id = %s", (user_id,))
    cache.set(cache_key, data, ttl)
    return data
```

### 34. Inefficient API Design (REST)
```
# ❌ Bad: Multiple round trips
GET /users/123
GET /users/123/orders
GET /users/123/addresses

# ✅ Better: Include related resources
GET /users/123?include=orders,addresses

# Or use GraphQL
query {
  user(id: 123) {
    name
    email
    orders {
      id
      total
    }
    addresses {
      street
      city
    }
  }
}
```

### 35. Missing Rate Limiting (Python/JS)
```python
# ❌ Bad: No rate limiting
@app.route('/api/data')
def get_data():
    # Process and return data
    return jsonify({"data": "sensitive data"})

# ✅ Better: Add rate limiting
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/data')
@limiter.limit("10 per minute")  # More restrictive limit for sensitive endpoints
def get_data():
    return jsonify({"data": "sensitive data"})
```

## Dependencies

### 36. Outdated Dependencies (Python/JS)
```
# ❌ Bad: Outdated or vulnerable dependencies
# package.json
{
  "dependencies": {
    "express": "^4.16.4",  // Old version with known vulnerabilities
    "lodash": "^4.17.11"
  }
}

# ✅ Better: Regularly update dependencies
{
  "dependencies": {
    "express": "^4.18.2",  // Latest stable version
    "lodash": "^4.17.21"
  }
}

# Use tools like:
# - npm audit (Node.js)
# - safety check (Python)
# - Dependabot (GitHub)
# - Snyk
```

### 37. Overly Large Dependencies (JS)
```javascript
// ❌ Bad: Using moment.js for simple date formatting
import moment from 'moment';

function formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
}

// ✅ Better: Use lightweight alternatives
import { format } from 'date-fns';

function formatDate(date) {
    return format(new Date(date), 'yyyy-MM-dd');
}

// Or even better: Use native Intl API
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date(date));
}
```

### 38. Duplicate Dependencies (JS)
```
# ❌ Bad: Multiple versions of the same package
node_modules/
  /lodash
    /4.17.15
  /some-package
    /node_modules
      /lodash
        /4.17.10

# ✅ Better: Use package resolutions or dedupe
# package.json
{
  "resolutions": {
    "lodash": "^4.17.21"
  }
}

# Then run:
# npm dedupe
# or with Yarn:
# yarn dedupe
```

### 39. Unused Dependencies (Python/JS)
```
# ❌ Bad: Unused dependencies in requirements.txt
flask==2.0.1
requests==2.26.0
pandas==1.3.3  # Not actually used in the project
numpy==1.21.2  # Only used in a single script

# ✅ Better: Keep dependencies clean
# Use tools like:
# - depcheck (Node.js)
# - pip-check (Python)
# - deptry (Python)

# For Python, use requirements.in with pip-tools:
# requirements.in
flask==2.0.1
requests==2.26.0

# Then run:
# pip-compile requirements.in > requirements.txt
```

### 40. Insecure Dependencies (Python/JS)
```
# ❌ Bad: Insecure package versions
# requirements.txt
Django==2.1.0  # Has known security vulnerabilities
requests==2.20.0

# ✅ Better: Use secure versions and tools
# requirements.in
Django>=3.2.0,<3.3.0  # Latest LTS version
requests>=2.28.0

# Use tools like:
# - npm audit (Node.js)
# - safety check (Python)
# - OWASP Dependency-Check
# - Snyk

# In CI/CD pipeline:
# - npm audit --production
# - safety check
# - OWASP Dependency-Check
```

## Build & Deploy

### 41. Large Docker Images (Docker)
```dockerfile
# ❌ Bad: Large Docker image
FROM python:3.9

COPY . .
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    # ... many packages
    && rm -rf /var/lib/apt/lists/*

# ...

# ✅ Better: Use multi-stage builds and minimal base images
# Stage 1: Build
FROM python:3.9-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.9-slim
WORKDIR /app

# Copy only what's needed
COPY --from=builder /root/.local /root/.local
COPY . .

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

# Run as non-root user
RUN useradd -m myuser && chown -R myuser:myuser /app
USER myuser

CMD ["python", "app.py"]
```

### 42. Unoptimized Webpack Builds (JS)
```javascript
// ❌ Bad: Unoptimized webpack.config.js
module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

// ✅ Better: Optimized webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: 'single',
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
  ],
};
```

### 43. Inefficient CI/CD Pipelines
```yaml
# ❌ Bad: Inefficient CI pipeline
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Build
      run: npm run build
    - name: Deploy
      run: npm run deploy

# ✅ Better: Optimized CI pipeline
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Cache node modules
      uses: actions/cache@v2
      with:
        path: ~/.npm
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
        restore-keys: |
          ${{ runner.os }}-node-
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci --prefer-offline
    - name: Run tests
      run: npm test
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'
    - name: Install dependencies
      run: npm ci --only=production
    - name: Build
      run: npm run build
    - name: Upload artifact
      uses: actions/upload-artifact@v2
      with:
        name: build
        path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Download artifact
      uses: actions/download-artifact@v2
      with:
        name: build
    - name: Deploy
      run: npm run deploy
```

### 44. Missing Environment Configuration
```python
# ❌ Bad: Hardcoded configuration
DATABASE_URL = 'postgres://user:password@localhost:5432/mydb'
DEBUG = True
SECRET_KEY = 'insecure-secret-key'

# ✅ Better: Use environment variables
import os
from dotenv import load_dotenv

load_dotenv()  # Load .env file

DATABASE_URL = os.getenv('DATABASE_URL', 'postgres://localhost:5432/mydb')
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
SECRET_KEY = os.getenv('SECRET_KEY')

if not SECRET_KEY:
    raise ValueError('SECRET_KEY environment variable is required')
```

### 45. Unoptimized Docker Compose
```yaml
# ❌ Bad: Unoptimized docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_APP=app.py
      - FLASK_ENV=development
    volumes:
      - .:/code
    command: flask run --host=0.0.0.0
    depends_on:
      - db
  db:
    image: postgres:13
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

# ✅ Better: Optimized docker-compose.yml
version: '3.8'

x-shared-environment: &shared-environment
  # Common environment variables
  - PYTHONUNBUFFERED=1
  - PYTHONDONTWRITEBYTECODE=1

services:
  web:
    build:
      context: .
      target: development  # Multi-stage build target
      cache_from:  # Cache build layers
        - myapp_web
    ports:
      - "5000:5000"
    environment:
      <<: *shared-environment
      - FLASK_APP=app.py
      - FLASK_ENV=development
```

## Monitoring & Logging

### 46. Excessive Logging
```python
# ❌ Bad: Logging too much data
def process_data(data):
    logger.debug(f"Processing data: {data}")  # Could be huge!
    # ...

# ✅ Better: Log only what's necessary
def process_data(data):
    logger.debug("Processing data with length: %d", len(data))
    if len(data) > 1000:
        logger.debug("First 100 chars: %s", str(data)[:100])
    # ...
```

### 47. Missing Performance Monitoring
```javascript
// ❌ Bad: No performance monitoring
app.get('/api/data', async (req, res) => {
    const data = await fetchData();
    res.json(data);
});

// ✅ Better: Add monitoring
const promBundle = require('express-prom-bundle');
const metricsMiddleware = promBundle({ includeMethod: true });

app.use(metricsMiddleware);

// Or with custom metrics
const responseHistogram = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
});

app.use((req, res, next) => {
    const end = responseHistogram.startTimer();
    res.on('finish', () => {
        end({ 
            method: req.method, 
            route: req.route?.path || req.path,
            status_code: res.statusCode 
        });
    });
    next();
});
```

### 48. Unstructured Logs
```python
# ❌ Bad: Unstructured logs
print(f"Error processing user {user_id}: {error}")

# ✅ Better: Structured logging
import json
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)

logger = logging.getLogger(__name__)

try:
    process_user(user_id)
except Exception as e:
    logger.error(
        "Error processing user",
        extra={
            'user_id': user_id,
            'error': str(e),
            'stack_trace': traceback.format_exc()
        }
    )
```

### 49. Missing Error Tracking
```javascript
// ❌ Bad: Errors not properly tracked
try {
    riskyOperation();
} catch (error) {
    console.error('An error occurred:', error);
}

// ✅ Better: Use error tracking
import * as Sentry from '@sentry/node';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
});

try {
    riskyOperation();
} catch (error) {
    Sentry.captureException(error);
    // Optionally re-throw if needed
    throw error;
}
```

### 50. Inefficient Log Rotation
```
# ❌ Bad: No log rotation
# Logs grow indefinitely

# ✅ Better: Use log rotation
# In Python
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler(
    'app.log',
    maxBytes=5*1024*1024,  # 5MB
    backupCount=5
)

# Or use system logrotate
# /etc/logrotate.d/myapp
/var/log/myapp/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload myapp
    endscript
}
```
