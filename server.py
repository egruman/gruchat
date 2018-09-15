from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def hello_world():
    return render_template('index.html')