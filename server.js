const http = require('http');  // Import HTTP module
const fs = require('fs');      // Import File System module
const url = require('url');    // Import URL module

http.createServer((req, res) => {
    let q = new URL(req.url, 'http://localhost:8080'); // Parse request URL
    let filePath = '';

    // Format log entry (request URL + timestamp)
    const logEntry = `Request: ${req.url} - Timestamp: ${new Date().toISOString()}\n`;

    // Append log entry to log.txt
    fs.appendFile('log.txt', logEntry, (err) => {
        if (err) console.log('Error writing to log:', err);
    });

    // Check if the URL contains "documentation"
    if (q.pathname.includes('documentation')) {
        filePath = 'documentation.html'; // Serve documentation page
    } else {
        filePath = 'index.html'; // Serve index page by default
    }

    // Read and return the file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            res.end();
        }
    });

}).listen(8080, () => {
    console.log('Server is running at http://localhost:8080');
});
