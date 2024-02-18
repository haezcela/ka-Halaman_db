const urlParams = new URLSearchParams(window.location.search);
const cropId = urlParams.get("id");

if (cropId) {
  // Use the crop ID to fetch crop data from Firestore and populate the page
  db.collection("crops")
    .doc(cropId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const cropData = doc.data();
        // Populate crop details on the page
        const cropDetailsContainer = document.getElementById("crop-details");
        cropDetailsContainer.innerHTML = `
                    <h2>${cropData.type}</h2>
                    <p>Harvest Date: ${cropData.date}</p>
                    <!-- Add more details as needed -->
                `;
      } else {
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.error("Error fetching crop:", error);
    });
} else {
  console.log("Crop ID not provided!");
}
