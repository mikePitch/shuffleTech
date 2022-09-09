import pyfirmata
import time
# import datetime


board = pyfirmata.Arduino('/dev/cu.usbmodem14401')

it = pyfirmata.util.Iterator(board)
it.start()

switchPin = board.digital[2]

switchPin.mode = pyfirmata.INPUT
time.sleep(1)

print('ready')
shotCount = 0
while True:
    sw = switchPin.read()
    if sw is True:
        # board.digital[13].write(1)
      
      
        shotCount += 1
        print('Shot Number: ' + str(shotCount))
        # a = datetime.datetime.now()
        while True:
            sw = switchPin.read()
            if sw is False:
                
                # b = datetime.datetime.now()
                # delta = b - a
                # # print(delta.total_seconds()) #time in secounds
                # secs = (delta.total_seconds())
                # speed = (60/1000)/secs
                # # print("puck speed =", speed,"m/s")
                # print("puck speed =", speed * 3.6,"kph")
               

         

                break

    # else:
    #     board.digital[13].write(0)


# dist = speed * time
# speed = dist / time
 



