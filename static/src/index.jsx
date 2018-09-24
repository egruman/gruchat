import React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';
import App from './App.jsx'
import openSocket from 'socket.io-client';
import 'bootstrap';

var port=5000;

$(document).ready(()=>{
if(location.port) port=location.port;
var host='//'+document.domain+':'+port;
const socket = openSocket(host);

ReactDOM.render(<App socket={socket} />, 
	document.getElementById('root'));
});
