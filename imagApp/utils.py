import re

def serial_sort_key(s):
    m = re.match(r"(\d+)([A-Za-z]?)$", s)
    if m:
        num = int(m.group(1))
        letter = m.group(2) or ""
        return (num, letter)
    return (0, "")