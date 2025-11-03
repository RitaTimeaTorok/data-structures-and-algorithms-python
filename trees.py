class Node:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None

class BinarySearchTree:
    def __init__(self):
        self.root = None

    def insert(self, data):
        """ Insert a new value into the BST"""
        if self.root is None:
            self.root = Node(data)
        else:
            self._insert(self.root, data)

    def _insert(self, node, data):
        if data < node.data:
            if node.left is not None:
                self._insert(node.left, data)
            else:
                node.left = Node(data)
        elif data > node.data:
            if node.right is not None:
                self._insert(node.right, data)
            else:
                node.right = Node(data)
        else: # if the data already exists, no duplicates
            pass

    def search(self, data):
        """ Returns True if the data exists, False if not """
        return self._search(self.root, data)

    def _search(self, node, data):
        if node is None:
            return False
        if node.data == data:
            return True

        if data < node.data:
            return self._search(node.left, data)
        else:
            return self._search(node.right, data)

    def inorder(self):
        self._inorder(self.root)
        print()

    def _inorder(self, node):
        if node is None:
            return
        self._inorder(node.left)
        print(node.data, end=" ")
        self._inorder(node.right)

    def preorder(self):
        self._preorder(self.root)
        print()

    def _preorder(self, node):
        if node is None:
            return
        print(node.data, end=" ")
        self._preorder(node.left)
        self._preorder(node.right)

    def postorder(self):
        self._postorder(self.root)
        print()

    def _postorder(self, node):
        if node is None:
            return
        self._postorder(node.left)
        self._postorder(node.right)
        print(node.data, end=" ")

    def print_tree(self, node=None, indent="", last=True):
        if node is None:
            node = self.root
        if node is not None:
            print(indent + ("└─ " if last else "├─ ") + str(node.data))
            indent += "   " if last else "│  "
            children = [c for c in (node.left, node.right) if c]
            for i, child in enumerate(children):
                self.print_tree(child, indent, i == len(children) - 1)

    def delete(self, data):
        """Delete a node from the BST."""
        self.root = self._delete(self.root, data)

    def _delete(self, node, data):
        if node is None:
            return None

        if data < node.data:
            node.left = self._delete(node.left, data)
        elif data > node.data:
            node.right = self._delete(node.right, data)
        else:
            # Case 1: no child or one child
            if node.left is None:
                return node.right
            elif node.right is None:
                return node.left

            # Case 2: two children → find inorder successor
            successor = self._min_value_node(node.right)
            node.data = successor.data
            node.right = self._delete(node.right, successor.data)

        return node

    def _min_value_node(self, node):
        current = node
        while current.left is not None:
            current = current.left
        return current


bst = BinarySearchTree()
for value in [50, 30, 70, 20, 40, 60, 80, 10, 5]:
    bst.insert(value)

print("Tree structure:")
bst.print_tree()
print()

bst.delete(5)

print("Tree structure after deleting 5:")
bst.print_tree()
print()

print("Inorder: ", end=" ")
bst.inorder()

print("Preorder: ", end=" ")
bst.preorder()

print("Postorder: ", end=" ")
bst.postorder()