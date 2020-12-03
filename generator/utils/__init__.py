import json
import random
import csv


def get_random_course():
    prefix = random.sample(['COSC', 'ISYS', 'OENG', 'EEET', ], 1)[0]
    return prefix + str(random.randint(1000, 9999))


def get_random_location():
    build = str(random.randint(1, 2))
    floor = str(random.randint(1, 2))
    room = str(random.randint(1, 2))
    return 'SGS/{build}.{floor}.{room}'.format(build=build, floor=floor, room=room)


def get_random_semester():
    sem_prefix = random.sample(['A', 'B', 'C'], 1)[0]
    return str(random.randint(2018, 2020)) + sem_prefix


def get_all_course_title():
    with open('../data/course_title.csv', newline='') as file:
        data = list(csv.reader(file))
        return data


def get_random_school():
    return random.sample(['SST', 'SBM', 'SDM', 'SSC'], 1)[0]


def export_data(data, export_path):
    # convert to json
    data = json.dumps(data, default=lambda o: o.__dict__, sort_keys=True, indent=4)
    # export to json file
    f = open(export_path, "w")
    f.write(data)
    f.close()
    print('Data have been saved at:', export_path)


def get_random(array):
    return random.sample(array, 1)[0]


def get_random_number_under_5():
    return random.randint(1, 5)
