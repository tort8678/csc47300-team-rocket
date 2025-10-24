
function createUser() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword || password.length < 1) {
            alert('Passwords do not match.');
            return false; // Prevent form submission
        }
        const userInfo = {
            email: document.getElementById('email').value,
            username: document.getElementById('username').value,
            emplid: document.getElementById('emplid').value,
            password: password
        };
        localStorage.setItem(document.getElementById('username').value, JSON.stringify(userInfo));
        alert('Account created successfully!');
        console.log("user created successfully")
        return true;

}

function createThread() {
    const threadInfo = {
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        content: document.getElementById('content').value,
        createdAt: new Date().toISOString()
    };
    if (threadInfo.category !== "" && threadInfo.title.length > 0 && threadInfo.content.length > 0) {
        localStorage.setItem(`thread_${Date.now()}`, JSON.stringify(threadInfo));
        alert('Thread created successfully!');
        console.log("Thread created successfully");
    } else {
        alert('Please fill in all required fields.');
    }
}

function getThreads() {
    const threads = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('thread_')) {
            const thread = JSON.parse(localStorage.getItem(key));
            threads.push(thread);
        }
    }
    threads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log(threads);
}
