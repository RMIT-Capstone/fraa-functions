import factory
import publisher

# Create raw data
students = factory.StudentFactory().generate_student_data(number=5)
lecturers = factory.LecturerFactory().generate_lecturer_data(number=2)
courses = factory.CourseFactory().generate_course_data(number=4)

# linking courses data with lecturers/students
lecturers, courses = factory.LecturerFactory().connect_to_courses(lecturers=lecturers, courses=courses)
students = factory.StudentFactory().connect_to_courses(courses=courses, students=students)

# generate session data base on courses created
sessions = factory.SessionFactory().generate_session_data(courses=courses, students=students)


# Publish data
publisher.publish_courses(courses)
publisher.publish_students(students)
publisher.publish_lecturers(lecturers)
publisher.publish_sessions_with_cloud_api(sessions)


# Delete data
# publisher.delete_data_with_cloud_api(students=students, courses=courses, lecturers=lecturers)


# Shown data
# publisher.shown_data(courses)
# publisher.shown_data(students)
# publisher.shown_data(lecturers)
# publisher.shown_data(sessions)
