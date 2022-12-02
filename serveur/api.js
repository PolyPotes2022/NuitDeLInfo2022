import express from 'express'; 

var nbRequettes = 0;
var derniersMessages = [];

/**
 * @param {express.Application} app
 */
export function registerAPI(app) {
	app.get('/api/discord-message', (req, res) => {
		if (!req.query.message) {
			res.status(400).send('Missing message');
			return;
		}

		derniersMessages.push(req.query.message);
		if(derniersMessages.length > 10)
			derniersMessages.shift();
	});

	app.get('/api', (req, res) => {
		nbRequettes++;
		// envoyer le nombre de requêtes et les derniers messages en format texte
		res.send('Nombre de requêtes: ' + nbRequettes + '<br/><br/>Derniers messages:<br/>' + derniersMessages.join('<br/>'));
  });
}