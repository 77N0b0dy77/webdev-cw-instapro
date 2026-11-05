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

import {
    getPosts,
    getUserPosts,
    createPost,
    togglePostLike,
} from "./api.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

// ID постов, для которых сейчас выполняется запрос лайка
const pendingLikeIds = new Set();

const isLikePending = (postId) => {
    return pendingLikeIds.has(String(postId));
};

const getToken = () => {
    return user ? `Bearer ${user.token}` : undefined;
};

// Обработка нажатия на лайк
const onLikeClick = async ({ postId, isLiked }) => {
    if (!user) {
        alert("Чтобы ставить лайки, необходимо авторизоваться");
        return;
    }

    const normalizedPostId = String(postId);

    // Защита от повторного запроса для этого поста
    if (pendingLikeIds.has(normalizedPostId)) {
        return;
    }

    // Блокируем кнопку до завершения запроса
    pendingLikeIds.add(normalizedPostId);
    renderApp();

    try {
        const updatedPost = await togglePostLike({
            postId,
            token: getToken(),
            isLiked,
        });

        const postIndex = posts.findIndex(
            (post) => String(post.id) === String(updatedPost.id)
        );

        if (postIndex !== -1) {
            posts[postIndex] = updatedPost;
        }
    } catch (error) {
        console.error("Ошибка при изменении лайка:", error);
        alert(error.message || "Не удалось изменить лайк");
    } finally {
        // Разблокируем кнопку после завершения запроса
        pendingLikeIds.delete(normalizedPostId);
        renderApp();
    }
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

    // Общая лента
    if (page === POSTS_PAGE) {
        return renderPostsPageComponent({
            appEl,
            onLikeClick,
            isLikePending: (postId) => {
                return pendingLikeIds.has(String(postId));
            },
        });
    }

    // Лента конкретного пользователя
if (page === USER_POSTS_PAGE) {
    return renderUserPostsPageComponent({
        appEl,
        posts,
        onLikeClick,
        isLikePending,
        goToPage,
    });
}
};

// Запуск приложения
goToPage(POSTS_PAGE);