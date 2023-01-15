import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getTodos, addTodo, updateTodo, deleteTodo } from "../../api/todosApi";
import { FaUpload } from "react-icons/fa";
import Todo from "./Todo";

const TodoList = () => {
  const [newTodo, setNewTodo] = useState("");
  const queryClient = useQueryClient();

  const {
    isLoading,
    isError,
    error,
    data: todos,
  } = useQuery("todos", getTodos);

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
    content = todos.map((todo) => {
      return (
        <Todo
          key={todo.id}
          todo={todo}
          updateTodo={() =>
            updateTodoMutation.mutate({ ...todo, completed: !todo.completed })
          }
          deleteTodo={() => deleteTodoMutation.mutate({id: todo.id})}
        />
      );
    });
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
