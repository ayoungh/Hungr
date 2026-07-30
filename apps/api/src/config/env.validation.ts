import Joi from "joi";

export const environmentSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),
  MONGODB_URI: Joi.string()
    .pattern(/^mongodb(?:\+srv)?:\/\//)
    .when("NODE_ENV", {
      is: "production",
      then: Joi.required(),
      otherwise: Joi.string().default("mongodb://127.0.0.1:27017/hungrdb"),
    }),
  JWT_SECRET: Joi.string()
    .min(32)
    .when("NODE_ENV", {
      is: "production",
      then: Joi.required(),
      otherwise: Joi.string().default("development-only-change-this-secret"),
    }),
  APP_ORIGIN: Joi.string().uri().default("http://localhost:3000"),
  PORT: Joi.number().port().default(4000),
});
