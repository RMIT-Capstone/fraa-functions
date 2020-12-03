from faker import Faker
import classes
import datetime
import utils
import random


class StudentFactory:
    @staticmethod
    def create_student():
        fake = Faker()
        fullName = fake.name()
        sid = str(random.randint(3000000, 4000000))
        email = 's{}@rmit.edu.vn'.format(sid)
        school = utils.get_random_school()
        firstTimePassword = True
        createAt = datetime.datetime.now().isoformat()
        subscribedCourses = []
        attendance_count = 0
        return classes.Student(fullName, email, school, createAt, subscribedCourses, firstTimePassword,
                               attendance_count)

    def generate_student_data(self, number, export_path=None):
        data = {'students': [], 'count': number}
        for i in range(number):
            data['students'].append(self.create_student())
        # convert to data to json
        # data = utils.to_json(data)
        if export_path is not None:
            utils.export_data(data, export_path)
        return data

    @staticmethod
    def connect_to_courses(courses, students):
        for student in students['students']:
            num = random.randint(1, 4)  # num must < len(courses['courses'])
            selected_courses = random.sample(courses['courses'], num)
            subscribed_courses = []
            for course in selected_courses:
                subscribed_courses.append(course.get_course_code())
            student.subscribe_course(subscribed_courses)
        return students


class CourseFactory:
    @staticmethod
    def create_course():
        code = utils.get_random_course()
        name = []
        lecturer = ''
        school = utils.get_random_school()
        semester = utils.get_random_semester()
        sessionCount = utils.get_random_number_under_5()
        createAt = datetime.datetime.now().isoformat()
        return classes.Course(code, lecturer, name, school, semester, sessionCount, createAt)

    def generate_course_data(self, number, export_path=None):
        data = {'courses': [], 'count': number}
        titles = utils.get_all_course_title()
        for i in range(number):
            course = self.create_course()
            course.add_name(titles[i][0].split())
            data['courses'].append(course)
        # convert to data to json
        # data = utils.to_json(data)
        if export_path is not None:
            utils.export_data(data, export_path)
        return data


class LecturerFactory:
    @staticmethod
    def create_lecturer():
        fake = Faker()
        fullName = fake.name()
        sid = str(random.randint(3000000, 4000000))
        email = 'v{}@rmit.edu.vn'.format(sid)
        school = utils.get_random_school()
        createAt = datetime.datetime.now().isoformat()
        subscribedCourses = []
        firstTimePassword = True
        return classes.Lecturer(fullName, email, school, createAt, subscribedCourses, firstTimePassword)

    def generate_lecturer_data(self, number, export_path=None):
        data = {'lecturers': [], 'count': number}
        for i in range(number):
            data['lecturers'].append(self.create_lecturer())
        # data = utils.to_json(data)
        if export_path is not None:
            utils.export_data(data, export_path)
        return data

    @staticmethod
    def connect_to_courses(courses, lecturers):
        for course in courses['courses']:
            lecturer = utils.get_random(lecturers['lecturers'])
            course.add_lecturer(lecturer.get_name())
            subscribed_courses = lecturer.get_subscribed_course()
            subscribed_courses.append(course.get_course_code())
            lecturer.subscribe_course(subscribed_courses)
        return lecturers, courses


class SessionFactory:
    @staticmethod
    def create_session(course=None):
        if course is None:
            courseCode = courseName = lecturer = semester = None
        else:
            course = course.get_detail()
            courseCode = course['code']
            courseName = course['name']
            lecturer = course['lecturer']
            semester = course['semester']
        validOn = datetime.datetime.now().isoformat()
        expireOn = (datetime.datetime.now() + datetime.timedelta(minutes=15)).isoformat()
        createAt = datetime.datetime.now().isoformat()
        location = utils.get_random_location()
        attendees = []
        return classes.Session(courseCode, courseName, createAt, expireOn, lecturer,
                               location, semester, validOn, attendees)

    def generate_session_data(self, courses):
        data = {"sessions": [], "count": 0}
        for course in courses['courses']:
            for i in range(course.get_session_count()):
                session = self.create_session(course)
                data["sessions"].append(session)
                data["count"] += 1
        return data
