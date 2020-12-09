class Student:
    def __init__(self, fullName, email, school, createdAt, subscribedCourses, firstTimePassword,
                 totalAttendedEventsCount):
        self.fullName = fullName
        self.email = email
        self.school = school
        self.createdAt = createdAt
        self.subscribedCourses = subscribedCourses
        self.firstTimePassword = firstTimePassword
        self.totalAttendedEventsCount = totalAttendedEventsCount
        # self.verified = verified

    def subscribe_course(self, courses):
        self.subscribedCourses = courses

    def check_attendance(self, total_attendance):
        self.totalAttendedEventsCount = total_attendance

    def get_detail(self):
        return {"fullName": self.fullName, "school": self.school, "email": self.email, "createdAt": self.createdAt,
                "subscribedCourses": self.subscribedCourses, "firstTimePassword": self.firstTimePassword,
                "totalAttendedEventsCount": self.totalAttendedEventsCount}

    def get_subscribe_courses(self):
        return self.subscribedCourses

    def get_email(self):
        return self.email


class Course:
    def __init__(self, code, lecturer, name, school, semester, sessionCount, createdAt, _id):
        self.code = code
        self.name = name
        self.lecturer = lecturer
        self.school = school
        self.semester = semester
        self.sessionCount = sessionCount
        self.createdAt = createdAt
        self._id = _id

    def add_lecturer(self, lecturer):
        self.lecturer = lecturer

    def add_name(self, name):
        self.name = name

    def get_detail(self):
        return {"code": self.code, "lecturer": self.lecturer, "name": self.name, "school": self.school,
                "semester": self.semester, "sessionCount": self.sessionCount,
                "createdAt": self.createdAt, "_id": self._id}

    def get_session_count(self):
        return int(self.sessionCount)

    def get_course_code(self):
        return self.code

    def get_lecturer(self):
        return self.lecturer

    def set_id(self, _id):
        self._id = _id


class Lecturer:
    def __init__(self, fullName, email, school, createdAt, subscribedCourses, firstTimePassword):
        self.fullName = fullName
        self.email = email
        self.school = school
        self.createdAt = createdAt
        self.subscribedCourses = subscribedCourses
        self.firstTimePassword = firstTimePassword

    def subscribe_course(self, courses):
        self.subscribedCourses = courses

    def get_name(self):
        return self.fullName

    def get_subscribed_course(self):
        return self.subscribedCourses

    def get_detail(self):
        return {"fullName": self.fullName, "school": self.school, "email": self.email, "createdAt": self.createdAt,
                "subscribedCourses": self.subscribedCourses, "firstTimePassword": self.firstTimePassword}


class Session:
    def __init__(self, courseCode, courseName, createdAt, expireOn, lecturer,
                 location, semester, validOn, attendees, _id, courseId):
        self.attendees = attendees
        self.courseCode = courseCode
        self.courseName = courseName
        self.createdAt = createdAt
        self.expireOn = expireOn
        self.lecturer = lecturer
        self.semester = semester
        self.location = location
        self.validOn = validOn
        self._id = _id
        self.courseId = courseId

    def add_attendees(self, attendees):
        self.attendees = attendees

    def get_detail(self):
        return {"courseCode": self.courseCode, "courseName": self.courseName, "createdAt": self.createdAt,
                "expireOn": self.expireOn, "lecturer": self.lecturer, "location": self.location,
                "courseId": self.courseId, "validOn": self.validOn, "semester": self.semester,
                "attendees": self.attendees, "_id": self._id}

    def set_time(self, validOn, expireOn):
        self.validOn = validOn
        self.expireOn = expireOn

    def set_id(self, _id):
        self._id = _id