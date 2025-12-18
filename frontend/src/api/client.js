// Simple wrapper for fetch that adds auth headers
export const client = {
    get: async (url) => request('GET', url),
    post: async (url, body) => request('POST', url, body),
    put: async (url, body) => request('PUT', url, body),
    delete: async (url) => request('DELETE', url),
};

async function request(method, url, body) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    
    // Helper to throw if 401/403 (could trigger logout here in future)
    if (response.status === 401 || response.status === 403) {
        if (url !== '/api/auth/login') {
            console.warn('Unauthorized request, redirecting...');
            // Optional: localStorage.removeItem('token');
            // Optional: window.location.href = '/login';
        }
    }

    return response;
}
