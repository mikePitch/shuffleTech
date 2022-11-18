import pygame

background_colour = (255,255,255)
table_colour = (202,164,116)
(width, height) = (1050, 200) #108


connection_established = False
conn, addr = None, None


puckX = 300
puckY = 300

screen = pygame.display.set_mode((width, height))
pygame.display.set_caption('Shuffles')
screen.fill(background_colour)
pygame.draw.rect(screen, table_colour, pygame.Rect(10, 10, 2250, 500))


pygame.draw.circle(screen, (255,0,0),[puckX, puckY], 30, 0)
pygame.display.flip()

smallBlue = pygame.image.load('Assets/BluePuck.png')
BigBlue = pygame.image.load('Assets/BluePuck-1.png')

screen.blit(smallBlue, (10,10))
screen.blit(BigBlue, (50,50))
pygame.display.flip()


while True:

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False



        
 
    
