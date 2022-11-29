def colorCal():
    #Set Mask Defaults

    lrh = 0
    lrs = 0
    lrv = 0
    urh = 180
    urs = 255
    urv = 255


    while True:
        ccFrame = video.get().getCvFrame() 
        ccvHSV = cv2.cvtColor(ccFrame, cv2.COLOR_BGR2HSV)


        lower_red = np.array([lrh,lrs,lrv])
        upper_red = np.array([urh,urs,urv])

        maskRed = cv2.inRange(ccvHSV, lower_red, upper_red)


        
        cv2.imshow("Mask", maskRed)
        cv2.imshow('Select_Puck_Colour', ccFrame)



        key = cv2.waitKey(1)
        if key == ord('q'):
            break

        elif key in [ord('1'), ord('2'), ord('3')]:
            if key == ord('1'): editMask = "H"
            if key == ord('2'): editMask = "S"
            if key == ord('3'): editMask = "V"
            print("Editing", editMask, "press [ or ] ")

        

        elif key in [ord('['), ord(']'), ord('-'), ord('=')]:
            editUpperRange = False
            if key in [ord('='), ord(']')]: 
                change = 1
                if key == ord('='):
                    editUpperRange = True

            if key in [ord('-'), ord('[')]: 
                change = -1
                if key == ord('-'):
                    editUpperRange = True
            


            if editMask == "H":
                if editUpperRange == False:
                    lrh = clamp(lrh + change, 0, 180)
                    print("lrh:", lrh)
                else:
                    urh = clamp(urh + change, 0, 180)
                    print("urh:", urh)
            if editMask == "S":
                lrs = clamp(lrs + change, 0, 255)
                print("lrs:", lrs)
            if editMask == "V":
                lrv = clamp(lrv + change, 0, 255)
                print("lrv:", lrv)
            
    # if esc is pressed, close all windows.
    cv2.destroyAllWindows()