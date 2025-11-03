import heapq

print()
print("-------------------- heapq --------------------")
print()

h = []
heapq.heappush(h, 5)
heapq.heappush(h, 2)
heapq.heappush(h, 7)
heapq.heappush(h, 1)

print(h)
print(f"First element in the heap: {h[0]}")
print(f"Popping an element: {heapq.heappop(h)}")
print(h)

data = [9, 3, 6, 1, 8, 2]
heapq.heapify(data)
print(f"Data turned into heap: {data}")
print(data[0])

print()
print("-------------------- Priority Queue --------------------")
print()

pq = []
heapq.heappush(pq, (2, "task-A"))
heapq.heappush(pq, (1, "task-B"))
heapq.heappush(pq, (1, "task-C"))

while pq:
    pr, tk = heapq.heappop(pq)
    print(f"Priority: {pr}, Task: {tk}")


### Useful heapq functions ###

# heapq.heappush(heap, x)        # push
# heapq.heappop(heap)            # pop min
# heapq.heapify(lst)             # in-place list -> heap (O(n))
# heapq.heappushpop(heap, x)     # push then pop min (faster than push+pop)
# heapq.heapreplace(heap, x)     # pop min then push x (assumes heap non-empty)
# heapq.nsmallest(k, iterable)   # get k smallest (uses heap internally)
# heapq.nlargest(k, iterable)    # get k largest
# heapq.merge(*iterables)        # merge multiple sorted streams (generator)

# for max-heaps negation is simplest or push (-priority, counter, item)

print()
print("-------------------- Priority Scheduler --------------------")
print()

class Scheduler:
    """
    Min-priority scheduler:
        - smaller priority value = runs earlier
        - supports changing priorities and cancellation
    """
    def __init__(self):
        """ Will store priority-task pairs """
        self.heap = []

    def schedule(self, task, priority):
        """ Add a task with a given priority """
        entry = (priority, task)
        heapq.heappush(self.heap, entry)

    def tasks(self):
        """Return a list of (priority, task) sorted by priority (non-destructive)."""
        return sorted(self.heap)

    def __repr__(self):
        items = ", ".join(f"({p}, {t})" for p, t in self.tasks())
        return items

    def peek(self):
        """ Return task with the smallest priority """
        return self.heap[0] if self.heap else None

    def get_priority(self, task):
        """ Return the priority for a given task """
        for p, t in self.heap:
            if t == task:
                return p
        return None

    def change_priority(self, task, new_priority):
        """
        Change the priority of an existing task
        Implementation: replace the tuple and re-heapify
        Returns True if changed, False if not found
        """
        for i, (p,t) in enumerate(self.heap):
            if t == task:
                self.heap[i] = (new_priority, task)
                heapq.heapify(self.heap)
                return True
        return False

    def pop_next(self):
        """ Remove and return the first priority task """
        if not self.heap:
            return None
        return heapq.heappop(self.heap)

my_tasks = Scheduler()
my_tasks.schedule("drink water", 1)
my_tasks.schedule("learn heaps", 2)
my_tasks.schedule("do something", 5)
my_tasks.schedule("eat", 3)
my_tasks.schedule("clean", 3)

print("All of my tasks: ", my_tasks)
print("Next up (peek): ", my_tasks.peek())

print()

my_tasks.change_priority("eat", 0)
print("All tasks after changing the priority of 'eat': ", my_tasks.tasks())
print("Next up (peek):", my_tasks.peek())

print()

my_tasks.pop_next()
print("All tasks after popping: ", my_tasks.tasks())

print()