// Simple test file for TypeScript analyzer

// Test 1: Sequential fetches
async function testSequentialFetchesExample() {
  const user = await fetch('/api/user/1');
  const posts = await fetch('/api/posts/1');
}

// Test 2: Multiple setState calls
class TestStateUpdates extends React.Component {
  updateUser() {
    this.setState({ loading: true });
    this.setState({ name: 'John' });
  }
}

// Test 3: Multiple useState hooks that could be combined
function CombinedStateExample() {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  
  return null;
}
