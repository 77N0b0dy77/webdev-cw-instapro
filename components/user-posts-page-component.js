import { renderHeaderComponent } from "./header-component.js";

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("ru-RU", {
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
        ? posts.map((post) => `
            <li class="post">

                <div class="post-header">
                    <img
                        class="post-header__user-image"
                        src="${post.user.imageUrl}"
                        alt="Аватар пользователя"
                    />

                    <p class="post-header__user-name">
                        ${post.user.name}
                    </p>
                </div>

                <img
                    class="post-image"
                    src="${post.imageUrl}"
                    alt="Изображение публикации"
                />

                <div class="post-likes">

                    <button
                        class="like-button"
                        data-post-id="${post.id}"
                        data-is-liked="${post.isLiked}"
                        ${isLikePending(post.id) ? "disabled" : ""}
                    >
                        <img
                            src="./assets/images/${
                                post.isLiked
                                    ? "like-active.svg"
                                    : "like-not-active.svg"
                            }"
                            alt="Лайк"
                        />
                    </button>

                    <p class="post-likes-text">
                        Нравится:
                        <strong>${post.likes.length}</strong>
                    </p>

                </div>

                <p class="post-text">
                    <span class="post-text__user-name">
                        ${post.user.name}
                    </span>

                    ${post.description}
                </p>

                <p class="post-date">
                    ${formatDate(post.createdAt)}
                </p>

            </li>
        `).join("")
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
        element: document.querySelector(".header-container"),
    });

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