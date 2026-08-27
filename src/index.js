export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/search") {
      const keyword = url.searchParams.get("keyword");

      if (!keyword) {
        return Response.json(
          {
            error: "検索キーワードを入力してください"
          },
          {
            status: 400,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      // 楽天市場商品検索API
      const apiUrl =
        "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701" +
        "?applicationId=" + encodeURIComponent(env.RAKUTEN_APPLICATION_ID) +
        "&accessKey=" + encodeURIComponent(env.RAKUTEN_ACCESS_KEY) +
        "&affiliateId=" + encodeURIComponent(env.RAKUTEN_AFFILIATE_ID || "") +
        "&keyword=" + encodeURIComponent(keyword) +
        "&hits=20" +
        "&format=json";

      try {
        const response = await fetch(apiUrl);

        const data = await response.json();

        // 楽天APIエラー
        if (!response.ok) {
          return Response.json(
            {
              error: data.error || "楽天APIエラー",
              error_description:
                data.error_description || "詳細不明",
              status: response.status
            },
            {
              status: response.status,
              headers: {
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }

        return Response.json(data, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
          }
        });

      } catch (error) {
        return Response.json(
          {
            error: "楽天APIへの接続に失敗しました",
            details: error.message
          },
          {
            status: 500,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
    }

    return new Response("Rakuten ROOM API Worker", {
      status: 200
    });
  }
};
