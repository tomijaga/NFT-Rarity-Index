import "../styles/globals.css";
import type { AppProps } from "next/app";
import { PageComponent } from "components";
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PageComponent>
      <Component {...pageProps} />
    </PageComponent>
  );
}

export default MyApp;
