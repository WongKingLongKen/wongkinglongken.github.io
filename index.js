import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, onValue, remove } from "firebase/database";
import config from './config.js';

const firebaseConfig = process.env.NODE_ENV === 'production' 
    ? config 
    : {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
    };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

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

function addTask(task, isCompleted = false) {
    const taskId = Date.now().toString(); // unique ID for each task
    
    // Save to Firebase
    set(ref(db, 'tasks/' + taskId), {
        text: task,
        completed: isCompleted,
        timestamp: taskId
    });
}

// Listen for tasks from Firebase
onValue(ref(db, 'tasks'), (snapshot) => {
    todoList.innerHTML = ''; // Clear current list
    
    const tasks = snapshot.val();
    if (tasks) {
        Object.entries(tasks).forEach(([taskId, taskData]) => {
            createTaskElement(taskId, taskData);
        });
    }
});

function createTaskElement(taskId, taskData) {
    const listItem = document.createElement('li');
    listItem.dataset.id = taskId;
    
    const taskContainer = document.createElement('div');
    taskContainer.className = 'task-content';
    
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = taskData.text;
    taskContainer.appendChild(taskText);
    
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'task-controls';
    
    const checkBox = document.createElement('input');
    checkBox.setAttribute('type', 'checkbox');
    checkBox.checked = taskData.completed;
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

    if (taskData.completed) {
        taskText.style.textDecoration = 'line-through';
    }
    
    checkBox.addEventListener('change', function() {
        const newStatus = this.checked;
        set(ref(db, `tasks/${taskId}/completed`), newStatus);
        taskText.style.textDecoration = newStatus ? 'line-through' : 'none';
    });
    
    deleteButton.addEventListener('click', function() {
        remove(ref(db, 'tasks/' + taskId));
    });
    
    editButton.addEventListener('click', function() {
        const isEditing = listItem.classList.contains('editing');
        
        if (isEditing) {
            const input = taskContainer.querySelector('input[type="text"]');
            if (input && input.value.trim() !== '') {
                set(ref(db, `tasks/${taskId}/text`), input.value);
                taskText.textContent = input.value;
                taskContainer.removeChild(input);
                taskContainer.appendChild(taskText);
                listItem.classList.remove('editing');
                editButton.textContent = 'Edit';
            }
        } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = taskText.textContent;
            taskContainer.removeChild(taskText);
            taskContainer.appendChild(input);
            listItem.classList.add('editing');
            editButton.textContent = 'Save';
            input.focus();

            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && input.value.trim() !== '') {
                    editButton.click();
                }
            });
        }
    });
}