import factory
import publisher

# Create raw data
students = factory.StudentFactory().generate_student_data(number=1)
lecturers = factory.LecturerFactory().generate_lecturer_data(number=1)
courses = factory.CourseFactory().generate_course_data(number=1)

# linking courses data with lecturers/students
lecturers, courses = factory.LecturerFactory().connect_to_courses(lecturers=lecturers, courses=courses)
students = factory.StudentFactory().connect_to_courses(courses=courses, students=students)

# generate session data base on courses created
sessions = factory.SessionFactory().generate_session_data(courses=courses, students=students)


# Publish data
publisher.publish_courses(courses)
publisher.publish_sessions(sessions)
publisher.publish_students(students)
publisher.publish_lecturers(lecturers)
