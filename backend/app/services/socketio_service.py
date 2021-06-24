from flask.ctx import RequestContext
from flask.signals import Namespace
from backend import app
from flask_socketio import SocketIO, emit
from backend.app import app, socketio
import time

# emit vs socketio.emit
# emit ... only Server-Client except when using broadcast=True, context aware
# socketio.emit ... broadcast to all connected clients, context unaware

# class SocketIOService():
#    def __init__(self):
#        pass
#        #self.socketio = socketio = SocketIO(app, logger=True, engineio_logger=True, cors_allowed_origins="*")

@socketio.on('connect', namespace='/socket.io') # namespace='/socket.io')
def ws_connect():
    print('#'*50, ' connected websocket: ', '#'*50)
    emit('connected', {'data': 'Connected'}, broadcast=False)#, namespace="/socket.io") # this should only emit event to connected client
    socketio.sleep(0) # when using gevent, socketio.sleep(0) after emit will release cpu and let other tasks do their work. https://github.com/miguelgrinberg/Flask-SocketIO/issues/418#issuecomment-283382281
    emitInstanceRefresh() # load instances when first connecting
    socketio.sleep(0)

@socketio.on('disconnect', namespace='/socket.io')#, namespace='/socket.io')
def disconnected():
    print('disconnected')

def emitInstanceRefresh():
    print('emitting instance refresh info')
    socketio.emit('new_instance_data', {'data': 'New Instance Data in Backend'}, broadcast=True, namespace='/socket.io') #, namespace="/socket.io")
    socketio.sleep(0)

def emitInstanceDeleted(instance_name):
    print('emitting instance delete info')
    socketio.emit('instance_deleted', {'id': instance_name}, broadcast=True, namespace='/socket.io') #, namespace="/socket.io")
    socketio.sleep(0)