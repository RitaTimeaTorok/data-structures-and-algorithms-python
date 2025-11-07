from flask import Flask, render_template  # type: ignore
from routes.sorting_routes import sorting_blueprint
from routes.upload_routes import upload_blueprint
from routes.data_structures_routes import ds_blueprint
import random

app = Flask(__name__)

app.register_blueprint(sorting_blueprint)
app.register_blueprint(upload_blueprint)
app.register_blueprint(ds_blueprint)


@app.route("/")
def index():
    random_array = [random.randint(1, 100) for _ in range(10)]
    stack_init = [random.randint(5, 99) for _ in range(7)]
    queue_init = [random.randint(5, 99) for _ in range(7)]
    linked_init = [random.randint(5, 99) for _ in range(6)]

    return render_template(
        "index.html",
        array=random_array,
        stack_init=stack_init,
        queue_init=queue_init,
        linked_init=linked_init,
    )


if __name__ == "__main__":
    app.run(debug=True)
