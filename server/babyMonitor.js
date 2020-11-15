const path = require('path');
const childProcess = require('child_process');
const { spawn, execSync } = childProcess;

const log = new (require('log'))({ tag: 'baby-monitor' });
const SocketServer = require('websocket-server');
const AvcServer = require('ws-avc-player/lib/server');
const WebSocket = require('ws');

const babyMonitor = {
	opts: {
		camera: {
			width: 1280,
			height: 720,
			raspivid: function(){
				return [
					'-pf',
					'baseline',
					'-ih',
					'-hf',
					'-vf',
					'-t', '0',
					'-w', babyMonitor.opts.camera.width,
					'-h', babyMonitor.opts.camera.height,
					'-fps', '15',
					'-g', '30',
					'-o',
					'-'
				];
			}
		}
	},
	inactivityReboot: function(){
		setTimeout(function(){
			execSync('reboot');
		}, 60 * 1000);
	},
	init: function(opts){
		this.opts = Object.assign(this.opts, opts);

		const { app, staticServer } = require('http-server').init(opts.port, opts.rootFolder);

		this.socketServer = new SocketServer({ server: app.server });
		this.wss = new WebSocket.Server({ port: 3333 });
		this.avcServer = new AvcServer(this.wss, this.opts.camera.width, this.opts.camera.height);

		app.use('/resources', staticServer(path.join(this.opts.rootFolder, 'client/resources')));
		app.use('/fonts', staticServer(path.join(this.opts.rootFolder, 'client/fonts')));

		app.get('/home', (req, res, next) => { res.sendPage('index'); });

		this.socketServer.registerEndpoints(this.socketEndpoints);

		let streamer = null;

		const startStreamer = () => {
			log()('starting raspivid');

			streamer = spawn('raspivid', this.opts.camera.raspivid());
			streamer.on('close', (code) => {
				log()(code);
				streamer = null;
			});

			streamer.stderr.on('data', (data) => {
				log.error(`stderr: ${data}`);
			});

			this.avcServer.setVideoStream(streamer.stdout);
		};

		this.avcServer.on('client_connected', () => {
			if(!streamer) startStreamer();
		});

		this.avcServer.on('client_disconnected', () => {
			log()('avc client disconnected');

			if(this.avcServer.clients.size < 1){
				if(!streamer) return log()('raspivid not running');

				log()('stopping raspivid');

				streamer.kill('SIGTERM');

				inactivityReboot();
			}
		});
	},
	socketEndpoints: {
		client_connect: function(){
			log('Client connected');

			this.reply('init', {});
		}
	}
};

module.exports = babyMonitor;