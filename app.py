from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Database config
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'tasks.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500))

    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'description': self.description}

# Initialize DB before first request
@app.before_first_request
def create_tables():
    db.create_all()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/tasks/', methods=['GET', 'POST'])
def handle_tasks():
    if request.method == 'POST':
        data = request.get_json()
        new_task = Task(title=data['title'], description=data.get('description', ''))
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict()), 201
    else:
        tasks = Task.query.all()
        return jsonify([task.to_dict() for task in tasks])

@app.route('/api/tasks/<int:task_id>/', methods=['PUT', 'DELETE'])
def handle_task(task_id):
    task = Task.query.get_or_404(task_id)

    if request.method == 'PUT':
        data = request.get_json()
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        db.session.commit()
        return jsonify(task.to_dict())

    if request.method == 'DELETE':
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted'})

if __name__ == '__main__':
    # Use host=0.0.0.0 for Render, port from env
    port = int(os.environ.get('PORT', 10000))
    app.run(debug=False, host='0.0.0.0', port=port)
