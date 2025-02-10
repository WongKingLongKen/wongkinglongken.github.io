const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

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
  
  // Create container for task content
  const taskContainer = document.createElement('div');
  taskContainer.className = 'task-content';
  
  const taskText = document.createElement('span');
  taskText.className = 'task-text';
  taskText.textContent = task;
  taskContainer.appendChild(taskText);
  
  // Create container for controls
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'task-controls';
  
  const checkBox = document.createElement('input');
  checkBox.setAttribute('type', 'checkbox');
  checkBox.checked = isCompleted;
  controlsContainer.appendChild(checkBox);
  
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  controlsContainer.appendChild(editButton);
  
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  controlsContainer.appendChild(deleteButton);

  listItem.appendChild(taskContainer);
  listItem.appendChild(controlsContainer);
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
      // Save the edited task
      const input = taskContainer.querySelector('input[type="text"]');
      if (input && input.value.trim() !== '') {
        taskText.textContent = input.value;
        taskContainer.removeChild(input);
        taskContainer.appendChild(taskText);
        listItem.classList.remove('editing');
        editButton.textContent = 'Edit';
        saveTasksToLocalStorage();       
      }
    } else {
      // Enter edit mode
      const input = document.createElement('input');
      input.type = 'text';
      input.value = taskText.textContent;
      taskContainer.removeChild(taskText);
      taskContainer.appendChild(input);
      listItem.classList.add('editing');
      editButton.textContent = 'Save';
      input.focus();

      // Save on pressing Enter key
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            if (input.value.trim() !== '') {
                editButton.click();
            }
        }
    });
}
});
  
  saveTasksToLocalStorage();
}

function saveTasksToLocalStorage() {
  const tasks = [];
  document.querySelectorAll('#todo-list li').forEach(task => {
      const taskText = task.querySelector('.task-text')?.textContent;
      const isCompleted = task.querySelector('input[type="checkbox"]').checked;
      if (taskText) {
          tasks.push({ text: taskText, completed: isCompleted });
      }
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

document.addEventListener('DOMContentLoaded', function() {
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  savedTasks.forEach(task => {
      addTask(task.text, task.completed);
  });
});
