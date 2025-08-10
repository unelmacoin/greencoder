# Test Python file for Green Coder extension
import os
import sys

def inefficient_function():
    # This will trigger some sustainability issues
    global global_var  # This will trigger the global variable issue
    global_var = "test"
    
    # Inefficient loop pattern
    items = ["a", "b", "c", "d", "e"]
    for i in range(len(items)):  # This will trigger the range(len()) issue
        print(f"Item {i}: {items[i]}")
    
    # List concatenation in loop
    result = []
    for item in items:
        result = result + [item.upper()]  # This will trigger the list concatenation issue
    
    # String concatenation in loop
    text = ""
    for item in items:
        text = text + item  # This will trigger the string concatenation issue
    
    return result, text

def efficient_function():
    # This is more efficient
    items = ["a", "b", "c", "d", "e"]
    
    # Use enumerate instead of range(len())
    for i, item in enumerate(items):
        print(f"Item {i}: {item}")
    
    # Use list comprehension instead of concatenation
    result = [item.upper() for item in items]
    
    # Use join instead of string concatenation
    text = "".join(items)
    
    return result, text

if __name__ == "__main__":
    print("Testing Green Coder extension...")
    inefficient_function()
    efficient_function() 