from faker import Faker
from classes import Student
import datetime


class StudentFactory:
    @staticmethod
    def create_student():
        fake = Faker()
        first_name = fake.name()
        last_name = fake.name()
        email = '{}.{}@example.com'.format(first_name, last_name).lower()
        school = 'sst'
        date_joined = datetime.datetime.now()
        return Student(first_name, last_name, email, school, date_joined)

    def generate_student_data(self, student_num):
        student_list = []
        for i in range(student_num):
            student_list.append(self.create_student())
        return student_list
