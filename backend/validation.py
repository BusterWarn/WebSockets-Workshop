import re

MAX_MESSAGE_LENGTH = 1000
MAX_USERNAME_LENGTH = 20

def username_too_long(username: str) -> bool:
    """Checks that the username is not too long"""
    return len(username) > MAX_USERNAME_LENGTH

def contains_invalid_characters(username: str) -> bool:
    """Checks that the username only contains valid characters"""
    return not re.match(r'^[a-zA-ZåäöÅÄÖ0-9_ -]+$', username)

def validate_room_name(room_name: str) -> str:
    """Checks that the room name is valid"""
    if len(room_name) > MAX_USERNAME_LENGTH:
        return "Room name is too long"
    if contains_invalid_characters(room_name):
        return "Room name contains invalid characters"
    return ""
