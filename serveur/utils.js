import express from 'express';
import fs from 'fs';

/**
 * @param {express.Request} req
 * @return {Promise<string>}
 */
 export function getRawPost(req) {
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
export async function getPostData(req) {
    return new URLSearchParams(await getRawPost(req));
}

/**
 * @param {express.Response} res
 * @param {string} type
 * @param {string} file
 * @param {Function} next
 * @param {number} code default 200
 */
export function sendFile(res, type, file, next, code) {
    if (file.includes('..')) {
        next();
        return; // .. n'est pas autorisé
     }
    // vérifier que le fichier existe
    fs.access(process.env.__dirname + file, fs.constants.F_OK, (err) => {
        if (err) {
            next?.();
        } else {
            res.status(code || 200).contentType(type).sendFile(process.env.__dirname + file);
        }
    });
}
