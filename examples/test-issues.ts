// Test file for TypeScript analyzer checks

// 1. Test for inefficient data fetches
async function testSequentialFetches() {
  // Should trigger: Multiple sequential fetches
  const user = await fetch('/api/user/1');
  const posts = await fetch('/api/posts/1');
  
  // Should NOT trigger: Already using Promise.all
  // const [user, posts] = await Promise.all([
  //   fetch('/api/user/1'),
  //   fetch('/api/posts/1')
  // ]);
}

// 2. Test for multiple setState calls
class TestComponent extends React.Component {
  updateUser() {
    // Should trigger: Multiple setState calls
    this.setState({ loading: true });
    this.setState({ name: 'John' });
    
    // Should NOT trigger: Single setState call
    // this.setState({ 
    //   loading: true, 
    //   name: 'John' 
    // });
  }
}

// 3. Test for multiple useState setters in functional components
function TestFunctionalComponent() {
  // Should trigger: Multiple state updates in sequence
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState(null);
  
  const loadData = async () => {
    setLoading(true);
    const result = await fetch('/api/data').then(r => r.json());
    setData(result);
    setLoading(false);
  };
  
  // Should NOT trigger: Using functional update
  // const [state, setState] = React.useState({
  //   loading: false,
  //   data: null
  // });
  // 
  // const betterLoadData = async () => {
  //   setState(prev => ({ ...prev, loading: true }));
  //   const result = await fetch('/api/data').then(r => r.json());
  //   setState(prev => ({ ...prev, loading: false, data: result }));
  // };
  
  return null;
}

// 4. Test for related state that could be combined
function UserProfile() {
  // Should trigger: Multiple related state variables
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  
  // Should NOT trigger: Combined state
  // const [user, setUser] = React.useState({
  //   firstName: '',
  //   lastName: '',
  //   email: ''
  // });
  
  return null;
}

// 5. Test for .then() chains that could be parallelized
function testThenChains() {
  // Should trigger: Sequential .then() with fetch
  fetch('/api/user/1')
    .then(user => user.json())
    .then(user => {
      return fetch(`/api/posts?userId=${user.id}`);
    })
    .then(posts => {
      console.log('Posts:', posts);
    });
    
  // Should NOT trigger: Using Promise.all
  // Promise.all([
  //   fetch('/api/user/1').then(r => r.json()),
  //   fetch('/api/posts')
  // ]).then(([user, posts]) => {
  //   console.log('User and posts:', { user, posts });
  // });
}
