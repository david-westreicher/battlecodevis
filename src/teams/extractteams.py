# save http://www.battlecode.org/contestants/teams/ to this folder 
teamLink = "http://www.battlecode.org/contestants/teams/"
f = open('Battlecode - AI Programming Competition.html', 'r')
teams = []
lineCount = 0
currentAvatar = None
for line in f:
    lineCount+=1
    if 'avatar' in line:
        currentAvatar = line[line.find("files/")+len('files/'):line.find('png')+3]
    if lineCount>2 and teamLink in line:
        numindex = line.find(teamLink)+len(teamLink)
        numstart = line[numindex:]
        teamNum = numstart[:numstart.find('"')]
        teamName = numstart[numstart.find('>')+1:numstart.find('<')].translate(None, '"')
        teams.append([teamNum,teamName,currentAvatar])
f.close()
for team in teams:
    print(team)

f = open('teams.js', 'w')
f.write('var teams = {};\n')
for team in teams:
    f.write('teams['+team[0]+'] = ["'+team[1]+'","'+team[2]+'"];\n')
f.close()
