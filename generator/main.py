import factory


def student_client(student_num, dest_path=None):
    student_factory = factory.StudentFactory()
    data = student_factory.generate_student_data(student_num, dest_path)
    return data


def course_client(course_num, dest_path=None):
    course_factory = factory.CourseFactory()
    data = course_factory.generate_course_data(course_num, dest_path)
    return data


def lecturer_client(lecturer_num, dest_path=None):
    lecturer_factory = factory.LecturerFactory()
    data = lecturer_factory.generate_lecturer_data(lecturer_num, dest_path)
    return data

def session_client(session_num, dest_path=None):
    ss_factory = factory.SessionFactory()
    data = ss_factory.generate_session_data(session_num, dest_path)
    return data


session_client(4, '../data/output/sessions.json')
course_client(3, '../data/output/courses.json')
student_client(4, '../data/output/students.json')
lecturer_client(4, '../data/output/lecturers.json')
