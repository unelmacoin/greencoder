/**
 * This file contains examples of various sustainability and performance issues
 * that the TypeScript analyzer can detect.
 */

// 1. Inefficient Data Fetching (New Check)
async function fetchUserData(userId: number) {
  // ❌ Inefficient: Multiple sequential fetches
  const user = await fetch(`/api/users/${userId}`);
  const posts = await fetch(`/api/posts?userId=${userId}`);
  
  // ✅ Better: Use Promise.all for parallel requests
  // const [user, posts] = await Promise.all([
  //   fetch(`/api/users/${userId}`),
  //   fetch(`/api/posts?userId=${userId}`)
  // ]);
}

// 2. Inefficient State Updates (New Check)
class UserProfile extends React.Component {
  updateProfile() {
    // ❌ Inefficient: Multiple setState calls
    this.setState({ loading: true });
    fetchUserData(1).then(() => {
      this.setState({ loading: false, data: 'some data' });
    });
    
    // ✅ Better: Batch state updates
    // this.setState({ loading: true });
    // fetchUserData(1).then((data) => {
    //   this.setState({ 
    //     loading: false, 
    //     data: data 
    //   });
    // });
  }
}

// 3. Memory Leaks in Closures
function setupEventListeners() {
  const largeData = Array(10000).fill('data');
  
  // ❌ Potential memory leak: Closure captures large object
  document.addEventListener('click', function() {
    console.log(largeData.length);
  });
  
  // ✅ Better: Process data and clean up
  // const dataLength = largeData.length;
  // document.addEventListener('click', function logLength() {
  //   console.log(dataLength);
  //   // Clean up
  //   document.removeEventListener('click', logLength);
  // });
}

// 4. Large Data Structures
function processData() {
  // ❌ Large data structure in code
  const bigData = [
    /* thousands of items */
  ];
  
  // ✅ Better: Load from external file or database
  // import { bigData } from './data/big-data';
}

// 5. Unoptimized API Calls
function fetchData() {
  // ❌ No error handling or cancellation
  fetch('/api/data')
    .then(response => response.json())
    .then(console.log);
    
  // ✅ Better: Add error handling and cleanup
  // const controller = new AbortController();
  // const timeoutId = setTimeout(() => controller.abort(), 5000);
  // 
  // fetch('/api/data', { signal: controller.signal })
  //   .then(response => response.json())
  //   .then(console.log)
  //   .catch(console.error)
  //   .finally(() => clearTimeout(timeoutId));
}

// 6. Unoptimized Image Loading
function renderImage() {
  // ❌ Basic image loading
  return `
    <img 
      src="/images/photo.jpg" 
      alt="Photo"
    >`;
    
  // ✅ Better: Responsive images with lazy loading
  // return `
  //   <img 
  //     src="/images/photo.jpg"
  //     srcSet="/images/photo-320w.jpg 320w, /images/photo-640w.jpg 640w"
  //     sizes="(max-width: 600px) 100vw, 50vw"
  //     alt="Photo"
  //     loading="lazy"
  //     decoding="async"
  //   >`;
}

// 7. Inefficient Loops
function processItems(items: any[]) {
  // ❌ Inefficient: Using for-in with arrays
  for (const index in items) {
    console.log(items[index]);
  }
  
  // ✅ Better: Use for-of or array methods
  // for (const item of items) {
  //   console.log(item);
  // }
  
  // ❌ Inefficient: Using forEach for simple iteration
  // items.forEach(item => console.log(item));
  
  // ✅ Better: Use for-of for better performance
  // for (const item of items) {
  //   console.log(item);
  // }
}

// 8. Console Logs in Production
function logUser(user: any) {
  // ❌ Console logs in production code
  console.log('User:', user);
  
  // ✅ Better: Use a proper logging library
  // logger.info('User data:', { userId: user.id });
}

// 9. Unoptimized State Management (React Hooks Example)
function UserProfileHooks() {
  // ❌ Multiple state updates
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState(null);
  
  const fetchData = async () => {
    setLoading(true);
    const result = await fetch('/api/data').then(r => r.json());
    setData(result);
    setLoading(false); // Causes extra re-render
  };
  
  // ✅ Better: Use useReducer or combine state
  // const [state, setState] = React.useState({
  //   loading: false,
  //   data: null,
  //   error: null
  // });
  
  // const fetchData = async () => {
  //   setState(prev => ({ ...prev, loading: true }));
  //   try {
  //     const result = await fetch('/api/data').then(r => r.json());
  //     setState({ loading: false, data: result, error: null });
  //   } catch (error) {
  //     setState({ loading: false, data: null, error });
  //   }
  // };
  
  return null;
}

// 10. Unoptimized Event Listeners
function setupListeners() {
  // ❌ Inline function in event listener
  document.addEventListener('scroll', () => {
    console.log('Scrolling...');
  });
  
  // ✅ Better: Use named function for cleanup
  // function handleScroll() {
  //   console.log('Scrolling...');
  // }
  // document.addEventListener('scroll', handleScroll);
  // // Cleanup:
  // return () => document.removeEventListener('scroll', handleScroll);
}
