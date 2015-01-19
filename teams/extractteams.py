# save http://www.battlecode.org/contestants/teams/ to this folder 
teamLink = "http://www.battlecode.org/contestants/teams/"
f = open('Battlecode - AI Programming Competition.html', 'r')
teams = []
for line in f:
    if teamLink in line:
        numindex = line.find(teamLink)+len(teamLink)
        numstart = line[numindex:]
        teamNum = numstart[:numstart.find('"')]
        teamName = numstart[numstart.find('>')+1:numstart.find('<')]
        teams.append([teamNum,teamName])
f.close()
print(teams)

f = open('teams.js', 'w')
f.write('var teams = {};\n')
for team in teams:
    f.write('team['+team[0]+'] = "'+team[1]+'";\n')
f.close()
