from collections import deque

print()
print("---------------- LINKED LISTS with deque ----------------")
print()

llist = deque("abcde")
print(llist)

llist.append("f")
print(llist)

llist.pop()
print(llist)

llist.appendleft("z")
print(llist)

llist.popleft()
print(llist)

print()
print("---------------- QUEUES ----------------")
print()

my_queue = deque()
my_queue.append("first")
my_queue.append("second")
my_queue.append("third")

print(f"my_queue: {my_queue}")

my_queue.popleft()
print(f"my_queue after removing an element: {my_queue}")

print()
print("---------------- STACKS ----------------")
print()

my_stack = deque()
my_stack.appendleft("first")
my_stack.appendleft("second")
my_stack.appendleft("third")

print(f"my_stack: {my_stack}")

my_stack.popleft()
print(f"my_stack after removing an element: {my_stack}")

print()
print("---------------- LINKED LISTS with my own implementation ----------------")
print()


class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

    def __str__(self):
        return self.data

class LinkedList:
    def __init__(self):
        self.head = None

    def __str__(self):
        node = self.head
        nodes = []
        while node is not None:
            nodes.append(str(node.data))
            node = node.next
        nodes.append("None")
        return " -> ".join(nodes)

    def __iter__(self):
        node = self.head
        while node is not None:
            yield node
            node = node.next

    def add_first(self, node):
        node.next = self.head
        self.head = node

    def add_last(self, node):
        if self.head is None:
            self.head = node
        else:
            current_node = self.head
            while current_node is not None:
                current_node = current_node.next
            current_node.next = node

    def add_after(self, target_node_data, new_node):
        if self.head is None:
            print("List is empty.")
            return
        for node in self:
            if node.data == target_node_data:
                new_node.next = node.next
                node.next = new_node
                return
        print(f"Node with data {target_node_data} was not found.")

    def add_before(self, target_node_data, new_node):
        if self.head is None:
            print("List is empty.")
            return
        if self.head.data == target_node_data:
            self.add_first(new_node)
            return
        for node in self:
            if node.next is not None and node.next.data == target_node_data:
                new_node.next = node.next
                node.next = new_node
                return
        print(f"Node with data {target_node_data} was not found.")

    def remove_node(self, target_node_data):
        if self.head is None:
            print("List is empty.")
            return
        if self.head.data == target_node_data:
            self.head = self.head.next
            return
        prev_node = self.head
        for node in self:
            if node.data == target_node_data:
                prev_node.next = node.next
                return
            prev_node = node
        print(f"Node with data {target_node_data} was not found.")


ll = LinkedList()
ll.add_first(Node("C"))
ll.add_first(Node("B"))
ll.add_first(Node("A"))
print(ll)
ll.add_before("C", Node("X"))
print(ll)
ll.add_before("A", Node("Z"))
print(ll)
ll.add_after("C", Node("Y"))
print(ll)

ll.remove_node("Y")
print(ll)
ll.remove_node("X")
print(ll)
ll.remove_node("Z")
print(ll)
ll.remove_node("Z")
print(ll)