import Log from 'log';
import dom from 'dom';
import socketClient from 'socket-client';
import WSAvcPlayer from 'ws-avc-player';

const log = new Log();

const babyMonitor = {
	init: function(){
		socketClient.init();

		socketClient.on('init', (data) => {
			log()('Connected');

			this.draw(data);
		});

		this.wsAvc = new WSAvcPlayer.default({ useWorker: false });

		this.wsAvc.connect(`ws://${document.location.hostname}:3333`);
	},
	draw: function(){
		document.getElementById('videoWrapper').appendChild(this.wsAvc.AvcPlayer.canvas);
	}
};

dom.onLoad(babyMonitor.init.bind(babyMonitor));