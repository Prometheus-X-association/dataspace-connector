const http = require('http');

let receivedPayload;

const server = http.createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/received') {
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify({ receivedPayload }));
        return;
    }

    if (request.method !== 'POST' || request.url !== '/transfer') {
        response.statusCode = 404;
        response.end();
        return;
    }

    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => {
        receivedPayload = Buffer.concat(chunks).toString('utf-8');
        response.statusCode = 204;
        response.end();
    });
});

server.listen(8032);
