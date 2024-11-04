import { Item } from '@/types/type'; 

interface fetchPostRequestProps {
  endpoint: string;
  body: Record<string, Item | Record<string, Item>>
}

export const fetchPostRequest = async ({ endpoint, body }: fetchPostRequestProps) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error('APIリクエストが失敗しました');
  }
};

interface fetchGetRequestProps {
  endpoint: string;
}

export const fetchGETRequestItems = async <T extends Record<string, Item>>({ endpoint }: fetchGetRequestProps) => {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    });
    if (!response.ok) {
      throw new Error('APIリクエストが失敗しました');
    }
    const items: T[] = await response.json();
    return items;
  } catch {
    return undefined;
  }
};

export const fetchGETRequestItem = async <T extends Record<string, Item>>({ endpoint }: fetchGetRequestProps) => {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    });
    if (!response.ok) {
      throw new Error('APIリクエストが失敗しました');
    }
    const items: T = await response.json();
    return items;
  } catch {
    return undefined;
  }
};