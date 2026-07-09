import os
from flask_migrate import init as fm_init, migrate as fm_migrate, upgrade as fm_upgrade, stamp as fm_stamp
from migrate import app, db

def ensure_migrations():
    # Create migrations folder and an initial migration if missing
    if not os.path.exists('migrations'):
        print('Initializing migrations folder...')
        fm_init(directory='migrations')
        print('Creating initial migration...')
        fm_migrate(message='initial', directory='migrations')
        fm_stamp(directory='migrations')

def apply_migrations():
    with app.app_context():
        ensure_migrations()
        print('Applying migrations...')
        fm_upgrade(directory='migrations')
        print('Migrations applied.')

if __name__ == '__main__':
    apply_migrations()
