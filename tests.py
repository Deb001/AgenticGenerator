import unittest
from app import app

class TestApp(unittest.TestCase):
    
    def setUp(self):
        self.app = app.test_client()

    def test_home_route(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)

    def test_portfolio_route(self):
        response = self.app.get('/portfolio')
        self.assertEqual(response.status_code, 200)

    def test_signal_route(self):
        response = self.app.get('/signals')
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()