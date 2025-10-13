import bcrypt

class UserDatabase:
    def __init__(self):
        self.users = {}

    def add_user(self, username: str, password: str):
        if username in self.users:
            raise ValueError(f"User {username} already exists")

        hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
        self.users[username] = hashed_password

    def check_user(self, username: str, password: str):
        if username not in self.users:
            return False

        hashed_password = self.users[username]
        return bcrypt.checkpw(password.encode(), hashed_password)
