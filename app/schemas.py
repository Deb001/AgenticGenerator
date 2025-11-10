from marshmallow import Schema, fields, validate, validates, ValidationError
from .models import User

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=150)
    )
    email = fields.Email(required=True)
    password = fields.Str(
        load_only=True,
        required=True,
        validate=validate.Length(min=8)
    )

    @validates("username")
    def validate_username(self, value):
        if not value.isidentifier():
            raise ValidationError(
                "Username must contain only letters, numbers, and underscores."
            )

class LoginSchema(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True, load_only=True)

class TodoSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=255)
    )
    description = fields.Str(allow_none=True)
    completed = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)