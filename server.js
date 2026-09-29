const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const CSV_FILE = path.join(__dirname, 'waitlist.csv');

const server = http.createServer((req, res) => {
    // Handle API request for waitlist
    if (req.method === 'POST' && req.url === '/api/waitlist') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { email, campus } = data;
                const date = new Date().toISOString();
                
                // Add header if file doesn't exist
                if (!fs.existsSync(CSV_FILE)) {
                    fs.writeFileSync(CSV_FILE, 'Email,Campus,Timestamp\n');
                }
                
                // Append row to CSV
                const row = `"${email}","${campus}","${date}"\n`;
                fs.appendFileSync(CSV_FILE, row);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // Serve static files
    // Strip query parameters for file lookup
    let cleanUrl = req.url.split('?')[0];
    let filePath = '.' + cleanUrl;
    if (filePath === './') filePath = './index.html';
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Waitlist entries will be auto-saved to ${CSV_FILE}`);
});
