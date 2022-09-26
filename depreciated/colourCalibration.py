#imports
import cv2
import numpy as np

#get frame


#select points to get hsv value




#select highest and lowest values

#run again for new frame

#add any buffers

#save values



def clickPoint(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONUP :  # checks mouse click
        colorsHSV = image[y, x]
       
        print("HSV Value at ({},{}):{} ".format(x,y,colorsHSV))
        print(colorsHSV)
# Read an image
colourCalVid = cv2.VideoCapture(0)
ret, ccFrame = colourCalVid.read()



# image = cv2.imread("hanif.jpg")
# Create a window and set Mousecallback to a function for that window
cv2.namedWindow('Select_Puck_Colour')
cv2.setMouseCallback('Select_Puck_Colour', clickPoint)

while (True):
    ret, ccFrame = colourCalVid.read()
# Do until esc pressed
    while (True):
        cv2.imshow('Select_Puck_Colour', ccFrame)
        ccvHSV = cv2.cvtColor(ccFrame, cv2.COLOR_BGR2HSV)

        image = ccvHSV
        if cv2.waitKey(10) & 0xFF == 32:
            break

    if cv2.waitKey(10) & 0xFF == 27:
            break
# if esc is pressed, close all windows.
cv2.destroyAllWindows()
