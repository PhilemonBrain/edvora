import Joi from "joi";

export const signupLoginValidation = () => (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  const {error} = schema.validate(req.body);
  if (error){
    const formatted = formatJoiError(error);
    return res.status(400).json({error: formatted})
  }
  next()
};

const formatJoiError = (error) => {
  if (error instanceof Joi.ValidationError) {
    const details = error!.details || [];
    const formatted = {};
    details.forEach(({ context, message }) => {
      formatted[context.key] = [message];
    });
    return formatted;
  }
  // joi's async error messages are in the format - '<error statement> (<fieldname>)'
  const msgRegex = /\((.*?)\)/;
  const message = error.message;
  const result = msgRegex.exec(message);
  if (!result) return null;
  const [, key] = result;
  const index = result["index"];
  return { [key]: [message.substring(0, index - 1)] };
};
