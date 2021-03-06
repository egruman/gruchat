
import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)

app.debug = False
key= "123"
if ('SECRET_KEY' in os.environ):
    key = os.environ['SECRET_KEY']

app.config['SECRET_KEY'] = key
socketio = SocketIO(app)

print('Server started')

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@socketio.on('connect', namespace='/chat')
def test_connect():
    print('Connected')

@socketio.on('login', namespace='/chat')
def send_back_login(msg):
    emit('login response', msg, broadcast=True)

@socketio.on('logout', namespace='/chat')
def send_back_logout(msg):
    emit('logout response', msg, broadcast=True)

@socketio.on('welcome', namespace='/chat')
def send_back_welcome(msg): 
    emit('welcome response', msg, broadcast=True)

@socketio.on('send message', namespace='/chat')
def send_back_message(msg): 
    emit('recieve message', msg, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)