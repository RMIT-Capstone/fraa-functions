from faker import Faker
from classes import Student
import datetime
import utils


class StudentFactory:
    @staticmethod
    def create_student():
        fake = Faker()
        first_name, last_name = utils.split_name(fake.name())
        email = '{}_{}@example.com'.format(first_name, last_name).lower()
        school = 'SST'
        date_joined = datetime.datetime.now().isoformat()
        return Student(first_name, last_name, email, school, date_joined)

    def generate_student_data(self, student_num, export_to=None):
        data = {'students': [], 'count': student_num}
        for i in range(student_num):
            data['students'].append(self.create_student())
        # convert to data to json
        data = utils.to_json(data)
        if export_to is not None:
            # Create a json file
            f = open(export_to, "w")
            f.write(data)
            f.close()
            print('Data have been saved at:', export_to)
        return data
