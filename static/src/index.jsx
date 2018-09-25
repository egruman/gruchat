import React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';
import App from './App.jsx';
import 'bootstrap';
import io from 'socket.io-client';

$(document).ready(()=>{
	var port="";
	if(document.domain=='localhost') port=":5000";
	var host='//'+document.domain+port;
	const socket = io.connect(host, {secure: true});
	ReactDOM.render(<App socket={socket} />, 
		document.getElementById('root'));
});
