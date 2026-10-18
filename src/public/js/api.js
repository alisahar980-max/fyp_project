(function () {
    async function request(url, options = {}) {
        const config = {
            ...options,
            credentials: "include",
            headers: {
                ...(options.headers || {})
            }
        };

        if (options.body !== undefined) {
            config.headers["Content-Type"] = "application/json";
        }

        const response = await fetch(url, config);

        const text = await response.text();

        let data = {};

        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = {
                message: text
            };
        }

        if (!response.ok) {
            const error = new Error(
                data.error ||
                data.message ||
                `Request failed with status ${response.status}`
            );

            error.status = response.status;

            throw error;
        }

        return data;
    }

    window.api = {
        get(url) {
            return request(url, {
                method: "GET"
            });
        },

        post(url, body) {
            return request(url, {
                method: "POST",
                body: JSON.stringify(body)
            });
        },

        put(url, body) {
            return request(url, {
                method: "PUT",
                body: JSON.stringify(body)
            });
        },

        delete(url) {
            return request(url, {
                method: "DELETE"
            });
        },

        patch(url, body) {
            return request(url, {
                method: "PATCH",
                body: JSON.stringify(body)
            });
        }
    };
})();