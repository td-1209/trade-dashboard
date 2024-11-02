import { TabBar } from '@/app/(home)/components/TabBar';
import '../../styles/globals.css';
interface RootLayoutprops {
  children: React.ReactNode;
}

export default function RootLayout(props: RootLayoutprops): React.JSX.Element {
  return (
    <html lang='ja'>
      <head>
        <title>トレードダッシュボード</title>
      </head>
      <body>
        <div>
          {props.children}
          <TabBar />
        </div>
      </body>
    </html>
  );
}