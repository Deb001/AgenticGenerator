import os
from app import create_app

if __name__ == "__main__":
    env = os.getenv("FLASK_ENV", "development")
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "0") == "1" and env != "production"
    app = create_app()
    app.run(host="0.0.0.0", port=port, debug=debug)