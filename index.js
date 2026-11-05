import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";

import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";

import { renderPostsPageComponent } from "./components/posts-page-component.js";

import {
  renderUserPostsPageComponent,
} from "./components/user-posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";

import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";

import { getPosts, getUserPosts, createPost } from "./api.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

const getToken = () => {
  return user ? `Bearer ${user.token}` : undefined;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Переключение страниц приложения
 */
export const goToPage = (newPage, data) => {
  if (
    ![
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    throw new Error("Страницы не существует");
  }

  // Страница добавления поста
  if (newPage === ADD_POSTS_PAGE) {
    page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
    return renderApp();
  }

  // Главная страница с постами
  if (newPage === POSTS_PAGE) {
    page = LOADING_PAGE;
    renderApp();

    return getPosts({ token: getToken() })
      .then((newPosts) => {
        posts = newPosts;
        page = POSTS_PAGE;
        renderApp();
      })
      .catch((error) => {
        console.error("Ошибка загрузки постов:", error);

        posts = [];
        page = POSTS_PAGE;
        renderApp();

        alert("Не удалось загрузить посты: " + error.message);
      });
  }

  // Страница постов конкретного пользователя
  if (newPage === USER_POSTS_PAGE) {
    if (!data?.userId) {
      throw new Error("Не указан ID пользователя");
    }

    page = LOADING_PAGE;
    renderApp();

    return getUserPosts({
      userId: data.userId,
      token: getToken(),
    })
      .then((newPosts) => {
        posts = newPosts;
        page = USER_POSTS_PAGE;
        renderApp();
      })
      .catch((error) => {
        console.error("Ошибка загрузки постов пользователя:", error);

        posts = [];
        page = USER_POSTS_PAGE;
        renderApp();

        alert("Не удалось загрузить посты пользователя: " + error.message);
      });
  }

  page = newPage;
  renderApp();
};

/**
 * Отрисовка текущей страницы
 */
const renderApp = () => {
  const appEl = document.getElementById("app");

  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,

      onAddPostClick({ description, imageUrl }) {
        return createPost({
          description,
          imageUrl,
          token: getToken(),
        })
          .then(() => {
            return goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            console.error("Ошибка добавления поста:", error);
            alert(error.message);
            throw error;
          });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }

  // Отрисовка страницы конкретного пользователя
  if (page === USER_POSTS_PAGE) {
    return renderUserPostsPageComponent({
      appEl,
      posts,
    });
  }
};

// Запуск приложения
goToPage(POSTS_PAGE);
