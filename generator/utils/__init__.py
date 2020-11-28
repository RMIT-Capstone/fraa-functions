import json


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
