import express from 'express';

var nbRequettes = 0;
var derniersMessages = [];

const themes = [
	'light',
	'dark',
];
var currentTheme = 0;
export function getTheme() {
	return themes[currentTheme];
}

function addMessage(message) {
	derniersMessages.push(message);
	if (derniersMessages.length > 10) {
		derniersMessages.shift();
	}
}

/**
 * @param {express.Application} app
 */
export function registerAPI(app) {
	app.get('/api/discord-message', (req, res) => {
		if (!req.query.message) {
			res.status(400).send('Missing message');
			return;
		}
		addMessage(req.query.message);
	});

	app.get('/api', (req, res) => {
		nbRequettes++;
		// envoyer le nombre de requêtes et les derniers messages en format texte
		res.send('Nombre de requêtes: ' + nbRequettes + '<br/><br/>Derniers messages:<br/>' + derniersMessages.join('<br/>'));
	});

	app.post('/api/changetheme', (req, res) => {
		nbRequettes++;
		// changer le thème
		currentTheme = (currentTheme + 1) % themes.length;
		const theme = themes[currentTheme];
		res.send('Changement de thème : ' + theme);
	});
}