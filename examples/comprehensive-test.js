/**
 * Comprehensive test file for TypeScript/JavaScript sustainability analyzer
 * This file contains examples of both problematic and improved code patterns
 */

// ===== 1. Inefficient Data Fetching =====

// Bad: Sequential fetches
async function fetchUserDataSequentially(userId) {
  const user = await fetch(`/api/users/${userId}`);
  const posts = await fetch(`/api/users/${userId}/posts`);
  const comments = await fetch(`/api/users/${userId}/comments`);
  return { user, posts, comments };
}

// Good: Parallel fetches
async function fetchUserDataInParallel(userId) {
  const [user, posts, comments] = await Promise.all([
    fetch(`/api/users/${userId}`),
    fetch(`/api/users/${userId}/posts`),
    fetch(`/api/users/${userId}/comments`)
  ]);
  return { user, posts, comments };
}

// ===== 2. Inefficient State Management =====

// Bad: Multiple setState calls
class UserProfile extends React.Component {
  updateUser(userData) {
    this.setState({ loading: true });
    fetch('/api/update-user', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    .then(() => {
      this.setState({ loading: false });
      this.setState({ success: true });
    });
  }
}

// Good: Batched state updates
class BetterUserProfile extends React.Component {
  updateUser(userData) {
    this.setState({ loading: true });
    fetch('/api/update-user', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    .then(() => {
      this.setState({ 
        loading: false,
        success: true 
      });
    });
  }
}

// ===== 3. Memory Management =====

// Bad: Potential memory leak with event listeners
class EventExample extends React.Component {
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }
  
  // Missing cleanup!
  // componentWillUnmount() {
  //   window.removeEventListener('resize', this.handleResize);
  // }
  
  handleResize = () => {
    console.log('Window resized');
  };
}

// ===== 4. Inefficient Loops =====

// Bad: Inefficient array operations
function processArrayBad(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > 10) {
      result.push(arr[i] * 2);
    }
  }
  return result;
}

// Good: Using array methods
function processArrayGood(arr) {
  return arr
    .filter(item => item > 10)
    .map(item => item * 2);
}

// ===== 5. Network Request Optimization =====

// Bad: No request caching
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

// Good: With caching
const userCache = new Map();
async function fetchUserDataCached(userId) {
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();
  userCache.set(userId, data);
  return data;
}

// ===== 6. Large Data Handling =====

// Bad: Loading large data synchronously
function processLargeData() {
  const largeData = [/* 100,000 items */];
  return largeData.filter(item => item.isActive);
}

// Good: Process in chunks
async function processLargeDataInChunks() {
  let offset = 0;
  const chunkSize = 1000;
  let hasMore = true;
  const results = [];
  
  while (hasMore) {
    const chunk = await fetchChunk(offset, chunkSize);
    if (chunk.length === 0) {
      hasMore = false;
    } else {
      results.push(...chunk.filter(item => item.isActive));
      offset += chunkSize;
    }
  }
  
  return results;
}

// ===== 7. Unnecessary Re-renders =====

// Bad: Inline function in render
function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <UserItem 
          key={user.id} 
          onClick={() => handleClick(user.id)} 
          {...user} 
        />
      ))}
    </div>
  );
}

// Good: Memoized handler
const UserList = React.memo(function UserList({ users, onUserClick }) {
  return (
    <div>
      {users.map(user => (
        <UserItem 
          key={user.id} 
          onClick={onUserClick} 
          userId={user.id}
          {...user} 
        />
      ))}
    </div>
  );
});

// ===== 8. Error Handling =====

// Bad: No error handling
async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}

// Good: With proper error handling
async function fetchDataSafely(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error; // Re-throw or handle appropriately
  }
}

// ===== 9. Performance Optimization =====

// Bad: Inefficient component updates
class Counter extends React.Component {
  state = { count: 0 };
  
  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };
  
  // This will cause unnecessary re-renders
  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
        <ExpensiveComponent data={largeDataSet} />
      </div>
    );
  }
}

