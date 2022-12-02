var yMax = 500;
var xMax = 500;

function generateRandomX(width) {
	return Math.floor(Math.random() * (xMax - width));
}
function generateRandomY(height) {
	return Math.floor(Math.random() * (yMax - height));
}

class Element {
	x = 0;
	y = 0;
	width = 25;
	height = 25;
	t = 0;
	destination = {
		x: 0,
		y: 0,
		dx: 0, // velocité
		dy: 0
	}
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.t = Math.random() * 1000;
	}
	verifierPosition() {
		if (this.x < this.width / 2) this.x = this.width / 2;
		if (this.y < this.height / 2) this.y = this.height / 2;
		if (this.x > xMax - this.width / 2) this.x = xMax - this.width / 2;
		if (this.y > yMax - this.height / 2) this.y = yMax - this.height / 2;
	}
	animerPosition() {
		// déplacement semi aléatoire
		this.t++;
		this.x += Math.cos(this.t * Math.PI / 64) / 10 + Math.sin(Math.sin(this.t * Math.PI / 32) / 10) * 4;
		this.y += Math.sin(this.t * Math.PI / 64) / 10 + Math.sin(Math.cos(this.t * Math.PI / 32) / 10) * 4;
		if (this.destination.x || this.destination.y) {
			var dx = this.destination.x - this.x;
			var dy = this.destination.y - this.y;
			if (Math.abs(dx) + Math.abs(dy) < 10) {
				// proche de la destination
				this.generateRandomDestination();
			}
			this.destination.dx = Math.max(-0.5, Math.min(this.destination.dx + dx / 50, 0.5));
			this.destination.dy = Math.max(-0.5, Math.min(this.destination.dx + dy / 50, 0.5));
			this.x += this.destination.dx;
			this.y += this.destination.dy;
		}
		this.verifierPosition();
	}
	generateRandomDestination() {
		this.destination.x = generateRandomX(this.width);
		this.destination.y = generateRandomY(this.height);
		return this;
	}

	deplacer(dx, dy) {
		this.x += dx;
		this.y += dy;
		this.verifierPosition();
	}
}

class Lymphocyte extends Element {
	desintegrer = 0;
	animerKonami = 0;

	constructor(x, y) {
		super(x, y);
		this.width = 50;
		this.height = 50;
	}

	dessiner() {
		// dessiner 2 cercles, un blanc et un violet

		ctx.fillStyle = '#c9d3ec';
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI);
		ctx.fill();
		ctx.fillStyle = '#7e2b91';
		ctx.beginPath();
		var offsetX = this.width / 16;
		var offsetY = this.height / 16;
		if (this.animerKonami > 0) {

			if (document.documentElement.classList.contains('dark')) {
				var edmImage = document.getElementById('edmImage');
				const facteur = 1.5;
				ctx.drawImage(edmImage, this.x - this.width / 2 * facteur, this.y - this.height / 2 * facteur, this.width * facteur, this.height * facteur);
				this.animerKonami--;
				return;
			}
			// rotate
			var angle = Math.PI * 2 * this.animerKonami / 12.5;
			this.animerKonami--;
			var cos = Math.cos(angle);
			var sin = Math.sin(angle);
			var tempX = offsetX * cos - offsetY * sin;
			var tempY = offsetX * sin + offsetY * cos;
			offsetX = tempX;
			offsetY = tempY;
		}
		ctx.arc(this.x - offsetX, this.y - offsetY, this.width * 3 / 8, 0, 2 * Math.PI);
		ctx.fill();
		ctx.globalAlpha = 1;
	}

	deplacer(dx, dy) {
		if (this.desintegrer) return;
		super.deplacer(dx, dy);
	}

	/**
	 * @param {Element} element
	 */
	testerCollision(element) {
		if (!element) return false;
		var dx = this.x - element.x;
		var dy = this.y - element.y;
		var distance = Math.sqrt(dx * dx + dy * dy);
		return distance < (this.width + element.width) / 2;
	}
}

class Virus extends Element {
	dessiner() {
		var x = this.x - this.width / 2;
		var y = this.y - this.height / 2;
		ctx.drawImage(virusImage, x, y, this.width, this.height);
	}
}

var lymphocyteJoueur = new Lymphocyte(10, 10);
/**
 * @type {Lymphocyte[]}
 */
var lymphocytes = new Array(4).fill(0).map(() => new Lymphocyte(generateRandomX(lymphocyteJoueur.width), generateRandomY(lymphocyteJoueur.height)).generateRandomDestination());
/**
 * @type {Lymphocyte[]}
 */
