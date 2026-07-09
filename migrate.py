from flask_migrate import Migrate
from app import app, db

# Bind Flask-Migrate to the application and SQLAlchemy db instance.
migrate = Migrate(app, db)

if __name__ == '__main__':
    # simple runner for local debugging
    app.run(host='0.0.0.0', port=5000)
