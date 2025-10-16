import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import instance from "../services/axiosInstance"
const BASE_URL = `${import.meta.env.VITE_API_URL}/orders`; 

// ✅ Place Order
// orderSlice.js
export const placeOrder = createAsyncThunk(
  "order/placeOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await instance.post(
        `${import.meta.env.VITE_API_URL}/orders`,
        orderData,
        {
          withCredentials: true,  // ensure cookie travels
          headers: {
            // Helpful for the backend vendor middleware:
            "X-Delivery-Pincode": orderData?.shippingAddress?.postalCode || "",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to place order.");
    }
  }
);


// ✅ Get All Orders
export const getAllOrders = createAsyncThunk(
  "order/getAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get(BASE_URL);
      return response.data.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch orders.");
    }
  }
);

// ✅ Get Order by ID
export const getOrderById = createAsyncThunk(
  "order/getOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await instance.get(`${BASE_URL}/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch order.");
    }
  }
);

// ✅ Get Order by SellerID
export const getOrderBySellerId = createAsyncThunk(
  "order/getOrderBySellerId",
  async (sellerId, { rejectWithValue }) => {
    try {
      const response = await instance.get(`${BASE_URL}/seller/${sellerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch order.");
    }
  }
);

// ✅ Get Order by SellerID
export const getOrdersByUserId = createAsyncThunk(
  "order/getOrdersByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await instance.get(`${BASE_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch order.");
    }
  }
);

// ✅ Get Orders by Status
export const getOrdersByStatus = createAsyncThunk(
  "order/getOrdersByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const response = await instance.get(`${BASE_URL}/status/${status}`);
      return response.data.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch orders by status.");
    }
  }
);

// ✅ Update Order
export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async ({ orderId, orderData }, { rejectWithValue }) => {
    try {
      const response = await instance.put(`${BASE_URL}/${orderId}`, orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to update order.");
    }
  }
);

// ✅ Delete Order
export const deleteOrder = createAsyncThunk(
  "order/deleteOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await instance.delete(`${BASE_URL}/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to delete order.");
    }
  }
);

// 🏗️ **Redux Slice**
const orderSlice = createSlice({
  name: "order",
  initialState: {
    order: null,
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetOrder: (state) => {
      state.order = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 📌 Place Order
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 📌 Get All Orders
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 📌 Get Order by ID
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.order;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 📌 Get Order by SellerID
      .addCase(getOrderBySellerId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderBySellerId.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        console.log('getOrderBySellerId - ',action.payload.orders);
      })
      .addCase(getOrderBySellerId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 📌 Get Order by UserID
      .addCase(getOrdersByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        console.log('getOrdersByUserId - ',action.payload.orders);
      })
      .addCase(getOrdersByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 📌 Get Orders by Status
      .addCase(getOrdersByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrdersByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 📌 Update Order
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.order;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 📌 Delete Order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.orders = state.orders.filter(order => order._id !== action.meta.arg);
        }
        state.loading = false;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetOrder } = orderSlice.actions;
export default orderSlice.reducer;