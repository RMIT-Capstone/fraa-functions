import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("./publisher/settings/credentials.json")
app = firebase_admin.initialize_app(cred)
store = firestore.client()


def publish_collection(data, collection):
    doc_ref = store.collection(collection)
    for record in data[collection.split(']')[-1]]:
        doc_ref.add(record.get_detail())
    print('Finished publish the data')


def delete_collection(collection):
    docs = store.collection(collection).stream()
    deleted = 0
    for doc in docs:
        doc.reference.delete()
        deleted = deleted + 1
    print('{} collection is deleted: {} documents'.format(collection, deleted))


def shown_data(data, collection):
    print('Collection: ', collection)
    for record in data[collection.split(']')[-1]]:
        print(record.get_detail())