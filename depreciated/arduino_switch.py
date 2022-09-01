import pyfirmata
import time


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
        board.digital[13].write(1)
        print('button pressed')
        shotCount += 1
        print('Shot Number: ' + str(shotCount))
        while True:
            sw = switchPin.read()
            if sw is False:
                break

    else:
        board.digital[13].write(0)
        
    
 



