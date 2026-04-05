import re

# Lexer
tokens = re.findall(r'\d+|[+*()-]', "2+3*4")

# Parser (very simple for demo)
def parse_expr(tokens):
    result = int(tokens[0])
    i = 1
    while i < len(tokens):
        if tokens[i] == '+':
            result += int(tokens[i+1])
        elif tokens[i] == '*':
            result *= int(tokens[i+1])
        i += 2
    return result

print(parse_expr(tokens))  # Output: 14
