class HashTable:
    def __init__(self, size=10):
        """
        :param size: It can be set, if it is not define it will be 10
        table: Each slot in the table is actually a list/bucket that can store multiple key-value pairs
        """
        self.size = size
        self.table = [[] for _ in range(size)]

    def _hash(self, key):
        """
        Turns the key into a valid index
        The hash function can return a very large integer
        Our hash table only has limited slots so we shrink the number into a valid index by %
        """
        return hash(key) % self.size

    def set(self, key, value):
        """
        Stores a key-value pair
        If the key already exists, it updates the value, otherwise appends it to a bucket
        """
        index = self._hash(key)
        bucket = self.table[index]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))

    def get(self, key):
        """
        Looks up a key
        It finds the right bucket using the hash than searches that list for the key
        """
        index = self._hash(key)
        bucket = self.table[index]
        for k, v in bucket:
            if k == key:
                return v
        return None

    def __str__(self):
        representation = ""
        for t in self.table:
            representation = representation + str(t) + "\n"
        return representation

ht = HashTable()
ht.set("name", "Timea")
ht.set("age", 23)
ht.set("role", "Developer")
ht.set("mane", "something")
ht.set("color", "Blue")
ht.set("language", "Python")
ht.set("country", "Romania")
ht.set("animal", "Cat")
ht.set("drink", "Coffee")
ht.set("food", "Pasta")
ht.set("project", "AI App")

print(ht.get("name"))
print(ht.get("role"))
print(ht)              # shows internal buckets
