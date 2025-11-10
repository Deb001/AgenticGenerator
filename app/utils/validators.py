from marshmallow import ValidationError
from ..schemas import UserSchema, LoginSchema, TodoSchema

def validate_registration(data: dict) -> dict:
    """
    Validate registration payload using UserSchema.
    Returns deserialized data.
    Raises marshmallow.ValidationError on failure.
    """
    schema = UserSchema()
    try:
        result = schema.load(data)
        return result
    except ValidationError as err:
        raise err

def validate_login(data: dict) -> dict:
    """
    Validate login payload using LoginSchema.
    Returns deserialized data.
    """
    schema = LoginSchema()
    try:
        result = schema.load(data)
        return result
    except ValidationError as err:
        raise err

def validate_todo_payload(data: dict, partial: bool = False) -> dict:
    """
    Validate todo payload using TodoSchema.
    ``partial`` allows partial updates.
    """
    schema = TodoSchema(partial=partial)
    try:
        result = schema.load(data)
        return result
    except ValidationError as err:
        raise err