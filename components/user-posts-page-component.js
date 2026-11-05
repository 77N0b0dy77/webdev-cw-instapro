import { POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";

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
    onDeletePost,
    isDeletePending,
    currentUserId,
    goToPage,
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

            const likePending = isLikePending
                ? isLikePending(post.id)
                : false;

            const authorId = post.user?.id ?? post.user?._id;

            const isOwner =
                currentUserId &&
                String(authorId) === String(currentUserId);

            const deletePending = isDeletePending
                ? isDeletePending(post.id)
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
                            ${likePending ? "disabled" : ""}
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

                    ${
                        isOwner
                            ? `
                                <button
                                    type="button"
                                    class="delete-post-button"
                                    data-post-id="${postId}"
                                    ${deletePending ? "disabled" : ""}
                                >
                                    ${
                                        deletePending
                                            ? "Удаление..."
                                            : "Удалить публикацию"
                                    }
                                </button>
                            `
                            : ""
                    }
                </li>
            `;
        }).join("")
        : "<p>У пользователя пока нет публикаций</p>";

    appEl.innerHTML = `
        <div class="page-container">
            <div class="header-container"></div>

            <button
                type="button"
                class="back-to-posts-button"
            >
                ← На главную
            </button>

            <ul class="posts">
                ${postsHtml}
            </ul>
        </div>
    `;

    renderHeaderComponent({
        element: appEl.querySelector(".header-container"),
    });

    const backButton = appEl.querySelector(
        ".back-to-posts-button"
    );

    backButton.addEventListener("click", () => {
        goToPage(POSTS_PAGE);
    });

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

    for (const deleteButton of appEl.querySelectorAll(".delete-post-button")) {
        deleteButton.addEventListener("click", (event) => {
            event.stopPropagation();

            if (deleteButton.disabled) {
                return;
            }

            onDeletePost({
                postId: deleteButton.dataset.postId,
            });
        });
    }
}