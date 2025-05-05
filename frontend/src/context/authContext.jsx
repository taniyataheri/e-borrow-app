import { createContext, useState, useEffect } from "react";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem("token") || "");

    useEffect(() => {
        if (token) {
            axios.get(`${apiUrl}/me`, { headers: { Authorization: token } })
                .then((response) => {
                    setUser(response.data.user);
                    localStorage.setItem("user", JSON.stringify(response.data.user)); // ✅ sync user to localStorage
                })
                .catch(() => logout());
        }
    }, [token]);

    const login = (email, password) => {
        return axios.post(`${apiUrl}/login`, { email, password })
            .then((response) => {
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                setUser(response.data.user);
                localStorage.setItem("user", JSON.stringify(response.data.user)); // ✅ save user
                return response.data.user;
            });
    };

    const logout = () => {
        setUser(null);
        setToken("");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
