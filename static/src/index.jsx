import React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';
import App from './App.jsx';
import 'bootstrap';
import io from 'socket.io-client';

var port="";
if(document.domain=='localhost') port=":5000";
var host='//'+document.domain+port+'/chat';
const socket = io.connect(host, {secure: true, transports: ['websocket', 'polling']});

$(document).ready(()=>{
	ReactDOM.render(<App socket={socket} />, 
		document.getElementById('root'));
});
