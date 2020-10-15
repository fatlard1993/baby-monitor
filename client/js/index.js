// includes log dom socket-client ws-avc-player
// babel
/* global log dom socketClient WSAvcPlayer */

const babyMonitor = {
	init: function(){
		socketClient.init();

		socketClient.on('init', (data) => {
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