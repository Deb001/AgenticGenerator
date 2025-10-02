// script.js - Basic Arithmetic Calculator JavaScript Logic

class Calculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.initializeCalculator();
    }

    initializeCalculator() {
        this.bindEventListeners();
        this.updateDisplay();
    }

    bindEventListeners() {
        // Number buttons
        document.querySelectorAll('.btn-number').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.textContent);
            });
        });

        // Operation buttons
        document.querySelectorAll('.btn-operation').forEach(button => {
            button.addEventListener('click', () => {
                this.chooseOperation(button.textContent);
            });
        });

        // Special function buttons
        document.getElementById('clear').addEventListener('click', () => {
            this.clear();
        });

        document.getElementById('delete').addEventListener('click', () => {
            this.delete();
        });

        document.getElementById('equals').addEventListener('click', () => {
            this.compute();
        });

        document.getElementById('decimal').addEventListener('click', () => {
            this.appendDecimal();
        });

        // Keyboard support
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardInput(event);
        });
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentInput = '';
            this.shouldResetScreen = false;
        }
        
        if (this.currentInput === '0' && number !== '.') {
            this.currentInput = number;
        } else {
            this.currentInput += number;
        }
        
        this.updateDisplay();
    }

    appendDecimal() {
        if (this.shouldResetScreen) {
            this.currentInput = '0';
            this.shouldResetScreen = false;
        }
        
        if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
        
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentInput === '') return;
        
        if (this.previousInput !== '') {
            this.compute();
        }
        
        this.operation = operation;
        this.previousInput = this.currentInput;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        this.currentInput = computation.toString();
        this.operation = null;
        this.previousInput = '';
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.updateDisplay();
    }

    delete() {
        if (this.currentInput.length === 1) {
            this.currentInput = '0';
        } else {
            this.currentInput = this.currentInput.slice(0, -1);
        }
        this.updateDisplay();
    }

    updateDisplay() {
        const currentDisplay = document.getElementById('current-display');
        const previousDisplay = document.getElementById('previous-display');
        
        currentDisplay.textContent = this.formatDisplayNumber(this.currentInput);
        
        if (this.operation != null) {
            previousDisplay.textContent = `${this.formatDisplayNumber(this.previousInput)} ${this.operation}`;
        } else {
            previousDisplay.textContent = '';
        }
    }

    formatDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3';
        errorElement.style.zIndex = '1050';
        errorElement.textContent = message;
        
        document.body.appendChild(errorElement);
        
        setTimeout(() => {
            errorElement.remove();
        }, 3000);
        
        this.clear();
    }

    handleKeyboardInput(event) {
        if (/[0-9]/.test(event.key)) {
            this.appendNumber(event.key);
        } else if (event.key === '.') {
            this.appendDecimal();
        } else if (event.key === '+' || event.key === '-') {
            this.chooseOperation(event.key);
        } else if (event.key === '*' || event.key === 'x') {
            this.chooseOperation('×');
        } else if (event.key === '/') {
            this.chooseOperation('÷');
        } else if (event.key === 'Enter' || event.key === '=') {
            event.preventDefault();
            this.compute();
        } else if (event.key === 'Escape') {
            this.clear();
        } else if (event.key === 'Backspace') {
            this.delete();
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});