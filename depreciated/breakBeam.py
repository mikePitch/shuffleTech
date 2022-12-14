#import things
import cv2
import numpy as np
import time



#Create an object to hold reference to camera video capturing
cap = cv2.VideoCapture(2)

#check if connection with camera is successfully
if cap.isOpened():
    ret, frame = cap.read()  #capture a frame from live video

    #check whether frame is successfully captured
    if ret:
        #print success if frame capturing was successful
        print("Success : Captured frame")

        #↓↓↓↓↓↓——————————Write Program In Below——————————↓↓↓↓↓↓

        while True:
            ret, frame = cap.read() 
            frameBW = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            roi = frame[530: 570,530: 720]
            blur = cv2.blur(roi,(1000,1000))
            average_color_row = np.average(blur, axis=0)
            average_color = np.average(average_color_row, axis=0)
            redInt = int(average_color[2])
            
            print(redInt)
            if redInt < 255:
                print("shot", redInt)
                time.sleep(0.5)



            cv2.imshow("frameBW", frameBW)
            cv2.imshow("roi", roi)
            cv2.imshow("blur", blur)
            key = cv2.waitKey(30)
            
            throwCount = 0 
            if key == 97: #key "a"
                print("a pressed")
             
                


            if key == 115: #key "s"
                #start Looking for pucks
                print("Puck detection Initiallized")
          
            if key == 100: #key "d"
                #send table corners to xano
                print("d pressed")
            
            if key == 27: #key "esc"
                break

 
         #↑↑↑↑↑↑——————————Write Program Above——————————↑↑↑↑↑↑

    #print error if frame capturing was unsuccessful
    else:
        print("Error : Failed to capture frame")

# print error if the connection with camera is unsuccessful
else:
    print("Cannot open camera")



cap.release()
cv2.destroyAllWindows()





