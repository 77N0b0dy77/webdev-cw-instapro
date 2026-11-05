import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage } from "../index.js";

// Экранирование HTML-символов.
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

        if (url.protocol !== "https:") {
            return "";
        }

        return url.href;
    } catch {
        return "";
    }
};

export function renderPostsPageComponent({
    appEl,
    onLikeClick,
    isLikePending,
}) {
    const formatDate = (date) => {
        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        const diff = Date.now() - parsedDate.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) {
            return "Только что";
        }

        if (minutes < 60) {
            return `${minutes} минут назад`;
        }

        if (hours < 24) {
            return `${hours} часов назад`;
        }

        if (days < 30) {
            return `${days} дней назад`;
        }

        return parsedDate.toLocaleDateString("ru-RU");
    };

    const appHtml = `
        <div class="page-container">
            <div class="header-container"></div>

            <ul class="posts">
                ${posts.map((post) => {
                    const userId = escapeHtml(post.user?.id);
                    const userName = escapeHtml(post.user?.name);

                    const userImage = getSafeImageUrl(
                        post.user?.imageUrl
                    );

                    const postImage = getSafeImageUrl(
                        post.imageUrl
                    );

                    const description = escapeHtml(
                        post.description
                    );

                    const postId = escapeHtml(post.id);
                    const isLiked = Boolean(post.isLiked);

                    const likesCount = Array.isArray(post.likes)
                        ? post.likes.length
                        : 0;

                    const isPending = isLikePending
                        ? isLikePending(post.id)
                        : false;

                    return `
                        <li class="post">

                            <div
                                class="post-header"
                                data-user-id="${userId}"
                            >
                                ${
                                    userImage
                                        ? `
                                            <img
                                                src="${escapeHtml(userImage)}"
                                                class="post-header__user-image"
                                                alt="Аватар пользователя"
                                            >
                                        `
                                        : ""
                                }

                                <p class="post-header__user-name">
                                    ${userName}
                                </p>
                            </div>

                            <div class="post-image-container">
                                ${
                                    postImage
                                        ? `
                                            <img
                                                class="post-image"
                                                src="${escapeHtml(postImage)}"
                                                alt="${description}"
                                            >
                                        `
                                        : ""
                                }
                            </div>

                            <div class="post-likes">

                                <button
                                    type="button"
                                    data-post-id="${postId}"
                                    data-is-liked="${isLiked}"
                                    class="like-button"
                                    ${isPending ? "disabled" : ""}
                                >
                                    <img
                                        src="./assets/images/${
                                            isLiked
                                                ? "like-active.svg"
                                                : "like-not-active.svg"
                                        }"
                                        alt="Лайк"
                                    >
                                </button>

                                <p class="post-likes-text">
                                    Нравится:
                                    <strong>${likesCount}</strong>
                                </p>

                            </div>

                            <p class="post-text">
                                <span class="user-name">
                                    ${userName}
                                </span>

                                ${description}
                            </p>

                            <p class="post-date">
                                ${escapeHtml(formatDate(post.createdAt))}
                            </p>

                        </li>
                    `;
                }).join("")}
            </ul>
        </div>
    `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
        element: appEl.querySelector(".header-container"),
    });

    // Переход на страницу постов конкретного пользователя.
    for (const userEl of appEl.querySelectorAll(".post-header")) {
        userEl.addEventListener("click", () => {
            const userId = userEl.dataset.userId;

            if (!userId) {
                return;
            }

            goToPage(USER_POSTS_PAGE, {
                userId,
            });
        });
    }

    // Обработка нажатия на лайк.
    for (const likeButton of appEl.querySelectorAll(".like-button")) {
        likeButton.addEventListener("click", (event) => {
            event.stopPropagation();

            if (likeButton.disabled) {
                return;
            }

            onLikeClick({
                postId: likeButton.dataset.postId,
                isLiked: likeButton.dataset.isLiked === "true",
            });
        });
    }
}