import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

// var socket = io.connect('http://localhost:3001');

function load(){
	ReactDOM.render(<div>This is a test <App /></div>, document.getElementById('root'));
}

// setInterval(load, 1000);
load();
registerServiceWorker();