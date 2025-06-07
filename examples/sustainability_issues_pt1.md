# Sustainability Issues in JavaScript/TypeScript and Python - Part 1

## Table of Contents
1. [Memory Management](#memory-management)
2. [CPU/Performance](#cpuperformance)
3. [Network/IO](#networkio)
4. [Energy Efficiency](#energy-efficiency)
5. [Resource Usage](#resource-usage)

## Memory Management

### 1. Memory Leaks in Event Listeners (JS/TS)
```javascript
// ❌ Bad: Event listeners not removed
window.addEventListener('scroll', handleScroll);

// ✅ Good: Remove event listeners when done
const scrollHandler = () => { /* ... */ };
window.addEventListener('scroll', scrollHandler);
// Later...
window.removeEventListener('scroll', scrollHandler);
```

### 2. Large In-Memory Caches (Python)
```python
# ❌ Bad: Unbounded cache that can grow indefinitely
cache = {}

def get_data(key):
    if key not in cache:
        cache[key] = expensive_operation(key)
    return cache[key]

# ✅ Good: Use cache with size limit
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_data(key):
    return expensive_operation(key)
```

### 3. Circular References (JS/TS)
```typescript
// ❌ Bad: Circular reference causing memory leak
class Node {
    children: Node[] = [];
    parent: Node | null = null;
    
    addChild(child: Node) {
        this.children.push(child);
        child.parent = this;  // Circular reference
    }
}

// ✅ Good: Use weak references or break cycles
class Node {
    children: Node[] = [];
    private _parent: WeakRef<Node> | null = null;
    
    set parent(node: Node | null) {
        this._parent = node ? new WeakRef(node) : null;
    }
    
    get parent(): Node | null {
        return this._parent?.deref() || null;
    }
}
```

### 4. Unclosed Resources (Python)
```python
# ❌ Bad: File not properly closed
file = open('data.txt', 'r')
data = file.read()
# If an error occurs, file might not be closed

# ✅ Good: Use context manager
with open('data.txt', 'r') as file:
    data = file.read()
```

### 5. Large Object Retention (JS/TS)
```javascript
// ❌ Bad: Large object kept in memory
const largeData = fetchLargeData();
// largeData is kept in memory even when not needed

// ✅ Good: Free memory when done
function processData() {
    const largeData = fetchLargeData();
    // Process data...
    return process(largeData);
}
// largeData can be garbage collected after function returns
```

## CPU/Performance

### 6. Inefficient Loops (JS/TS)
```typescript
// ❌ Bad: Inefficient nested loops
for (const item1 of array1) {
    for (const item2 of array2) {
        if (item1.id === item2.id) {
            // O(n*m) complexity
        }
    }
}

// ✅ Good: Use a Set for O(1) lookups
const item1Ids = new Set(array1.map(item => item.id));
for (const item2 of array2) {
    if (item1Ids.has(item2.id)) {
        // O(n+m) complexity
    }
}
```

### 7. Unoptimized String Concatenation (Python)
```python
# ❌ Bad: String concatenation in loop
result = ""
for s in large_list:
    result += s  # Creates new string each time

# ✅ Good: Use join()
result = "".join(large_list)
```

### 8. Unnecessary Re-renders (React)
```jsx
// ❌ Bad: Inline function causes re-renders
function MyComponent({ items }) {
    return (
        <div>
            {items.map(item => (
                <button onClick={() => handleClick(item.id)}>
                    {item.name}
                </button>
            ))}
        </div>
    );
}

// ✅ Good: Memoize callbacks
const MemoizedButton = React.memo(({ id, name, onClick }) => (
    <button onClick={onClick}>
        {name}
    </button>
));

function MyComponent({ items }) {
    const handleClick = useCallback((id) => {
        // Handle click
    }, []);
    
    return (
        <div>
            {items.map(item => (
                <MemoizedButton
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    onClick={() => handleClick(item.id)}
                />
            ))}
        </div>
    );
}
```

### 9. Inefficient Data Structures (Python)
```python
# ❌ Bad: Using list for membership testing
items = [1, 2, 3, 4, 5]
if 5 in items:  # O(n) lookup
    pass

# ✅ Good: Use set for O(1) lookups
items = {1, 2, 3, 4, 5}
if 5 in items:  # O(1) lookup
    pass
```

### 10. Unoptimized Database Queries (JS/TS)
```typescript
// ❌ Bad: N+1 query problem
async function getUsersWithPosts(ids: number[]) {
    const users = await User.findAll({ where: { id: ids } });
    const usersWithPosts = [];
    
    for (const user of users) {
        const posts = await Post.findAll({ where: { userId: user.id } });
        usersWithPosts.push({ ...user.toJSON(), posts });
    }
    
    return usersWithPosts;
}

// ✅ Good: Eager loading with includes
async function getUsersWithPosts(ids: number[]) {
    return await User.findAll({
        where: { id: ids },
        include: [
            { model: Post, as: 'posts' }
        ]
    });
}
```

## Network/IO

### 11. Unoptimized API Calls (JS/TS)
```typescript
// ❌ Bad: Sequential API calls
async function fetchAllData(ids: string[]) {
    const results = [];
    for (const id of ids) {
        const data = await fetch(`/api/data/${id}`).then(r => r.json());
        results.push(data);
    }
    return results;
}

// ✅ Good: Parallel API calls
async function fetchAllData(ids: string[]) {
    const promises = ids.map(id => 
        fetch(`/api/data/${id}`).then(r => r.json())
    );
    return Promise.all(promises);
}
```

### 12. Unoptimized Image Loading (HTML/JS)
```html
<!-- ❌ Bad: No optimization -->
<img src="large-image.jpg" alt="Large image">

<!-- ✅ Good: Responsive and optimized -->
<img 
    src="image-320w.jpg"
    srcset="image-320w.jpg 320w, image-640w.jpg 640w, image-1024w.jpg 1024w"
    sizes="(max-width: 600px) 100vw, 50vw"
    alt="Responsive image"
    loading="lazy"
    decoding="async">
```

### 13. Uncompressed API Responses (Backend)
```python
# ❌ Bad: No compression
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/data')
def get_data():
    data = get_large_dataset()
    return jsonify(data)  # No compression

# ✅ Good: Enable compression
from flask import Flask, jsonify
from flask_compress import Compress

app = Flask(__name__)
Compress(app)  # Enable gzip compression

@app.route('/api/data')
def get_data():
    data = get_large_dataset()
    return jsonify(data)  # Automatically compressed
```

### 14. Unoptimized File Operations (Python)
```python
# ❌ Bad: Reading entire file into memory
with open('large_file.txt', 'r') as f:
    content = f.read()  # Reads entire file into memory
    process(content)

# ✅ Good: Process line by line
with open('large_file.txt', 'r') as f:
    for line in f:  # Processes one line at a time
        process_line(line)
```

### 15. Unoptimized Database Indexing (Python/SQLAlchemy)
```python
# ❌ Bad: No index on frequently queried column
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120))  # No index
    # ...
# Slow query: db.session.query(User).filter(User.email == 'test@example.com').first()

# ✅ Good: Add index for faster lookups
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), index=True)  # Add index
    # ...
# Much faster query with index
```

## Energy Efficiency

### 16. Unoptimized Animations (JS/CSS)
```css
/* ❌ Bad: Animating expensive properties */
.animate-me {
    width: 100px;
    transition: width 0.3s ease;
}
.animate-me:hover {
    width: 200px;  /* Triggers layout recalc */
}

/* ✅ Good: Animate transform/opacity */
.animate-me {
    transform: scale(1);
    transition: transform 0.3s ease;
}
.animate-me:hover {
    transform: scale(1.2);  /* Uses GPU acceleration */
}
```

### 17. Unoptimized Web Workers (JS)
```javascript
// ❌ Bad: Heavy computation on main thread
function processLargeData(data) {
    // Blocks UI thread
    return data.map(heavyProcessing);
}

// ✅ Good: Offload to Web Worker
const worker = new Worker('worker.js');
worker.postMessage(largeData);
worker.onmessage = (e) => {
    const processedData = e.data;
    // Update UI
};
```

### 18. Unoptimized Event Handlers (JS/TS)
```typescript
// ❌ Bad: Inefficient scroll handler
window.addEventListener('scroll', () => {
    // Runs too frequently
    updateUI();
});

// ✅ Good: Throttle scroll events
import { throttle } from 'lodash';

const throttledUpdate = throttle(updateUI, 100);
window.addEventListener('scroll', throttledUpdate);
```

### 19. Unoptimized React Component Updates
```jsx
// ❌ Bad: Unnecessary re-renders
function MyComponent({ data }) {
    const processed = processData(data);
    return <div>{processed}</div>;
}

// ✅ Good: Memoize expensive calculations
import { useMemo } from 'react';

function MyComponent({ data }) {
    const processed = useMemo(() => processData(data), [data]);
    return <div>{processed}</div>;
}
```

### 20. Unoptimized Canvas Operations (JS)
```javascript
// ❌ Bad: Inefficient canvas updates
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw everything every frame
    drawBackground();
    drawSprites();
    drawUI();
    requestAnimationFrame(draw);
}

// ✅ Good: Only redraw what changed
function draw() {
    // Only clear dirty regions
    dirtyRects.forEach(rect => {
        ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
    });
    
    // Only redraw affected sprites
    dirtySprites.forEach(sprite => {
        sprite.draw(ctx);
    });
    
    requestAnimationFrame(draw);
}
```

## Resource Usage

### 21. Unoptimized Image Processing (Python)
```python
# ❌ Bad: Loads entire image into memory
from PIL import Image

def process_image(path):
    img = Image.open(path)  # Loads entire image
    # Process image...
    return img

# ✅ Good: Process in chunks for large images
def process_large_image(path, chunk_size=1024):
    with Image.open(path) as img:
        width, height = img.size
        for y in range(0, height, chunk_size):
            # Process one chunk at a time
            box = (0, y, width, min(y + chunk_size, height))
            chunk = img.crop(box)
            # Process chunk...
```

### 22. Unoptimized Database Connection Pooling (Python)
```python
# ❌ Bad: New connection for each query
def get_user(user_id):
    conn = psycopg2.connect(CONN_STRING)  # New connection each time
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
    user = cursor.fetchone()
    conn.close()
    return user

# ✅ Good: Use connection pooling
from psycopg2 import pool

connection_pool = pool.SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    **db_config
)

def get_user(user_id):
    conn = connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
            return cursor.fetchone()
    finally:
        connection_pool.putconn(conn)
```

### 23. Unoptimized File Uploads (JS/TS)
```typescript
// ❌ Bad: Load entire file into memory
async function uploadFile(file: File) {
    const data = await file.arrayBuffer();  // Loads entire file
    await fetch('/upload', {
        method: 'POST',
        body: data
    });
}

// ✅ Good: Stream large files
async function uploadLargeFile(file: File) {
    await fetch('/upload', {
        method: 'POST',
        body: file,  // Streams the file
        headers: {
            'Content-Type': file.type
        }
    });
}
```

### 24. Unoptimized Data Processing (Python)
```python
# ❌ Bad: Inefficient data processing
def process_data(items):
    result = []
    for item in items:
        if is_valid(item):
            processed = process_item(item)
            if processed:
                result.append(processed)
    return result

# ✅ Good: Use generator expressions
def process_data(items):
    return (
        process_item(item) 
        for item in items 
        if is_valid(item) and process_item(item)
    )
```

### 25. Unoptimized Browser Storage (JS)
```javascript
// ❌ Bad: Storing large objects in localStorage
const bigData = { /* large object */ };
localStorage.setItem('bigData', JSON.stringify(bigData));

// ✅ Good: Use IndexedDB for large data
async function storeLargeData(data) {
    const db = await openDB('myDB', 1, {
        upgrade(db) {
            db.createObjectStore('store');
        }
    });
    await db.put('store', data, 'bigData');
}
```
