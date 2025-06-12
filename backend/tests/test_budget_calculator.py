import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.budget_calculator import BudgetCalculator, BudgetRequest


@pytest.fixture
def calculator():
    return BudgetCalculator()


def make_request(**kwargs):
    defaults = {
        "client_name": "John Doe",
        "client_email": "john@example.com",
        "client_phone": "12345",
        "property_name": "Farm",
        "state": "MG",
        "city": "City",
        "vertices_count": 10,
        "property_area": 50.0,
        "client_type": "pessoa_fisica",
        "is_urgent": False,
        "includes_topography": False,
        "includes_environmental": False,
    }
    defaults.update(kwargs)
    return BudgetRequest(**defaults)


def test_base_calculation(calculator):
    request = make_request()
    result = calculator.calculate_budget(request)
    assert result["total_price"] == 500 + 10 * 50


def test_state_multiplier(calculator):
    request = make_request(state="SP")
    result = calculator.calculate_budget(request)
    expected = (500 + 10 * 50) * 1.2
    assert result["total_price"] == expected


def test_urgency_fee(calculator):
    request = make_request(is_urgent=True)
    result = calculator.calculate_budget(request)
    expected = 500 + 10 * 50 + calculator.urgency_fee
    assert result["total_price"] == expected


def test_discount_rules(calculator):
    request = make_request(vertices_count=120, client_type="pessoa_juridica")
    result = calculator.calculate_budget(request)
    subtotal = 500 + 120 * 50
    large_discount = subtotal * 0.10
    after_large_discount = subtotal - large_discount
    pj_discount = after_large_discount * 0.05
    expected = round(after_large_discount - pj_discount, 2)
    assert result["total_price"] == expected
