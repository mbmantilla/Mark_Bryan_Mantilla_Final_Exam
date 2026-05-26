async function fetchStudents() {
  const res = await fetch('/api/students');
  return res.json();
}

function qs(selector, root = document) {
  return root.querySelector(selector);
}

async function renderTable() {
  const tbody = qs('#students-table tbody');
  tbody.innerHTML = '';
  const students = await fetchStudents();
  for (const s of students) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.id}</td>
      <td>${s.student_id}</td>
      <td>${s.full_name}</td>
      <td>${s.course}</td>
      <td>${s.year_level}</td>
      <td>${s.email}</td>
      <td>
        <button data-id="${s.id}" class="edit">Edit</button>
        <button data-id="${s.id}" class="delete">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

async function onSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const payload = {
    student_id: data.student_id,
    full_name: data.full_name,
    course: data.course,
    year_level: data.year_level,
    email: data.email
  };
  try {
    if (data.id) {
      const res = await fetch(`/api/students/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw await res.json();
    } else {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw await res.json();
    }
    form.reset();
    qs('input[name="id"]').value = '';
    await renderTable();
  } catch (err) {
    alert(err && err.error ? err.error : 'An error occurred');
  }
}

async function onTableClick(e) {
  if (e.target.classList.contains('edit')) {
    const id = e.target.dataset.id;
    const res = await fetch(`/api/students/${id}`);
    if (!res.ok) return alert('Failed to fetch');
    const s = await res.json();
    qs('input[name="student_id"]').value = s.student_id;
    qs('input[name="full_name"]').value = s.full_name;
    qs('input[name="course"]').value = s.course;
    qs('input[name="year_level"]').value = s.year_level;
    qs('input[name="email"]').value = s.email;
    qs('input[name="id"]').value = s.id;
  }
  if (e.target.classList.contains('delete')) {
    if (!confirm('Delete this student?')) return;
    const id = e.target.dataset.id;
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    if (!res.ok) return alert('Failed to delete');
    await renderTable();
  }
}

function onReset() {
  qs('#student-form').reset();
  qs('input[name="id"]').value = '';
}

document.addEventListener('DOMContentLoaded', async () => {
  qs('#student-form').addEventListener('submit', onSubmit);
  qs('#reset-btn').addEventListener('click', onReset);
  qs('#students-table').addEventListener('click', onTableClick);
  await renderTable();
});
