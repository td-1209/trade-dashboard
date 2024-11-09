export default async function Home() {
  return (
    <>
      <div className='flex flex-col h-screen'>
        <div className='p-4'>
          <p>マーケット情報はTradingViewを参照</p>
          <a href='https://www.sbifxt.co.jp/market/economic_calendar.html' className='text-secondary'>経済指標カレンダー</a>
        </div>
      </div>
    </>
  );
}