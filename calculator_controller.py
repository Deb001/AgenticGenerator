from calculator_view import CalculatorView
from calculator_model import CalculatorModel

class CalculatorController:
    def __init__(self):
        self.view = CalculatorView()
        self.model = CalculatorModel()
        self.view.set_controller(self)
    
    def handle_button_click(self, event):
        button_text = event.widget['text']
        
        if button_text == 'C':
            self.model.clear()
        elif button_text in ('+', '-', '*', '/'):
            self.model.set_operator(button_text)
            self.model.store_number(float(self.view.get_display_value()))
            self.view.update_display('0')
        elif button_text == '=':
            try:
                result = self.model.calculate()
                self.view.update_display(str(result))
            except ZeroDivisionError:
                self.view.show_error("Cannot divide by zero")
        else:
            current_value = self.view.get_display_value()
            if current_value == '0':
                current_value = ''
            self.view.update_display(current_value + button_text)

if __name__ == "__main__":
    controller = CalculatorController()
    controller.view.start()