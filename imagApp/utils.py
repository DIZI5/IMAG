import re
from .models import Product, MainGroup, Subsystem

def serial_sort_key_group(s):
    # Для груп: якщо починається з букви — перший
    if re.match(r"^[A-Za-z]", s):
        return (0, s)
    m = re.match(r"(\d+)([A-Za-z]?)$", s)
    if m:
        num = int(m.group(1))
        letter = m.group(2) or ""
        return (1, num, letter)
    return (2, s)

def serial_sort_key_product(s):
    # Для підпунктів: просто число + літера в кінці
    m = re.match(r"(\d+)([A-Za-z]?)$", s)
    if m:
        num = int(m.group(1))
        letter = m.group(2) or ""
        return (num, letter)
    return (s,)