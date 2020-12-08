import factory
import publisher


# Create raw data
students = factory.StudentFactory().generate_student_data(number=5)
lecturers = factory.LecturerFactory().generate_lecturer_data(number=5)
courses = factory.CourseFactory().generate_course_data(number=4)

# linking courses data with lecturers/students
lecturers, courses = factory.LecturerFactory().connect_to_courses(
    lecturers=lecturers, courses=courses)
students = factory.StudentFactory().connect_to_courses(
    courses=courses, students=students)

# generate session data base on courses created
sessions = factory.SessionFactory().generate_session_data(
    courses=courses, students=students)

# Publish/delete data to firestore
data = {'students': students, 'lecturers': lecturers,
        'courses': courses, 'attendance-sessions': sessions}
for key in data:
    publisher.shown_data(collection=key, data=data[key])
    publisher.publish_collection(collection=key, data=data[key])
