import json
import random

# Convert dict to json data
def to_json(self) -> json:
    return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)


# Check valid student
def validator():
    print("Checking the validity of student")


# Get full name and split to first and last name
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