import prisma from '../db/prismaClient.js';

export const getAllCategories = async () => {
  return prisma.category.findMany();
};

export const createCategory = async (data) => {
  return prisma.category.create({ data });
};

export const updateCategory = async (id, data) => {
  return prisma.category.update({
    where: { id },
    data,
  });
};

export const deleteCategory = async (id) => {
  return prisma.category.delete({
    where: { id },
  });
};