var lymphocytesMourants = [];
lymphocytes.push(lymphocyteJoueur);
/**
 * @type {Virus[]}
 */
var virus = [];

function spawnVirus() {
	// ajouter un virus sur un côté aléatoire
	var cote = Math.floor(Math.random() * 4);
	var x = 0;
	var y = 0;
	switch (cote) {
		case 0:
			x = generateRandomX(10);
			y = -10;
			break;
		case 1:
			x = generateRandomX(10);
			y = yMax + 10;
			break;
		case 2:
			x = -10;
			y = generateRandomY(10);
			break;
		case 3:
			x = xMax + 10;
			y = generateRandomY(10);
			break;
	}
	virus.push(new Virus(x, y).generateRandomDestination());
}

var controls = [];

/**
 * @type {HTMLImageElement}
 */
var virusImage;

/**
 * @type {CanvasRenderingContext2D}
 */
var ctx;

function redesiner() {
	ctx.clearRect(0, 0, xMax, yMax);
	for (let i = 0; i < lymphocytes.length; i++) {
		const lymphocyte = lymphocytes[i];
		lymphocyte.animerPosition();
		lymphocyte.dessiner();
		if (virus.filter(virus => lymphocyte.testerCollision(virus)).length) {
			lymphocytesMourants.push(lymphocyte);
			lymphocytes.splice(i, 1);
			i--;
			lymphocyte.desintegrer = 1;
		}
	}
	for (let i = 0; i < lymphocytesMourants.length; i++) {
		const lymphocyte = lymphocytesMourants[i];
		lymphocyte.desintegrer++;
		if (lymphocyte.desintegrer > 100) {
			lymphocytesMourants.splice(i, 1);
			i--;
			if (lymphocyteJoueur === lymphocyte) {
				window.location.replace("../fin");
			}
		} else {
			ctx.globalAlpha = 1 - lymphocyte.desintegrer / 100;
			lymphocyte.dessiner();
		}
	}
	virus.forEach(v => {
		v.animerPosition();
		v.dessiner();
	});
}

function timeoutActualiser() {
	var dx = 0;
	var dy = 0;
	var vitesse = 3;
	if (controls.includes('Shift')) vitesse *= 2;
	if (controls.includes('Control')) vitesse *= 2;
	if (controls.includes('ArrowUp')) dy -= vitesse;
	if (controls.includes('ArrowDown')) dy += vitesse;
	if (controls.includes('ArrowLeft')) dx -= vitesse;
	if (controls.includes('ArrowRight')) dx += vitesse;

	if (dx != 0 || dy != 0) {
		lymphocyteJoueur.deplacer(dx, dy);
	}
	redesiner();
}


/**
 * @param {HTMLCanvasElement} canvas
 */
function main(canvas) {
	// initialiser le canvas
	// dessiner...
	ctx = canvas.getContext('2d');
	canvas.width = xMax;
	canvas.height = yMax;
	ctx.save();
	redesiner();

}

// on load
window.addEventListener('load', () => {

	virusImage = document.querySelector('#vihImage');
	const canvas = document.querySelector('#game');
	if (canvas)
		main(canvas);

	setInterval(timeoutActualiser, 50);
	setInterval(spawnVirus, 5000);
	updateCanvasSize();
});

function updateCanvasSize() {
	const h1 = document.querySelector('h1');
	const width = window.innerWidth;
	const height = window.innerHeight - h1.offsetHeight;
	const min = Math.min(width, height) * 0.8;
	// redimensionner le canvas avec les variables --game-width et --game-height
	/**
	 * @type {HTMLDivElement}
	 */
	const game_frame = document.querySelector('#game_frame');
	if (game_frame) {
		game_frame.style.setProperty('--game-width', min + 'px');
		game_frame.style.setProperty('--game-height', min + 'px');
	}
}

window.addEventListener('resize', () => updateCanvasSize());

const keySequenceO = 'UUDDLRLRBA'
var keySequence = '';

window.addEventListener('keydown', (event) => {
	if (!controls.includes(event.key)) {
		controls.push(event.key);
		// démarrer le timer pour déplacer
	}
	if (event.key.startsWith('Arrow')) keySequence += event.key[5];
	else keySequence += event.key[0].toUpperCase();
	if (keySequence.length > keySequenceO.length) keySequence = keySequence.slice(1);
	if (keySequence === keySequenceO) {
		lymphocyteJoueur.animerKonami = 50;
	}
});

window.addEventListener('keyup', (event) => {
	// retirer la touche
	controls.splice(controls.indexOf(event.key), 1);
});