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
        </div>
      </body>
    </html>
  );
}