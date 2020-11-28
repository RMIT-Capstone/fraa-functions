"""
from classes import Student

s1 = Student('fname', 'lname', 'sst', 0)

print(s1.email)

from faker import Faker

for i in range(10):
    fake = Faker()
    print(fake.name())
"""

import factory
import Utils


def s_client(student_num, dest_path):
    # Generate student list
    student_factory = factory.StudentFactory()
    data = student_factory.generate_student_data(student_num)

    # Create a json file
    f = open(dest_path, "w")
    f.write(Utils.to_json(data))
    f.close()
    print('Data have been saved at:', dest_path)

    # # Print students
    # for s in data['students']:
    #     print(f"The type of object created: {type(s)}")
    #     print(s.get_detail())


s_client(3, "../data/data.json")
