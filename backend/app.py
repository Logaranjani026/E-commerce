import os
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from flask import Flask, jsonify
from flask_cors import CORS
from backend.config.settings import Config
from backend.models.database import db
import backend.models # Ensure all models are registered
from backend.routes import register_blueprints
from backend.services.seed_service import seed_database

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Setup CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize Database
    db.init_app(app)

    # Register API Blueprints
    register_blueprints(app)

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'online',
            'service': 'SmartCart AI API',
            'database': 'Connected',
            'ai_mode': 'Gemini 1.5 Flash' if Config.GEMINI_API_KEY else 'Smart Heuristic Engine (Active)'
        }), 200

    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'success': False, 'message': 'An internal server error occurred'}), 500

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'success': False, 'message': 'Bad request'}), 400

    # Create tables and auto-seed initial data
    with app.app_context():
        db.create_all()
        seed_database()

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"[*] SmartCart AI Backend Server running at http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
