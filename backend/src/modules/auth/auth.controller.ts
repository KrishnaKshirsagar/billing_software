import { Request, Response } from "express";
import { getCurrentUser, loginUser, registerOwner } from "./auth.service";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shopName, firstName, lastName, email, mobile, password } = req.body;

    if (!shopName || !firstName || !email || !password) {
      res.status(400).json({
        success: false,
        message: "shopName, firstName, email and password are required",
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
      return;
    }

    const result = await registerOwner({
      shopName,
      firstName,
      lastName,
      email,
      mobile,
      password,
    });

    res.status(201).json({
      success: true,
      message: "Shop registered successfully",
      data: result,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const result = await loginUser({
      email,
      password,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
};

export const me = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const user = await getCurrentUser(req.user.userId, req.user.shopId);

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : "User not found",
    });
  }
};
