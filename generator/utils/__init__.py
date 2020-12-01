import json
import random
import csv


def to_json(self) -> json:
    return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)


def split_name(self):
    full_name = self.split(" ", 1)
    first = full_name[0]
    last = full_name[1] if len(full_name) > 1 else ""  # In case there's name only 1 word
    return [first, last]


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
    with open('../data/input/course_title.csv', newline='') as file:
        data = list(csv.reader(file))
        return data


def get_random_school():
    return random.sample(['SST', 'SBM', 'EET'], 1)[0]
