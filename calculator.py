import logging

# Configure logging for this module.
# In a larger Flask application, logging might be configured centrally in __init__.py
# or a dedicated configuration file. For this module, a basic setup is sufficient
# to log operations and errors.
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def add(num1: float, num2: float) -> float:
    """
    Performs addition of two numbers.

    Args:
        num1 (float): The first number.
        num2 (float): The second number.

    Returns:
        float: The sum of num1 and num2.

    Raises:
        TypeError: If either num1 or num2 is not a valid number (int or float).
    """
    if not isinstance(num1, (int, float)) or not isinstance(num2, (int, float)):
        logger.error(f"Invalid input types for add operation: num1={num1} (type={type(num1)}), num2={num2} (type={type(num2)})")
        raise TypeError("Both inputs must be numbers (integers or floats).")
    
    result = num1 + num2
    logger.info(f"Performed addition: {num1} + {num2} = {result}")
    return result

def subtract(num1: float, num2: float) -> float:
    """
    Performs subtraction of the second number from the first.

    Args:
        num1 (float): The number to subtract from.
        num2 (float): The number to subtract.

    Returns:
        float: The difference between num1 and num2.

    Raises:
        TypeError: If either num1 or num2 is not a valid number (int or float).
    """
    if not isinstance(num1, (int, float)) or not isinstance(num2, (int, float)):
        logger.error(f"Invalid input types for subtract operation: num1={num1} (type={type(num1)}), num2={num2} (type={type(num2)})")
        raise TypeError("Both inputs must be numbers (integers or floats).")
        
    result = num1 - num2
    logger.info(f"Performed subtraction: {num1} - {num2} = {result}")
    return result

def multiply(num1: float, num2: float) -> float:
    """
    Performs multiplication of two numbers.

    Args:
        num1 (float): The first number.
        num2 (float): The second number.

    Returns:
        float: The product of num1 and num2.

    Raises:
        TypeError: If either num1 or num2 is not a valid number (int or float).
    """
    if not isinstance(num1, (int, float)) or not isinstance(num2, (int, float)):
        logger.error(f"Invalid input types for multiply operation: num1={num1} (type={type(num1)}), num2={num2} (type={type(num2)})")
        raise TypeError("Both inputs must be numbers (integers or floats).")
        
    result = num1 * num2
    logger.info(f"Performed multiplication: {num1} * {num2} = {result}")
    return result

def divide(num1: float, num2: float) -> float:
    """
    Performs division of the first number by the second number.

    Args:
        num1 (float): The numerator.
        num2 (float): The denominator.

    Returns:
        float: The quotient of num1 and num2.

    Raises:
        TypeError: If either num1 or num2 is not a valid number (int or float).
        ValueError: If num2 is zero, indicating division by zero.
    """
    if not isinstance(num1, (int, float)) or not isinstance(num2, (int, float)):
        logger.error(f"Invalid input types for divide operation: num1={num1} (type={type(num1)}), num2={num2} (type={type(num2)})")
        raise TypeError("Both inputs must be numbers (integers or floats).")
        
    if num2 == 0:
        logger.error(f"Attempted division by zero: num1={num1}, num2={num2}")
        raise ValueError("Cannot divide by zero.")
        
    result = num1 / num2
    logger.info(f"Performed division: {num1} / {num2} = {result}")
    return result