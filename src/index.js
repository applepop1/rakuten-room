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

      if (!env.RAKUTEN_APPLICATION_ID) {
        return Response.json(
          {
            error: "RAKUTEN_APPLICATION_ID が設定されていません"
          },
          {
            status: 500,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      if (!env.RAKUTEN_ACCESS_KEY) {
        return Response.json(
          {
            error: "RAKUTEN_ACCESS_KEY が設定されていません"
          },
          {
            status: 500,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      const apiUrl =
        "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701" +
        "?applicationId=" + encodeURIComponent(env.RAKUTEN_APPLICATION_ID) +
        "&accessKey=" + encodeURIComponent(env.RAKUTEN_ACCESS_KEY) +
        "&keyword=" + encodeURIComponent(keyword) +
        "&hits=20" +
        "&format=json";

      try {
        const response = await fetch(apiUrl);

        const responseText = await response.text();

        let data;

        try {
          data = JSON.parse(responseText);
        } catch {
          return Response.json(
            {
              error: "楽天APIからJSON以外のデータが返されました",
              status: response.status,
              details: responseText
            },
            {
              status: response.status,
              headers: {
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }

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
            details: error.message,
            stack: error.stack
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
