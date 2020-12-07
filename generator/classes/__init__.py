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

    def get_detail(self):
        return {"fullName": self.fullName, "school": self.school, "email": self.email, "createAt": self.createAt,
                "subscribedCourses": self.subscribedCourses, "firstTimePassword": self.firstTimePassword,
                "attendance_count": self.attendance_count}

    def get_subscribe_courses(self):
        return self.subscribedCourses

    def get_email(self):
        return self.email


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

    def get_session_count(self):
        return int(self.sessionCount)

    def get_course_code(self):
        return self.code

    def get_lecturer(self):
        return self.lecturer


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

    def get_name(self):
        return self.fullName

    def get_subscribed_course(self):
        return self.subscribedCourses

    def get_detail(self):
        return {"fullName": self.fullName, "school": self.school, "email": self.email, "createAt": self.createAt,
                "subscribedCourses": self.subscribedCourses, "firstTimePassword": self.firstTimePassword}


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

    def get_detail(self):
        return {"courseCode": self.courseCode, "courseName": self.courseName, "createAt": self.createAt,
                "expireOn": self.expireOn, "lecturer": self.lecturer, "location": self.location,
                "validOn": self.validOn, "semester": self.semester, "attendees": self.attendees}

