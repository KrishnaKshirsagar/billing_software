import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import roleRoutes from "../modules/roles/role.routes";
import userRoutes from "../modules/users/user.routes";
import brandRoutes from "../modules/brands/brand.routes";
import categoryRoutes from "../modules/categories/category.routes";
import productRoutes from "../modules/products/product.routes";
import unitRoutes from "../modules/units/unit.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/roles", roleRoutes);
router.use("/users", userRoutes);

router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/units", unitRoutes);
router.use("/products", productRoutes);

export default router;
