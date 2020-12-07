import firebase_admin
from firebase_admin import credentials, firestore
import json
import time


def publish_collection(PATH):
    with open(PATH) as file:
        data = json.load(file)
    doc_ref = store.collection('[test]' + collection)
    for data in data[collection]:
        doc_ref.add(data)


def delete_collection(coll_ref):
    docs = store.collection(coll_ref).stream()
    deleted = 0
    for doc in docs:
        print(f'Deleting doc {doc.id} => {doc.to_dict()}')
        doc.reference.delete()
        deleted = deleted + 1
    print('{} collection is deleted: {} document'.format(coll_ref, deleted))


timer = time.time()
cred = credentials.Certificate("./settings/credentials.json")
app = firebase_admin.initialize_app(cred)
store = firestore.client()

DEST_PATH = '../../data/output/'
COLLECTION = ['students', 'lecturers', 'sessions', 'courses']


for collection in COLLECTION:
    path = DEST_PATH + '{}.json'.format(collection)
    publish_collection(path)
print('Finished publish data in: ', time.time() - timer)


# for collection in COLLECTION:
#     delete_collection('[test]' + collection)
