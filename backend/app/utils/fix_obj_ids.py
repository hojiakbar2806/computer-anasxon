from bson import ObjectId


def fix_object_ids(doc):
    if doc is None:
        return None
    for key, value in doc.items():
        if isinstance(value, dict):
            doc[key] = fix_object_ids(value)
        elif isinstance(value, list):
            doc[key] = [fix_object_ids(item) for item in value]
        elif isinstance(value, ObjectId):
            doc[key] = str(value)
    return doc
