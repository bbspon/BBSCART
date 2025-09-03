import api from "../utils/api";

export const getMetrics = async () => {
    const { data } = await api.get('/dashboard');
    return data;
};

export const getProducts = async () => {
    const { data } = await api.get('/products');
    return data;
};

export const addProduct = async (product) => {
    const { data } = await api.post('/products', product);
    return data;
};

export const deleteProduct = async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
};

export const getOrders = async () => {
    const { data } = await api.get('/orders');
    return data;
};

export const updateOrderStatus = async (id, status) => {
    const { data } = await api.put(`/orders/${id}`, { status });
    return data;
};