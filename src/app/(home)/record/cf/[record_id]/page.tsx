export default async function Home({ params }: { params: Promise<{ record_id: string }> }) {
  const recordId = (await params).record_id;
  return (
    <>
      cash-flow-record ({recordId})
    </>
  );
}