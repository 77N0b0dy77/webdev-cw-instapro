import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage } from "../index.js";

export function renderPostsPageComponent({
    appEl,
    onLikeClick,
    isLikePending,
}) {
    const formatDate = (date) => {
        const diff = Date.now() - new Date(date).getTime();

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

        return new Date(date).toLocaleDateString("ru-RU");
    };

    const appHtml = `
        <div class="page-container">
            <div class="header-container"></div>

            <ul class="posts">
                ${posts.map((post) => `
                    <li class="post">

                        <div
                            class="post-header"
                            data-user-id="${post.user.id}"
                        >
                            <img
                                src="${post.user.imageUrl}"
                                class="post-header__user-image"
                                alt="Аватар пользователя"
                            >

                            <p class="post-header__user-name">
                                ${post.user.name}
                            </p>
                        </div>

                        <div class="post-image-container">
                            <img
                                class="post-image"
                                src="${post.imageUrl}"
                                alt="${post.description}"
                            >
                        </div>

                        <div class="post-likes">

                            <button
                                data-post-id="${post.id}"
                                data-is-liked="${post.isLiked}"
                                class="like-button"
                                ${isLikePending(post.id) ? "disabled" : ""}
                            >
                                <img
                                    src="./assets/images/${
                                        post.isLiked
                                            ? "like-active.svg"
                                            : "like-not-active.svg"
                                    }"
                                    alt="Лайк"
                                >
                            </button>

                            <p class="post-likes-text">
                                Нравится:
                                <strong>${post.likes.length}</strong>
                            </p>

                        </div>

                        <p class="post-text">
                            <span class="user-name">
                                ${post.user.name}
                            </span>

                            ${post.description}
                        </p>

                        <p class="post-date">
                            ${formatDate(post.createdAt)}
                        </p>

                    </li>
                `).join("")}
            </ul>
        </div>
    `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
        element: document.querySelector(".header-container"),
    });

    // Переход на страницу постов конкретного пользователя
    for (const userEl of document.querySelectorAll(".post-header")) {
        userEl.addEventListener("click", () => {
            goToPage(USER_POSTS_PAGE, {
                userId: userEl.dataset.userId,
            });
        });
    }

    // Обработка нажатия на лайк
    for (const likeButton of document.querySelectorAll(".like-button")) {
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