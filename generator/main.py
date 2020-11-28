import factory
import utils


def s_client(student_num, dest_path):
    # Generate student list
    student_factory = factory.StudentFactory()
    data = student_factory.generate_student_data(student_num)
    print(data)



s_client(3, "../data/data.json")
