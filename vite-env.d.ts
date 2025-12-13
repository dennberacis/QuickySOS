// Manually declare process.env for the client-side code
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};
