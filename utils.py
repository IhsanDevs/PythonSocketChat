import sqlite3
import json


class Utils:
    conn = sqlite3.connect("database.db", check_same_thread=False)

    def __init__(self) -> None:
        self.conn.row_factory = sqlite3.Row
        if (
            len(
                self.conn.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='chats'"
                ).fetchall()
            )
            == 0
        ):
            self.create_chats_table()

        if (
            len(
                self.conn.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
                ).fetchall()
            )
            == 0
        ):
            self.create_users_table()

    def create_chats_table(self):
        """Table contain columns: user_id, username, message, created_at"""
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS chats (user_id INTEGER, username TEXT, message TEXT, created_at TEXT)"
        )
        self.conn.commit()

    def create_users_table(self):
        """Table contain columns: user_id, username, created_at"""
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS users (user_id INTEGER, username TEXT, created_at TEXT)"
        )
        self.conn.commit()

    def create_user(self, user_id, username, created_at):
        self.conn.execute(
            "INSERT INTO users (user_id, username, created_at) VALUES (?, ?, ?)",
            (user_id, username, created_at),
        )
        self.conn.commit()

    def create_chat(self, user_id, username, message, created_at):
        self.conn.execute(
            "INSERT INTO chats (user_id, username, message, created_at) VALUES (?, ?, ?, ?)",
            (user_id, username, message, created_at),
        )
        self.conn.commit()

    def get_all_chats(self):
        chats = self.conn.execute(
            "SELECT * FROM chats ORDER BY created_at DESC"
        ).fetchall()

        return chats

    def get_all_users(self):
        users = self.conn.execute(
            "SELECT * FROM users ORDER BY created_at DESC"
        ).fetchall()

        return users

    def get_user_by_id(self, user_id):
        user = self.conn.execute(
            "SELECT * FROM users WHERE user_id = ?", (user_id,)
        ).fetchone()

        return user

    def delete_user(self, user_id):
        self.conn.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
        self.conn.commit()

    def update_user(self, user_id, username):
        self.conn.execute(
            "UPDATE users SET username = ? WHERE user_id = ?", (username, user_id)
        )
        self.conn.commit()


def decode_data(data):
    return json.loads(data)


def encode_data(data):
    return json.dumps([dict(ix) for ix in data])
