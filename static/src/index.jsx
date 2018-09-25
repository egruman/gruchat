import React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';
import App from './App.jsx'
import 'bootstrap';
import openSocket from 'socket.io-client';

$(document).ready(()=>{
fetch('/getport').then(res => res.json()).then(function (res) {
		var host='http://'+document.domain+':'+res.port;
		const socket = openSocket(host);
		console.log("socket: "+socket);
		ReactDOM.render(<App socket={socket} />, 
			document.getElementById('root'));
	});
});
