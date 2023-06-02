from routes import sio, app

if __name__ == "__main__":
    sio.run(app, host="0.0.0.0", port=5001, debug=True)
