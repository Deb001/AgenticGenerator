import tkinter as tk
from calculator_controller import Controller

class CalculatorUI:
    def __init__(self, root):
        self.root = root
        self.controller = Controller()
        self.create_ui()
    
    def create_ui(self):
        self.root.title("Calculator")
        self.entry = tk.Entry(self.root, width=20)
        self.entry.grid(row=0, column=0, columnspan=4)
        
        buttons = [
            '7', '8', '9', '/',
            '4', '5', '6', '*',
            '1', '2', '3', '-',
            '0', '.', '=', '+',
            'C'
        ]
        
        row_index = 1
        col_index = 0
        
        for button in buttons:
            btn = tk.Button(self.root, text=button, width=5)
            btn.grid(row=row_index, column=col_index)
            btn.bind('<Button-1>', self.on_click)
            col_index += 1
            if col_index > 3:
                col_index = 0
                row_index += 1
        
    def on_click(self, event):
        button = event.widget['text']
        if button == 'C':
            self.entry.delete(0, tk.END)
        elif button == '=':
            try:
                result = str(eval(self.entry.get()))
                self.entry.delete(0, tk.END)
                self.entry.insert(tk.END, result)
            except Exception as e:
                self.entry.delete(0, tk.END)
                self.entry.insert(tk.END, "Error")
        else:
            self.entry.insert(tk.END, button)

if __name__ == "__main__":
    root = tk.Tk()
    app = CalculatorUI(root)
    root.mainloop()