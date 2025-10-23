/* public/app.js - Frontend logic for item CRUD operations */
'use strict';

/* DOM element references */
const itemsList = document.getElementById('items-list');
const itemForm = document.getElementById('item-form');
const messageBox = document.getElementById('message');
const submitBtn = itemForm.querySelector('button[type="submit"]');

/* Utility: display a temporary message */
function showMessage(msg, type = 'success') {
    clearTimeout(showMessage._timer);
    messageBox.textContent = msg;
    messageBox.className = ''; // reset classes
    messageBox.classList.add(type === 'error' ? 'error' : 'success');
    showMessage._timer = setTimeout(() => {
        messageBox.textContent = '';
        messageBox.className = '';
    }, 3000);
}

/* Render a single item as <li> with Edit/Delete controls */
function renderItem(item) {
    const li = document.createElement('li');
    li.dataset.id = item.id;
    li.innerHTML = `
        <strong>${escapeHTML(item.title)}</strong><br>
        <span>${escapeHTML(item.body)}</span>
        <div class="actions">
            <button type="button" class="edit-btn">Edit</button>
            <button type="button" class="delete-btn">Delete</button>
        </div>
    `;
    return li;
}

/* Escape HTML to prevent XSS when inserting user-provided data */
function escapeHTML(str) {
    return String(str).replace(/[&<>"'`=\/]/g, s => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#x60;',
        '=': '&#x3D;',
        '/': '&#x2F;'
    })[s]);
}

/* Fetch all items from the server and render them */
async function fetchItems() {
    try {
        const res = await fetch('/api/items');
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to fetch items');
        }
        const items = await res.json();
        itemsList.innerHTML = '';
        items.forEach(item => itemsList.appendChild(renderItem(item)));
    } catch (e) {
        showMessage(e.message, 'error');
    }
}

/* Populate the form for editing an existing item */
function handleEdit(item) {
    itemForm.elements.title.value = item.title;
    itemForm.elements.body.value = item.body;
    itemForm.elements.id.value = item.id; // hidden field
    submitBtn.textContent = 'Update';
}

/* Delete an item by id */
async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
        const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Delete failed');
        }
        showMessage('Item deleted successfully');
        await fetchItems();
    } catch (e) {
        showMessage(e.message, 'error');
    }
}

/* Submit handler for create or update */
async function handleFormSubmit(event) {
    event.preventDefault();
    const { title, body, id } = itemForm.elements;
    const payload = {
        title: title.value.trim(),
        body: body.value.trim()
    };
    if (!payload.title || !payload.body) {
        showMessage('Title and body are required', 'error');
        return;
    }

    const isUpdate = id.value;
    const url = isUpdate ? `/api/items/${id.value}` : '/api/items';
    const method = isUpdate ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Operation failed');
        }
        showMessage(isUpdate ? 'Item updated' : 'Item created');
        itemForm.reset();
        submitBtn.textContent = 'Create';
        await fetchItems();
    } catch (e) {
        showMessage(e.message, 'error');
    }
}

/* Event delegation for Edit/Delete buttons */
itemsList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const li = btn.closest('li');
    if (!li) return;
    const id = li.dataset.id;

    if (btn.classList.contains('edit-btn')) {
        // Retrieve the item data from the server to ensure freshness
        try {
            const res = await fetch(`/api/items/${id}`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to load item');
            }
            const item = await res.json();
            handleEdit(item);
        } catch (e) {
            showMessage(e.message, 'error');
        }
    } else if (btn.classList.contains('delete-btn')) {
        await handleDelete(id);
    }
});

/* Initialize on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
    fetchItems();
    itemForm.addEventListener('submit', handleFormSubmit);
});