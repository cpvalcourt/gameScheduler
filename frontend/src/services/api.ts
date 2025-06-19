import axios from 'axios';

const baseURL = 'http://localhost:3002/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Profile picture methods
export const uploadProfilePicture = async (formData: FormData) => {
    const response = await api.post('/users/profile-picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteProfilePicture = async () => {
    const response = await api.delete('/users/profile-picture');
    return response.data;
};

// Profile update method
export const updateProfile = async (profileData: {
    username?: string;
    email?: string;
    bio?: string;
    location?: string;
    phone?: string;
    date_of_birth?: string;
    linkedin_url?: string;
    twitter_url?: string;
    website_url?: string;
}) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
};

// Account deletion method
export const deleteAccount = async (password: string) => {
    const response = await api.delete('/users/account', {
        data: { password }
    });
    return response.data;
};

export default api; 