import React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';
import App from './App.jsx';
import 'bootstrap';
import openSocket from 'socket.io-client';

$(document).ready(()=>{
	var port="";
	console.log(document.domain);
	if(document.domain=='localhost') port=":5000";
	var host='//'+document.domain+port;
	const socket = openSocket(host);
	ReactDOM.render(<App socket={socket} />, 
		document.getElementById('root'));
});
