def convert_id(obj):
    """
    Convert MongoDB _id to string id in a document
    """
    if isinstance(obj, dict):
        if "_id" in obj:
            obj["id"] = str(obj.pop("_id"))
        return obj
    return obj 