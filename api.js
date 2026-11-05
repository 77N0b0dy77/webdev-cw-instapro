const personalKey = "prod";
const baseHost = "https://wedev-api.sky.pro";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
    return fetch(postsHost, {
        method: "GET",
        headers: {
            Authorization: token,
        },
    }).then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Ошибка загрузки постов");
        }

        return data.posts;
    });
}

// Получение постов конкретного пользователя
export function getUserPosts({ userId, token }) {
    if (!userId) {
        throw new Error("Не передан ID пользователя");
    }

    const url = `${postsHost}/user-posts/${userId}`;

    return fetch(url, {
        method: "GET",
        headers: token ? { Authorization: token } : {},
    }).then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Ошибка сервера: ${response.status}`);
        }

        return data.posts;
    });
}

export function registerUser({ login, password, name, imageUrl }) {
    return fetch(baseHost + "/api/user", {
        method: "POST",
        body: JSON.stringify({
            login,
            password,
            name,
            imageUrl,
        }),
    }).then((response) => {
        if (response.status === 400) {
            throw new Error("Такой пользователь уже существует");
        }

        return response.json();
    });
}

export function loginUser({ login, password }) {
    return fetch(baseHost + "/api/user/login", {
        method: "POST",
        body: JSON.stringify({
            login,
            password,
        }),
    }).then((response) => {
        if (response.status === 400) {
            throw new Error("Неверный логин или пароль");
        }

        return response.json();
    });
}

// Загружает картинку в облако
export function uploadImage({ file }) {
    const data = new FormData();
    data.append("file", file);

    return fetch(baseHost + "/api/upload/image", {
        method: "POST",
        body: data,
    }).then((response) => {
        return response.json();
    });
}

export function createPost({ description, imageUrl, token }) {
    return fetch(postsHost, {
        method: "POST",
        headers: {
            Authorization: token,
        },
        body: JSON.stringify({
            description,
            imageUrl,
        }),
    }).then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Не удалось добавить пост");
        }

        return data;
    });
}

// Поставить или убрать лайк
export const togglePostLike = async ({ postId, token, isLiked }) => {
    const response = await fetch(
        `${postsHost}/${postId}/${isLiked ? "dislike" : "like"}`,
        {
            method: "POST",
            headers: {
                Authorization: token,
            },
        }
    );

    if (!response.ok) {
        let errorMessage = "Не удалось изменить лайк";

        try {
            const data = await response.json();
            errorMessage = data.error || errorMessage;
        } catch (error) {
            // Если сервер не вернул JSON, используем стандартное сообщение
        }

        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.post;
};