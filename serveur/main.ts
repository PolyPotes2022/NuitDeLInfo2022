import express, { Request, Response } from 'express';
import { createServer } from 'http';

import { resolve as resolvePath, dirname } from 'path';
process.env.__dirname = resolvePath(dirname(''));
const PORT = parseInt(process.env.PORT || '') || 80;

const app = express();
const server = createServer(app);

function getRawPost(req: Request): Promise<string> {
    return new Promise((res, rej) => {
        var body = "";
        req.on('data', chunk => body += chunk);
        req.on('end', () => res(body));
        req.on('close', () => rej);
        req.on('error', () => rej);
    })
}

async function getPostData(req: Request) {
    return new URLSearchParams(await getRawPost(req));
}

function sendFile(res: Response, type: string, file: string) {
    res.status(200).contentType(type).sendFile(process.env.__dirname + file);
}

// Public files
app.use('/favicon.ico', (req, res) => sendFile(res, 'image/x-icon', '/polypote.ico'));
app.use('/polypote.ico', (req, res) => sendFile(res, 'image/x-icon', '/polypote.ico'));
app.use('/main.css', (req, res) => sendFile(res, 'text/css', '/web/css/main.css'));
app.use('/404', (req, res) => sendFile(res, 'text/html', '/web/404.html'));

app.use('/', (req, res) => sendFile(res, 'text/html', '/web/index.html'));
app.use('/web/js/main.js', (req, res) => sendFile(res, 'text/js', '/web/js/main.js'));
app.use('/web/css/main.css', (req, res) => sendFile(res, 'text/css', '/web/css/main.css'));

// Not found
app.use((req, res) => {
    console.log('404 unknow request: ', { url: req.url, method: req.method });
    res.status(404).contentType('text/html').sendFile(process.env.__dirname + '/web/unknow.html');
});

server.listen(PORT);
var address = server.address();
if (typeof address !== 'string') address = `http://localhost:${address?.port}`;
console.log(`Server running on ${address}`);