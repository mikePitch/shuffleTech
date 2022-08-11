#import the libraries
import cv2 as cv
import numpy as np

#read the image
img = cv.imread("testframe.png")

#convert the BGR image to HSV colour space
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)

#set the lower and upper bounds for the blue hue
lower_red = np.array([0,50,50])
upper_red = np.array([10,255,255])

lower_red2 = np.array([170,50,50])
upper_red2 = np.array([180,255,255])


#create a mask for blue colour using inRange function
mask1 = cv.inRange(hsv, lower_red, upper_red)
mask2 = cv.inRange(hsv, lower_red2, upper_red2)
mask = mask1 | mask2

#findWhites
lower_whites = np.array([0,0,200])
upper_whites = np.array([180,255,255])

#create a mask for blue colour using inRange function
maskWhite = cv.inRange(hsv, lower_whites, upper_whites)

#perform bitwise and on the original image arrays using the mask
res = cv.bitwise_and(img, img, mask=mask)

#create resizable windows for displaying the images
cv.namedWindow("res", cv.WINDOW_NORMAL)
cv.namedWindow("hsv", cv.WINDOW_NORMAL)
cv.namedWindow("mask", cv.WINDOW_NORMAL)
cv.namedWindow("original", cv.WINDOW_NORMAL)
cv.namedWindow("whites", cv.WINDOW_NORMAL)
#display the images
cv.imshow("mask", mask)
#cv.imshow("hsv", hsv)
#cv.imshow("res", res)
#cv.imshow("original", img)
#cv.imshow("whites", maskWhite)

if cv.waitKey(0):
    cv.destroyAllWindows()