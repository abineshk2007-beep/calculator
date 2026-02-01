// Calculator Class
class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
    }

    appendNumber(number) {
        // Reset screen after equals or operation
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }

        // Prevent multiple decimal points
        if (number === '.' && this.currentOperand.includes('.')) return;

        // Replace initial zero unless adding decimal
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;

        // If there's a previous operand, calculate first
        if (this.previousOperand !== '') {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;

        // Visual feedback for operator
        this.updateActiveOperator(operation);
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.showError();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Round to avoid floating point errors
        this.currentOperand = this.roundResult(computation).toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;

        // Flash animation
        this.currentOperandElement.classList.add('flash');
        setTimeout(() => {
            this.currentOperandElement.classList.remove('flash');
        }, 200);
    }

    roundResult(number) {
        // Round to 10 decimal places to avoid floating point errors
        return Math.round(number * 10000000000) / 10000000000;
    }

    calculatePercent() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = (current / 100).toString();
        this.updateDisplay();
    }

    showError() {
        this.currentOperand = 'Math Error';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
        setTimeout(() => {
            this.clear();
            this.updateDisplay();
        }, 2000);
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();

        // If it's an error message, return as-is
        if (stringNumber === 'Math Error' || stringNumber === 'Error') {
            return stringNumber;
        }

        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;

        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            // Add thousand separators
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

    updateDisplay() {
        // Handle error state
        if (this.currentOperand === 'Math Error' || this.currentOperand === 'Error') {
            this.currentOperandElement.textContent = this.currentOperand;
            this.previousOperandElement.textContent = '';
            return;
        }

        this.currentOperandElement.textContent =
            this.currentOperand === '' ? '0' : this.getDisplayNumber(this.currentOperand);

        if (this.operation != null) {
            const operatorSymbol = this.getOperatorSymbol(this.operation);
            this.previousOperandElement.textContent =
                `${this.getDisplayNumber(this.previousOperand)} ${operatorSymbol}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }

    getOperatorSymbol(operation) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷'
        };
        return symbols[operation] || operation;
    }

    updateActiveOperator(operation) {
        // Remove active class from all operators
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to current operator
        const activeBtn = document.querySelector(`[data-operator="${operation}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
}

// Initialize Calculator
const previousOperandElement = document.getElementById('previousOperand');
const currentOperandElement = document.getElementById('currentOperand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Number Buttons
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
    });
});

// Operator Buttons
document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operator);
        calculator.updateDisplay();
    });
});

// Action Buttons
document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;

        switch (action) {
            case 'clear':
                calculator.clear();
                document.querySelectorAll('.btn-operator').forEach(btn => {
                    btn.classList.remove('active');
                });
                break;
            case 'delete':
                calculator.delete();
                break;
            case 'equals':
                calculator.compute();
                document.querySelectorAll('.btn-operator').forEach(btn => {
                    btn.classList.remove('active');
                });
                break;
            case 'percent':
                calculator.calculatePercent();
                break;
        }

        calculator.updateDisplay();
    });
});

// Keyboard Support
document.addEventListener('keydown', (e) => {
    // Numbers and decimal
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }

    // Operators
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        calculator.chooseOperation(e.key);
        calculator.updateDisplay();
    }

    // Enter or Equals
    if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculator.compute();
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('active');
        });
        calculator.updateDisplay();
    }

    // Backspace
    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }

    // Escape
    if (e.key === 'Escape') {
        calculator.clear();
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('active');
        });
        calculator.updateDisplay();
    }

    // Percent
    if (e.key === '%') {
        calculator.calculatePercent();
        calculator.updateDisplay();
    }
});

// Initial display
calculator.updateDisplay();
