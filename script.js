const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

// Listener for form submission
todoForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const newTask = todoInput.value;
  
  if (newTask === '') {
    alert('Please enter a task!');
    return;
  }
  
  todoInput.value = '';
  addTask(newTask);
});

// Add new task
function addTask(task, isCompleted = false) {
  const listItem = document.createElement('li');
  const taskText = document.createElement('span');
  taskText.textContent = task;
  listItem.appendChild(taskText);
  
  const checkBox = document.createElement('input');
  checkBox.setAttribute('type', 'checkbox');
  checkBox.checked = isCompleted;
  listItem.appendChild(checkBox);
  
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  listItem.appendChild(deleteButton);
  
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  listItem.appendChild(editButton);
  
  todoList.appendChild(listItem);

  if (isCompleted) {
    taskText.style.textDecoration = 'line-through';
  }
  
  checkBox.addEventListener('change', function() {
    if (this.checked) {
      taskText.style.textDecoration = 'line-through';
    } else {
      taskText.style.textDecoration = 'none';
    }
    saveTasksToLocalStorage();
  });
  
  deleteButton.addEventListener('click', function() {
    todoList.removeChild(listItem);
    saveTasksToLocalStorage();
  });
  
  editButton.addEventListener('click', function() {
    const isEditing = listItem.classList.contains('editing');
    if (isEditing) {
      const input = listItem.querySelector('input[type="text"]');
      taskText.textContent = input.value;
      listItem.removeChild(input);
      listItem.classList.remove('editing');
      editButton.textContent = 'Edit';
      saveTasksToLocalStorage();
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = taskText.textContent;
      listItem.insertBefore(input, taskText);
      listItem.removeChild(taskText);
      listItem.classList.add('editing');
      editButton.textContent = 'Save';
      input.focus();

      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          editButton.click();
        }
      });
    }
  });
  
  saveTasksToLocalStorage();
}

function saveTasksToLocalStorage() {
  const tasks = [];
  document.querySelectorAll('#todo-list li').forEach(task => {
    const taskText = task.querySelector('span').textContent;
    const isCompleted = task.querySelector('input[type="checkbox"]').checked;
    tasks.push({ text: taskText, completed: isCompleted });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

document.addEventListener('DOMContentLoaded', function() {
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  savedTasks.forEach(task => {
    addTask(task.text, task.completed);
  });
});
