from array import array
from struct import pack, unpack

a = array("i", [1, 2, 3, 4])

print(f"a: {a}")
print(f"type of a is {type(a)}")
print(f"how many bytes does the data type occupy: {array("i").itemsize}")

print()

b = array("i", [2 ** i for i in range(8)])
print(f"b: {b}")

print()

c = array("d", (1.4, 2.8, 4, 5.6))
print(f"c: {c}")
print(f"how many bytes does the data type occupy: {array("d").itemsize}")

print()

# this is deprecated -> only numeric data now
# d = array("u", "coffee")
d = array("b", b"coffee")
print(f"d: {d}")
print(f"how many bytes does the data type occupy: {array("b").itemsize}")

print()
print("------------------------------------------------------")
print()

fibonacci_numbers = array("I", [1, 1, 2, 3, 5, 8, 13, 21, 34, 55])
print(f"some fibonacci numbers: {fibonacci_numbers}")
print(len(fibonacci_numbers))
print(sum(fibonacci_numbers))

for i, number in enumerate(fibonacci_numbers):
    print(f"fibonacci_numbers[{i}] = {number}")

print(f"the last number of the sequence: {fibonacci_numbers[-1]}")
print(f"number of 1s: {fibonacci_numbers.count(1)}")
print(f"what is the index of the number 13: {fibonacci_numbers.index(13)}")

print()
print("------------------------------------------------------")
print()

def save(filename, numbers):
    with open(filename, mode="wb") as file:
        file.write(numbers.typecode.encode("ascii"))
        file.write(pack("<I", len(numbers)))
        numbers.tofile(file)

def load(filename):
    with open(filename, mode="rb") as file:
        typecode = file.read(1).decode("ascii")
        (length,) = unpack("<I", file.read(4))
        numbers = array(typecode)
        numbers.fromfile(file, length)
        return numbers

save("binary.data", array("H", [12, 42, 7, 15, 42, 38, 21]))
loaded = load("binary.data")
print(loaded)