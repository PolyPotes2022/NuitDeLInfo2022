import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
dotenv.config();

import { resolve as resolvePath, dirname } from 'path';
import { getTheme, registerAPI } from './api.js';
import { sendFile } from './utils.js';
process.env.__dirname = resolvePath(dirname(''));
const PORT = parseInt(process.env.PORT || '') || 80;

const app = express();
const server = createServer(app);

/**
 * @param {express.Response} res
 */
function send404(res) {
    sendFile(res, 'text/html', '/web/404.html', null, 404);
}

// Public files
app.use('/favicon.ico', (req, res, next) => sendFile(res, 'image/x-icon', '/favicon.ico', next));
app.use('/polypote.ico', (req, res, next) => sendFile(res, 'image/x-icon', '/polypote.ico', next));
app.use('/main.css', (req, res, next) => sendFile(res, 'text/css', '/web/css/main.css', next));
app.use('/404', (req, res) => send404(res));
app.use('/theme_custom.css', (req, res, next) => {
    switch (getTheme()) {
        case 'dark':
            sendFile(res, 'text/css', '/web/css/theme_dark.css', next);
            break;
        default:
            sendFile(res, 'text/css', '/web/css/main.css', next);
            break;
    }
});
app.use('/theme.js', (req, res, next) => {
    switch (getTheme()) {
        case 'dark':
            res.send('document.documentElement.classList.add("dark");');
            break;
        default:
            res.send('');
            break;
    }
});

registerAPI(app);

app.use('/js/', (req, res, next) => sendFile(res, 'text/js', '/web/js/' + req.path, next));
app.use('/css/', (req, res, next) => sendFile(res, 'text/css', '/web/css/' + req.path, next));
app.use('/images/', (req, res, next) => sendFile(res, 'text/css', '/web/images/' + req.path, next));
app.use('/ts/scripts/', (req, res, next) => sendFile(res, 'text/js', '/web/ts/scripts/' + req.path, next));
app.use('/ts/styles/', (req, res, next) => sendFile(res, 'text/css', '/web/ts/styles/' + req.path, next));
app.use('/ts/images/', (req, res, next) => sendFile(res, 'text/css', '/web/ts/images/' + req.path, next));
app.use('/ts/', (req, res, next) => sendFile(res, 'text/html', '/web/ts/ts.html', next));
app.use('/', (req, res, next) => {
    if (req.path == '/') {
        sendFile(res, 'text/html', '/web/index.html', next);
    } else {
        sendFile(res, 'text/html', '/web/' + req.path + '.html', () => {
            const nom = req.path.split('/').pop();
            sendFile(res, 'text/html', '/web/' + req.path + '/' + nom + '.html', next);
        });
    }
});

// Not found
app.use((req, res) => send404(res));

server.listen(PORT);
var address = server.address();
if (typeof address !== 'string') address = `http://localhost:${address?.port}`;
console.log(`Server running on ${address}`);