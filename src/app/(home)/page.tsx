import { getUserInfo } from '@/lib/dynamodb';

export default async function Home() {
  const users = await getUserInfo();
  return (
    <>
      <p className='text-secondaryButtonBG'>テスト</p>
      <div>
        {users?.map((user, index) => (
          <li key={index}>
              ID: {user.id}, Password: {user.password}
          </li>
        ))}
      </div>
    </>
  );
}