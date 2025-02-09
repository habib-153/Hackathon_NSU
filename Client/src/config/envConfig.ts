const envConfig = {
  baseApi: process.env.NEXT_PUBLIC_BASE_API,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
};

export default envConfig;
