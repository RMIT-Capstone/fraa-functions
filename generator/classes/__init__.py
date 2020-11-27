class Student:
    def __init__(self, first_name, last_name, email, school, date_created):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.school = school
        self.date_created = date_created

    def get_detail(self):
        return {"first_name": self.first_name, "last_name": self.last_name, "email": self.email,
                "school": self.school, "date_created": self.date_created}


class Course:
    def __init__(self, code, lecturer, name, school, semester, session_count):
        self.code = code
        self.lecturer = lecturer
