class Student:
    def __init__(self, fullName, email, school, createAt, subscribedCourses, firstTimePassword, attendance_count):
        self.fullName = fullName
        self.email = email
        self.school = school
        self.createAt = createAt
        self.subscribedCourses = subscribedCourses
        self.firstTimePassword = firstTimePassword
        self.attendance_count = attendance_count

    def subscribe_course(self, courses):
        self.subscribedCourses = courses

    def check_attendance(self, total_attendance):
        self.attendance_count = total_attendance


class Course:
    def __init__(self, code, lecturer, name, school, semester, sessionCount, createAt):
        self.code = code
        self.name = name
        self.lecturer = lecturer
        self.school = school
        self.semester = semester
        self.sessionCount = sessionCount
        self.createAt = createAt

    def add_lecturer(self, lecturer):
        self.lecturer = lecturer

    def add_name(self, name):
        self.name = name

    def get_detail(self):
        return {"code": self.code, "lecturer": self.lecturer, "name": self.name, "school": self.school,
                "semester": self.semester, "sessionCount": self.sessionCount, "createAt": self.createAt}


class Lecturer:
    def __init__(self, fullName, email, school, createAt, subscribedCourses, firstTimePassword):
        self.fullName = fullName
        self.email = email
        self.school = school
        self.createAt = createAt
        self.subscribedCourses = subscribedCourses
        self.firstTimePassword = firstTimePassword

    def subscribe_course(self, courses):
        self.subscribedCourses = courses


class Session:
    def __init__(self, courseCode, courseName, createAt, expireOn, lecturer, location, semester, validOn, attendees):
        self.attendees = attendees
        self.courseCode = courseCode
        self.courseName = courseName
        self.createAt = createAt
        self.expireOn = expireOn
        self.lecturer = lecturer
        self.semester = semester
        self.location = location
        self.validOn = validOn

    def add_attendees(self, attendees):
        self.attendees = attendees

