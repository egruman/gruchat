import React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';
import App from './App.jsx'
import openSocket from 'socket.io-client';
import 'bootstrap';

$(document).ready(()=>{
fetch('/getport').then(res => res.json()).then(function (res) {
		var host='//'+document.domain+':'+res.port;
		const socket = openSocket(host);
		console.log("port:"+res.port+", domain:"+document.domain);
		ReactDOM.render(<App socket={socket} />, 
			document.getElementById('root'));
	});
});