// Good: Optimized with React.memo and useCallback
const Counter = () => {
  const [count, setCount] = React.useState(0);
  const increment = React.useCallback(() => setCount(c => c + 1), []);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <MemoizedExpensiveComponent data={largeDataSet} />
    </div>
  );
};

const MemoizedExpensiveComponent = React.memo(ExpensiveComponent);

// ===== 10. Code Splitting =====

// Bad: Large bundle with everything included
import { HeavyComponent } from './HeavyComponent';

// Good: Dynamic imports for code splitting
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </React.Suspense>
  );
}

// ===== 11. Memory Leaks =====

// Bad: Potential memory leak with subscriptions
class DataFetcher extends React.Component {
  _isMounted = false;
  
  componentDidMount() {
    this._isMounted = true;
    this.fetchData();
  }
  
  componentWillUnmount() {
    this._isMounted = false;
  }
  
  async fetchData() {
    const data = await fetchData();
    if (this._isMounted) {  // Check if component is still mounted
      this.setState({ data });
    }
  }
  
  // ...
}

// ===== 12. DOM Manipulation =====

// Bad: Direct DOM manipulation in React
function BadButton() {
  const handleClick = () => {
    // Direct DOM manipulation is an anti-pattern in React
    document.getElementById('myButton').style.backgroundColor = 'red';
  };
  
  return <button id="myButton" onClick={handleClick}>Click Me</button>;
}

// Good: Using React's state
function GoodButton() {
  const [isActive, setIsActive] = React.useState(false);
  
  return (
    <button 
      style={{ backgroundColor: isActive ? 'red' : '' }}
      onClick={() => setIsActive(!isActive)}
    >
      Click Me
    </button>
  );
}

// ===== 13. Unnecessary Re-renders with Context =====

// Bad: Context causing unnecessary re-renders
const MyContext = React.createContext();

function App() {
  const [state, setState] = React.useState({ /* large state object */ });
  
  return (
    <MyContext.Provider value={state}>
      <ChildComponent />
    </MyContext.Provider>
  );
}

// Good: Memoized context value
function BetterApp() {
  const [state, setState] = React.useState({ /* large state object */ });
  const contextValue = React.useMemo(() => ({
    // Only include what consumers need
    value: state.value,
    updateValue: (newValue) => setState(prev => ({ ...prev, value: newValue }))
  }), [state.value]);
  
  return (
    <MyContext.Provider value={contextValue}>
      <ChildComponent />
    </MyContext.Provider>
  );
}

// ===== 14. Event Handling =====

// Bad: Inline arrow functions in JSX
function BadForm() {
  return (
    <form>
      <input type="text" onChange={(e) => handleChange(e)} />
      <button onClick={() => handleSubmit()}>Submit</button>
    </form>
  );
}

// Good: Memoized handlers
function GoodForm() {
  const handleChange = React.useCallback((e) => {
    // Handle change
  }, []);
  
  const handleSubmit = React.useCallback(() => {
    // Handle submit
  }, []);
  
  return (
    <form>
      <input type="text" onChange={handleChange} />
      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
}

// ===== 15. Large Component Trees =====

// Bad: Large component with many responsibilities
function BigComponent({ data }) {
  // State and logic for feature A
  const [stateA, setStateA] = React.useState();
  // State and logic for feature B
  const [stateB, setStateB] = React.useState();
  // ... many more states and effects
  
  return (
    <div>
      {/* Lots of JSX */}
    </div>
  );
}

// Good: Split into smaller components
function FeatureA() {
  const [state, setState] = React.useState();
  // Feature A logic
  return <div>Feature A</div>;
}

function FeatureB() {
  const [state, setState] = React.useState();
  // Feature B logic
  return <div>Feature B</div>;
}

function BetterComponent() {
  return (
    <div>
      <FeatureA />
      <FeatureB />
    </div>
  );
}
