"""Create routes for the application."""
from flask import render_template, Flask, request
from flask_assets import Environment, Bundle
from flask_socketio import SocketIO, emit
import utils

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.debug = True
sio = SocketIO(app)
assets = Environment(app)

css = Bundle(
    "bootstrap/css/bootstrap.min.css", "css/NunitoSans.css", output="gen/packed.css"
)
js = Bundle(
    "js/bs-init.js",
    "js/socket.io.min.js",
    # "js/socket.io.min.js.map",
    "js/main.js",
    output="gen/packed.js",
)
manifest = Bundle("manifest.json", output="gen/manifest.json")
assets.register("css_all", css)
assets.register("js_all", js)
assets.register("manifest", manifest)
assets.init_app(app)


@app.route("/")
def index():
    return render_template(
        "index.jinja2", title="Anonymous Chat", desc="Let's talk anonym. funny!"
    )


@app.route("/assets/img/thumb.jpeg")
def thumb():
    return app.send_static_file("img/thumb.jpeg")


@app.route("/sitemap.xml")
def sitemap():
    # set the response header to XML
    response = app.make_response(render_template("sitemap.xml"))
    response.headers["Content-Type"] = "application/xml"
    return response


@sio.on("newUser")
def handle_new_user(data):
    # decode data
    decodedJson = utils.decode_data(data)
    status = decodedJson["status"]
    utilsClass = utils.Utils()
    # check user if exist in database
    if utilsClass.get_user_by_id(user_id=decodedJson["id"]) is None:
        utilsClass.create_user(
            user_id=decodedJson["id"],
            username=decodedJson["username"],
            created_at=decodedJson["created_at"],
        )
        emit("newUser", data, broadcast=True)
        print("newUser : ", data)

    if status == "online":
        emit("onlineUser", data, broadcast=True)
        print("newUser : ", data)

    if status == "offline":
        emit("offlineUser", data, broadcast=True)
        print("newUser : ", data)


@sio.on("updatedUser")
def handle_updated_user(data):
    # decode data
    decodedJson = utils.decode_data(data)
    utilsClass = utils.Utils()
    # check user if exist in database
    if utilsClass.get_user_by_id(user_id=decodedJson["id"]) is None:
        utilsClass.create_user(
            user_id=decodedJson["id"],
            username=decodedJson["username"],
            created_at=decodedJson["created_at"],
        )

    utilsClass.update_user(
        user_id=decodedJson["id"],
        username=decodedJson["username"],
    )
    emit("updatedUser", data, broadcast=True)
    print("updatedUser : ", data)


@sio.on("newMessage")
def handle_new_message(data):
    decodedJson = utils.decode_data(data)
    utilsClass = utils.Utils()
    # check user if exist in database
    if utilsClass.get_user_by_id(user_id=decodedJson["id"]) is None:
        utilsClass.create_user(
            user_id=decodedJson["id"],
            username=decodedJson["username"],
            created_at=decodedJson["created_at"],
        )
    utilsClass.create_chat(
        user_id=decodedJson["id"],
        username=decodedJson["username"],
        message=decodedJson["message"],
        created_at=decodedJson["created_at"],
    )
    emit("newMessage", data, broadcast=True)
    print("newMessage : ", data)


@sio.on("typing")
def handle_typing(data):
    emit("typing", data, broadcast=True)
    print("typing : ", data)


@sio.on("deletedUser")
def handle_delete_user(data):
    # decode data
    decodedJson = utils.decode_data(data)
    utilsClass = utils.Utils()
    # check user if exist in database
    if utilsClass.get_user_by_id(user_id=decodedJson["id"]) is not None:
        utilsClass.delete_user(user_id=decodedJson["id"])
        emit("deletedUser", data, broadcast=True)
        print("deletedUser : ", data)


@sio.on("getAllMessages")
def handle_get_all_messages(data):
    # decode data
    decodedJson = utils.decode_data(data)
    utilsClass = utils.Utils()
    # check user if exist in database
    if utilsClass.get_user_by_id(user_id=decodedJson["id"]) is None:
        utilsClass.create_user(
            user_id=decodedJson["id"],
            username=decodedJson["username"],
            created_at=decodedJson["created_at"],
        )
    # get all messages
    messages = utilsClass.get_all_chats()
    messages = utils.encode_data(messages)
    # send all messages to user
    emit("getAllMessages", messages)
    print("getAllMessages : ", messages)


@sio.on("disconnect")
def handle_disconnect():
    print("disconnect")
