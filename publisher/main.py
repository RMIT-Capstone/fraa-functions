import firebase_admin
from firebase_admin import credentials, firestore
import json

cred = credentials.Certificate("./settings/credentials.json")
app = firebase_admin.initialize_app(cred)
store = firestore.client()

DATA = '../data/output/students.json'
COLLECTION = 'test_student'

with open(DATA) as f:
    data = json.load(f)

doc_ref = store.collection(COLLECTION)
for student in data['students']:
    doc_ref.add(student)
