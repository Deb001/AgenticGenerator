# Web Calculator Project

## Overview
A simple web-based calculator that performs basic arithmetic operations (addition, subtraction, multiplication, division).  
The project includes a responsive UI, core JavaScript logic, and automated tests.

## Features
- **Arithmetic Operations**: Add, subtract, multiply, divide.
- **Responsive Design**: UI adapts to different screen sizes.
- **Error Handling**: Handles division by zero and invalid inputs.
- **Automated Tests**: JavaScript test suite verifies all operations.

## File Structure
/ (root)
│
├─ index.html      # Main calculator UI
├─ style.css       # Styling and responsive layout (M1)
├─ script.js       # Core arithmetic functions & UI handling (S1)
│
├─ test.html       # Test harness page
├─ test.js         # Automated test cases (S2)
│
└─ README.md       # Project documentation (this file)

## Setup & Usage
1. **Open the Calculator**
   - Open `index.html` in any modern web browser.
2. **Perform Calculations**
   - Enter numbers in the input fields.
   - Click the desired operation button (`+`, `-`, `×`, `÷`).
   - The result appears below the buttons.
3. **Responsive Behavior**
   - Resize the browser window or view on a mobile device; the layout adjusts automatically.

## Testing
1. Open `test.html` in a browser.
2. The page automatically loads `script.js` and runs the test suite defined in `test.js`.
3. Test results are displayed on the page, indicating passed/failed cases.

## Development Notes
- **Core Logic (S1)**: Implemented in `script.js` with pure functions (`add`, `subtract`, `multiply`, `divide`).
- **Responsive UI (M1)**: CSS rules in `style.css` use flexbox and media queries.
- **Testing (S2)**: `test.js` contains unit tests for each arithmetic function, including edge cases like division by zero.

## Contributing
Feel free to fork the repository, improve the UI, add more operations, or extend the test coverage. Submit pull requests with clear descriptions of changes.

## License
This project is released under the MIT License.