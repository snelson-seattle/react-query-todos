import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getTodos, addTodo, updateTodo, deleteTodo } from "../../api/todosApi";
import { FaTrash, FaUpload } from "react-icons/fa";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import { StrictModeDroppable as Droppable } from "../../helpers/strictModeDroppable";

const TodoList = () => {
  const [newTodo, setNewTodo] = useState("");
  const queryClient = useQueryClient();

  const { isLoading, isError, error, data } = useQuery("todos", getTodos, {
    // The select will allow you to modify your data,
    // This will sort the todos in reverse order (newest at the top)
    select: (data) => data.sort((a, b) => b.id - a.id),
  });

  const [todos, setTodos] = useState(data || []);

  useEffect(() => {
    const arrayIdsOrder = JSON.parse(localStorage.getItem("taskOrder"));

    // If there is data, but no array of task ids in correct order
    if (!arrayIdsOrder && data?.length) {
      const idsOrderArray = data.map((item) => item.id);
      localStorage.setItem("taskOrder", JSON.stringify(idsOrderArray));
    }

    let myTaskArray;
    if (arrayIdsOrder?.length && data?.length) {
      // map over data array and sort by correct position
      myTaskArray = arrayIdsOrder.map((position) => {
        return data.find((item) => item.id === position);
      });

      const newItems = data.filter((item) => {
        return !arrayIdsOrder.includes(item.id);
      });

      if (newItems?.length) {
        myTaskArray = [...newItems, ...myTaskArray];
      }
    }

    setTodos(myTaskArray || data);
  }, [data]);

  const addTodoMutation = useMutation(addTodo, {
    onSuccess: () => {
      // Invalidates the cache and triggers a refetch
      queryClient.invalidateQueries("todos");
    },
  });

  const updateTodoMutation = useMutation(updateTodo, {
    onSuccess: () => {
      // Invalidates the cache and triggers a refetch
      queryClient.invalidateQueries("todos");
    },
  });

  const deleteTodoMutation = useMutation(deleteTodo, {
    onSuccess: () => {
      // Invalidates the cache and triggers a refetch
      queryClient.invalidateQueries("todos");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addTodoMutation.mutate({
      userId: 1,
      name: newTodo,
      completed: false,
    });
    setNewTodo("");
  };

  const handleDelete = (id) => {
    const arrayIdsOrder = JSON.parse(localStorage.getItem("taskOrder"));

    if (arrayIdsOrder?.length) {
      const newIdsOrderArray = arrayIdsOrder.filter((num) => num !== id);
      localStorage.setItem("taskOrder", JSON.stringify(newIdsOrderArray));
    }

    deleteTodoMutation.mutate({ id });
  };

  const handleDragEnd = (result) => {
    if (!result?.destination) {
      return;
    }

    const tasks = [...todos];

    const [reorderedItem] = tasks.splice(result.source.index, 1);

    tasks.splice(result.destination.index, 0, reorderedItem);

    const idsOrderArray = tasks.map((task) => task.id);
    localStorage.setItem("taskOrder", JSON.stringify(idsOrderArray));

    setTodos(tasks);
  };

  const newItemSection = (
    <form onSubmit={handleSubmit}>
      <label htmlFor="new-todo">Enter a new todo item</label>
      <div className="new-todo">
        <input
          type="text"
          id="new-todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter a new todo"
        />
      </div>
      <button className="submit">
        <FaUpload />
      </button>
    </form>
  );

  let content = "";
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isError) {
    content = <p>{error.message}</p>;
  } else {
    content = content = (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <section {...provided.droppableProps} ref={provided.innerRef}>
              {todos.map((todo, index) => {
                return (
                  <Draggable
                    key={todo.id}
                    draggableId={todo.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <article
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                      >
                        <div className="todo">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            id={todo.id}
                            onChange={() =>
                              updateTodoMutation.mutate({
                                ...todo,
                                completed: !todo.completed,
                              })
                            }
                          />
                          <label htmlFor={todo.id}>{todo.name}</label>
                        </div>
                        <button
                          className="trash"
                          onClick={() => handleDelete(todo.id)}
                        >
                          <FaTrash />
                        </button>
                      </article>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </section>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  return (
    <main>
      <h1>Todo List</h1>
      {newItemSection}
      {content}
    </main>
  );
};

export default TodoList;
