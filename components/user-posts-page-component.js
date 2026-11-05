import { renderHeaderComponent } from "./header-component.js";

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

function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function renderUserPostsPageComponent({
    appEl,
    posts,
    onLikeClick,
    isLikePending,
}) {
    const postsHtml = posts.length
        ? posts.map((post) => {
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

                    <div class="post-header">

                        ${
                            userImage
                                ? `
                                    <img
                                        class="post-header__user-image"
                                        src="${escapeHtml(userImage)}"
                                        alt="Аватар пользователя"
                                    />
                                `
                                : ""
                        }

                        <p class="post-header__user-name">
                            ${userName}
                        </p>

                    </div>

                    ${
                        postImage
                            ? `
                                <img
                                    class="post-image"
                                    src="${escapeHtml(postImage)}"
                                    alt="${description}"
                                />
                            `
                            : ""
                    }

                    <div class="post-likes">

                        <button
                            type="button"
                            class="like-button"
                            data-post-id="${postId}"
                            data-is-liked="${isLiked}"
                            ${isPending ? "disabled" : ""}
                        >
                            <img
                                src="./assets/images/${
                                    isLiked
                                        ? "like-active.svg"
                                        : "like-not-active.svg"
                                }"
                                alt="Лайк"
                            />
                        </button>

                        <p class="post-likes-text">
                            Нравится:
                            <strong>${likesCount}</strong>
                        </p>

                    </div>

                    <p class="post-text">

                        <span class="post-text__user-name">
                            ${userName}
                        </span>

                        ${description}

                    </p>

                    <p class="post-date">
                        ${escapeHtml(formatDate(post.createdAt))}
                    </p>

                </li>
            `;
        }).join("")
        : "<p>У пользователя пока нет публикаций</p>";

    appEl.innerHTML = `
        <div class="page-container">
            <div class="header-container"></div>

            <ul class="posts">
                ${postsHtml}
            </ul>
        </div>
    `;

    renderHeaderComponent({
        element: appEl.querySelector(".header-container"),
    });

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