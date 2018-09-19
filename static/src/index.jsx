import React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';
import App from './App.jsx'
import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:5000');

// import './index.css';


$(document).ready(()=>{
ReactDOM.render(<App socket={socket} />, 
	document.getElementById('root'));
});
