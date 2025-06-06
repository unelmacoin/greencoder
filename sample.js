// Example JavaScript code with some sustainability issues

// 1. Memory leak example
let globalCache = {};
function addDataToCache(key, value) {
    globalCache[key] = value;
}

// 2. Inefficient array operation
function findInArray(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            return i;
        }
    }
    return -1;
}

// 3. Network call without error handling
async function fetchData(url) {
    const response = await fetch(url);
    return await response.json();
}

// 4. Inefficient string concatenation
function buildQuery(params) {
    let query = '';
    for (const key in params) {
        query += `${key}=${params[key]}&`;
    }
    return query.slice(0, -1);
}

// 5. Unnecessary data processing
function processData(data) {
    const processed = [];
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.active) {
            processed.push({
                id: item.id,
                name: item.name,
                value: item.value * 2
            });
        }
    }
    return processed;
}

// 6. Inefficient event listener
function setupEventListeners() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Clicked');
        });
    });
}

// 7. Inefficient DOM manipulation
function updateUI(data) {
    const container = document.getElementById('container');
    if (container) {
        container.innerHTML = '';
        data.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item.name;
            container.appendChild(div);
        });
    }
}

// 8. Inefficient timer
function startTimer() {
    setInterval(() => {
        console.log('Timer tick');
    }, 1000);
}

// Example usage
const data = [
    { id: 1, name: 'Item 1', value: 10, active: true },
    { id: 2, name: 'Item 2', value: 20, active: false },
    { id: 3, name: 'Item 3', value: 30, active: true }
];

// Uncomment to test
// setupEventListeners();
// startTimer();
// updateUI(data);
