import {FaTrash} from "react-icons/fa";

const Todo = ({todo, updateTodo, deleteTodo}) => {
  return (
    <article>
        <div className="todo">
            <input type="checkbox" checked={todo.completed} id={todo.id} onChange={updateTodo} />
            <label htmlFor={todo.id}>{todo.name}</label>
        </div>
        <button className="trash" onClick={deleteTodo}>
            <FaTrash />
        </button>
    </article>
  )
}

export default Todo