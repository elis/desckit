var path = require('path')

module.exports = {
	descksPath: path.resolve(__dirname, '..', 'public/descks'),
	tempPath: path.resolve(__dirname, 'temp'),
	cachePath: path.resolve(__dirname, '..', 'public/cache'),
	port: 1280,
	options: {
		exportWidth: 1920,
		exportHeight: 1080
	},
	renderWriteTime: 1000,
	renderTime: 1000, /* ms */
	keys: {
		forecast: 'cbec8d61a4253bdd8756e76abf2894a1'
	}
}