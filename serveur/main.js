import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

import { resolve as resolvePath, dirname } from 'path';
process.env.__dirname = resolvePath(dirname(''));
const PORT = parseInt(process.env.PORT || '') || 80;

const app = express();
const server = createServer(app);

/**
 * @param {express.Request} req
 * @return {Promise<string>}
 */
function getRawPost(req) {
    return new Promise((res, rej) => {
        var body = "";
        req.on('data', chunk => body += chunk);
        req.on('end', () => res(body));
        req.on('close', () => rej);
        req.on('error', () => rej);
    })
}

/**
 * @param {express.Request} req
 */
async function getPostData(req) {
    return new URLSearchParams(await getRawPost(req));
}

/**
 * @param {express.Response} res
 * @param {string} type
 * @param {string} file
 * @param {number} code default 200
 * @param {Function} next
 */
function sendFile(res, type, file, status, next) {
    // vérifier que le fichier existe
    fs.access(process.env.__dirname + file, fs.constants.F_OK, (err) => {
        if (err) {
            next();
        } else {
            res.status(status || 200).contentType(type).sendFile(process.env.__dirname + file);
        }
    });
}

/**
 * @param {express.Response} res
 */
function send404(res) {
    sendFile(res, 'text/html', '/web/404.html', 404);
}

// Public files
app.use('/favicon.ico', (req, res) => sendFile(res, 'image/x-icon', '/polypote.ico'));
app.use('/polypote.ico', (req, res) => sendFile(res, 'image/x-icon', '/polypote.ico'));
app.use('/main.css', (req, res) => sendFile(res, 'text/css', '/web/css/main.css'));
app.use('/404', (req, res) => send404(res));

app.use('/js/', (req, res) => sendFile(res, 'text/js', '/web/js/' + req.path));
app.use('/css/', (req, res) => sendFile(res, 'text/css', '/web/css/' + req.path));
app.use('/', (req, res, next) => {
    if (req.path == '/') {
        sendFile(res, 'text/html', '/web/index.html');
    } else {
        sendFile(res, 'text/html', '/web/' + req.path + '.html');
    }
});

// Not found
app.use((req, res) => send404(res));

server.listen(PORT);
var address = server.address();
if (typeof address !== 'string') address = `http://localhost:${address?.port}`;
console.log(`Server running on ${address}`);