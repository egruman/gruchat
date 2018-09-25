import React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';
import App from './App.jsx';
import 'bootstrap';
import io from 'socket.io-client';

$(document).ready(()=>{
	fetch('/getport').then(res=>res.json()).then(function(res){
		var host='//'+document.domain+res.port;
		const socket = io.connect(host, {secure: true});
		ReactDOM.render(<App socket={socket} />, 
			document.getElementById('root'));
	});
});
