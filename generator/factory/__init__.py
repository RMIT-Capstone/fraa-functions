from faker import Faker
from classes import Student, Course, Lecturer, Session
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
        school = utils.get_random_school()
        first_time_pass = True
        date_joined = datetime.datetime.now().isoformat()
        # date_joined = datetime.datetime.now().strftime("%B %d,%Y at %I:%M:%S %p %z")
        subscribed_courses = []
        attendance_count = 0
        return Student(full_name, email, school, date_joined, subscribed_courses, first_time_pass, attendance_count)

    def generate_student_data(self, number, export_path=None):
        data = {'students': [], 'count': number}
        for i in range(number):
            data['students'].append(self.create_student())
        # convert to data to json
        data = utils.to_json(data)
        if export_path is not None:
            f = open(export_path, "w")
            f.write(data)
            f.close()
            print('Data have been saved at:', export_path)
        return data


class CourseFactory:
    @staticmethod
    def create_course():
        code = utils.get_random_course()
        name = []
        lecturer = ''
        school = utils.get_random_school()
        semester = utils.get_random_semester()
        session_count = 0
        date_created = datetime.datetime.now().isoformat()
        return Course(code, lecturer, name, school, semester, session_count, date_created)

    def generate_course_data(self, number, export_to=None):
        data = {'courses': [], 'count': number}
        titles = utils.get_all_course_title()
        for i in range(number):
            course = self.create_course()
            course.add_name(titles[i][0].split())
            data['courses'].append(course)
        # convert to data to json
        data = utils.to_json(data)
        if export_to is not None:
            # Create a json file
            f = open(export_to, "w")
            f.write(data)
            f.close()
            print('Data have been saved at:', export_to)
        return data


class LecturerFactory:
    @staticmethod
    def create_lecturer():
        fake = Faker()
        full_name = fake.name()
        sid = str(random.randint(3000000, 4000000))
        email = 'v{}@rmit.edu.vn'.format(sid)
        school = utils.get_random_school()
        date_joined = datetime.datetime.now().isoformat()
        subscribed_courses = []
        first_time_pass = True
        return Lecturer(full_name, email, school, date_joined, subscribed_courses, first_time_pass)

    def generate_lecturer_data(self, number, export_path=None):
        data = {'lecturers': [], 'count': number}
        for i in range(number):
            data['lecturers'].append(self.create_lecturer())
        data = utils.to_json(data)
        if export_path is not None:
            f = open(export_path, "w")
            f.write(data)
            f.close()
            print('Data have been saved at:', export_path)
        return data


class SessionFactory:
    pass
