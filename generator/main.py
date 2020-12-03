import factory
import utils

# Create raw data
students = factory.StudentFactory().generate_student_data(10)
lecturers = factory.LecturerFactory().generate_lecturer_data(10)
courses = factory.CourseFactory().generate_course_data(5)


# generate session data  base on courses created
sessions = factory.SessionFactory().generate_session_data(courses)


# Export to json file
utils.export_data(students, '../data/output/students.json')
utils.export_data(courses, '../data/output/courses.json')
utils.export_data(lecturers, '../data/output/lecturers.json')
utils.export_data(sessions, '../data/output/sessions.json')
