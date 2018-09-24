import React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';
import App from './App.jsx'
import openSocket from 'socket.io-client';
import 'bootstrap';

console.log(location);
var port=5000;
if(location.port) port=location.port;

var host='//'+document.domain+':'+port;
const socket = openSocket(host);

$(document).ready(()=>{
ReactDOM.render(<App socket={socket} />, 
	document.getElementById('root'));
});
