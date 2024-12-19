# Unzip script

import zipfile
import os


inputRoot=input("Enter the directory of zipped files: ")
outRoot=input("Enter output file root name: ")
directory_path = f"./{inputRoot}/"


files = [f for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]


cnt = 0
for file in files:
    try:
        with zipfile.ZipFile(f"{directory_path}/{file}", 'r') as zip_ref:
                file_data=[]
                if "T_F41SCHEDULE_B1.csv" in zip_ref.namelist():
                    file_data = zip_ref.read("T_F41SCHEDULE_B1.csv")
                print(directory_path)
                new_file_path = os.path.join(directory_path, f"output/{outRoot}_{str(cnt)}.csv")
                cnt+=1

                with open(new_file_path, "wb") as new_file:
                    new_file.write(file_data)
    except:
        pass

print(files)
