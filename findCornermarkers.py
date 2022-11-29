import cv2


def tableCalibration(tableCorners):
    puckLocationsFile = open("tableLocation.txt","w")
    tc = '-'.join(str(v) for v in tableCorners)
    puckLocationsFile.write(tc)
    puckLocationsFile.close()

def findCornermarkers(video):
    print("Finding Table Corner Locations")
    tableCorners = [(0,0), (10,0), (0,10), (10,10)]
    frame = video.get().getCvFrame()

    frameBW = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    frameBW = cv2.bitwise_not(frameBW)
    
    #detect markers
    arucoDict = cv2.aruco.Dictionary_get(cv2.aruco.DICT_4X4_50)
    arucoParams = cv2.aruco.DetectorParameters_create()
    (corners, ids, rejected) = cv2.aruco.detectMarkers(frameBW, arucoDict, parameters=arucoParams)

    if len(corners) == 4:
        print("All " + str(len(corners)) + " markers detected")

        #Assign marker co-ordinates to correct corner

        for x in range (0,4):
            ppp = corners[x]
            pp = ppp[0]
            p = pp[0]
            pInt = (int(p[0]), int(p[1]))
            # print(pInt, ids[x])
            if ids[x] == 3:
                dim.topLeft = pInt
            elif ids[x] == 2:
                dim.topRight = pInt
            elif ids[x] == 1:
                dim.bottomLeft = pInt
            else:
                dim.bottomRight = pInt
        
        tableCorners = [dim.topLeft, dim.topRight, dim.bottomLeft, dim.bottomRight]
        tableCalibration(tableCorners)
        
    else:
        print("Found " + str(len(corners)) + " markers")
        print(ids)
        
    return tableCorners