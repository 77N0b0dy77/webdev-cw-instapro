import { goToPage, logout, user } from "../index.js";
import { ADD_POSTS_PAGE, AUTH_PAGE, POSTS_PAGE } from "../routes.js";

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

/**
 * Компонент заголовка страницы.
 *
 * @param {HTMLElement} params.element - HTML-элемент заголовка.
 * @returns {HTMLElement} Возвращает элемент после рендеринга.
 */
export function renderHeaderComponent({ element }) {
  const safeUserName = escapeHtml(user?.name);

  element.innerHTML = `
    <div class="page-header">
      <h1 class="logo">instapro</h1>

      <button class="header-button add-or-login-button">
        ${
          user
            ? '<div title="Добавить пост" class="add-post-sign"></div>'
            : "Войти"
        }
      </button>

      ${
        user
          ? `<button title="${safeUserName}" class="header-button logout-button">Выйти</button>`
          : ""
      }
    </div>
  `;

  // Добавить пост или перейти на страницу авторизации.
  element
    .querySelector(".add-or-login-button")
    .addEventListener("click", () => {
      if (user) {
        goToPage(ADD_POSTS_PAGE);
      } else {
        goToPage(AUTH_PAGE);
      }
    });

  // Возврат в общую ленту по клику на логотип.
  element.querySelector(".logo").addEventListener("click", () => {
    goToPage(POSTS_PAGE);
  });

  // Выход из аккаунта.
  element
    .querySelector(".logout-button")
    ?.addEventListener("click", logout);

  return element;
}