// src/middleware/errorHandler.ts
import { Context, MiddlewareHandler } from "hono";

export function errorHandler(): MiddlewareHandler {
  return async (c: Context, next) => {
    try {
      await next();
    } catch (error) {
      console.error("Error:", error);

      if (error instanceof Error) {
        return c.json(
          {
            success: false,
            error: error.message,
          },
          error.name === "NotFoundError" ? 404 : 500
        );
      }

      return c.json(
        {
          success: false,
          error: "Internal Server Error",
        },
        500
      );
    }
  };
}
