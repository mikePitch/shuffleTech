import time

redTeam = ['Mike', 'Blake', 'Kane']
blueTeam = ['Caf', 'Chad']

redTurn = True
shots = 0

redTick = 0
blueTick = 0

redTeamCount = len(redTeam)
blueTeamCount = len(blueTeam)

while True:
    if redTurn:
        print('Red: Its ' + redTeam[redTick] + "'s turn!")
        redTick += 1
        if redTick == redTeamCount:
            redTick = 0
        
    else: #blue turn
        print('Blue: Its ' + blueTeam[blueTick] + "'s turn!")
        blueTick += 1
        if blueTick == blueTeamCount:
            blueTick = 0
    redTurn = not redTurn
    time.sleep(1)