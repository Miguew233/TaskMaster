  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  const taskForm = document.getElementById('task-form');
  let tasks = [];

  // Load tasks from localStorage
  function loadTasks() {
    const stored = localStorage.getItem('taskmaster-tasks');
    if(stored) {
      tasks = JSON.parse(stored);
    } else {
      tasks = [];
    }
  }

  // Save tasks to localStorage
  function saveTasks() {
    localStorage.setItem('taskmaster-tasks', JSON.stringify(tasks));
  }

  // Render tasks to the DOM
  function renderTasks() {
    taskList.innerHTML = '';
    if(tasks.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.textContent = 'Nenhuma tarefa cadastrada. Adicione uma nova!';
      emptyMsg.style.color = '#ccc';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.padding = '1rem 0';
      taskList.appendChild(emptyMsg);
      return;
    }
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.setAttribute('data-id', task.id);
      li.className = task.completed ? 'completed' : '';

      // Task text (click to toggle complete)
      const span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.text;
      span.setAttribute('tabindex', '0');
      span.setAttribute('role', 'button');
      span.setAttribute('aria-pressed', task.completed ? 'true' : 'false');
      span.title = 'Clique para marcar/desmarcar concluído';
      span.addEventListener('click', () => toggleComplete(task.id));
      span.addEventListener('keypress', (e) => {
        if(e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleComplete(task.id);
        }
      });
      li.appendChild(span);

      // Buttons group (edit, delete)
      const btnGroup = document.createElement('div');
      btnGroup.className = 'btn-group';

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.setAttribute('aria-label', 'Editar tarefa');
      editBtn.title = 'Editar tarefa';
      editBtn.innerHTML = '✏️';
      editBtn.addEventListener('click', () => startEdit(task.id));
      btnGroup.appendChild(editBtn);

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.setAttribute('aria-label', 'Excluir tarefa');
      delBtn.title = 'Excluir tarefa';
      delBtn.innerHTML = '🗑️';
      delBtn.addEventListener('click', () => deleteTask(task.id));
      btnGroup.appendChild(delBtn);

      li.appendChild(btnGroup);

      taskList.appendChild(li);
    });
  }

  // Add new task
  function addTask(text) {
    if(text.trim() === '') return;
    const newTask = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
  }

  // Toggle complete status of a task
  function toggleComplete(id) {
    const idx = tasks.findIndex(t => t.id === id);
    if(idx !== -1) {
      tasks[idx].completed = !tasks[idx].completed;
      saveTasks();
      renderTasks();
    }
  }

  // Delete a task
  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }

  // Start editing a task
  function startEdit(id) {
    const li = document.querySelector(`li[data-id="${id}"]`);
    if(!li) return;
    const span = li.querySelector('.task-text');
    const oldText = span.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = oldText;
    input.setAttribute('aria-label', 'Editar texto da tarefa');
    li.replaceChild(input, span);
    input.focus();

    input.addEventListener('blur', () => finishEdit(id, input.value));
    input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') {
        e.preventDefault();
        finishEdit(id, input.value);
      } else if(e.key === 'Escape') {
        e.preventDefault();
        cancelEdit(id, oldText);
      }
    });
  }

  // Finish editing a task
  function finishEdit(id, newText) {
    const idx = tasks.findIndex(t => t.id === id);
    if(idx === -1) return;
    if(newText.trim() === '') {
      // if empty after edit, delete the task
      deleteTask(id);
      return;
    }
    tasks[idx].text = newText.trim();
    saveTasks();
    renderTasks();
  }

  // Cancel editing
  function cancelEdit(id, oldText) {
    const li = document.querySelector(`li[data-id="${id}"]`);
    if(!li) return;
    const input = li.querySelector('.edit-input');
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = oldText;
    span.setAttribute('tabindex', '0');
    span.setAttribute('role', 'button');
    span.title = 'Clique para marcar/desmarcar concluído';
    span.addEventListener('click', () => toggleComplete(id));
    li.replaceChild(span, input);
  }

  taskForm.addEventListener('submit', e => {
    e.preventDefault();
    addTask(taskInput.value);
    taskInput.value = '';
    taskInput.focus();
  });

  // Initialize app
  loadTasks();
  renderTasks();