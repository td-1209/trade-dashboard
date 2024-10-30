export default async function Home({ params }: { params: { record_id: string } }) {
  return (
    <>
        cash-flow-record ({ params.record_id })
    </>
  );
}