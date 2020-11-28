import json


def to_json(self) -> json:
    return json.dumps(self, default=lambda o: o.__dict__,
                      sort_keys=True, indent=4)
