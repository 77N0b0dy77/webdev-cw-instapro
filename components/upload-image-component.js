import { uploadImage } from "../api.js";

// Экранирование специальных HTML-символов.
const escapeHtml = (value) => {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
};

// Проверка URL изображения.
const getSafeImageUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  try {
    const url = new URL(value);

    // Разрешаем только HTTPS.
    if (url.protocol !== "https:") {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
};

/**
 * Компонент загрузки изображения.
 *
 * @param {HTMLElement} params.element - HTML-элемент компонента.
 * @param {Function} params.onImageUrlChange - Функция изменения URL изображения.
 */
export function renderUploadImageComponent({
  element,
  onImageUrlChange,
}) {
  let imageUrl = "";
  let isUploading = false;
  let errorMessage = "";

  const render = () => {
    const safeImageUrl = getSafeImageUrl(imageUrl);

    element.innerHTML = `
      <div class="upload-image">
        ${
          safeImageUrl
            ? `
              <div class="file-upload-image-container">
                <img
                  class="file-upload-image"
                  src="${escapeHtml(safeImageUrl)}"
                  alt="Загруженное изображение"
                >

                <button
                  type="button"
                  class="file-upload-remove-button button"
                >
                  Заменить фото
                </button>
              </div>
            `
            : `
              <label class="file-upload-label secondary-button">
                <input
                  type="file"
                  class="file-upload-input"
                  accept="image/*"
                  ${isUploading ? "disabled" : ""}
                  style="display: none"
                >

                ${isUploading ? "Загружаю файл..." : "Выберите фото"}
              </label>
            `
        }

        <div class="upload-image-error form-error"></div>
      </div>
    `;

    // Вывод сообщения об ошибке через textContent.
    const errorElement = element.querySelector(".upload-image-error");
    errorElement.textContent = errorMessage;

    // Обработка выбора файла.
    const fileInputElement = element.querySelector(".file-upload-input");

    fileInputElement?.addEventListener("change", async () => {
      const file = fileInputElement.files?.[0];

      if (!file) {
        return;
      }

      // Проверяем, что выбран файл изображения.
      if (!file.type.startsWith("image/")) {
        errorMessage = "Выберите файл изображения";
        render();
        return;
      }

      errorMessage = "";
      isUploading = true;
      render();

      try {
        const result = await uploadImage({ file });

        const uploadedImageUrl = getSafeImageUrl(result?.fileUrl);

        if (!uploadedImageUrl) {
          throw new Error(
            "Сервер не вернул корректный адрес изображения"
          );
        }

        imageUrl = uploadedImageUrl;

        // Передаём URL родительскому компоненту.
        onImageUrlChange(imageUrl);
      } catch (error) {
        console.error("Ошибка загрузки изображения:", error);

        errorMessage =
          error.message || "Не удалось загрузить изображение";
      } finally {
        isUploading = false;
        render();
      }
    });

    // Обработка замены изображения.
    element
      .querySelector(".file-upload-remove-button")
      ?.addEventListener("click", () => {
        imageUrl = "";
        errorMessage = "";

        onImageUrlChange("");

        render();
      });
  };

  render();
}