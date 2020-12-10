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


HOST_SERVER = 'https://asia-northeast1-fraa-capstone.cloudfunctions.net/api/'


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
            print('Course existed: ', course['code'])
        else:
            data.set_id(json.loads(res.text)['id'])
    print('Finished publish courses')


def publish_students(students):
    for student in students:
        student = student.get_detail()
        student_payload = {
            'email': student['email'],
            'password': '1234567',
            'displayName': student['fullName'],
            'school': student['school'],
            'isLecturer': False
        }
        res = post_data(payload=student_payload, api='create_user')
        if "error" in json.loads(res.text):
            print('Error: ', res.text)
        else:
            course_payload = {
                'email': student['email'],
                'courses': student['subscribedCourses']
            }
            res2 = post_data(payload=course_payload, api='subscribe_to_courses')
            if "error" in json.loads(res2.text):
                print('Error subscribed to courses:', course_payload)
    print('Finished publish students')


def publish_lecturers(lecturers):
    for lecturer in lecturers:
        lecturer = lecturer.get_detail()
        payload = {
            'email': lecturer['email'],
            'password': '1234567',
            'displayName': lecturer['fullName'],
            'school': lecturer['school'],
            'isLecturer': True
        }
        res = post_data(payload=payload, api='create_user')
        if "error" in json.loads(res.text):
            print('Error: ', res.text)

    print('Finished publish lecturers')


def publish_sessions_no_attendees(sessions):
    for data in sessions:
        session = data.get_detail()
        res = post_data(payload={'code': session['courseCode']}, api='get_course_by_code')
        course_id = json.loads(res.text)['course']['id']

        payload = {
            "content": {
                "courseId": course_id,
                "courseCode": session['courseCode'],
                "courseName": session['courseName'],
                "lecturer": session['lecturer'],
                "validOn": session['validOn'],
                "expireOn": session['expireOn'],
                "location": session['location'],
                "semester": "2020C"
            }
        }
        res = post_data(payload=payload, api='create_attendance_session')
        session_id = json.loads(res.text)
        print(session_id)

        for attendee in session['attendees']:
            payload = {
                "email": attendee,
                "sessionId": session_id
            }
            post_data(payload=payload, api='register_to_attendance_session')
    print('Finished publish sessions')


def publish_sessions(sessions):
    doc_ref = store.collection('attendance-sessions')
    for data in sessions:
        session = data.get_detail()
        payload = {
            "courseCode": session['courseCode'],
            "courseName": session['courseName'],
            "lecturer": session['lecturer'],
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
            pass

        for attendee in session['attendees']:
            payload = {
                "email": attendee,
                "isLecturer": False
            }
            res = post_data(payload=payload, api='get_user_by_email')
            if "error" in json.loads(res.text):
                print('Error: ', res.text)
            else:
                _id = json.loads(res.text)['id']
                store.collection('students').document(_id).update({"totalAttendedEventsCount": firestore.Increment(1)})
    print('Finished publish the sessions')
