"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function UsersnapWidget() {
  const apiKey = process.env.NEXT_PUBLIC_USERSNAP_GLOBAL_API_KEY;

  useEffect(() => {
    // Define the callback before the script loads
    (window as any).onUsersnapCXLoad = function (api: any) {
      api.init();
      (window as any).Usersnap = api;
    };
  }, []);

  if (!apiKey) return null;

  return (
    <Script
      strategy="afterInteractive"
      src={`https://widget.usersnap.com/global/load/${apiKey}?onload=onUsersnapCXLoad`}
    />
  );
}
