import React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';
import App from './App.jsx'
import openSocket from 'socket.io-client';
import 'bootstrap';

var port=5000;
if(process.env.PORT) port=process.env.PORT;

var host='//'+document.domain+':'+port;
const socket = openSocket(host);

$(document).ready(()=>{
ReactDOM.render(<App socket={socket} />, 
	document.getElementById('root'));
});
