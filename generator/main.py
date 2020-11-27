"""
from classes import Student

s1 = Student('fname', 'lname', 'sst', 0)

print(s1.email)

from faker import Faker

for i in range(10):
    fake = Faker()
    print(fake.name())
"""

import factories


def s_client():
    student_factory = factories.StudentFactory()
    # num = input("Enter the s num: ")

    shapes = student_factory.generate_student_data(3)
    print(len(shapes))

    for shape in shapes:
        print(f"The type of object created: {type(shape)}")
        print(shape.get_detail())

s_client()