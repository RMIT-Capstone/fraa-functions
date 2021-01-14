from faker import Faker
import classes
import datetime
import utils
import random

random.seed(76)
SCHOOL_PREFIX = ['SST', 'SBM', 'SDM', 'SSC', 'SIB']
COURSE_PREFIX = ['COSC', 'ISYS', 'OENG', 'EEET']


class StudentFactory:
    @staticmethod
    def create_student():
        fake = Faker()
        fullName = fake.name()
        sid = str(random.randint(3000000, 4000000))
        email = 's{}@rmit.edu.vn'.format(sid)
        school = random.sample(SCHOOL_PREFIX, 1)[0]
        firstTimePassword = True
        createdAt = datetime.datetime.utcnow()
        subscribedCourses = []
        totalAttendedEventsCount = 0
        return classes.Student(fullName, email, school, createdAt, subscribedCourses,
                               firstTimePassword, totalAttendedEventsCount)

    def generate_student_data(self, number):
        data = []
        for i in range(number):
            data.append(self.create_student())
        return data

    @staticmethod
    def connect_to_courses(courses, students):
        for student in students:
            if len(courses)>3:
                num = random.randint(1, 3)
            else:
                num = random.randint(1, len(courses))
            selected_courses = random.sample(courses, num)
            subscribed_courses = []
            for course in selected_courses:
                subscribed_courses.append(course.get_course_code())
            student.subscribe_course(subscribed_courses)
        return students


class CourseFactory:
    @staticmethod
    def create_course():
        code = random.sample(COURSE_PREFIX, 1)[
            0] + str(random.randint(1000, 9999))
        name = lecturer = _id = ''
        school = random.sample(SCHOOL_PREFIX, 1)[0]
        semester = '2020C'
        sessionCount = 3
        createdAt = datetime.datetime.utcnow()
        return classes.Course(code, lecturer, name, school, semester, sessionCount, createdAt, _id)

    def generate_course_data(self, number):
        data = []
        for i in range(number):
            course = self.create_course()
            title = random.sample(utils.get_all_course_title(), 1)[0][0]
            course.add_name(title)
            data.append(course)
        return data


class LecturerFactory:
    @staticmethod
    def create_lecturer():
        fake = Faker()
        fullName = fake.name()
        sid = str(random.randint(3000000, 4000000))
        email = 'v{}@rmit.edu.vn'.format(sid)
        school = random.sample(SCHOOL_PREFIX, 1)[0]
        createdAt = datetime.datetime.utcnow()
        subscribedCourses = []
        firstTimePassword = True
        return classes.Lecturer(fullName, email, school, createdAt, subscribedCourses, firstTimePassword)

    def generate_lecturer_data(self, number):
        data = []
        for i in range(number):
            data.append(self.create_lecturer())
        return data

    @staticmethod
    def connect_to_courses(courses, lecturers):
        for course in courses:
            lecturer = random.sample(lecturers, 1)[0]
            course.add_lecturer(lecturer.get_name())
            subscribed_courses = lecturer.get_subscribed_course()
            subscribed_courses.append(course.get_course_code())
            lecturer.subscribe_course(subscribed_courses)
        return lecturers, courses


class SessionFactory:
    @staticmethod
    def create_session(course, attendees=None):
        course = course.get_detail()
        courseCode = course['code']
        courseName = course['name']
        lecturer = course['lecturer']
        semester = course['semester']
        courseId = course['_id']
        now = datetime.datetime.now() - datetime.timedelta(hours=7)
        validOn = now.isoformat()
        expireOn = (now + datetime.timedelta(minutes=30)).isoformat()
        createdAt = now.isoformat()
        build = str(random.randint(1, 2))
        floor = str(random.randint(1, 2))
        room = str(random.randint(1, 2))
        location = 'SGS/{build}.{floor}.{room}'.format(build=build, floor=floor, room=room)
        attendees = attendees
        _id = ''
        return classes.Session(courseCode, courseName, createdAt, expireOn, lecturer,
                               location, semester, validOn, attendees, _id, courseId)

    def generate_session_data(self, courses, students):
        data = []
        for c in range(len(courses)):
            course = courses[c]
            # TODO: turn into range and add the time delta base on  index
            for i in range(course.get_session_count()):
                now = datetime.datetime.now() - datetime.timedelta(hours=7) + datetime.timedelta(minutes=c*90)
                attendees = []
                for student in students:
                    for subscribed_course in student.get_subscribe_courses():
                        rate = [False] * 0 + [True] * 1
                        if subscribed_course == course.get_course_code() and random.choice(rate) is True and 1 > i:
                            attendees.append(student.get_email())
                session = self.create_session(course, attendees)
                validOn = (now - datetime.timedelta(days=1)
                           + datetime.timedelta(days=i)).isoformat()
                expireOn = (now - datetime.timedelta(days=1)
                            + datetime.timedelta(days=i, minutes=50)).isoformat()
                session.set_time(validOn=validOn, expireOn=expireOn)
                data.append(session)
        return data
