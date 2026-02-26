from app import create_app
from asgiref.wsgi import WsgiToAsgi

# Create Flask app
flask_app = create_app()

# Convert Flask WSGI app to ASGI for uvicorn
app = WsgiToAsgi(flask_app)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5000)
