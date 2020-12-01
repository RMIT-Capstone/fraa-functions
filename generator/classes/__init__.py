class Student:
    def __init__(self, full_name, email, school, date_created, subscribed_courses, first_time_pass, attendance_count):
        self.full_name = full_name
        self.email = email
        self.school = school
        self.date_created = date_created
        self.subscribed_courses = subscribed_courses
        self.first_time_pass = first_time_pass
        self.attendance_count = attendance_count

    def subscribe_course(self, courses):
        self.subscribed_courses = courses

    def check_attendance(self, total_attendance):
        self.attendance_count = total_attendance


class Course:
    def __init__(self, code, lecturer, name, school, semester, session_count, date_created):
        self.code = code
        self.name = name
        self.lecturer = lecturer
        self.school = school
        self.semester = semester
        self.session_count = session_count
        self.date_created = date_created

    def add_lecturer(self, lecturer):
        self.lecturer = lecturer

    def add_name(self, name):
        self.name = name


class Session:
    def __init__(self,attendees):
        self.attendees = attendees

    def add_attendees(self, attendees):
        self.attendees = attendees


class Lecturer:
    def __init__(self, full_name, email, school, date_created, subscribed_courses, first_time_pass):
        self.full_name = full_name
        self.email = email
        self.school = school
        self.date_created = date_created
        self.subscribed_courses = subscribed_courses
        self.first_time_pass = first_time_pass

    def subscribe_course(self, courses):
        self.subscribed_courses = courses
