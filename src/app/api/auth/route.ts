export const GET = () => {
  return new Response('', {
    status: 401,
    headers: {
      'WWW-Authenticate':
        'Basic realm="Access to the staging site", charset="UTF-8"',
    },
  });
};