let fetchedPhotoIds = [];
let allPhotoIds = [];

async function fetchAllPhotoIdsAndSaveToLocal() {
  try {
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await fetch(`https://api.slingacademy.com/v1/sample-data/photos?offset=${offset}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Error fetching photo IDs.');
      }
      const data = await response.json();
      allPhotoIds = allPhotoIds.concat(data.photos.map(photo => photo.id));

      if (data.total_photos <= offset + data.limit) {
        break;
      }
      offset += limit;
    }
    localStorage.setItem('allPhotoIds', JSON.stringify(allPhotoIds));
    return allPhotoIds;
  } catch (error) {
    console.error('Error fetching and saving photo IDs:', error);
    return [];
  }
}

async function fetchPhotoData(photoId) {
  try {
    const response = await fetch(`https://api.slingacademy.com/v1/sample-data/photos/${photoId}`);
    if (!response.ok) {
      throw new Error(`Error fetching photo with ID ${photoId}.`);
    }
    const data = await response.json();
    return {
      title: data.photo.title,
      description: data.photo.description,
      url: data.photo.url,
    };
  } catch (error) {
    console.error(`Error fetching photo with ID ${photoId}:`, error);
    return null;
  }
}

async function fetchRandomPhotos() {
  try {
    const localAllPhotoIds = localStorage.getItem('allPhotoIds');
    if (localAllPhotoIds) {
      allPhotoIds = JSON.parse(localAllPhotoIds);
    } else {
      allPhotoIds = await fetchAllPhotoIdsAndSaveToLocal();
    }
    const remainingPhotoIds = allPhotoIds.filter(id => !fetchedPhotoIds.includes(id));

    if (remainingPhotoIds.length === 0) {
      console.log('No more available photo IDs to fetch.');
      return;
    }

    const randomPhotoIds = remainingPhotoIds.slice(0, 6);

    fetchedPhotoIds = fetchedPhotoIds.concat(randomPhotoIds);

    const galleryContainer = document.querySelector(".gallery-container");
    galleryContainer.innerHTML = "";

    for (const randomId of randomPhotoIds) {
      const photoData = await fetchPhotoData(randomId);

      if (photoData) {
        const artwork = document.createElement("div");
        artwork.classList.add("artwork");

        const img = document.createElement("img");
        img.src = photoData.url;
        img.alt = photoData.title;

        const title = document.createElement("h2");
        title.textContent = photoData.title;

        const description = document.createElement("p");
        description.textContent = photoData.description;

        artwork.appendChild(img);
        artwork.appendChild(title);
        artwork.appendChild(description);

        galleryContainer.appendChild(artwork);
      }
    }
  } catch (error) {
    console.error('Error fetching and displaying photos:', error);
  }
}

const refreshButton = document.getElementById("refresh-button");
refreshButton.addEventListener("click", fetchRandomPhotos);

fetchRandomPhotos();
