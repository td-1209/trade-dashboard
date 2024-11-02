import { Item } from '../types/type'; 

interface fetchPostRequestProps {
  endpoint: string;
  body: Record<string, Item | Record<string, Item>>
}

export const fetchPostRequest = async ({ endpoint, body }: fetchPostRequestProps) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error('APIリクエストが失敗しました');
  }
};

interface fetchGetRequestProps {
  endpoint: string;
}

export const fetchGETRequest = async ({ endpoint }: fetchGetRequestProps) => {
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {'Content-Type': 'application/json',},
  });
  if (!response.ok) {
    throw new Error('APIリクエストが失敗しました');
  }
};