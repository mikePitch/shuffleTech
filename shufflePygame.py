import pygame
import socket
import sys
import threading
import re

background_colour = (255,255,255)
table_colour = (202,164,116)
(width, height) = (2270, 520)

#TCP IP Setup
tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print('Socket created')

server_address = ("192.168.243.189", 6345)
tcp_socket.bind(server_address)
print('Socket bind complete')
tcp_socket.listen(1)
print('Socket now listening')


connection_established = False
conn, addr = None, None


            

def create_thread(target):
    thread = threading.Thread(target=target)
    thread.daemon = True
    thread.start()

def waiting_for_connection():
    global connection_established, conn, addr
    conn, addr = tcp_socket.accept()
    print('Connected')
    connection_establised = True
    get_data()
    


puckX = 300
puckY = 300

screen = pygame.display.set_mode((width, height))
pygame.display.set_caption('Shuffles')
screen.fill(background_colour)
pygame.draw.rect(screen, table_colour, pygame.Rect(10, 10, 2250, 500))


pygame.draw.circle(screen, (255,0,0),[puckX, puckY], 30, 0)
pygame.display.flip()



create_thread(waiting_for_connection)

running = True

def get_data():
    try:
        while True:
                data = conn.recv(1024)
                print(data.decode('utf-8'))
     
                if not data:
                    break
    finally:
        conn.close()

while running:

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False



        
 
    
