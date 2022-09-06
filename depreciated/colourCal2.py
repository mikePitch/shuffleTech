import cv2
import numpy as np



cap = cv2.VideoCapture(1)

redLowerHue = 170
redUpperHue = 10
blueLowerHue = 100
blueUpperHue = 140


 #———————————————Puck detection start————————————————————————
while True:
    ret, frame = cap.read()
    # convert to hsv colorspace
    frameHSV = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    # find the colors within the boundaries
 


    #——————————————Red Mask————————————————


    #set the lower and upper bounds for the red hue (red hsv wraps)
    lower_red = np.array([0,120,200])
    upper_red = np.array([10,255,255])

    lower_red2 = np.array([170,120,200])
    upper_red2 = np.array([180,255,255])

    #create a mask for red colour using inRange function
    redMask2 = cv2.inRange(frameHSV, lower_red2, upper_red2)
    redMask1 = cv2.inRange(frameHSV, lower_red, upper_red)
    maskRed = redMask1 | redMask2


    # #——————————————Blue Mask————————————————     
    #set the lower and upper bounds for the blue hue (red hsv wraps)
    lower_blue = np.array([80,0,120])
    upper_blue = np.array([150,220,240])


    #create a mask for blue colour using inRange function
    maskBlue = cv2.inRange(frameHSV, lower_blue, upper_blue)


    #show Frame
    cv2.imshow("puckframe", frame)
    cv2.imshow("redMask", maskRed)
    cv2.imshow("blueMask", maskBlue)

    key = cv2.waitKey()
    if key == 32:
        print("redLowerHue = ",redLowerHue)
        redLowerHue = int(input("enter new value"))
        redUpperHue = 10
        blueLowerHue = 100
        blueUpperHue = 140
    if key == 27:
        break