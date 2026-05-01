import axios from "axios";
import { Category, ApiResponse, Page } from "../types/category"

const API_URL = "/api/categories";

export const getCategories = async (page: number, size: number) => {
  const res = await axios.get<ApiResponse<Page<Category>>>(`${API_URL}?page=${page}&size=${size}`);
  return res.data.data;
};

export const createCategory = async (data: Partial<Category>) => {
  const res = await axios.post<ApiResponse<Category>>(API_URL, data);
  return res.data.data;
};

export const updateCategory = async (id: number, data: Partial<Category>) => {
  const res = await axios.put<ApiResponse<Category>>(`${API_URL}/${id}`, data);
  return res.data.data;
};

export const deleteCategory = async (id: number) => {
  await axios.delete(`${API_URL}/${id}`);
};
