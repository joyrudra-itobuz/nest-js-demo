import config from 'src/config/config';

export default {
  SALT_VALUE: '10',
  JWT_ACCESS_SECRET: config.JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRY: config.JWT_ACCESS_EXPIRY,
  JWT_REFRESH_SECRET: config.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRY: config.JWT_REFRESH_EXPIRY,
};
