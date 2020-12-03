import firebase_admin
import google.cloud
from firebase_admin import credentials, firestore

cred = credentials.Certificate("./settings/fraa-capstone.json")
app = firebase_admin.initialize_app(cred)

store = firestore.client()
doc_ref = store.collection('students')

try:
    docs = doc_ref.get()
    for doc in docs:
        print(doc.to_dict())
except google.cloud.exceptions.NotFound:
    print('Missing data')
