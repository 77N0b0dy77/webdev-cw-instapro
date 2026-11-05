function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function renderUserPostsPageComponent({ appEl, posts }) {
  const postsHtml = posts.length
    ? posts.map((post) => `
        <div class="post">
          <div class="post-header">
            <img
              class="post-header__user-image"
              src="${post.user.imageUrl}"
              alt="Аватар пользователя"
            />
            <p class="post-header__user-name">${post.user.name}</p>
          </div>

          <img
            class="post-image"
            src="${post.imageUrl}"
            alt="Изображение публикации"
          />

          <div class="post-likes">
            <button class="like-button">
              <img
                src="./assets/images/like-not-active.svg"
                alt="Нравится"
              />
            </button>
            <p>${post.likes.length}</p>
          </div>

          <p class="post-text">
            <span class="post-text__user-name">${post.user.name}</span>
            ${post.description}
          </p>

          <p class="post-date">${formatDate(post.createdAt)}</p>
        </div>
      `).join("")
    : "<p>У пользователя пока нет публикаций</p>";

  appEl.innerHTML = `
    <div class="page-container">
      <div class="posts">
        ${postsHtml}
      </div>
    </div>
  `;
}