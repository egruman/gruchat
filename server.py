from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = "123"
socketio = SocketIO(app)


@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@socketio.on('connect')
def test_connect():
    print('Connected')

@socketio.on('login')
def send_back(msg):
    emit('login response', msg, broadcast=True)
    print(str(msg['username'])+' has logged in')

@socketio.on('logout')
def send_back(msg):
    emit('logout response', msg, broadcast=True)
    print(str(msg['username'])+' has logged out')

@socketio.on('welcome')
def send_back(msg): 
    emit('welcome response', msg, broadcast=True)
    print(str(msg['from'])+' has noticed '+str(msg['to']) +' has logged in')

@socketio.on('send message')
def send_back(msg): 
    emit('recieve message', msg, broadcast=True)
    print(str(msg['from'])+' sent a message to '+str(msg['to']) +'!')

if __name__ == '__main__':
    socketio.run(app)