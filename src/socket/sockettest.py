import socket
import time

roundnumber = 0

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR,1)
s.bind(('localhost', 1337))
s.listen(1)
conn, addr = s.accept()
print 'Connected by', addr
while roundnumber<2001:
    conn.sendall(str(roundnumber))
    roundnumber+=1
    time.sleep(0.1)
print 'Connection closed'
conn.close()
s.shutdown(socket.SHUT_RDWR)
s.close()
