import sys
import random
import math
import pygame
from pygame.locals import QUIT

# from main import Blue

pygame.init()
size = (1200, 300)
surf = pygame.display.set_mode((size[0], size[1]))
surf.fill((100, 100, 100))
points = []
pygame.display.set_caption('Voronoi Diagram')

BlueTurn = True

while True:
    for event in pygame.event.get():
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            posx, posy = pygame.mouse.get_pos()
            if BlueTurn:          
                points.append([[posx, posy], (0,0,255)])
                BlueTurn = False
            else:
                points.append([[posx, posy], (255,0,0)])
                BlueTurn = True
                
            pygame.draw.circle(surf, (255, 255, 255), (posx, posy), 5, 1)
            for x, y in [(x, y) for x in range(size[0]) for y in range(size[1])]:
                if surf.get_at((x, y))[:-1] != (255, 255, 255):
                    surf.set_at((x, y), min([(math.sqrt((x - i[0][0])**2 + (y - i[0][1])**2), i[1]) for i in points])[1])

        if event.type == QUIT:
            pygame.quit()
            sys.exit()
    pygame.display.update()




# https://youtu.be/g5FnaNtcCzU
# """
# What is Voronoi?

# A Voronoi diagram divides the plane into separate regions where ​
# each region contains exactly one generating point (seed) and​
# every point in a given region is closer to its seed than to any other. ​
# The regions around the edge of the cluster of points extend out to infinity. 


# """
# import sys
# print("python version is: ", sys.version)

# import numpy as np
# from scipy.spatial import Voronoi, voronoi_plot_2d
# from matplotlib import pyplot as plt

# points = np.array([[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2],
#                    [2, 0], [2, 1], [2, 2]])

# # points = np.array([[295, 3161],[231,1916],[372, 1624],[296, 3164],[169, 2229],[251, 1663]])

# plt.scatter(points[:,0], points[:,1])

# #Create voronoi object
# vor = Voronoi(points)

# #Get voronoi vertices
# vor_vertices = vor.vertices
# print("Vertices: ")
# print(vor_vertices)


# #Get voronoi regions
# vor_regions = vor.regions
# print("Regions: ")
# print(vor_regions) #Each sub-list contains the coordinates for the regions

# #Use built in function to plot
# fig = voronoi_plot_2d(vor)
# plt.show()


# def voronoi_volumes(points):
#     v = Voronoi(points)
#     vol = np.zeros(v.npoints)
#     for i, reg_num in enumerate(v.point_region):
#         indices = v.regions[reg_num]
#         if -1 in indices: # some regions can be opened
#             vol[i] = np.inf
#         else:
#             vol[i] = ConvexHull(v.vertices[indices]).volume
#     return vol