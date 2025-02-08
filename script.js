// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const choreForm = document.getElementById('chore-form');
  const choreInput = document.getElementById('chore-input');
  const choreList = document.getElementById('chore-list');

  // Function to add a new chore
  function addChore(choreText) {
    const li = document.createElement('li');

    // Create checkbox for completion
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', () => {
      li.classList.toggle('completed', checkbox.checked);
    });

    // Create span to hold chore text
    const span = document.createElement('span');
    span.textContent = choreText;

    // Delete button to remove chore
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete';
    deleteBtn.addEventListener('click', () => {
      choreList.removeChild(li);
    });

    // Append children to li in proper order
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    choreList.appendChild(li);
  }

  // Form submission to add new chore
  choreForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const choreText = choreInput.value.trim();
    if (choreText !== '') {
      addChore(choreText);
      choreInput.value = ''; // clear input after adding
    }
  });
});
