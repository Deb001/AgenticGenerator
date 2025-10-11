import logging
from flask import Blueprint, render_template, request, jsonify
from . import calculator

# Configure logging for the routes module
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create a Blueprint for the main application routes
# This blueprint will be registered with the Flask app in __init__.py
bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    """
    Renders the main index.html page, serving as the frontend for the calculator.
    This route is the entry point for the web application.
    """
    logger.info("Serving the main index.html page.")
    return render_template('index.html')

@bp.route('/api/add', methods=['POST'])
def add_route():
    """
    API endpoint for performing addition.
    Expects a JSON payload with 'num1' and 'num2' keys.
    Example payload: {'num1': 5, 'num2': 3}
    Returns a JSON response with the 'result' or an 'error' message.
    """
    return _handle_calculation_request(calculator.add, 'addition')

@bp.route('/api/subtract', methods=['POST'])
def subtract_route():
    """
    API endpoint for performing subtraction.
    Expects a JSON payload with 'num1' and 'num2' keys.
    Example payload: {'num1': 10, 'num2': 4}
    Returns a JSON response with the 'result' or an 'error' message.
    """
    return _handle_calculation_request(calculator.subtract, 'subtraction')

@bp.route('/api/multiply', methods=['POST'])
def multiply_route():
    """
    API endpoint for performing multiplication.
    Expects a JSON payload with 'num1' and 'num2' keys.
    Example payload: {'num1': 6, 'num2': 7}
    Returns a JSON response with the 'result' or an 'error' message.
    """
    return _handle_calculation_request(calculator.multiply, 'multiplication')

@bp.route('/api/divide', methods=['POST'])
def divide_route():
    """
    API endpoint for performing division.
    Expects a JSON payload with 'num1' and 'num2' keys.
    Example payload: {'num1': 20, 'num2': 5}
    Returns a JSON response with the 'result' or an 'error' message.
    Handles division by zero specifically.
    """
    return _handle_calculation_request(calculator.divide, 'division')

def _handle_calculation_request(operation_func, operation_name):
    """
    A helper function to abstract the common logic for handling arithmetic API requests.
    It performs input validation, calls the appropriate calculator function,
    and handles potential errors, returning a standardized JSON response.

    Args:
        operation_func (callable): The function from the calculator module to execute
                                   (e.g., calculator.add, calculator.divide).
        operation_name (str): A string representing the name of the operation for logging.

    Returns:
        flask.Response: A JSON response containing the result or an error message,
                        along with an appropriate HTTP status code.
    """
    if not request.is_json:
        logger.warning(f"[{operation_name}] Request did not contain JSON data.")
        return jsonify({'error': 'Request must be JSON'}), 400

    data = request.get_json()
    if not data:
        logger.warning(f"[{operation_name}] Empty JSON payload received.")
        return jsonify({'error': 'Invalid or empty JSON payload'}), 400

    num1_raw = data.get('num1')
    num2_raw = data.get('num2')

    if num1_raw is None or num2_raw is None:
        logger.warning(f"[{operation_name}] Missing 'num1' or 'num2' in payload: {data}")
        return jsonify({'error': 'Missing numbers in payload. Please provide num1 and num2.'}), 400

    try:
        # Convert input to float to handle decimal numbers
        num1 = float(num1_raw)
        num2 = float(num2_raw)
    except (ValueError, TypeError):
        logger.warning(f"[{operation_name}] Invalid number format. num1: '{num1_raw}', num2: '{num2_raw}'")
        return jsonify({'error': 'Invalid number format. Please provide valid numbers.'}), 400

    try:
        result = operation_func(num1, num2)
        logger.info(f"[{operation_name}] Operation successful: {num1} and {num2} -> {result}")
        return jsonify({'result': result}), 200
    except ZeroDivisionError:
        logger.error(f"[{operation_name}] Attempted division by zero: {num1} / {num2}")
        return jsonify({'error': 'Division by zero is not allowed.'}), 400
    except Exception as e:
        # Catch any other unexpected errors during calculation
        logger.exception(f"[{operation_name}] An unexpected error occurred during calculation for {num1} and {num2}.")
        return jsonify({'error': f'An unexpected server error occurred: {str(e)}'}), 500