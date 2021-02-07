import axios from "axios";
const CONFIGURATION = {};

let IS_CONFIGURED = false;

export const awaitGently = async (rep) => rep;

export const configure = ({
  baseUrl = {},
  headers = {},
  auth,
  createOpts = {},
}) => {
  if (IS_CONFIGURED) {
    console.warn("apiServices already configured");
    return;
  }
  CONFIGURATION.baseUrl = baseUrl;
  CONFIGURATION.headers = headers;
  CONFIGURATION.auth = auth;
  CONFIGURATION.api = createApiInstance();
  IS_CONFIGURED = true;
};

export const createApi = ({ commands } = {}) => {
  return Object.fromEntries(
    Object.entries(commands).map(([key, command]) => {
      return [
        key,
        ({ ...args } = {}, ...otherArgs) =>
          command({ api: CONFIGURATION.API, ...args }, ...otherArgs),
      ];
    })
  );
};

export const createApiInstance = () => {
  const axiosCommon = {
    baseURL: CONFIGURATION.baseUrl,
    headers: CONFIGURATION.headers,
  };

  const instance = axios.create(axiosCommon);
  instance.interceptors.request.use(
    async function (config) {
      if (CONFIGURATION.auth) {
        const token = await awaitGently(CONFIGURATION.auth.getToken());
        config.headers.Authorization = `${
          CONFIGURATION.auth.Authorization
        } ${token}`;
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );
  return instance;
};