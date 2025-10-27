import re

MAX_MESSAGE_LENGTH = 80
MAX_USERNAME_LENGTH = 20

def username_too_long(username: str) -> bool:
    """Checks that the username is not too long"""
    return len(username) > MAX_USERNAME_LENGTH

def contains_invalid_characters(username: str) -> bool:
    """Checks that the username only contains valid characters"""
    return not re.match(r'^[a-zA-ZåäöÅÄÖ0-9_ -]+$', username)
