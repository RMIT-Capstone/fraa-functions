from faker import Faker
from classes import Student, Course
import datetime
import utils
import random


class StudentFactory:
    @staticmethod
    def create_student():
        fake = Faker()
        full_name = fake.name()
        sid = str(random.randint(3000000, 4000000))
        email = 's{}@rmit.edu.vn'.format(sid)
        school = 'SST'
        # date_joined = datetime.datetime.now().isoformat()
        date_joined = datetime.datetime.now().strftime("%B %d,%Y at %I:%M:%S %p %z")
        subscribed_courses =[],
        first_time_pass = True
        attendance_count = 0
        return Student(full_name, email, school, date_joined, subscribed_courses, first_time_pass, attendance_count)

    def generate_student_data(self, number, export_to=None):
        data = {'students': [], 'count': number}
        for i in range(number):
            data['students'].append(self.create_student())
        # convert to data to json
        data = utils.to_json(data)
        if export_to is not None:
            # Create a json file
            f = open(export_to, "w")
            f.write(data)
            f.close()
            print('Data have been saved at:', export_to)
        return data


class CourseFactory:
    @staticmethod
    def create_course():
        code = utils.get_random_course()
        name = []
        school = 'SST'
        semester = utils.get_random_semester()
        session_count = 0
        date_created = datetime.datetime.now().strftime("%B %d,%Y at %I:%M:%S %p %z")
        lecturer = ''
        return Course(code, lecturer, name, school, semester, session_count, date_created)

    def generate_course_data(self, number, export_to=None):
        data = {'courses': [], 'count': number}
        for i in range(number):
            data['courses'].append(self.create_course())
        # convert to data to json
        data = utils.to_json(data)
        if export_to is not None:
            # Create a json file
            f = open(export_to, "w")
            f.write(data)
            f.close()
            print('Data have been saved at:', export_to)
        return data



class SessionFactory():
    pass
