
import os
from flask import Flask, render_template, request, make_response, jsonify, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)

app.debug = False
key= "123"
if ('SECRET_KEY' in os.environ):
  key = os.environ['SECRET_KEY']

app.config['SECRET_KEY'] = key
socketio = SocketIO(app)

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/getport')
def port():
    port = 5000
    if 'PORT' in os.environ:
        port = ""
    print('Domain: '+str(url_for('index'))+', Port: '+str(port))
    return make_response(jsonify({'port': port, 'domain': url_for('index')}))
    
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