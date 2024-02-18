const cropList = document.querySelector("#crop-list");
const form = document.querySelector("#add-crop-form");

// create element & render crops
function renderCrop(doc) {
  let li = document.createElement("li");
  let type = document.createElement("span");
  let date = document.createElement("span");
  let cross = document.createElement("div");

  li.setAttribute("data-id", doc.id);
  type.textContent = doc.data().type;
  date.textContent = doc.data().date;
  cross.textContent = "x";

  li.appendChild(type);
  li.appendChild(date);
  li.appendChild(cross);

  cropList.appendChild(li);

  // deleting data
  cross.addEventListener("click", (e) => {
    e.stopPropagation();
    let id = e.target.parentElement.getAttribute("data-id");
    db.collection("crops").doc(id).delete();
  });
}

// saving data
form.addEventListener("submit", (e) => {
  e.preventDefault();
  db.collection("crops").add({
    type: form.type.value,
    date: form.date.value,
  });
  form.type.value = "";
  form.date.value = "";
});

// real-time listener
db.collection("crops")
  .orderBy("type")
  .onSnapshot((snapshot) => {
    let changes = snapshot.docChanges();
    changes.forEach((change) => {
      console.log(change.doc.data());
      if (change.type == "added") {
        renderCrop(change.doc);
      } else if (change.type == "removed") {
        let li = cropList.querySelector("[data-id=" + change.doc.id + "]");
        cropList.removeChild(li);
      }
    });
  });

const cropsList = document.getElementById("crops-list");

db.collection("crops")
  .get()
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const crop = doc.data();
      const cropItem = document.createElement("li");
      cropItem.textContent = crop.name;
      cropItem.addEventListener("click", () => {
        window.location.href = `crop-journal.html?id=${doc.id}`;
      });
      cropsList.appendChild(cropItem);
    });
  })
  .catch((error) => {
    console.error("Error fetching crops:", error);
  });

const urlParams = new URLSearchParams(window.location.search);
const cropId = urlParams.get("id");

if (cropId) {
  const journalEntries = document.getElementById("journal-entries");
  const newEntryForm = document.getElementById("new-entry-form");

  // Fetch and display journal entries:
  db.collection("crops")
    .doc(cropId)
    .collection("journal")
    .orderBy("date", "desc") // Order entries by date (descending)
    .get()
    .then((querySnapshot) => {
      journalEntries.innerHTML = ""; // Clear existing entries before updating

      querySnapshot.forEach((doc) => {
        const entry = doc.data();
        const entryElement = createEntryElement(entry); // Create an element for each entry

        journalEntries.appendChild(entryElement);
      });
    })
    .catch((error) => {
      console.error("Error fetching journal entries:", error);
      // Handle errors by displaying an appropriate message or retrying
    });

  // Handle adding new journal entries:
  newEntryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const date = new Date(document.getElementById("entry-date").value);
    const details = document.getElementById("entry-details").value.trim();

    if (!date || !details) {
      alert("Please fill in both date and details.");
      return;
    }

    db.collection("crops")
      .doc(cropId)
      .collection("journal")
      .add({
        date: firebase.firestore.Timestamp.fromDate(date), // Use timestamp
        details: details,
      })
      .then(() => {
        // Entry added successfully
        newEntryForm.reset(); // Clear the form fields

        console.log("Journal entry added successfully");
      })
      .catch((error) => {
        console.error("Error adding journal entry:", error);
        // Handle errors by displaying an appropriate message or retrying
      });
  });

  // Function to create a journal entry element:
  function createEntryElement(entry) {
    const entryElement = document.createElement("li");
    const dateElement = document.createElement("span");
    const detailsElement = document.createElement("p");

    dateElement.textContent = formatDate(entry.date.toDate()); // Format date using a suitable function
    detailsElement.textContent = entry.details;

    entryElement.appendChild(dateElement);
    entryElement.appendChild(detailsElement);

    // Optionally, add styling or interactive elements:
    // - Highlight recent entries based on date
    // - Add buttons for editing or deleting entries

    return entryElement;
  }

  // Function to format a date (replace with your preferred formatting):
  function formatDate(date) {
    // Implement your date formatting logic here
    // Example: return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
