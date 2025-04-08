document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.getElementById('body');
  
    const editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    const editTitle = document.getElementById('edit-title');
    const editDesc = document.getElementById('edit-description');
    const editId = document.getElementById('edit-id');
    const saveEditBtn = document.getElementById('save-edit-btn');
  
    if (localStorage.getItem('darkMode') === 'enabled') {
      darkModeToggle.checked = true;
      body.classList.replace('bg-light', 'bg-dark');
    }
  
    darkModeToggle.addEventListener('change', () => {
      if (darkModeToggle.checked) {
        body.classList.replace('bg-light', 'bg-dark');
        localStorage.setItem('darkMode', 'enabled');
      } else {
        body.classList.replace('bg-dark', 'bg-light');
        localStorage.setItem('darkMode', 'disabled');
      }
    });
  
    function loadTasks() {
      taskList.innerHTML = '';
      fetch('/api/tasks/')
        .then(res => res.json())
        .then(tasks => tasks.forEach(addTaskToList));
    }
  
    function addTaskToList(task) {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <div>
          <strong>${task.title}</strong><br>
          <small>${task.description}</small>
        </div>
        <div>
          <button class="btn btn-warning btn-sm me-2 edit-btn" data-id="${task.id}" data-title="${task.title}" data-description="${task.description}">Edit</button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${task.id}">Delete</button>
        </div>
      `;
      taskList.appendChild(li);
    }
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
  
      fetch('/api/tasks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      })
        .then(res => res.json())
        .then(data => {
          addTaskToList(data);
          form.reset();
        });
    });
  
    taskList.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-btn')) {
        editId.value = e.target.dataset.id;
        editTitle.value = e.target.dataset.title;
        editDesc.value = e.target.dataset.description;
        editModal.show();
      }
  
      if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        fetch(`/api/tasks/${id}/`, { method: 'DELETE' })
          .then(() => loadTasks());
      }
    });
  
    saveEditBtn.addEventListener('click', () => {
      const id = editId.value;
      const title = editTitle.value;
      const description = editDesc.value;
  
      fetch(`/api/tasks/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      }).then(() => {
        editModal.hide();
        loadTasks();
      });
    });
  
    loadTasks();
  });
  