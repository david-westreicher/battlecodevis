import os
import subprocess

for file in os.listdir("./"):
    if file.endswith(".obj"):
    	outFile = file.replace(".obj",".js")
    	print(file,outFile)
    	
        subprocess.call(["python", "./convert_obj_three.py", "-i", file, "-o", outFile], shell=True)