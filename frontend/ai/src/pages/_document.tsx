import { Html, Head, Main, NextScript } from "next/document";
// import { Inter } from "next/font/google"

// const inter = Inter({ subsets: ["latin"] })

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8"></meta>
      </Head>
      <title>BED_AIO</title>
      <body
        // style={{
        //   background:
        //     "linear-gradient(109.6deg, rgb(20, 30, 48) 11.2%, rgb(36, 40, 65) 91.1%)",
        // }}
        // className={`${inter.className} bg-slate-800 text-slate-100 container mx-auto p-4`}
        // bg-gradient-to-br min-h-screen from-gray-800 to-slate-950
        className={`text-slate-100 w-view box-border bg-fixed`}
        style={{ backgroundImage: `url("/background.jpg")`, width: "100%" }}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
