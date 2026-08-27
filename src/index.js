export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 楽天商品検索API
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

      // 楽天API URL
      const apiUrl =
        "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601" +
        "?applicationId=" + encodeURIComponent(env.RAKUTEN_APPLICATION_ID) +
        "&affiliateId=" + encodeURIComponent(env.RAKUTEN_AFFILIATE_ID || "") +
        "&keyword=" + encodeURIComponent(keyword) +
        "&hits=20";

      try {
        const response = await fetch(apiUrl);

        // 楽天APIから返ってきた内容を取得
        const text = await response.text();

        // JSONに変換
        let data;

        try {
          data = JSON.parse(text);
        } catch (e) {
          return Response.json(
            {
              error: "楽天APIから正しいJSONが返されませんでした",
              details: text
            },
            {
              status: 500,
              headers: {
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }

        // 楽天APIがエラーを返した場合
        if (!response.ok) {
          return Response.json(
            {
              error: "楽天APIエラー",
              status: response.status,
              details: data
            },
            {
              status: response.status,
              headers: {
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }

        // 正常終了
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

    // その他のアクセス
    return new Response("Rakuten ROOM API Worker", {
      status: 200
    });
  }
};
