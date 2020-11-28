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
        date_joined = datetime.datetime.now().isoformat()
        return Student(first_name, last_name, email, school, date_joined)

    def generate_student_data(self, student_num):
        data = {'students': []}
        for i in range(student_num):
            data['students'].append(self.create_student())
        return data
