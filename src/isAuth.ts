// import { verify } from "jsonwebtoken"; 

// export const isAuth = (req, res, next) => {
//   const authorization = context.req.headers["authorization"];

//   if (!authorization) throw new Error("not authenticated");

//   try {
//     const token = authorization.split(" ")[1];
//     verify(token, process.env.ACCESS_TOKEN_SECRET!, (error, decoded) => {
//       if (error && error.message) throw new Error("Not Unauthenticated")
//       context.payload = decoded as any;
//     });
//     return next()
//   } catch (error) {
//     console.log(error);
//     throw new Error(error);
//   }
// };));