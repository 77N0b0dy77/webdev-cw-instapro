import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";

  const render = () => {
    appEl.innerHTML = `
      <div class="page-container">
        <div class="header-container"></div>

        <div class="form">
          <h3 class="form-title">Новая публикация</h3>

          <div class="form-inputs">
            <textarea
              id="description-input"
              class="input"
              placeholder="Описание поста"
              rows="4"
            ></textarea>

            <div class="upload-image-container"></div>

            <div class="form-error"></div>

            <button class="button" id="add-button">
              Добавить
            </button>
          </div>
        </div>
      </div>
    `;

    renderHeaderComponent({
      element: appEl.querySelector(".header-container"),
    });

    // Подключаем готовый компонент загрузки изображения
    renderUploadImageComponent({
      element: appEl.querySelector(".upload-image-container"),
      onImageUrlChange(newImageUrl) {
        imageUrl = newImageUrl;
      },
    });

    const addButton = appEl.querySelector("#add-button");

    addButton.addEventListener("click", () => {
  const description = appEl
    .querySelector("#description-input")
    .value.trim();

  const errorElement = appEl.querySelector(".form-error");
  errorElement.textContent = "";

  if (!description) {
    errorElement.textContent = "Введите описание поста";
    return;
  }

  if (!imageUrl) {
    errorElement.textContent = "Загрузите изображение";
    return;
  }

  addButton.disabled = true;
  addButton.textContent = "Добавляю...";

  Promise.resolve(onAddPostClick({ description, imageUrl }))
    .catch((error) => {
      console.error(error);
      errorElement.textContent = error.message || "Не удалось добавить пост";
      addButton.disabled = false;
      addButton.textContent = "Добавить";
    });
});
  };

  render();
}