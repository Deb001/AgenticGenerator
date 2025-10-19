import calculator_view as cv
import calculator_model as cm
import calculator_controller as cc

def main():
    # Initialize the application by calling main() function from calculator_view.
    view = cv.CalculatorView()
    model = cm.CalculatorModel()
    controller = cc.CalculatorController(view, model)
    
    # Start the user interface
    view.start()

if __name__ == "__main__":
    main()