// Simple wrapper for fetch that adds auth headers
export const client = {
    get: async (url) => request('GET', url),
    post: async (url, body) => request('POST', url, body),
    put: async (url, body) => request('PUT', url, body),
    delete: async (url) => request('DELETE', url),
};

async function request(method, url, body) {
    const user = JSON.parse(localStorage.getItem('user'));
    
    const headers = {
        'Content-Type': 'application/json',
    };

    if (user) {
        headers['x-user-id'] = user.id;
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
        console.warn('Unauthorized request');
    }

    return response;
}
