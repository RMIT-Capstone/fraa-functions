import json

import firebase_admin
import requests
from firebase_admin import credentials, firestore
from dateutil.parser import parse

cred = credentials.Certificate('./publisher/settings/credentials.json')
app = firebase_admin.initialize_app(cred)
store = firestore.client()


def publish_collection(data, collection):
    doc_ref = store.collection(collection)
    for record in data:
        doc_ref.add(record.get_detail())
    print('Finished publish the data')


def delete_collection(collection):
    docs = store.collection(collection).stream()
    deleted = 0
    for doc in docs:
        doc.reference.delete()
        deleted = deleted + 1
    print('{} collection is deleted: {} documents'.format(collection, deleted))


def shown_data(data):
    print('DATA:')
    for record in data:
        print(record.get_detail())


# HOST_SERVER = 'https://asia-northeast1-fraa-capstone.cloudfunctions.net/api/'

HOST_SERVER = 'http://localhost:5001/serve/asia-northeast1/api/'


def post_data(payload, api):
    try:
        req = requests.post(HOST_SERVER + api,
                            data=json.dumps(payload),
                            headers={'content-type': 'application/json'})
        return req
    except Exception as e:
        print(e)


def publish_courses(courses):
    for data in courses:
        course = data.get_detail()
        payload = {
            'course': {
                'code': course['code'],
                'lecturer': course['lecturer'],
                'name': course['name'],
                'school': course['school']
            }
        }
        res = post_data(payload=payload, api='create_course')
        if "error" in json.loads(res.text):
            print('Error: ', res.text)
    print('Finished publish courses')


def publish_students(students):
    for student in students:
        student = student.get_detail()
        student_payload = {
            "user": {
                'email': student['email'],
                'password': '1234567',
                'displayName': student['fullName'],
                'school': student['school'],
                'isLecturer': False
            }
        }
        res = post_data(payload=student_payload, api='create_user')
        if "error" in json.loads(res.text):
            print('Error: ', res.text)

        userId = json.loads(res.text)['success']['user']['id']
        course_payload = {
            'userId': userId,
            'courses': student['subscribedCourses']
        }
        res2 = post_data(payload=course_payload, api='subscribe_to_courses')
        if "error" in json.loads(res2.text):
            print('Error: (student subscribe to courses): ', res2.text)
    print('Finished publish students')


def publish_lecturers(lecturers):
    for lecturer in lecturers:
        lecturer = lecturer.get_detail()
        payload = {
            "user": {
                'email': lecturer['email'],
                'password': '1234567',
                'displayName': lecturer['fullName'],
                'school': lecturer['school'],
                'isLecturer': True
            }
        }
        res = post_data(payload=payload, api='create_user')
        if "error" in json.loads(res.text):
            print('Error: ', res.text)

        userId = json.loads(res.text)['success']['user']['id']
        course_payload = {
            'userId': userId,
            'courses': lecturer['subscribedCourses']
        }
        res2 = post_data(payload=course_payload, api='subscribe_to_courses')
        if "error" in json.loads(res2.text):
            print('Error: (lecturer subscribe to courses): ', res2.text)
    print('Finished publish lecturers')


def publish_sessions_with_api(sessions):
    for data in sessions:
        session = data.get_detail()
        res = post_data(payload={'code': session['courseCode']}, api='get_course_by_code')
        course_id = json.loads(res.text)['course']['id']

        payload = {
            "course": {
                "courseCode": session['courseCode'],
                "courseName": session['courseName'],
                "lecturer": session['lecturer'],
                "courseId": course_id
            },
            "validOn": session['validOn'],
            "expireOn": session['expireOn'],
            "location": session['location'],
            "semester": "2020C",
            "attendees": session["attendees"],
            "createdAt": session['createdAt']
        }

        res = post_data(payload=payload, api='create_attendance_session')
        if "error" in json.loads(res.text):
            print('Error: ', res.text)
        else:
            session_id = json.loads(res.text)['success']['id']
            for attendee in session['attendees']:
                payload = {
                    "email": attendee,
                    "sessionId": session_id
                }
                res2 = post_data(payload=payload, api='register_to_attendance_session')
                if "error" in json.loads(res2.text):
                    print('Error: ', res2.text)
    print('Finished publish sessions')


def publish_sessions(sessions):
    doc_ref = store.collection('attendance-sessions')
    for data in sessions:
        session = data.get_detail()
        res = post_data(payload={'code': session['courseCode']}, api='get_course_by_code')
        course_id = json.loads(res.text)['course']['id']

        payload = {
            "course": {
                "courseCode": session['courseCode'],
                "courseName": session['courseName'],
                "lecturer": session['lecturer'],
                "courseId": course_id
            },
            "validOn": parse(session['validOn']),
            "expireOn": parse(session['expireOn']),
            "location": session['location'],
            "semester": "2020C",
            "attendees": session["attendees"],
            "createdAt": parse(session['createdAt'])
        }
        try:
            doc_ref.add(payload)
        except Exception as err:
            print(err)

        for attendee in session['attendees']:
            payload = {
                "email": attendee,
                "isLecturer": False
            }
            res = post_data(payload=payload, api='get_user_by_email')
            if "error" in json.loads(res.text):
                print('Error: ', res.text)
            else:
                _id = json.loads(res.text)['success']['user']['id']
                store.collection('students').document(_id).update({"totalAttendedEventsCount": firestore.Increment(1)})
    print('Finished publish the sessions')


def delete_data(students, courses, lecturers):
    for student in students:
        s = student.get_detail()
        post_data(payload={'email': s['email']}, api='delete_user')
    for lecturer in lecturers:
        lec = lecturer.get_detail()
        post_data(payload={'email': lec['email']}, api='delete_user')
    for course in courses:
        c = course.get_detail()
        try:
            res = post_data(payload={'code': c['code']}, api='get_course_by_code')
            course_id = json.loads(res.text)['course']['id']
            post_data(payload={'id': course_id}, api='delete_course')
        except Exception as e:
            print('Error: ( delete course', c['code'], ')', e)
            pass
    # Delete sessions
    for course in courses:
        c = course.get_detail()
        sessions = store.collection('attendance-sessions').where('course.courseCode', '==', c['code']).get()
        for session in sessions:
            session.reference.delete()
    print('Finished delete data')

