const list = document.querySelector("#post-list");
const form = document.querySelector("#add-post-form");

// create element & render cafe
function render(doc) {
  let li = document.createElement("li");
  let text = document.createElement("span");
  let cross = document.createElement("div");

  li.setAttribute("data-id", doc.id);
  text.textContent = doc.data().text;
  cross.textContent = "x";

  li.appendChild(text);
  li.appendChild(cross);
  list.appendChild(li);

  // deleting data
  cross.addEventListener("click", (e) => {
    e.stopPropagation();
    let id = e.target.parentElement.getAttribute("data-id");
    db.collection("posts").doc(id).delete();
  });
}

// saving data
form.addEventListener("submit", (e) => {
  e.preventDefault();
  db.collection("posts").add({
    text: form.text.value,
  });
  form.text.value = "";
});

// real-time listener
db.collection("posts")
  .orderBy("text")
  .onSnapshot((snapshot) => {
    let changes = snapshot.docChanges();
    changes.forEach((change) => {
      console.log(change.doc.data());
      if (change.type == "added") {
        render(change.doc);
      } else if (change.type == "removed") {
        let li = list.querySelector("[data-id=" + change.doc.id + "]");
        list.removeChild(li);
      }
    });
  });

// updating records (console demo)
// db.collection('posts').doc('DOgwUvtEQbjZohQNIeMr').update({
//     name: 'mario world'
// });

// db.collection('posts').doc('DOgwUvtEQbjZohQNIeMr').update({
//     city: 'hong kong'
// });

// setting data
// db.collection('posts').doc('DOgwUvtEQbjZohQNIeMr').set({
//     city: 'hong kong'
// });
