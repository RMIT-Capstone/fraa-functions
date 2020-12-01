import factory


def student_client(student_num, dest_path=None):
    student_factory = factory.StudentFactory()
    data = student_factory.generate_student_data(student_num, dest_path)
    print(data)
    return data


def course_client(course_num, dest_path=None):
    course_factory = factory.CourseFactory()
    data = course_factory.generate_course_data(course_num, dest_path)
    print(data)
    return data


course_client(3)
